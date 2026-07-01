"""Brand 05 — Promise (4s)

5 verbs sequentially emphasized with the brand color:
    读取 · 解析 · 汇总 · 推荐 · 改进

Layout
    0.0–0.5s   black
    0.5–3.5s   each verb flashes brand-color for ~0.6s, in sequence
    3.5–4.0s   beat

Budget: 0.5 (intro) + 5 * 0.6 (verbs) + 0.2 (out) = 3.7s, fits 4s
"""

import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(_HERE))

from manim import (
    Scene, Text, VGroup, BLACK, WHITE, GREY,
    UP, DOWN, ORIGIN,
    FadeIn, FadeOut,
)

from _lib import BRAND, TITLE_SIZE


VERBS = ["读取", "解析", "汇总", "推荐", "改进"]


class Promise(Scene):
    def construct(self):
        for verb in VERBS:
            word = Text(verb, font_size=TITLE_SIZE, color=BRAND, weight="BOLD").move_to(ORIGIN)
            self.play(FadeIn(word, shift=UP * 0.4), run_time=0.25)
            self.play(FadeOut(word, shift=DOWN * 0.4), run_time=0.25)
        self.wait(0.4)
