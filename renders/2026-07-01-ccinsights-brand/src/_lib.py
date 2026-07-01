"""Shared brand constants and helpers for cc-insights videos.

Import per-scene (do NOT use `from manim import *`):
    from manim import Scene, Text, ...
    from _lib import BRAND, UP, DOWN, ...  # brand palette + direction constants

Helper to inject this dir onto sys.path for scripts in subdirs (e.g. src/brand/):
    import os, sys
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
"""

import os
import sys

# Allow `src/brand/*.py` to find _lib at `src/_lib.py`.
# Safe to call from any deep module: idempotent.
_HERE = os.path.dirname(os.path.abspath(__file__))
_SRC_DIR = os.path.dirname(_HERE)
if _SRC_DIR not in sys.path:
    sys.path.insert(0, _SRC_DIR)

from manim import (
    BLACK, WHITE, GREY, GREEN, BLUE, RED, YELLOW, ORANGE, PURPLE, PINK,
    UP, DOWN, LEFT, RIGHT, ORIGIN, UR, UL, DR, DL,
)

# Brand palette (read from docs/logo/cc-insights.svg comment)
BRAND = "#C15F3C"        # terracotta orange — logo peak highlight
BRAND_DARK = "#A04E2F"
HIGH_RED = "#D17070"     # dashboard 'high' tag (muted)
MED_AMBER = "#D4A574"    # dashboard 'medium' tag (muted)

# Type scale
TITLE_SIZE = 64
SUBTITLE_SIZE = 32
BODY_SIZE = 24
TAG_SIZE = 28
SMALL_SIZE = 20
TINY_SIZE = 16
