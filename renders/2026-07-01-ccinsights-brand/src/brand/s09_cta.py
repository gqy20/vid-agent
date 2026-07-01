"""Brand 09 — CTA (3s)

Layout
    0.0–0.3s   black
    0.3–1.5s   terminal prompt: `❯ cc-insights` (in green + bright brand-orange cursor)
    1.5–3.0s   three install commands appear in a vertical list

Wall-clock budget
    0.2 (intro) + 1.0 (prompt) + 1.8 (3 commands) = 3.0s
"""

import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(_HERE))

from manim import (
    Scene, Text, VGroup,
    BLACK, WHITE, GREY, GREEN,
    UP, DOWN, LEFT,
    FadeIn, Write,
)

from _lib import BRAND, BODY_SIZE, TINY_SIZE


INSTALL_COMMANDS = [
    "brew install cc-insights",
    "go install github.com/gqy20/cc-insights/cmd/cc-insights@latest",
    "gh release download --repo gqy20/cc-insights",
]


class CTA(Scene):
    def construct(self):
        # Prompt
        prompt_text = "❯ cc-insights"
        prompt = Text(prompt_text, font_size=36, color=GREEN).to_edge(UP, buff=1.6)

        # Three install commands
        lines = VGroup(*[
            Text(f"$ {c}", font_size=TINY_SIZE, color=WHITE)
                .to_edge(LEFT, buff=1.0)
                .shift(DOWN * (1.0 - 0.5 * i))
            for i, c in enumerate(INSTALL_COMMANDS)
        ])

        self.play(FadeIn(prompt, shift=LEFT * 0.3), run_time=0.8)
        for line in lines:
            self.play(FadeIn(line, shift=LEFT * 0.2), run_time=0.55)
        self.wait(0.4)
        # 0.8 + 3*0.55 + 0.4 = 2.85s, fits 3s
