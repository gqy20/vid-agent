#!/usr/bin/env python3
"""List or safely prune local Claude Code recording-log archives."""

from __future__ import annotations

import argparse
import json
import re
import shutil
from pathlib import Path
from typing import Any


LAB = Path(__file__).resolve().parent
REPO_ROOT = LAB.parents[2]
SAFE_ID = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*$")


def manifest_for(run_dir: Path) -> dict[str, Any]:
    manifest_path = run_dir / "manifest.json"
    if not manifest_path.is_file():
        return {}
    try:
        value = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return {}
    return value if isinstance(value, dict) else {}


def run_directories(recording_root: Path) -> list[Path]:
    if not recording_root.is_dir():
        return []
    runs = [
        path
        for path in recording_root.iterdir()
        if path.is_dir() and not path.is_symlink() and SAFE_ID.fullmatch(path.name)
    ]
    return sorted(runs, key=lambda path: (str(manifest_for(path).get("archivedAt", "")), path.name))


def prune_recording_logs(recording_root: Path, *, keep: int, apply: bool) -> list[Path]:
    if keep < 0:
        raise ValueError("keep must be zero or greater")
    root = recording_root.resolve()
    runs = run_directories(root)
    planned = runs[:-keep] if keep else runs
    if not apply:
        return planned
    for target in planned:
        resolved = target.resolve()
        if resolved.parent != root or target.is_symlink():
            raise ValueError(f"refusing to remove path outside recording root: {target}")
        shutil.rmtree(resolved)
    return planned


def parse_apply(value: str) -> bool:
    if value == "true":
        return True
    if value == "false":
        return False
    raise argparse.ArgumentTypeError("--apply must be true or false")


def recording_root(episode_id: str) -> Path:
    if not SAFE_ID.fullmatch(episode_id):
        raise ValueError(f"invalid episode id: {episode_id!r}")
    return REPO_ROOT / "remotion" / "renders" / "claude-code-course" / episode_id / "tmp" / "recordings"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)

    list_parser = subparsers.add_parser("list", help="list local recording runs")
    list_parser.add_argument("episode_id")

    prune_parser = subparsers.add_parser("prune", help="remove old runs; dry-run by default")
    prune_parser.add_argument("episode_id")
    prune_parser.add_argument("--keep", type=int, default=10)
    prune_parser.add_argument("--apply", type=parse_apply, default=False)

    args = parser.parse_args()
    root = recording_root(args.episode_id)
    if args.command == "list":
        for path in reversed(run_directories(root)):
            manifest = manifest_for(path)
            scan = manifest.get("sensitiveScan") if isinstance(manifest.get("sensitiveScan"), dict) else {}
            print(
                "\t".join(
                    (
                        path.name,
                        str(manifest.get("status", "unknown")),
                        str(scan.get("verdict", "unknown")),
                        str(manifest.get("archivedAt", "unknown")),
                    )
                )
            )
        return 0

    planned = prune_recording_logs(root, keep=args.keep, apply=args.apply)
    action = "removed" if args.apply else "would remove"
    for path in planned:
        print(f"{action}: {path}")
    print(f"{action} {len(planned)} run(s); keeping newest {args.keep}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
