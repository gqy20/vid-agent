"""Brand 03 — Question (4.0s)

"但你从未真正诊断过自己" rises then holds; a brand "?" fades in below.
Text is move_to-centered (Text is left-anchored, .shift() would not recenter).

Budget: 2.0 (rise) + 0.8 (?) + 1.2 (hold) = 4.0s
"""

import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(_HERE))

from manim import (
    Scene, Text, BLACK, WHITE, GREY,
    UP, DOWN,
    FadeIn,
)

from _lib import BRAND, FONT_GOTHIC, SUBTITLE_SIZE


class Question(Scene):
    def construct(self):
        line = Text("但你从未真正诊断过自己", font=FONT_GOTHIC,
                    font_size=44, color=WHITE, weight="BOLD").move_to([0, 0.3, 0])
        accent = Text("?", font=FONT_GOTHIC, font_size=72, color=BRAND,
                      weight="BOLD").move_to([0, -1.2, 0])

        self.play(FadeIn(line, shift=UP * 0.5), run_time=2.0)
        self.play(FadeIn(accent), run_time=0.8)
        self.wait(1.2)  # 2.0 + 0.8 + 1.2 = 4.0s
