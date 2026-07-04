"""Brand 02 — Pain (2.8s)

A real-looking terminal (Catppuccin Mocha, title bar, blinking cursor)
showing a frustrated fix loop. Tool calls are syntax-colored (Read blue,
Edit amber); the two pain lines flare red; a "↻ loop detected" chip flags
the cycle. Replaces the previous black-bg floating-text version.

Beat × run_time: 0.4 frame + 0.6 lines + 0.35 chip + 0.2 cursor + 0.35 blink + 0.5 ? + 0.4 hold = 2.8s
"""

import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(_HERE))

from manim import (
    Scene, Text, RoundedRectangle, VGroup,
    UR,
    FadeIn,
    rate_functions,
)

from _lib import (
    BRAND, FONT_MONO, terminal_frame,
    TERM_BG, TERM_FG, TERM_RED, TERM_BLUE, TERM_AMBER,
    TINY_SIZE,
)


# (line, color) — tool calls colored One-Dark-style; pain lines red.
LOG = [
    ("❯ fix the bug in auth",       TERM_FG),
    ("  Read   src/auth.go",        TERM_BLUE),
    ("❯ still broken, try again",   TERM_RED),
    ("  Edit   src/auth.go",        TERM_AMBER),
    ("❯ nope, errors persist",      TERM_RED),
    ("  Edit   src/auth.go",        TERM_AMBER),
]


class Pain(Scene):
    def construct(self):
        win_w, win_h = 11.0, 5.2
        frame, bar_y = terminal_frame(
            win_w, win_h, "history.jsonl — cc-insights",
            status="main ✱   src/auth.go   Go 1.21   ⏱ 2.1min")

        content_top = bar_y - 0.75
        line_h = 0.5
        x_left = -win_w / 2 + 0.4
        lines = []
        for i, (body, color) in enumerate(LOG):
            t = Text(body, font=FONT_MONO, font_size=TINY_SIZE, color=color)
            t.move_to([x_left + t.width / 2, content_top - i * line_h, 0])
            lines.append(t)

        last = lines[-1]
        cursor = Text("_", font=FONT_MONO, font_size=TINY_SIZE,
                      color=TERM_FG).move_to(
            [last.get_right()[0] + 0.12, last.get_center()[1], 0])

        chip_t = Text("↻ loop detected", font=FONT_MONO, font_size=TINY_SIZE,
                      color=TERM_RED, weight="BOLD")
        chip = RoundedRectangle(width=2.6, height=0.42, corner_radius=0.12,
                                color=TERM_RED, stroke_width=1.5,
                                fill_color=TERM_BG, fill_opacity=0.6)
        chip.move_to([win_w / 2 - 1.6, bar_y - 0.75, 0])
        chip_t.move_to(chip.get_center())

        qmark = Text("?", font=FONT_MONO, font_size=64, color=BRAND,
                     weight="BOLD").to_corner(UR, buff=0.7)

        self.play(FadeIn(frame), run_time=0.4)
        self.play(FadeIn(VGroup(*lines), lag_ratio=0.12), run_time=0.6)
        self.play(FadeIn(chip), FadeIn(chip_t), run_time=0.35)
        self.play(FadeIn(cursor), run_time=0.2)
        self.play(cursor.animate.set_opacity(0.2),
                  rate_func=rate_functions.there_and_back, run_time=0.35)
        self.play(FadeIn(qmark), run_time=0.5)
        self.wait(0.4)
        # 0.4 + 0.6 + 0.35 + 0.2 + 0.35 + 0.5 + 0.4 = 2.8s
