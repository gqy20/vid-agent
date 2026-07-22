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
                    "uuid": "raw-user-uuid",
                    "cwd": "/home/cc/project",
                    "message": {"role": "user", "content": f"读取 /home/qy/private.txt {secret}"},
                },
                {
                    "type": "assistant",
                    "timestamp": "2026-07-22T12:00:01Z",
                    "uuid": "raw-assistant-uuid",
                    "parentUuid": "raw-user-uuid",
                    "message": {
                        "id": "raw-message-id",
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
                {
                    "type": "user",
                    "timestamp": "2026-07-22T12:00:02Z",
                    "uuid": "raw-result-uuid",
                    "parentUuid": "raw-assistant-uuid",
                    "message": {
                        "role": "user",
                        "content": [
                            {
                                "type": "tool_result",
                                "tool_use_id": "toolu_private_id",
                                "is_error": False,
                                "content": f"secret result {secret}",
                            }
                        ],
                    },
                },
                {
                    "type": "file-history-snapshot",
                    "timestamp": "2026-07-22T12:00:03Z",
                    "snapshot": {
                        "trackedFileBackups": {
                            "/home/qy/private.txt": {"backupFileName": f"{secret}.txt"}
                        }
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
        self.assertNotIn("raw-user-uuid", trace_text)
        self.assertNotIn("raw-assistant-uuid", trace_text)
        self.assertNotIn("raw-message-id", trace_text)
        self.assertEqual(trace_rows[0]["relativeSeconds"], 0.0)
        self.assertEqual(trace_rows[0]["type"], "user")
        self.assertEqual(trace_rows[1]["toolNames"], ["Read"])
        self.assertEqual(trace_rows[1]["parentSequence"], 0)
        self.assertEqual(trace_rows[1]["messageOrdinal"], 1)
        self.assertEqual(trace_rows[1]["contentTypes"], ["tool_use"])
        self.assertEqual(
            trace_rows[1]["toolCalls"],
            [{"ordinal": 1, "name": "Read", "inputKeys": ["file_path"]}],
        )
        self.assertEqual(trace_rows[2]["parentSequence"], 1)
        self.assertEqual(
            trace_rows[2]["toolResults"],
            [{"ordinal": 1, "isError": False, "contentType": "string"}],
        )
        self.assertEqual(
            trace_rows[3]["checkpoint"],
            {"kind": "snapshot", "trackedFileCount": 1},
        )
        self.assertNotIn("content", trace_rows[0])
        self.assertNotIn("cwd", trace_rows[0])

        architecture_path = self.output / "sanitized" / "session-architecture.json"
        architecture_text = architecture_path.read_text(encoding="utf-8")
        architecture = json.loads(architecture_text)
        self.assertNotIn(secret, architecture_text)
        self.assertNotIn("private.txt", architecture_text)
        self.assertEqual(architecture["events"]["session"], 4)
        self.assertEqual(architecture["chain"]["linkedNodes"], 3)
        self.assertEqual(architecture["chain"]["resolvedParents"], 2)
        self.assertEqual(architecture["messages"]["assistantEntries"], 1)
        self.assertEqual(architecture["messages"]["assistantMessages"], 1)
        self.assertEqual(architecture["tools"]["calls"], 1)
        self.assertEqual(architecture["tools"]["results"], 1)
        self.assertEqual(architecture["tools"]["paired"], 1)
        self.assertEqual(architecture["checkpoints"]["snapshots"], 1)

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
