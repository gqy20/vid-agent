"""Brand 06 — Demo tease (5s)

Six dashboard cards appear in a 3-by-2 grid with their headline numbers.
"""

import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(_HERE))

from manim import (
    Scene, Text, Rectangle, VGroup,
    FadeIn,
)

from _lib import (
    BRAND, BRAND_DARK, HIGH_RED, MED_AMBER,
    SUBTITLE_SIZE, SMALL_SIZE, TINY_SIZE,
    BLACK, WHITE, GREY,
    UP, DOWN, LEFT, RIGHT, ORIGIN,
)


# (label, value) — drawn from docs/dashboard.png
CARDS = [
    ("消息数",  "110,375"),
    ("命令调用", "14,578"),
    ("工具调用", "45,749"),
    ("Token",   "8.2G"),
    ("活跃项目", "97"),
    ("诊断项",   "3"),
]


class DemoTease(Scene):
    def construct(self):
        # Bug fix (RED): cards were overflowing the canvas because
        #   card_w=4.2 × 3 + 2×0.3 = 13.2  (manim default width ≈14.2,
        #   but 4-char CN labels and 6-digit values needed more headroom).
        # Shrunk cards + smaller value font + reduced value displacement.
        card_w, card_h = 3.4, 1.4
        hgap, vgap = 0.3, 0.3
        grid_origin_x = -(card_w + hgap)            # leftmost card center
        grid_origin_y = (card_h + vgap) / 2 + 0.2

        cards = []
        for i, (label, value) in enumerate(CARDS):
            r, c = divmod(i, 3)
            x = grid_origin_x + c * (card_w + hgap)
            y = grid_origin_y - r * (card_h + vgap)

            box = Rectangle(width=card_w, height=card_h,
                            color=GREY, stroke_width=2,
                            fill_color=BLACK, fill_opacity=0.5)
            label_t = Text(label, font_size=SMALL_SIZE, color=GREY).move_to([x, y + 0.34, 0])
            # Smaller value font so "110,375" fits inside 3.4-unit card.
            value_t = Text(value, font_size=26, color=WHITE, weight="BOLD").move_to([x, y - 0.18, 0])
            grp = VGroup(box, label_t, value_t).move_to([x, y, 0])
            cards.append(grp)

        # ---- Sequence ---------------------------------------------------
        self.wait(0.2)
        for card in cards:
            self.play(FadeIn(card, scale=0.9), run_time=0.5)
        self.wait(0.8)
