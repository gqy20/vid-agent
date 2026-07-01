"""Brand 07 — Highlight (3s)

Layout: a single high-impact finding card rises and pulses its peak.
    "Agent 单调用 24.5min"   — matches the dashboard 'high' tag

Wall-clock budget
    0.4 (intro) + 1.2 (rise) + 1.4 (pulse x2) = 3.0s
"""

import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(_HERE))

from manim import (
    Scene, Text, Rectangle, Circle, VGroup,
    BLACK, WHITE, GREY, BLUE,
    UP, DOWN, ORIGIN,
    FadeIn,
    rate_functions,
)

from _lib import BRAND, BRAND_DARK, HIGH_RED, SUBTITLE_SIZE, BODY_SIZE


class Highlight(Scene):
    def construct(self):
        box = Rectangle(width=8, height=2.0, color=GREY, stroke_width=2,
                        fill_color=BLACK, fill_opacity=0.6)
        title = Text("高耗时样例",
                     font_size=BODY_SIZE, color=GREY).move_to([0, 0.45, 0])
        body = Text("Agent 单调用 24.5min",
                    font_size=SUBTITLE_SIZE, color=WHITE, weight="BOLD").move_to([0, -0.1, 0])
        tag = Text("high", font_size=BODY_SIZE, color=BLACK, weight="BOLD")
        tag_bg = Rectangle(width=1.2, height=0.55,
                           color=HIGH_RED, fill_color=HIGH_RED, fill_opacity=1.0).move_to([3.3, 0.45, 0])
        tag.move_to(tag_bg.get_center())

        # Peak dot — the brand spot like the logo
        peak = Circle(radius=0.18, color=BRAND, fill_color=BRAND, fill_opacity=1.0).move_to([-3.5, 0, 0])
        peak_glow = Circle(radius=0.42, color=BRAND, fill_color=BRAND, fill_opacity=0.20).move_to(peak.get_center())

        group = VGroup(box, title, tag_bg, tag, body, peak_glow, peak).move_to(ORIGIN)

        self.play(FadeIn(group, shift=UP * 0.4), run_time=1.2)

        # Peak pulses
        self.play(peak_glow.animate.scale(1.6),
                  rate_func=rate_functions.there_and_back, run_time=0.7)
        self.play(peak_glow.animate.scale(1.6),
                  rate_func=rate_functions.there_and_back, run_time=0.7)
        self.wait(0.4)
        # total: 1.2 + 0.7 + 0.7 + 0.4 = 3.0s
