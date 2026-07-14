#!/usr/bin/env python3
"""Apply true pixel mosaics to the two auth-token appearances in Ep01."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
from pathlib import Path


IDLE_TIME_LIMIT = 5.0  # Must match agg's --idle-time-limit.
ANSI_ESCAPE = re.compile(r"\x1b(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])")


def find_markers(cast: Path) -> tuple[float, float]:
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
            elapsed += min(float(item[0]), IDLE_TIME_LIMIT)
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
    args = parser.parse_args()

    token_time, settings_time = find_markers(args.cast)
    hidden_chars = max(1, args.secret_length - 3)
    mask_width = min(1000, max(32, round(hidden_chars * 14.63)))
    if mask_width % 2:
        mask_width += 1

    mask_height = 40
    pixel_width = max(4, round(mask_width / 8))
    pixel_height = 5
    token_start, token_end = token_time - 0.1, token_time + 2.2
    settings_start, settings_end = settings_time - 0.1, settings_time + 3.2
    print(
        f"mosaic windows: token={token_start:.3f}-{token_end:.3f}s "
        f"settings={settings_start:.3f}-{settings_end:.3f}s"
    )

    # The terminal and Vim lines use different leading columns. Coordinates are
    # calibrated against the fixed 120x28 agg render (1756x1010).
    filter_graph = (
        "[0:v]split=3[base][token_src][settings_src];"
        f"[token_src]crop={mask_width}:{mask_height}:496:842,"
        f"scale={pixel_width}:{pixel_height}:flags=area,"
        f"scale={mask_width}:{mask_height}:flags=neighbor[token_px];"
        f"[base][token_px]overlay=496:842:enable=between(t\\,{token_start:.3f}\\,{token_end:.3f})[masked];"
        f"[settings_src]crop={mask_width}:{mask_height}:482:116,"
        f"scale={pixel_width}:{pixel_height}:flags=area,"
        f"scale={mask_width}:{mask_height}:flags=neighbor[settings_px];"
        f"[masked][settings_px]overlay=482:116:enable=between(t\\,{settings_start:.3f}\\,{settings_end:.3f})[out]"
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
