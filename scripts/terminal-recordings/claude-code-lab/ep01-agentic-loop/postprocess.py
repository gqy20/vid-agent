#!/usr/bin/env python3
"""Apply true pixel mosaics to the two auth-token appearances in Ep01."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
from pathlib import Path


ANSI_ESCAPE = re.compile(r"\x1b(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])")
REFERENCE_WIDTH = 1758
REFERENCE_HEIGHT = 1010


def media_dimensions(path: Path) -> tuple[int, int]:
    output = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-select_streams",
            "v:0",
            "-show_entries",
            "stream=width,height",
            "-of",
            "json",
            str(path),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    stream = json.loads(output.stdout)["streams"][0]
    return int(stream["width"]), int(stream["height"])


def even(value: float) -> int:
    rounded = max(2, round(value))
    return rounded if rounded % 2 == 0 else rounded + 1


def find_markers(cast: Path, idle_time_limit: float) -> tuple[float, float]:
    elapsed = 0.0
    token_time: float | None = None
    settings_time: float | None = None
    plain_output = ""
    auth_marker_count = 0

    with cast.open(encoding="utf-8") as stream:
        for line in stream:
            item = json.loads(line)
            if not isinstance(item, list):
                continue
            elapsed += min(float(item[0]), idle_time_limit)
            output = item[2]
            plain_output += ANSI_ESCAPE.sub("", output)
            marker_count = plain_output.count("ANTHROPIC_AUTH_TOKEN")
            if marker_count > auth_marker_count:
                if token_time is None:
                    token_time = elapsed
                elif settings_time is None:
                    settings_time = elapsed
                auth_marker_count = marker_count

    if token_time is None or settings_time is None:
        raise SystemExit("could not locate auth-token mosaic markers in cast")
    return token_time, settings_time


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--cast", type=Path, required=True)
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--secret-length", type=int, required=True)
    parser.add_argument("--idle-time-limit", type=float, default=5.0)
    args = parser.parse_args()

    token_time, settings_time = find_markers(args.cast, args.idle_time_limit)
    media_width, media_height = media_dimensions(args.input)
    scale_x = media_width / REFERENCE_WIDTH
    scale_y = media_height / REFERENCE_HEIGHT
    hidden_chars = max(1, args.secret_length - 3)
    base_mask_width = min(1000, max(32, round(hidden_chars * 14.63)))
    mask_width = even(base_mask_width * scale_x)
    mask_height = even(40 * scale_y)
    pixel_width = max(4, round(base_mask_width / 8))
    pixel_height = 5
    token_x = round(496 * scale_x)
    token_y = round(842 * scale_y)
    settings_x = round(482 * scale_x)
    settings_y = round(116 * scale_y)
    token_start, token_end = token_time - 0.1, token_time + 2.2
    settings_start, settings_end = settings_time - 0.1, settings_time + 3.2
    print(
        f"mosaic windows: token={token_start:.3f}-{token_end:.3f}s "
        f"settings={settings_start:.3f}-{settings_end:.3f}s"
    )

    # The terminal and Vim lines use different leading columns. Coordinates are
    # calibrated against the 120x28, 24px reference render and scaled to the
    # actual raster size so the same recording can be rendered at 2x density.
    filter_graph = (
        "[0:v]split=3[base][token_src][settings_src];"
        f"[token_src]crop={mask_width}:{mask_height}:{token_x}:{token_y},"
        f"scale={pixel_width}:{pixel_height}:flags=area,"
        f"scale={mask_width}:{mask_height}:flags=neighbor[token_px];"
        f"[base][token_px]overlay={token_x}:{token_y}:enable=between(t\\,{token_start:.3f}\\,{token_end:.3f})[masked];"
        f"[settings_src]crop={mask_width}:{mask_height}:{settings_x}:{settings_y},"
        f"scale={pixel_width}:{pixel_height}:flags=area,"
        f"scale={mask_width}:{mask_height}:flags=neighbor[settings_px];"
        f"[masked][settings_px]overlay={settings_x}:{settings_y}:enable=between(t\\,{settings_start:.3f}\\,{settings_end:.3f})[out]"
    )

    subprocess.run(
        [
            "ffmpeg",
            "-loglevel",
            "error",
            "-y",
            "-i",
            str(args.input),
            "-filter_complex",
            filter_graph,
            "-map",
            "[out]",
            "-an",
            "-c:v",
            "libx264",
            "-crf",
            "18",
            "-pix_fmt",
            "yuv420p",
            "-movflags",
            "+faststart",
            str(args.output),
        ],
        check=True,
    )


if __name__ == "__main__":
    main()
