"""Brand 09 — CTA (3.0s)

Terminal window titled ~/projects — zsh. Prompt runs `cc-insights`, three
install commands appear, then a green "✓ installed" echo lands — the echo
is what turns the mock window into something that reads as a real
screenshot. Status bar along the bottom (git branch / cwd / shell).

Beat × run_time: 0.4 frame + 0.55 prompt + 3*0.35 cmds + 0.35 echo + 0.2 cursor + 0.25 blink + 0.2 hold = 3.0s
"""

import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(_HERE))

from manim import (
    Scene, Text, VGroup,
    LEFT,
    FadeIn,
    rate_functions,
)

from _lib import (
    FONT_MONO, terminal_frame,
    TERM_FG, TERM_DIM, TERM_GREEN,
    TINY_SIZE, BODY_SIZE,
)


INSTALL_COMMANDS = [
    "brew install cc-insights",
    "go install github.com/gqy20/cc-insights/cmd/cc-insights@latest",
    "gh release download --repo gqy20/cc-insights",
]


class CTA(Scene):
    def construct(self):
        win_w, win_h = 11.0, 4.8
        frame, bar_y = terminal_frame(
            win_w, win_h, "~/projects — zsh",
            status="main   ~/projects/cc-insights   zsh 5.9")

        content_top = bar_y - 0.8
        x_left = -win_w / 2 + 0.4

        prompt = Text("❯ cc-insights", font=FONT_MONO, font_size=BODY_SIZE,
                      color=TERM_GREEN)
        prompt.move_to([x_left + prompt.width / 2, content_top, 0])

        cmds = []
        for i, c in enumerate(INSTALL_COMMANDS):
            t = Text("$ " + c, font=FONT_MONO, font_size=TINY_SIZE, color=TERM_FG)
            t.move_to([x_left + t.width / 2, content_top - 0.75 - i * 0.55, 0])
            cmds.append(t)

        echo = Text("✓ installed cc-insights v1.2.0", font=FONT_MONO,
                    font_size=TINY_SIZE, color=TERM_GREEN)
        echo.move_to([x_left + echo.width / 2,
                      cmds[-1].get_center()[1] - 0.55, 0])

        cursor = Text("_", font=FONT_MONO, font_size=TINY_SIZE,
                      color=TERM_FG).move_to(
            [cmds[-1].get_right()[0] + 0.12, cmds[-1].get_center()[1], 0])

        self.play(FadeIn(frame), run_time=0.4)
        self.play(FadeIn(prompt, shift=LEFT * 0.2), run_time=0.55)
        for c in cmds:
            self.play(FadeIn(c, shift=LEFT * 0.15), run_time=0.35)
        self.play(FadeIn(echo), run_time=0.35)
        self.play(FadeIn(cursor), run_time=0.2)
        self.play(cursor.animate.set_opacity(0.2),
                  rate_func=rate_functions.there_and_back, run_time=0.25)
        self.wait(0.2)
        # 0.4 + 0.55 + 3*0.35 + 0.35 + 0.2 + 0.25 + 0.2 = 3.0s
