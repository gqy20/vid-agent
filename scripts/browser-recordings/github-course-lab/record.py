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

sys.path.insert(0, str(SCRIPT_DIR))

from scenarios import SCENARIOS, get_scenario  # noqa: E402


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Record a deterministic GitHub Course browser scenario")
    parser.add_argument("scenario", choices=sorted(SCENARIOS))
    parser.add_argument("--output-root", type=Path, default=DEFAULT_OUTPUT_ROOT)
    parser.add_argument("--storage-state", type=Path)
    parser.add_argument("--channel", default=os.environ.get("GITHUB_COURSE_BROWSER_CHANNEL", "chrome"))
    parser.add_argument("--headed", action="store_true")
    parser.add_argument("--keep-webm", action="store_true")
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


def transcode(raw_webm: Path, output_mp4: Path, *, trim_start_seconds: float = 0) -> None:
    command = [
        "ffmpeg",
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
    ]
    if trim_start_seconds > 0:
        command.extend(["-ss", f"{trim_start_seconds:.3f}"])
    command.extend(
        [
            "-i",
            str(raw_webm),
            "-vf",
            "fps=30,format=yuv420p",
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
    storage_state = ensure_safe_storage_state(args.storage_state)
    output_root = args.output_root.expanduser().resolve()
    output_root.mkdir(parents=True, exist_ok=True)
    DEFAULT_TMP_ROOT.mkdir(parents=True, exist_ok=True)

    temp_dir = Path(tempfile.mkdtemp(prefix=f"{config.recording_id}-", dir=DEFAULT_TMP_ROOT))
    output_mp4 = output_root / f"{config.recording_id}.mp4"
    poster_path = output_root / f"{config.recording_id}-poster.png"
    metadata_path = output_root / f"{config.recording_id}.json"

    try:
        async with async_playwright() as playwright:
            launch_options: dict[str, object] = {"headless": not args.headed}
            if args.channel:
                launch_options["channel"] = args.channel
            browser = await playwright.chromium.launch(**launch_options)
            context = await browser.new_context(
                viewport={"width": config.viewport_width, "height": config.viewport_height},
                locale=config.locale,
                timezone_id=config.timezone_id,
                color_scheme=config.color_scheme,
                reduced_motion="reduce",
                storage_state=str(storage_state) if storage_state else None,
                record_video_dir=str(temp_dir),
                record_video_size={"width": config.viewport_width, "height": config.viewport_height},
            )
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
            await scenario.run(page)
            await page.close()
            await context.close()
            await browser.close()
            raw_webm = Path(await video.path())

        transcode(raw_webm, output_mp4, trim_start_seconds=trim_start_seconds)
        extract_poster(output_mp4, poster_path)
        if args.keep_webm:
            shutil.copy2(raw_webm, output_root / f"{config.recording_id}.webm")

        metadata = {
            "recordingId": config.recording_id,
            "scenarioId": args.scenario,
            "capturedAt": datetime.now(timezone.utc).isoformat(),
            "viewport": {"width": config.viewport_width, "height": config.viewport_height},
            "locale": config.locale,
            "timezoneId": config.timezone_id,
            "colorScheme": config.color_scheme,
            "browserChannel": args.channel,
            "containsSensitiveState": False,
            "trimStartSeconds": round(trim_start_seconds, 3),
            "src": f"github-course/browser/{output_mp4.name}",
            "poster": f"github-course/browser/{poster_path.name}",
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
