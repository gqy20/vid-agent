from __future__ import annotations

import importlib.util
import json
import os
import stat
import tempfile
import unittest
from pathlib import Path


LAB = Path(__file__).resolve().parents[1]
MODULE_PATH = LAB / "archive-recording-logs.py"


def load_module():
    spec = importlib.util.spec_from_file_location("archive_recording_logs", MODULE_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {MODULE_PATH}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class ArchiveRecordingLogsTest(unittest.TestCase):
    def setUp(self) -> None:
        self.module = load_module()
        self.temp_dir = tempfile.TemporaryDirectory()
        self.root = Path(self.temp_dir.name)
        self.claude_home = self.root / "claude-home"
        self.output = self.root / "recordings" / "20260722T120000Z-123"
        (self.claude_home / "projects" / "-home-cc-project").mkdir(parents=True)
        (self.claude_home / "debug").mkdir(parents=True)

    def tearDown(self) -> None:
        self.temp_dir.cleanup()

    def write_session(self, lines: list[dict]) -> Path:
        target = self.claude_home / "projects" / "-home-cc-project" / "session.jsonl"
        target.write_text(
            "".join(json.dumps(line, ensure_ascii=False) + "\n" for line in lines),
            encoding="utf-8",
        )
        return target

    def archive(self, *, secret: str = "") -> dict:
        director_log = self.root / "run.log"
        director_log.write_text("[12:00:00] start\n", encoding="utf-8")
        events = self.root / "events.jsonl"
        events.write_text(
            json.dumps(
                {
                    "eventId": "000001",
                    "phase": "start",
                    "segmentId": "01_prompt",
                    "kind": "command",
                    "label": "发送最小任务",
                    "rawElapsedSeconds": 1.25,
                    "edit": {"mode": "normal"},
                },
                ensure_ascii=False,
            )
            + "\n",
            encoding="utf-8",
        )
        version_file = self.root / "claude-version.txt"
        version_file.write_text("2.1.216 (Claude Code)\n", encoding="utf-8")

        return self.module.archive_recording_logs(
            episode_id="ep02-interactive-guide",
            run_id="20260722T120000Z-123",
            exit_code=0,
            mode="run",
            claude_home=self.claude_home,
            director_log=director_log,
            events=events,
            version_file=version_file,
            output_dir=self.output,
            image={"tag": "cc-base:test", "id": "sha256:image", "buildFingerprint": "fingerprint"},
            secrets=[secret] if secret else [],
            now="2026-07-22T12:01:00Z",
        )

    def test_archives_only_log_subtrees_and_excludes_settings(self) -> None:
        self.write_session([{"type": "system", "timestamp": "2026-07-22T12:00:00Z"}])
        (self.claude_home / "debug" / "session.txt").write_text("debug line\n", encoding="utf-8")
        (self.claude_home / "settings.json").write_text(
            '{"env":{"ANTHROPIC_AUTH_TOKEN":"must-not-be-copied"}}',
            encoding="utf-8",
        )

        manifest = self.archive()

        self.assertTrue((self.output / "raw" / "projects" / "-home-cc-project" / "session.jsonl").is_file())
        self.assertTrue((self.output / "raw" / "debug" / "session.txt").is_file())
        self.assertTrue((self.output / "raw" / "director" / "run.log").is_file())
        self.assertTrue((self.output / "raw" / "director" / "events.jsonl").is_file())
        self.assertFalse((self.output / "raw" / "settings.json").exists())
        self.assertNotIn("must-not-be-copied", json.dumps(manifest))
        self.assertEqual(stat.S_IMODE(self.output.stat().st_mode), 0o700)
        for path in self.output.rglob("*"):
            expected = 0o700 if path.is_dir() else 0o600
            self.assertEqual(stat.S_IMODE(path.stat().st_mode), expected, str(path))

    def test_trace_keeps_whitelisted_metadata_without_message_content_or_paths(self) -> None:
        secret = "sk-recording-secret-value"
        self.write_session(
            [
                {
                    "type": "user",
                    "timestamp": "2026-07-22T12:00:00Z",
                    "cwd": "/home/cc/project",
                    "message": {"role": "user", "content": f"读取 /home/qy/private.txt {secret}"},
                },
                {
                    "type": "assistant",
                    "timestamp": "2026-07-22T12:00:01Z",
                    "message": {
                        "role": "assistant",
                        "content": [
                            {
                                "type": "tool_use",
                                "id": "toolu_private_id",
                                "name": "Read",
                                "input": {"file_path": "/home/qy/private.txt"},
                            }
                        ],
                    },
                },
            ]
        )

        self.archive(secret=secret)

        trace_text = (self.output / "sanitized" / "session-trace.jsonl").read_text(encoding="utf-8")
        trace_rows = [json.loads(line) for line in trace_text.splitlines()]
        self.assertNotIn(secret, trace_text)
        self.assertNotIn("private.txt", trace_text)
        self.assertNotIn("toolu_private_id", trace_text)
        self.assertEqual(trace_rows[0]["relativeSeconds"], 0.0)
        self.assertEqual(trace_rows[0]["type"], "user")
        self.assertEqual(trace_rows[1]["toolNames"], ["Read"])
        self.assertNotIn("content", trace_rows[0])
        self.assertNotIn("cwd", trace_rows[0])

    def test_audit_reports_secret_counts_without_serializing_secret(self) -> None:
        secret = "sk-recording-secret-value"
        self.write_session(
            [
                {
                    "type": "user",
                    "timestamp": "2026-07-22T12:00:00Z",
                    "message": {"role": "user", "content": secret},
                }
            ]
        )

        manifest = self.archive(secret=secret)

        audit_text = (self.output / "audit" / "sensitive-scan.json").read_text(encoding="utf-8")
        audit = json.loads(audit_text)
        manifest_text = (self.output / "manifest.json").read_text(encoding="utf-8")
        self.assertEqual(audit["verdict"], "fail")
        self.assertEqual(audit["findings"]["configuredSecret"], 1)
        self.assertNotIn(secret, audit_text)
        self.assertNotIn(secret, manifest_text)
        self.assertEqual(manifest["status"], "succeeded")
        self.assertEqual(manifest["claudeCodeVersion"], "2.1.216 (Claude Code)")
        self.assertGreater(len(manifest["files"]), 0)
        self.assertTrue(all(len(item["sha256"]) == 64 for item in manifest["files"]))


if __name__ == "__main__":
    unittest.main()
