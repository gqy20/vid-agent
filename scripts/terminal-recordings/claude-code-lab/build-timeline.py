#!/usr/bin/env python3
"""Build a safe, frame-addressable editing timeline from a Claude Code cast."""

from __future__ import annotations

import argparse
import bisect
import hashlib
import json
import os
import subprocess
from dataclasses import dataclass
from fractions import Fraction
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class ClockPoint:
    raw_seconds: float
    media_seconds: float


def load_cast_clock(cast: Path, idle_time_limit: float) -> tuple[dict[str, Any], list[ClockPoint]]:
    if idle_time_limit <= 0:
        raise ValueError("idle_time_limit must be positive")

    with cast.open(encoding="utf-8") as stream:
        try:
            header = json.loads(next(stream))
        except StopIteration as error:
            raise ValueError("cast is empty") from error
        if header.get("version") != 3:
            raise ValueError(f"expected asciinema cast v3, got {header.get('version')!r}")

        raw_seconds = 0.0
        media_seconds = 0.0
        points = [ClockPoint(0.0, 0.0)]
        for line_number, line in enumerate(stream, start=2):
            item = json.loads(line)
            if not isinstance(item, list) or len(item) < 3:
                raise ValueError(f"invalid cast event on line {line_number}")
            delta = float(item[0])
            if delta < 0:
                raise ValueError(f"negative cast delta on line {line_number}")
            raw_seconds += delta
            media_seconds += min(delta, idle_time_limit)
            points.append(ClockPoint(raw_seconds, media_seconds))

    return header, points


def map_raw_to_media(raw_seconds: float, points: list[ClockPoint]) -> float:
    if raw_seconds <= 0:
        return 0.0
    raw_values = [point.raw_seconds for point in points]
    index = bisect.bisect_left(raw_values, raw_seconds)
    if index >= len(points):
        tail = points[-1]
        return tail.media_seconds + (raw_seconds - tail.raw_seconds)
    if points[index].raw_seconds == raw_seconds:
        return points[index].media_seconds

    left = points[index - 1]
    right = points[index]
    raw_span = right.raw_seconds - left.raw_seconds
    if raw_span <= 0:
        return right.media_seconds
    # agg caps a long delay rather than scaling the entire interval. A marker
    # inside that delay therefore advances normally until the cap, then stays
    # on the last available media time until the next cast event appears.
    media_span = right.media_seconds - left.media_seconds
    return left.media_seconds + min(raw_seconds - left.raw_seconds, media_span)


def load_events(path: Path) -> list[dict[str, Any]]:
    events: list[dict[str, Any]] = []
    seen_event_ids: set[str] = set()
    with path.open(encoding="utf-8") as stream:
        for line_number, line in enumerate(stream, start=1):
            if not line.strip():
                continue
            event = json.loads(line)
            event_id = str(event.get("eventId", ""))
            if not event_id or event_id in seen_event_ids:
                raise ValueError(f"invalid or duplicate eventId on line {line_number}")
            if event.get("phase") not in {"start", "end", "point"}:
                raise ValueError(f"invalid phase on line {line_number}")
            if not event.get("segmentId"):
                raise ValueError(f"missing segmentId on line {line_number}")
            event["rawElapsedSeconds"] = float(event["rawElapsedSeconds"])
            seen_event_ids.add(event_id)
            events.append(event)
    events.sort(key=lambda item: (item["rawElapsedSeconds"], item["eventId"]))
    return events


def probe_media(path: Path) -> dict[str, Any]:
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-select_streams",
            "v:0",
            "-show_entries",
            "stream=width,height,r_frame_rate,nb_frames,duration",
            "-of",
            "json",
            str(path),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    stream = json.loads(result.stdout)["streams"][0]
    fps = float(Fraction(stream["r_frame_rate"]))
    duration = float(stream.get("duration") or 0)
    frame_count_value = stream.get("nb_frames")
    frame_count = int(frame_count_value) if frame_count_value not in {None, "N/A"} else round(duration * fps)
    return {
        "width": int(stream["width"]),
        "height": int(stream["height"]),
        "fps": fps,
        "durationSeconds": duration,
        "durationInFrames": frame_count,
        "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
    }


def build_manifest(
    *,
    recording_id: str,
    cast_header: dict[str, Any],
    clock_points: list[ClockPoint],
    events: list[dict[str, Any]],
    media: dict[str, Any],
    idle_time_limit: float,
) -> dict[str, Any]:
    fps = float(media["fps"])
    total_frames = int(media["durationInFrames"])
    if fps <= 0 or total_frames <= 0:
        raise ValueError("media fps and durationInFrames must be positive")

    normalized_events: list[dict[str, Any]] = []
    for event in events:
        media_seconds = map_raw_to_media(event["rawElapsedSeconds"], clock_points)
        normalized_events.append(
            {
                **event,
                "mediaSeconds": round(media_seconds, 6),
                "mediaFrame": min(total_frames - 1, max(0, round(media_seconds * fps))),
            }
        )

    media_duration = float(media["durationSeconds"])
    out_of_bounds = [
        event["eventId"]
        for event in normalized_events
        if not 0 <= event["mediaSeconds"] <= media_duration + (1 / fps)
    ]
    if out_of_bounds:
        raise ValueError(f"events outside media duration: {', '.join(out_of_bounds)}")

    open_segments: dict[str, dict[str, Any]] = {}
    segments: list[dict[str, Any]] = []
    for event in normalized_events:
        segment_id = event["segmentId"]
        if event["phase"] == "point":
            continue
        if event["phase"] == "start":
            if segment_id in open_segments or any(item["id"] == segment_id for item in segments):
                raise ValueError(f"duplicate segment start: {segment_id}")
            open_segments[segment_id] = event
            continue

        start = open_segments.pop(segment_id, None)
        if start is None:
            raise ValueError(f"segment end without start: {segment_id}")
        start_frame = min(total_frames, max(0, round(start["mediaSeconds"] * fps)))
        end_frame = min(total_frames, max(0, round(event["mediaSeconds"] * fps)))
        if end_frame <= start_frame:
            end_frame = min(total_frames, start_frame + 1)
        if end_frame <= start_frame:
            raise ValueError(f"empty segment after clamping: {segment_id}")
        segments.append(
            {
                "id": segment_id,
                "kind": start.get("kind"),
                "label": start.get("label"),
                "source": {
                    "startSeconds": start["mediaSeconds"],
                    "endSeconds": event["mediaSeconds"],
                    "startFrame": start_frame,
                    "endFrameExclusive": end_frame,
                    "durationInFrames": end_frame - start_frame,
                },
                "edit": start.get("edit") or {"mode": "normal"},
                "events": {"start": start["eventId"], "end": event["eventId"]},
            }
        )

    if open_segments:
        raise ValueError(f"unclosed segments: {', '.join(sorted(open_segments))}")

    segments.sort(key=lambda item: (item["source"]["startFrame"], item["id"]))
    previous_end = 0
    for segment in segments:
        start_frame = segment["source"]["startFrame"]
        if start_frame < previous_end:
            raise ValueError(f"overlapping segment: {segment['id']}")
        previous_end = segment["source"]["endFrameExclusive"]

    covered_frames = sum(segment["source"]["durationInFrames"] for segment in segments)
    return {
        "schemaVersion": 1,
        "recordingId": recording_id,
        "asset": {
            "file": f"{recording_id}.mp4",
            "sha256": media["sha256"],
            "width": int(media["width"]),
            "height": int(media["height"]),
            "fps": fps,
            "durationSeconds": float(media["durationSeconds"]),
            "durationInFrames": total_frames,
        },
        "capture": {
            "castVersion": cast_header["version"],
            "terminal": cast_header.get("term"),
            "idleTimeLimitSeconds": idle_time_limit,
            "clock": "host-monotonic-before-asciinema",
        },
        "coverage": {
            "segmentCount": len(segments),
            "coveredFrames": covered_frames,
            "unmarkedHeadFrames": segments[0]["source"]["startFrame"] if segments else total_frames,
            "unmarkedTailFrames": total_frames - previous_end if segments else 0,
        },
        "segments": segments,
        "events": normalized_events,
        "validation": {
            "eventsInBounds": True,
            "segmentsOrdered": True,
            "segmentsNonOverlapping": True,
        },
    }


def write_json_atomic(path: Path, value: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".partial")
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    os.replace(temporary, path)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--recording-id", required=True)
    parser.add_argument("--cast", type=Path, required=True)
    parser.add_argument("--events", type=Path, required=True)
    parser.add_argument("--media", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--idle-time-limit", type=float, default=5.0)
    args = parser.parse_args()

    cast_header, clock_points = load_cast_clock(args.cast, args.idle_time_limit)
    manifest = build_manifest(
        recording_id=args.recording_id,
        cast_header=cast_header,
        clock_points=clock_points,
        events=load_events(args.events),
        media=probe_media(args.media),
        idle_time_limit=args.idle_time_limit,
    )
    write_json_atomic(args.output, manifest)
    print(args.output)


if __name__ == "__main__":
    main()
