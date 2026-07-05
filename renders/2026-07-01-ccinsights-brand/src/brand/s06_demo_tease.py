"""Brand 06 — Demo tease (4.0s)

Six dashboard cards in a 3×2 grid. Cards now carry brand-stroked edges and
larger bold values; the headline metric (消息数) is emphasized in brand color
so the grid reads as a dashboard with a focal point, not a flat table.

Budget: 0.2 + 6*0.5 (cards) + 0.8 hold = 4.0s
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
    BRAND, BLACK, WHITE,
    FONT_GOTHIC, TERM_DIM,
    SMALL_SIZE,
)


# (label, value, hero) — hero is the headline metric, emphasized in brand color
CARDS = [
    ("消息数",  "110,375", True),
    ("命令调用", "14,578",  False),
    ("工具调用", "45,749",  False),
    ("Token",   "8.2G",    False),
    ("活跃项目", "97",      False),
    ("诊断项",   "3",       False),
]


class DemoTease(Scene):
    def construct(self):
        card_w, card_h = 3.4, 1.4
        hgap, vgap = 0.3, 0.3
        grid_origin_x = -(card_w + hgap)
        grid_origin_y = (card_h + vgap) / 2 + 0.2

        cards = []
        for i, (label, value, hero) in enumerate(CARDS):
            r, c = divmod(i, 3)
            x = grid_origin_x + c * (card_w + hgap)
            y = grid_origin_y - r * (card_h + vgap)

            box = Rectangle(width=card_w, height=card_h,
                            color=BRAND, stroke_width=1.5,
                            fill_color=BLACK, fill_opacity=0.5)
            label_t = Text(label, font=FONT_GOTHIC, font_size=SMALL_SIZE,
                           color=TERM_DIM).move_to([0, 0.34, 0])
            value_t = Text(
                value, font=FONT_GOTHIC,
                font_size=40 if hero else 32,
                color=BRAND if hero else WHITE, weight="BOLD",
            ).move_to([0, -0.18, 0])
            grp = VGroup(box, label_t, value_t).move_to([x, y, 0])
            cards.append(grp)

        self.wait(0.2)
        for card in cards:
            self.play(FadeIn(card, scale=0.9), run_time=0.5)
        self.wait(0.8)
