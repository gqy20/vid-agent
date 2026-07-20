from __future__ import annotations

import os
import re
import shutil
import subprocess
import unittest
from pathlib import Path


LAB = Path(__file__).resolve().parents[1]
BUILD_IMAGE = LAB / "build-image.sh"


@unittest.skipUnless(shutil.which("docker"), "docker CLI is required")
class BuildImageScriptTest(unittest.TestCase):
    def print_image(self, **environment: str) -> str:
        process_environment = os.environ.copy()
        process_environment.update(environment)
        completed = subprocess.run(
            [BUILD_IMAGE, "--print"],
            check=True,
            capture_output=True,
            text=True,
            env=process_environment,
        )
        return completed.stdout.strip()

    def test_print_returns_stable_content_addressed_tag(self) -> None:
        first = self.print_image(CC_UID="1000", CC_GID="1000")
        second = self.print_image(CC_UID="1000", CC_GID="1000")

        self.assertEqual(first, second)
        self.assertRegex(first, re.compile(r"^cc-base:[0-9a-f]{12}$"))

    def test_user_identity_changes_image_tag(self) -> None:
        default_identity = self.print_image(CC_UID="1000", CC_GID="1000")
        alternate_identity = self.print_image(CC_UID="1001", CC_GID="1000")

        self.assertNotEqual(default_identity, alternate_identity)


if __name__ == "__main__":
    unittest.main()
