from __future__ import annotations

import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


MODULE_PATH = Path(__file__).parents[1] / "build-timeline.py"
SPEC = importlib.util.spec_from_file_location("build_timeline", MODULE_PATH)
assert SPEC and SPEC.loader
build_timeline = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = build_timeline
SPEC.loader.exec_module(build_timeline)


class BuildTimelineTest(unittest.TestCase):
    def test_cli_writes_timeline_for_real_media_fixture(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            cast = root / "sample.cast"
            cast.write_text(
                "\n".join(
                    [
                        json.dumps({"version": 3, "term": {"cols": 120, "rows": 28}}),
                        json.dumps([0.1, "o", "command"]),
                        json.dumps([10.0, "o", "result"]),
                    ]
                )
                + "\n",
                encoding="utf-8",
            )
            events = root / "events.jsonl"
            events.write_text(
                "\n".join(
                    [
                        json.dumps(
                            {
                                "eventId": "000001",
                                "phase": "start",
                                "segmentId": "wait",
                                "kind": "wait",
                                "label": "等待",
                                "rawElapsedSeconds": 0.1,
                                "edit": {"mode": "speed", "targetDurationSeconds": 3},
                            }
                        ),
                        json.dumps(
                            {
                                "eventId": "000002",
                                "phase": "end",
                                "segmentId": "wait",
                                "rawElapsedSeconds": 10.1,
                                "edit": {"mode": "normal"},
                            }
                        ),
                    ]
                )
                + "\n",
                encoding="utf-8",
            )
            media = root / "sample.mp4"
            subprocess.run(
                [
                    "ffmpeg",
                    "-loglevel",
                    "error",
                    "-y",
                    "-f",
                    "lavfi",
                    "-i",
                    "color=c=black:s=160x90:r=30:d=6",
                    "-c:v",
                    "libx264",
                    "-pix_fmt",
                    "yuv420p",
                    str(media),
                ],
                check=True,
            )
            output = root / "sample.timeline.json"
            subprocess.run(
                [
                    sys.executable,
                    str(MODULE_PATH),
                    "--recording-id",
                    "sample",
                    "--cast",
                    str(cast),
                    "--events",
                    str(events),
                    "--media",
                    str(media),
                    "--output",
                    str(output),
                    "--idle-time-limit",
                    "5",
                ],
                check=True,
                capture_output=True,
                text=True,
            )

            manifest = json.loads(output.read_text(encoding="utf-8"))
            self.assertEqual(manifest["asset"]["durationInFrames"], 180)
            self.assertEqual(manifest["asset"]["fps"], 30)
            self.assertEqual(len(manifest["asset"]["sha256"]), 64)
            self.assertEqual(manifest["segments"][0]["source"]["endFrameExclusive"], 153)

    def test_maps_idle_compression_and_builds_frame_ranges(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            cast = root / "sample.cast"
            cast.write_text(
                "\n".join(
                    [
                        json.dumps({"version": 3, "term": {"cols": 120, "rows": 28}}),
                        json.dumps([0.1, "o", "command"]),
                        json.dumps([10.0, "o", "result"]),
                        json.dumps([0.1, "x", "0"]),
                    ]
                )
                + "\n",
                encoding="utf-8",
            )
            events_path = root / "events.jsonl"
            events_path.write_text(
                "\n".join(
                    [
                        json.dumps(
                            {
                                "eventId": "000001",
                                "phase": "start",
                                "segmentId": "install-wait",
                                "kind": "wait",
                                "label": "等待安装",
                                "rawElapsedSeconds": 0.1,
                                "edit": {"mode": "speed", "targetDurationSeconds": 3},
                            }
                        ),
                        json.dumps(
                            {
                                "eventId": "000002",
                                "phase": "end",
                                "segmentId": "install-wait",
                                "rawElapsedSeconds": 10.1,
                                "edit": {"mode": "normal"},
                            }
                        ),
                    ]
                )
                + "\n",
                encoding="utf-8",
            )

            header, points = build_timeline.load_cast_clock(cast, 5.0)
            self.assertAlmostEqual(build_timeline.map_raw_to_media(8.0, points), 5.1)
            self.assertAlmostEqual(build_timeline.map_raw_to_media(10.1, points), 5.1)
            manifest = build_timeline.build_manifest(
                recording_id="ep-test",
                cast_header=header,
                clock_points=points,
                events=build_timeline.load_events(events_path),
                media={
                    "width": 1920,
                    "height": 1080,
                    "fps": 30,
                    "durationSeconds": 6,
                    "durationInFrames": 180,
                    "sha256": "abc",
                },
                idle_time_limit=5.0,
            )

            segment = manifest["segments"][0]
            self.assertEqual(segment["source"]["startFrame"], 3)
            self.assertEqual(segment["source"]["endFrameExclusive"], 153)
            self.assertEqual(segment["edit"]["mode"], "speed")
            self.assertTrue(manifest["validation"]["segmentsNonOverlapping"])

    def test_rejects_unclosed_segments(self) -> None:
        with self.assertRaisesRegex(ValueError, "unclosed segments"):
            build_timeline.build_manifest(
                recording_id="ep-test",
                cast_header={"version": 3, "term": {}},
                clock_points=[build_timeline.ClockPoint(0, 0)],
                events=[
                    {
                        "eventId": "000001",
                        "phase": "start",
                        "segmentId": "open",
                        "kind": "wait",
                        "label": None,
                        "rawElapsedSeconds": 0,
                        "edit": {"mode": "cut"},
                    }
                ],
                media={
                    "width": 1920,
                    "height": 1080,
                    "fps": 30,
                    "durationSeconds": 1,
                    "durationInFrames": 30,
                    "sha256": "abc",
                },
                idle_time_limit=5.0,
            )

    def test_snaps_sequential_segments_that_share_an_idle_capped_frame(self) -> None:
        events = [
            {"eventId": "000001", "phase": "start", "segmentId": "one", "rawElapsedSeconds": 6.0, "edit": {"mode": "normal"}},
            {"eventId": "000002", "phase": "end", "segmentId": "one", "rawElapsedSeconds": 7.0, "edit": {"mode": "normal"}},
            {"eventId": "000003", "phase": "start", "segmentId": "two", "rawElapsedSeconds": 7.1, "edit": {"mode": "normal"}},
            {"eventId": "000004", "phase": "end", "segmentId": "two", "rawElapsedSeconds": 8.0, "edit": {"mode": "normal"}},
        ]
        manifest = build_timeline.build_manifest(
            recording_id="ep-test",
            cast_header={"version": 3, "term": {}},
            clock_points=[build_timeline.ClockPoint(0, 0), build_timeline.ClockPoint(10, 5)],
            events=events,
            media={
                "width": 1920,
                "height": 1080,
                "fps": 30,
                "durationSeconds": 6,
                "durationInFrames": 180,
                "sha256": "abc",
            },
            idle_time_limit=5.0,
        )

        one, two = manifest["segments"]
        self.assertEqual(one["source"]["endFrameExclusive"], two["source"]["startFrame"])
        self.assertTrue(manifest["validation"]["segmentsNonOverlapping"])

    def test_rejects_real_raw_time_overlap_even_when_media_frames_collapse(self) -> None:
        events = [
            {"eventId": "000001", "phase": "start", "segmentId": "one", "rawElapsedSeconds": 6.0, "edit": {"mode": "normal"}},
            {"eventId": "000002", "phase": "start", "segmentId": "two", "rawElapsedSeconds": 6.5, "edit": {"mode": "normal"}},
            {"eventId": "000003", "phase": "end", "segmentId": "one", "rawElapsedSeconds": 7.0, "edit": {"mode": "normal"}},
            {"eventId": "000004", "phase": "end", "segmentId": "two", "rawElapsedSeconds": 8.0, "edit": {"mode": "normal"}},
        ]
        with self.assertRaisesRegex(ValueError, "overlapping segment"):
            build_timeline.build_manifest(
                recording_id="ep-test",
                cast_header={"version": 3, "term": {}},
                clock_points=[build_timeline.ClockPoint(0, 0), build_timeline.ClockPoint(10, 5)],
                events=events,
                media={
                    "width": 1920,
                    "height": 1080,
                    "fps": 30,
                    "durationSeconds": 6,
                    "durationInFrames": 180,
                    "sha256": "abc",
                },
                idle_time_limit=5.0,
            )


if __name__ == "__main__":
    unittest.main()
