"""Brand 01 — Hook (2.5s)

Layout
    0.0–0.6s   "你每天都在用 Claude Code" rises
    0.6–1.8s   underline wipe (brand color)
    hold

Budget: 0.6 (rise) + 1.2 (underline) + 0.7 (hold) = 2.5s
"""

import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(_HERE))

from manim import (
    Scene, Text, Line, BLACK, WHITE, GREY, DOWN, LEFT, RIGHT, UP,
    Create, FadeIn,
)

from _lib import BRAND, FONT_GOTHIC


class Hook(Scene):
    def construct(self):
        line = Text("你每天都在用 Claude Code", font=FONT_GOTHIC,
                    font_size=52, color=WHITE, weight="BOLD").shift(UP * 0.2)
        underline = Line(LEFT * 4.5, RIGHT * 4.5, color=BRAND, stroke_width=6)
        underline.next_to(line, DOWN, buff=0.18)

        self.play(FadeIn(line, shift=UP * 0.8), run_time=0.6)
        self.play(Create(underline), run_time=1.2)
        self.wait(0.7)  # 0.6 + 1.2 + 0.7 = 2.5s
