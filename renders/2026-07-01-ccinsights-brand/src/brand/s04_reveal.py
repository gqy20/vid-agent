"""Brand 04 — Reveal (4.0s)

Brand-color block floods the frame, then the product name resolves with a
white underline and the Mandarin value-prop sub-line. The block flood is the
visual climax (kept from the original); additions are the Sarasa font and the
underline as a brand anchor.

Beat × run_time: 1.0 block + 0.9 title + 0.4 underline + 0.6 sub + 1.1 hold = 4.0s
"""

import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(_HERE))

from manim import (
    Scene, Text, Rectangle, Line, BLACK, WHITE,
    UP, ORIGIN, LEFT, RIGHT,
    FadeIn, Create,
)

from _lib import BRAND, FONT_GOTHIC, TITLE_SIZE, SUBTITLE_SIZE


class Reveal(Scene):
    def construct(self):
        block = Rectangle(width=16, height=10, color=BRAND,
                          fill_color=BRAND, fill_opacity=1.0).move_to(ORIGIN)
        self.play(Create(block), run_time=1.0)

        title = Text("cc-insights", font=FONT_GOTHIC, font_size=TITLE_SIZE + 16,
                     color=WHITE, weight="BOLD").move_to([0, 0.55, 0])
        underline = Line(LEFT * 2.4, RIGHT * 2.4, color=WHITE,
                         stroke_width=4).move_to([0, -0.1, 0])
        subtitle = Text("AI 驱动的 Claude Code 使用诊断", font=FONT_GOTHIC,
                        font_size=SUBTITLE_SIZE, color=WHITE).move_to([0, -0.85, 0])

        self.play(FadeIn(title, shift=UP * 0.3), run_time=0.9)
        self.play(Create(underline), run_time=0.4)
        self.play(FadeIn(subtitle, shift=UP * 0.3), run_time=0.6)
        self.wait(1.1)
        # total = 1.0 + 0.9 + 0.4 + 0.6 + 1.1 = 4.0s
