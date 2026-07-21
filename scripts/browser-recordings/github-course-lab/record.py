from __future__ import annotations

import argparse
import asyncio
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
from datetime import datetime, timezone
from pathlib import Path

from playwright.async_api import Error as PlaywrightError
from playwright.async_api import async_playwright

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parents[2]
DEFAULT_OUTPUT_ROOT = REPO_ROOT / "remotion/public/github-course/browser"
DEFAULT_TMP_ROOT = REPO_ROOT / "remotion/renders/github-course/tmp/browser-recordings"

RECORDING_PROFILES = {
    "hd30": {
        "viewport_width": 1600,
        "viewport_height": 900,
        "capture_width": 1600,
        "capture_height": 900,
        "device_scale_factor": 1,
        "capture_mode": "fixed-viewport",
    },
    "uhd30": {
        "viewport_width": 1600,
        "viewport_height": 900,
        "capture_width": 3840,
        "capture_height": 2160,
        "device_scale_factor": 2.4,
        # Headless Chrome subtracts 86px of window chrome. A 1600x986 native
        # window therefore yields a 1600x900 CSS viewport backed by 4K pixels.
        "window_width": 1600,
        "window_height": 986,
        "capture_mode": "native-window-dsf",
    },
}

sys.path.insert(0, str(SCRIPT_DIR))

from scenarios import SCENARIOS, get_scenario  # noqa: E402


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Record a deterministic GitHub Course browser scenario")
    parser.add_argument("scenario", choices=sorted(SCENARIOS))
    parser.add_argument("--profile", choices=sorted(RECORDING_PROFILES), default="hd30")
    parser.add_argument("--output-root", type=Path)
    parser.add_argument("--storage-state", type=Path)
    parser.add_argument("--channel", default=os.environ.get("GITHUB_COURSE_BROWSER_CHANNEL", "chrome"))
    parser.add_argument("--headed", action="store_true")
    parser.add_argument("--keep-webm", action="store_true")
    parser.add_argument("--normalize-existing", action="store_true")
    return parser.parse_args()


def ensure_safe_storage_state(path: Path | None) -> Path | None:
    if path is None:
        return None
    resolved = path.expanduser().resolve()
    if not resolved.is_file():
        raise FileNotFoundError(f"Storage state does not exist: {resolved}")
    if DEFAULT_OUTPUT_ROOT.resolve() in resolved.parents:
        raise ValueError("Storage state must never live under remotion/public")
    return resolved


def media_duration(path: Path) -> float:
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=nw=1:nk=1",
            str(path),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    return float(result.stdout.strip())


def transcode(
    raw_webm: Path,
    output_mp4: Path,
    *,
    trim_start_seconds: float = 0,
    target_duration_seconds: float | None = None,
) -> None:
    command = [
        "ffmpeg",
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-i",
        str(raw_webm),
    ]
    if trim_start_seconds > 0:
        command.extend(["-ss", f"{trim_start_seconds:.3f}"])
    source_duration = max(0.001, media_duration(raw_webm) - trim_start_seconds)
    filters = []
    if target_duration_seconds is not None:
        filters.append(f"setpts={target_duration_seconds / source_duration:.9f}*PTS")
    filters.extend(["fps=30", "format=yuv420p"])
    command.extend(
        [
            "-vf",
            ",".join(filters),
            "-an",
            "-c:v",
            "libx264",
            "-preset",
            "medium",
            "-crf",
            "18",
            "-movflags",
            "+faststart",
            str(output_mp4),
        ]
    )
    subprocess.run(command, check=True)


def normalize_existing_recording(
    output_mp4: Path,
    poster_path: Path,
    metadata_path: Path,
    reference_mp4: Path,
) -> None:
    if not output_mp4.is_file() or not metadata_path.is_file() or not reference_mp4.is_file():
        raise FileNotFoundError("Existing UHD video, metadata and HD timing reference are required")
    target_duration = media_duration(reference_mp4)
    source_duration = media_duration(output_mp4)
    partial = output_mp4.with_suffix(".normalized.partial.mp4")
    transcode(output_mp4, partial, target_duration_seconds=target_duration)
    partial.replace(output_mp4)
    extract_poster(output_mp4, poster_path)
    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    metadata["timelineNormalization"] = {
        "reference": f"github-course/browser/{reference_mp4.name}",
        "sourceDurationSeconds": round(source_duration, 6),
        "targetDurationSeconds": round(target_duration, 6),
    }
    metadata_path.write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def extract_poster(output_mp4: Path, poster_path: Path) -> None:
    subprocess.run(
        [
            "ffmpeg",
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-sseof",
            "-0.1",
            "-i",
            str(output_mp4),
            "-frames:v",
            "1",
            str(poster_path),
        ],
        check=True,
    )


async def record(args: argparse.Namespace) -> tuple[Path, Path, Path]:
    scenario = get_scenario(args.scenario)
    config = scenario.config
    profile = RECORDING_PROFILES[args.profile]
    storage_state = ensure_safe_storage_state(args.storage_state)
    default_output_root = DEFAULT_OUTPUT_ROOT if args.profile == "hd30" else DEFAULT_OUTPUT_ROOT / args.profile
    output_root = (args.output_root or default_output_root).expanduser().resolve()
    output_root.mkdir(parents=True, exist_ok=True)
    DEFAULT_TMP_ROOT.mkdir(parents=True, exist_ok=True)

    temp_dir = Path(tempfile.mkdtemp(prefix=f"{config.recording_id}-", dir=DEFAULT_TMP_ROOT))
    output_mp4 = output_root / f"{config.recording_id}.mp4"
    poster_path = output_root / f"{config.recording_id}-poster.png"
    metadata_path = output_root / f"{config.recording_id}.json"
    timing_reference = DEFAULT_OUTPUT_ROOT / f"{config.recording_id}.mp4"

    if args.normalize_existing:
        if args.profile != "uhd30":
            raise ValueError("--normalize-existing is only valid for the uhd30 profile")
        normalize_existing_recording(output_mp4, poster_path, metadata_path, timing_reference)
        return output_mp4, poster_path, metadata_path

    try:
        async with async_playwright() as playwright:
            launch_options: dict[str, object] = {"headless": not args.headed}
            if args.channel:
                launch_options["channel"] = args.channel
            if args.profile == "uhd30":
                launch_options["args"] = [
                    f"--window-size={profile['window_width']},{profile['window_height']}",
                    f"--force-device-scale-factor={profile['device_scale_factor']}",
                ]
            browser = await playwright.chromium.launch(**launch_options)
            context_options: dict[str, object] = dict(
                locale=config.locale,
                timezone_id=config.timezone_id,
                color_scheme=config.color_scheme,
                reduced_motion="reduce",
                storage_state=str(storage_state) if storage_state else None,
                record_video_dir=str(temp_dir),
                record_video_size={
                    "width": profile["capture_width"],
                    "height": profile["capture_height"],
                },
            )
            if args.profile == "uhd30":
                context_options["no_viewport"] = True
            else:
                context_options["viewport"] = {
                    "width": profile["viewport_width"],
                    "height": profile["viewport_height"],
                }
                context_options["device_scale_factor"] = profile["device_scale_factor"]
            context = await browser.new_context(**context_options)
            page = await context.new_page()
            recording_started_at = time.monotonic()
            video = page.video
            if video is None:
                raise RuntimeError("Playwright did not create a video recorder")
            prepare = getattr(scenario, "prepare", None)
            trim_start_seconds = 0.0
            if prepare is not None:
                await prepare(page)
                # Preserve a short stable lead-in before the first teaching action.
                trim_start_seconds = max(0.0, time.monotonic() - recording_started_at - 0.45)
            actual_viewport = await page.evaluate(
                "({width: window.innerWidth, height: window.innerHeight})"
            )
            collect_focus_regions = getattr(scenario, "collect_focus_regions", None)
            focus_regions = []
            if collect_focus_regions is not None:
                focus_regions = [
                    region.to_metadata()
                    for region in await collect_focus_regions(page)
                ]
            await scenario.run(page)
            await page.close()
            await context.close()
            await browser.close()
            raw_webm = Path(await video.path())

        target_duration = media_duration(timing_reference) if args.profile == "uhd30" and timing_reference.is_file() else None
        transcode(
            raw_webm,
            output_mp4,
            trim_start_seconds=trim_start_seconds,
            target_duration_seconds=target_duration,
        )
        extract_poster(output_mp4, poster_path)
        if args.keep_webm:
            shutil.copy2(raw_webm, output_root / f"{config.recording_id}.webm")

        metadata = {
            "recordingId": config.recording_id,
            "scenarioId": args.scenario,
            "profile": args.profile,
            "capturedAt": datetime.now(timezone.utc).isoformat(),
            "viewport": {
                "width": actual_viewport["width"],
                "height": actual_viewport["height"],
            },
            "teachingViewport": {
                "width": config.viewport_width,
                "height": config.viewport_height,
            },
            "captureResolution": {
                "width": profile["capture_width"],
                "height": profile["capture_height"],
            },
            "deviceScaleFactor": profile["device_scale_factor"],
            "captureMode": profile["capture_mode"],
            "locale": config.locale,
            "timezoneId": config.timezone_id,
            "colorScheme": config.color_scheme,
            "browserChannel": args.channel,
            "containsSensitiveState": False,
            "trimStartSeconds": round(trim_start_seconds, 3),
            "timelineNormalization": (
                {
                    "reference": f"github-course/browser/{timing_reference.name}",
                    "targetDurationSeconds": round(target_duration, 6),
                }
                if target_duration is not None
                else None
            ),
            "focusRegions": focus_regions,
            "src": f"github-course/browser/{args.profile + '/' if args.profile != 'hd30' else ''}{output_mp4.name}",
            "poster": f"github-course/browser/{args.profile + '/' if args.profile != 'hd30' else ''}{poster_path.name}",
        }
        metadata_path.write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        return output_mp4, poster_path, metadata_path
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)


def main() -> int:
    args = parse_args()
    try:
        outputs = asyncio.run(record(args))
    except (FileNotFoundError, KeyError, PlaywrightError, RuntimeError, subprocess.CalledProcessError, ValueError) as exc:
        print(f"github-course-lab: {exc}", file=sys.stderr)
        return 1
    for output in outputs:
        print(output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
