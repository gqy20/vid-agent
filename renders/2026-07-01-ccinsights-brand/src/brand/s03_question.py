"""Brand 03 — Question (4.0s)

Pivot from plain text to a diagnostic frame: a small setup line, the
question with 从未真正 branded, and an ECG pulse line drawing L→R
underneath — the visual metaphor for 诊断 (a code checkup). Fixes the
"soul online, skin missing" feedback on the bare-text version.

Beat × run_time: 0.4 setup + 1.2 question + 1.0 ecg draw + 0.4 ? + 1.0 hold = 4.0s
"""

import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(_HERE))

from manim import (
    Scene, Text, VGroup, VMobject, WHITE, GREY, UP, RIGHT, UR,
    FadeIn, Create,
    rate_functions,
)
import numpy as np

from _lib import BRAND, FONT_GOTHIC, TERM_DIM, BODY_SIZE, SUBTITLE_SIZE


# ECG pulse — 4 PQRST complexes, drawn L→R as a diagnostic sweep.
ECG_PTS = [
    (-6.0, 0.0), (-4.5, 0.0), (-4.2, 0.15), (-4.05, -0.4), (-3.9, 1.0),
    (-3.75, -0.7), (-3.6, 0.1), (-3.0, 0.0),
    (-2.0, 0.0), (-1.7, 0.15), (-1.55, -0.4), (-1.4, 1.0), (-1.25, -0.7),
    (-1.1, 0.1), (-0.5, 0.0),
    (0.5, 0.0), (0.8, 0.15), (0.95, -0.4), (1.1, 1.0), (1.25, -0.7),
    (1.4, 0.1), (2.0, 0.0),
    # 4th complex is missing — flat where a beat should be, the visual
    # punchline for 从未真正诊断 (a skipped checkup).
    (3.0, 0.0), (3.4, 0.05), (3.8, 0.0), (4.5, 0.0), (5.5, 0.0), (6.0, 0.0),
]


class Question(Scene):
    def construct(self):
        setup = Text("你每天写代码", font=FONT_GOTHIC, font_size=BODY_SIZE,
                     color=TERM_DIM).move_to([0, 1.7, 0])

        # question with 从未真正 branded — three segments joined into one line
        a = Text("但你", font=FONT_GOTHIC, font_size=SUBTITLE_SIZE + 12,
                 color=WHITE, weight="BOLD")
        b = Text("从未真正", font=FONT_GOTHIC, font_size=SUBTITLE_SIZE + 12,
                 color=BRAND, weight="BOLD")
        c = Text("诊断过自己", font=FONT_GOTHIC, font_size=SUBTITLE_SIZE + 12,
                 color=WHITE, weight="BOLD")
        b.next_to(a, RIGHT, buff=0.06)
        c.next_to(b, RIGHT, buff=0.06)
        line = VGroup(a, b, c).move_to([0, 0.5, 0])

        ecg = VMobject(stroke_color=GREY, stroke_width=2)
        ecg.set_points_as_corners([np.array(p + (0.0,)) for p in ECG_PTS])
        ecg.scale(0.5).move_to([0, -1.1, 0])

        qmark = Text("?", font=FONT_GOTHIC, font_size=72, color=BRAND,
                     weight="BOLD").to_corner(UR, buff=0.8)

        self.play(FadeIn(setup), run_time=0.4)
        self.play(FadeIn(line, shift=UP * 0.3), run_time=1.2)
        self.play(Create(ecg, rate_func=rate_functions.linear), run_time=1.0)
        self.play(FadeIn(qmark), run_time=0.4)
        self.wait(1.0)
        # 0.4 + 1.2 + 1.0 + 0.4 + 1.0 = 4.0s
