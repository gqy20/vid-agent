"""Brand 10 — End card (2.0s)

Logo draws ~1.4× larger with a heavier stroke, the product name lands in
bold white under a Mandarin slogan (closes the "looks unfinished" gap), and
a brand-filled "★ Star on GitHub" CTA button replaces the bare URL — a real
call-to-action instead of credits.

Beat × run_time: 0.2 intro + 0.6 logo + 0.4 title + 0.3 slogan + 0.4 CTA + 0.1 hold = 2.0s
"""

import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(_HERE))

from manim import (
    Scene, Text, Circle, VMobject, RoundedRectangle, VGroup,
    BLACK, WHITE, GREY,
    UP, ORIGIN,
    Create, FadeIn,
)
import numpy as np

from _lib import BRAND, FONT_GOTHIC, SMALL_SIZE, BODY_SIZE


def polyline(points, color=WHITE, stroke_width=8):
    m = VMobject(stroke_color=color, stroke_width=stroke_width)
    m.set_points_as_corners([np.array(p, dtype=float) for p in points])
    return m


class End(Scene):
    def construct(self):
        top_points = [
            [-1.5,  0.6, 0.0], [-0.8, 0.6, 0.0], [-0.4, 0.6, 0.0],
            [ 0.0, -0.7, 0.0],
            [ 0.4,  0.6, 0.0], [ 0.8, 0.6, 0.0], [ 1.5, 0.6, 0.0],
        ]
        bottom_points = [[-0.8, 0.6, 0.0], [-1.5, -0.6, 0.0]]
        top_arm = polyline(top_points)
        bottom_arm = polyline(bottom_points)
        peak_pos = [0.0, -0.7, 0.0]
        peak_glow = Circle(radius=0.35, color=BRAND,
                           fill_color=BRAND, fill_opacity=0.18).move_to(peak_pos)
        peak = Circle(radius=0.16, color=BRAND,
                      fill_color=BRAND, fill_opacity=1.0).move_to(peak_pos)
        logo = VGroup(top_arm, bottom_arm, peak_glow, peak).scale(1.4).shift(UP * 1.2)

        title = Text("cc-insights", font=FONT_GOTHIC, font_size=52,
                     color=WHITE, weight="BOLD").move_to([0, -0.7, 0])
        slogan = Text("看清你的每一次 Claude Code 会话", font=FONT_GOTHIC,
                      font_size=SMALL_SIZE, color=GREY).move_to([0, -1.35, 0])

        cta_text = Text("★  Star on GitHub", font=FONT_GOTHIC,
                        font_size=BODY_SIZE, color=WHITE, weight="BOLD")
        cta_btn = RoundedRectangle(width=4.8, height=0.85, corner_radius=0.2,
                                   color=BRAND, fill_color=BRAND, fill_opacity=0.9)
        cta_text.move_to(cta_btn.get_center())
        cta = VGroup(cta_btn, cta_text).move_to([0, -2.25, 0])

        self.wait(0.2)
        self.play(Create(top_arm), Create(bottom_arm),
                  FadeIn(peak_glow), FadeIn(peak), run_time=0.6)
        self.play(FadeIn(title, shift=UP * 0.3), run_time=0.4)
        self.play(FadeIn(slogan), run_time=0.3)
        self.play(FadeIn(cta, shift=UP * 0.2), run_time=0.4)
        self.wait(0.1)
        # total = 0.2 + 0.6 + 0.4 + 0.3 + 0.4 + 0.1 = 2.0s
