"""Brand 10 — End card (2s)

Layout
    0.0–0.3s   black
    0.3–1.5s   the logo polyline draws + peak appears
    1.5–2.0s   URL fades in below

Wall-clock budget
    0.3 (intro) + 1.0 (polyline) + 0.4 (peak+title) + 0.3 (URL) = 2.0s
"""

import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(_HERE))

from manim import (
    Scene, Text, Circle, VMobject,
    BLACK, WHITE, GREY,
    UP, DOWN, ORIGIN,
    Create, FadeIn,
)
import numpy as np

from _lib import BRAND, SUBTITLE_SIZE, SMALL_SIZE


def polyline(points, color=WHITE, stroke_width=5):
    m = VMobject(stroke_color=color, stroke_width=stroke_width)
    m.set_points_as_corners([np.array(p, dtype=float) for p in points])
    return m


class End(Scene):
    def construct(self):
        # Bug fix (RED): logo polyline was off-center (x range was -2.4..+1.6,
        # not symmetric around 0). Redesigned with x symmetric around 0, peak
        # at (0, -0.7).
        #
        # Geometry sketch (units):
        #
        #     (-1.5,0.6)(-0.9,0.6)               (0.9,0.6)(1.5,0.6)
        #       \      /                          \      /
        #        (-1.0,0.6)                        (1.0,0.6)
        #           \                                  /
        #            \                                /
        #             \-->(0,-0.7) [PEAK]-->---/       <- pseudo, see below
        #
        # Actually using the cc-insights logo proportions:
        #   top arm: [-1.5,0.6] → [-0.8,0.6] → [-0.4,0.6] → [0,-0.7] →
        #            [0.4,0.6] → [0.8,0.6] → [1.5,0.6]
        #   bottom arm of ❯: [-0.8,0.6] → [-1.5,-0.6]
        top_points = [
            [-1.5,  0.6, 0.0],
            [-0.8,  0.6, 0.0],
            [-0.4,  0.6, 0.0],
            [ 0.0, -0.7, 0.0],
            [ 0.4,  0.6, 0.0],
            [ 0.8,  0.6, 0.0],
            [ 1.5,  0.6, 0.0],
        ]
        bottom_points = [
            [-0.8,  0.6, 0.0],
            [-1.5, -0.6, 0.0],
        ]

        top_arm = polyline(top_points)
        bottom_arm = polyline(bottom_points)
        peak_pos = [0.0, -0.7, 0.0]
        peak_glow = Circle(radius=0.35, color=BRAND,
                           fill_color=BRAND, fill_opacity=0.18).move_to(peak_pos)
        peak = Circle(radius=0.16, color=BRAND,
                      fill_color=BRAND, fill_opacity=1.0).move_to(peak_pos)

        title = Text("cc-insights", font_size=44,
                     color=WHITE, weight="BOLD").move_to([0, -1.4, 0])
        url = Text("github.com/gqy20/cc-insights",
                   font_size=SMALL_SIZE, color=BRAND).move_to([0, -2.05, 0])

        self.play(Create(top_arm), run_time=0.6)
        self.play(Create(bottom_arm), FadeIn(peak_glow), FadeIn(peak),
                  run_time=0.4)
        self.play(FadeIn(title, shift=UP * 0.3), run_time=0.4)
        self.play(FadeIn(url), run_time=0.3)
        self.wait(0.3)
