"""Brand 02 — Pain (4s)

Layout
    0.0–0.5s   black
    0.5–3.0s   6 lines of history.jsonl scroll up; line 3 (last-write-loop) loops
    3.0–4.0s   the loop indicator ⤴ pulses; "?" appears top-right

Budget: 0.5 (intro) + 2.5 (scroll + loop start) + 1.0 (final pulse) = 4.0s

Note: terminal lines use plain Text (Unicode arrows, no LaTeX); no MathTex.
"""

import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(_HERE))

from manim import (
    Scene, Text, VGroup,
    BLACK, WHITE, GREY, GREEN, BLUE,
    UP, DOWN, LEFT, RIGHT, ORIGIN, UR,
    Create, FadeIn, FadeOut,
    rate_functions,
)

from _lib import BRAND, BODY_SIZE, TINY_SIZE


SAMPLE_LINES = [
    '{"role":"user","content":"fix the bug in auth","ts":1718000000}',
    '{"role":"assistant","tool_use":"Read","ts":1718000001}',
    '{"role":"user","content":"still broken, try again","ts":1718000042}',
    '{"role":"assistant","tool_use":"Edit","ts":1718000043}',
    '{"role":"user","content":"nope, errors persist","ts":1718000071}',
    '{"role":"assistant","tool_use":"Edit","ts":1718000072}',
]


class Pain(Scene):
    def construct(self):
        # ---- Build terminal lines ---------------------------------------
        lines = VGroup(*[
            Text(s, font_size=TINY_SIZE, color=GREEN)
                .to_edge(LEFT, buff=0.4)
                .shift(UP * (2.2 - 0.4 * i))
            for i, s in enumerate(SAMPLE_LINES)
        ])
        loop_marker = Text("⤴", font_size=32, color=BRAND).next_to(lines[2], RIGHT, buff=0.2)

        # 0.5 — lines fade in (the scroll-up illusion)
        self.play(FadeIn(lines), run_time=0.8)

        # 1.3 — loop marker appears, blinks 2x via opacity oscillation
        self.play(FadeIn(loop_marker), run_time=0.2)
        self.play(
            loop_marker.animate.set_opacity(0.3),
            rate_func=rate_functions.there_and_back, run_time=0.4
        )
        self.play(
            loop_marker.animate.set_opacity(0.3).set_opacity(1.0),
            rate_func=rate_functions.there_and_back, run_time=0.4
        )

        # 2.6 — question mark appears top-right
        qmark = Text("?", font_size=72, color=BRAND, weight="BOLD").to_corner(UR, buff=1.0)
        self.play(FadeIn(qmark), run_time=0.6)
        self.wait(0.4)
        # total: 0.8 + 0.2 + 0.4 + 0.4 + 0.6 + 0.4 = 2.8s, fit in 4.0s budget
