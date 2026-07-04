"""Brand 07 — Highlight (3.0s)

Giant "24.5min" headline (the peak finding) over a comparison baseline
(行业均值 2.1min, ⬆ 11.6×), with a red 'high' tag. The number now carries
the frame — replaces the small single-card version that read as empty.

Beat × run_time: 0.3 label + 1.0 big number + 0.7 avg + 0.6 delta + 0.4 hold = 3.0s
"""

import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(_HERE))

from manim import (
    Scene, Text, RoundedRectangle, VGroup,
    WHITE, GREY, ORIGIN, RIGHT,
    FadeIn,
)

from _lib import (
    BRAND, HIGH_RED, FONT_GOTHIC, TERM_DIM,
    SUBTITLE_SIZE, BODY_SIZE,
)


class Highlight(Scene):
    def construct(self):
        label = Text("Agent 单调用峰值", font=FONT_GOTHIC, font_size=BODY_SIZE,
                     color=TERM_DIM).move_to([0, 1.9, 0])

        big = Text("24.5", font=FONT_GOTHIC, font_size=120, color=BRAND,
                   weight="BOLD").move_to(ORIGIN)
        unit = Text("min", font=FONT_GOTHIC, font_size=BODY_SIZE + 8,
                    color=WHITE).next_to(big, RIGHT, buff=0.18)
        VGroup(big, unit).move_to([0, 0.4, 0])

        avg = Text("行业均值 2.1min", font=FONT_GOTHIC, font_size=BODY_SIZE,
                   color=GREY).move_to([0, -1.0, 0])

        delta_bg = RoundedRectangle(width=2.8, height=0.75, corner_radius=0.12,
                                    color=HIGH_RED, stroke_width=2,
                                    fill_color=HIGH_RED, fill_opacity=0.18)
        delta = Text("⬆ 11.6×", font=FONT_GOTHIC, font_size=SUBTITLE_SIZE,
                     color=HIGH_RED, weight="BOLD")
        delta_bg.move_to([0, -1.95, 0])
        delta.move_to(delta_bg.get_center())

        self.play(FadeIn(label), run_time=0.3)
        self.play(FadeIn(big), FadeIn(unit), run_time=1.0)
        self.play(FadeIn(avg), run_time=0.7)
        self.play(FadeIn(delta_bg), FadeIn(delta), run_time=0.6)
        self.wait(0.4)
        # 0.3 + 1.0 + 0.7 + 0.6 + 0.4 = 3.0s
