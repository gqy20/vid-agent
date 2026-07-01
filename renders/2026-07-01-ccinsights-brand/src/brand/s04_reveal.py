"""Brand 04 — Reveal (4s)

Layout
    0.0–0.5s   black
    0.5–2.0s   brand-color block wipes in from bottom (full-width)
    2.0–3.5s   "cc-insights" appears large, white; subtitle appears below
    3.5–4.0s   brief hold

Budget: 0.5 (intro) + 1.5 (block wipe) + 1.5 (text) + 0.5 (hold) = 4.0s
"""

import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(_HERE))

from manim import (
    Scene, Text, Rectangle, BLACK, WHITE, GREY, BLUE,
    UP, DOWN, ORIGIN,
    FadeIn, Create,
)

from _lib import BRAND, BRAND_DARK, TITLE_SIZE, SUBTITLE_SIZE


class Reveal(Scene):
    def construct(self):
        # Brand-color rectangle: full-frame block. Use Create (drawn from center)
        # so the wipe-in looks like the brand color flooding the screen.
        block = Rectangle(width=16, height=10, color=BRAND,
                          fill_color=BRAND, fill_opacity=1.0).move_to(ORIGIN)

        self.play(Create(block, run_time=1.0), run_time=1.0)

        title = Text("cc-insights", font_size=TITLE_SIZE + 16, color=WHITE,
                     weight="BOLD").move_to([0, 0.5, 0])
        subtitle = Text("AI 驱动的 Claude Code 使用诊断",
                        font_size=SUBTITLE_SIZE, color=WHITE).move_to([0, -0.6, 0])

        self.play(FadeIn(title, shift=UP * 0.3), run_time=0.9)
        self.play(FadeIn(subtitle, shift=UP * 0.3), run_time=0.6)
        self.wait(1.5)
        # total = 1.0 + 0.9 + 0.6 + 1.5 = 4.0s
