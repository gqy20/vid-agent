#!/usr/bin/env python3
"""Reuse the proven two-position auth-token mosaic from the original EP01."""

from pathlib import Path
import runpy


runpy.run_path(
    str(Path(__file__).resolve().parents[1] / "ep01-agentic-loop" / "postprocess.py"),
    run_name="__main__",
)
