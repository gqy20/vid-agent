"""Brand 01 — Hook (3s)

Layout
    0.0–0.5s   black
    0.5–2.5s   "你每天都在用 Claude Code" rises from bottom
    2.5–3.0s   underline wipe (orange brand color)

Budget: 0.5 (intro) + 2.0 (rise) + 0.5 (underline) = 3.0s
"""

import os
import sys

# Add the project's src/ directory to sys.path so `from _lib import ...`
# works whether we run from src/ or src/brand/.
_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(_HERE))

from manim import (
    Scene, Text, Line, BLACK, WHITE, GREY, DOWN, LEFT, RIGHT, UP,
    Create, FadeIn,
)

from _lib import BRAND


class Hook(Scene):
    def construct(self):
        line = Text("你每天都在用 Claude Code",
                    font_size=52, color=WHITE, weight="BOLD").shift(UP * 0.2)
        underline = Line(LEFT * 4.5, RIGHT * 4.5, color=BRAND, stroke_width=6)
        underline.next_to(line, DOWN, buff=0.18)

        self.play(FadeIn(line, shift=UP * 0.8), run_time=0.6)
        self.play(Create(underline, run_time=0.8), run_time=1.2)
        self.wait(0.7)  # budget tail: 3.0s
