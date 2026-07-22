from __future__ import annotations

import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


LAB = Path(__file__).resolve().parents[1]
MODULE_PATH = LAB / "manage-recording-logs.py"


def load_module():
    spec = importlib.util.spec_from_file_location("manage_recording_logs", MODULE_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {MODULE_PATH}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class ManageRecordingLogsTest(unittest.TestCase):
    def setUp(self) -> None:
        self.module = load_module()
        self.temp_dir = tempfile.TemporaryDirectory()
        self.root = Path(self.temp_dir.name) / "recordings"
        self.root.mkdir()
        for run_id, archived_at in (
            ("20260720T120000Z-1", "2026-07-20T12:00:00Z"),
            ("20260721T120000Z-2", "2026-07-21T12:00:00Z"),
            ("20260722T120000Z-3", "2026-07-22T12:00:00Z"),
        ):
            run = self.root / run_id
            run.mkdir()
            (run / "manifest.json").write_text(
                json.dumps({"runId": run_id, "archivedAt": archived_at}),
                encoding="utf-8",
            )

    def tearDown(self) -> None:
        self.temp_dir.cleanup()

    def test_prune_is_dry_run_by_default_and_keeps_newest(self) -> None:
        planned = self.module.prune_recording_logs(self.root, keep=1, apply=False)

        self.assertEqual([path.name for path in planned], ["20260720T120000Z-1", "20260721T120000Z-2"])
        self.assertEqual(len(list(self.root.iterdir())), 3)

    def test_prune_apply_deletes_only_planned_run_directories(self) -> None:
        planned = self.module.prune_recording_logs(self.root, keep=2, apply=True)

        self.assertEqual([path.name for path in planned], ["20260720T120000Z-1"])
        self.assertFalse((self.root / "20260720T120000Z-1").exists())
        self.assertTrue((self.root / "20260721T120000Z-2").is_dir())
        self.assertTrue((self.root / "20260722T120000Z-3").is_dir())


if __name__ == "__main__":
    unittest.main()
