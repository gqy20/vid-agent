"""Brand 08 — Credibility (2.4s)

A "开源 · 生产就绪" header with a brand underline, then three brand-stroked
badges fade in as a staggered row. Same card language as s06/s07, so the
credibility segment stops reading as floating labels and joins the visual
system. No fabricated metrics (stars/contributors) — kept to verifiable
claims (license / language / deployment).

Beat × run_time: 0.35 header + 0.25 underline + 0.9 badges + 0.9 hold = 2.4s
"""

import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(_HERE))

from manim import (
    Scene, Text, Line, Square, RoundedRectangle, VGroup,
    BLACK, WHITE, GREY,
    UP, DOWN, LEFT, RIGHT,
    FadeIn, Create,
)

from _lib import BRAND, FONT_GOTHIC, SUBTITLE_SIZE, BODY_SIZE, SMALL_SIZE


BADGES = [
    ("MIT",        "开源许可"),
    ("Go 1.21+",   "现代语言"),
    ("单 binary",  "零依赖部署"),
]


class Credibility(Scene):
    def construct(self):
        header_y = 1.7
        title = Text("开源 · 生产就绪", font=FONT_GOTHIC, font_size=SUBTITLE_SIZE,
                     color=WHITE, weight="BOLD").move_to([0, header_y, 0])
        ul = Line(LEFT * 1.4, RIGHT * 1.4, color=BRAND,
                  stroke_width=4).move_to([0, header_y - 0.45, 0])

        badge_w, badge_h = 3.4, 1.7
        gap = 0.45
        x0 = -(len(BADGES) - 1) * (badge_w + gap) / 2
        badge_y = -0.3

        badges = []
        for i, (head, sub) in enumerate(BADGES):
            x = x0 + i * (badge_w + gap)
            box = RoundedRectangle(
                width=badge_w, height=badge_h, corner_radius=0.14,
                color=BRAND, stroke_width=2.5,
                fill_color=BRAND, fill_opacity=0.12,
            ).move_to([x, badge_y, 0])
            marker = Square(side_length=0.16, color=BRAND, fill_color=BRAND,
                            fill_opacity=1.0).move_to(
                [x - badge_w / 2 + 0.35, badge_y + badge_h / 2 - 0.35, 0])
            head_t = Text(head, font=FONT_GOTHIC, font_size=BODY_SIZE + 6,
                          color=BRAND, weight="BOLD").move_to([x, badge_y + 0.22, 0])
            sub_t = Text(sub, font=FONT_GOTHIC, font_size=SMALL_SIZE,
                         color=WHITE).move_to([x, badge_y - 0.4, 0])
            badges.append(VGroup(box, marker, head_t, sub_t))

        self.play(FadeIn(title), run_time=0.35)
        self.play(Create(ul), run_time=0.25)
        self.play(FadeIn(VGroup(*badges), lag_ratio=0.18), run_time=0.9)
        self.wait(0.9)
        # total ≈ 0.35 + 0.25 + 0.9 + 0.9 = 2.4s
