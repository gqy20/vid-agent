from __future__ import annotations

import sys
import unittest
from pathlib import Path

LAB_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(LAB_ROOT))

from scenarios.base import normalize_focus_region  # noqa: E402


class NormalizeFocusRegionTest(unittest.TestCase):
    def test_unions_targets_adds_padding_and_normalizes(self) -> None:
        region = normalize_focus_region(
            region_id="collaboration-navigation",
            boxes=[
                {"x": 200, "y": 100, "width": 120, "height": 40},
                {"x": 360, "y": 104, "width": 100, "height": 36},
            ],
            viewport_width=1600,
            viewport_height=900,
            label="协作状态",
            tone="action",
            padding_px=10,
        )

        self.assertEqual(region.x, 0.11875)
        self.assertEqual(region.y, 0.1)
        self.assertEqual(region.width, 0.175)
        self.assertEqual(region.height, 0.066667)
        self.assertEqual(region.to_metadata()["label"], "协作状态")

    def test_clamps_padding_to_viewport(self) -> None:
        region = normalize_focus_region(
            region_id="edge",
            boxes=[{"x": 2, "y": 3, "width": 98, "height": 97}],
            viewport_width=100,
            viewport_height=100,
            padding_px=10,
        )

        self.assertEqual((region.x, region.y, region.width, region.height), (0, 0, 1, 1))

    def test_rejects_empty_target_list(self) -> None:
        with self.assertRaisesRegex(ValueError, "has no target boxes"):
            normalize_focus_region(
                region_id="empty",
                boxes=[],
                viewport_width=1600,
                viewport_height=900,
            )


if __name__ == "__main__":
    unittest.main()
