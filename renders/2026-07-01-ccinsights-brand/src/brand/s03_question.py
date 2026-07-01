"""Brand 03 — Question (4s)

Layout
    0.0–0.5s   black
    0.5–3.5s   "但你从未真正诊断过自己" rises then holds
    3.5–4.0s   beat

Budget: 0.5 + 2.5 (rise) + 0.5 (hold) + 0.5 (beat) = 4.0s
"""

import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(_HERE))

from manim import (
    Scene, Text, BLACK, WHITE, GREY, BLUE,
    UP, DOWN,
    FadeIn, FadeOut,
)

from _lib import BRAND, SUBTITLE_SIZE


class Question(Scene):
    def construct(self):
        # Bug fix (RED): .shift() doesn't recenter text — Text is left-anchored.
        # Use .move_to([x, y, 0]) so the text is truly centered.
        line = Text(
            "但你从未真正诊断过自己",
            font_size=44, color=WHITE, weight="BOLD"
        ).move_to([0, 0.3, 0])

        # Subtle accent: a small "?" mark fades in below
        accent = Text("?", font_size=72, color=BRAND,
                      weight="BOLD").move_to([0, -1.2, 0])

        self.play(FadeIn(line, shift=UP * 0.5), run_time=2.0)
        self.play(FadeIn(accent), run_time=0.8)
        self.wait(1.2)  # 2.0 + 0.8 + 1.2 = 4.0s
