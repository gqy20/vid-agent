"""Brand 08 — Credibility (3s)

Three small badges appear in sequence.
    MIT · Go 1.21+ · 单 binary

Wall-clock budget
    0.2 (intro) + 3 * 0.7 (badges) + 0.5 (hold) = 2.8s, fits 3s
"""

import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(_HERE))

from manim import (
    Scene, Text, Rectangle, VGroup,
    BLACK, WHITE, GREY, BLUE,
    UP, DOWN, LEFT, RIGHT, ORIGIN,
    FadeIn,
)

from _lib import BRAND, BODY_SIZE


BADGES = [
    ("MIT",          "开源许可"),
    ("Go 1.21+",     "现代语言"),
    ("单 binary",     "零依赖"),
]


class Credibility(Scene):
    def construct(self):
        badge_w, badge_h = 3.4, 1.3
        hgap = 0.4
        start_x = -(badge_w + hgap)

        card_objs = []
        for i, (head, sub) in enumerate(BADGES):
            x = start_x + i * (badge_w + hgap)
            box = Rectangle(width=badge_w, height=badge_h,
                            color=BRAND, stroke_width=2,
                            fill_color=BLACK, fill_opacity=0.6).move_to([x, 0, 0])
            head_t = Text(head, font_size=BODY_SIZE + 4, color=BRAND, weight="BOLD").move_to([x, 0.18, 0])
            sub_t = Text(sub, font_size=BODY_SIZE - 4, color=WHITE).move_to([x, -0.25, 0])
            grp = VGroup(box, head_t, sub_t)
            card_objs.append(grp)

        self.wait(0.2)
        for c in card_objs:
            self.play(FadeIn(c, scale=0.85), run_time=0.55)
        self.wait(0.5)
