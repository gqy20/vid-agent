"""Shared brand constants and helpers for cc-insights videos.

Import per-scene (do NOT use `from manim import *`):
    from manim import Scene, Text, ...
    from _lib import BRAND, UP, DOWN, ...
"""

import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
_SRC_DIR = os.path.dirname(_HERE)
if _SRC_DIR not in sys.path:
    sys.path.insert(0, _SRC_DIR)

from manim import (
    BLACK, WHITE, GREY, GREEN, BLUE, RED, YELLOW, ORANGE, PURPLE, PINK,
    UP, DOWN, LEFT, RIGHT, ORIGIN, UR, UL, DR, DL,
    RoundedRectangle, Circle, VGroup, Text, Line,
)

# Brand palette
BRAND = "#C15F3C"        # terracotta orange — logo peak highlight
BRAND_DARK = "#A04E2F"
HIGH_RED = "#D17070"     # dashboard 'high' tag (muted)
MED_AMBER = "#D4A574"    # dashboard 'medium' tag (muted)

# Typography. Two faces, split by audience signal:
#   - FONT_MONO  → JetBrains Mono: pure-English terminal/shell in s02/s09.
#                  The IDE font programmers stare at 8h/day.
#   - FONT_GOTHIC → Sarasa Mono SC: any text that carries CJK. Latin+CJK
#                  share one equal-width grid (JetBrains has no CJK, so using
#                  it for Chinese lines would fall back to a proportional
#                  face and break alignment — verified, see git log).
FONT_GOTHIC = "Sarasa Mono SC"
FONT_MONO = "JetBrains Mono"

# Terminal palette (Catppuccin Mocha) — used by terminal_frame() in s02/s09.
TERM_BG = "#1e1e2e"
TERM_RED = "#f38ba8"
TERM_AMBER = "#fab387"
TERM_GREEN = "#a6e3a1"
TERM_BLUE = "#89b4fa"
TERM_FG = "#cdd6f4"
TERM_DIM = "#6c7086"

# Type scale
TITLE_SIZE = 64
SUBTITLE_SIZE = 32
BODY_SIZE = 24
TAG_SIZE = 28
SMALL_SIZE = 20
TINY_SIZE = 16


def terminal_frame(width, height, title="~/cc-insights — zsh", status=None):
    """macOS-style terminal window centered at ORIGIN.

    Returns (group, bar_y): group is body + 3 dots + title (+ optional
    status bar), bar_y is the title-bar y so callers can place content below.
    Pass status= for a dim bottom status bar (git branch / cwd / shell) —
    the IDE-feel detail that lifts the mock window toward a real screenshot.
    """
    body = RoundedRectangle(
        width=width, height=height, corner_radius=0.18,
        color=TERM_DIM, stroke_width=1.5,
        fill_color=TERM_BG, fill_opacity=1.0,
    ).move_to(ORIGIN)
    bar_y = height / 2 - 0.32
    dots = VGroup(*[
        Circle(radius=0.09, color=c, fill_color=c, fill_opacity=1.0,
               stroke_width=0).move_to([-width / 2 + 0.4 + i * 0.3, bar_y, 0])
        for i, c in enumerate([TERM_RED, TERM_AMBER, TERM_GREEN])
    ])
    title_t = Text(title, font=FONT_MONO, font_size=TINY_SIZE,
                   color=TERM_DIM).move_to([0, bar_y, 0])
    group = VGroup(body, dots, title_t)
    if status:
        status_y = -height / 2 + 0.32
        sep = Line([-width / 2 + 0.3, status_y + 0.28, 0],
                   [width / 2 - 0.3, status_y + 0.28, 0],
                   color=TERM_DIM, stroke_width=1)
        status_t = Text(status, font=FONT_MONO, font_size=TINY_SIZE,
                        color=TERM_DIM).move_to([0, status_y, 0])
        group.add(sep, status_t)
    return group, bar_y
