"""Draft / scratch for scenario 3: 90-degree rotation.

Not meant to be rendered directly. Kept for reference and post-mortem.
"""

from manim import (
    Scene,
    Axes,
    Text,
    Arrow,
    ORIGIN,
    RIGHT,
    UP,
    LEFT,
    DOWN,
    BLUE,
    RED,
    YELLOW,
    WHITE,
    Create,
    Write,
    Rotate,
    AnimationGroup,
    VGroup,
)


def _build():
    axes = Axes(
        x_range=[-2, 2, 1],
        y_range=[-2, 2, 1],
        x_length=5,
        y_length=5,
        tips=True,
    )
    e1 = Arrow(ORIGIN, RIGHT, color=BLUE, buff=0, stroke_width=8)
    e2 = Arrow(ORIGIN, UP, color=RED, buff=0, stroke_width=8)

    matrix_label = Text("R = [[0,-1],[1,0]]").to_edge(RIGHT)
    matrix_label.shift(UP * 2)

    self.play(Create(axes), run_time=0.5)
    self.play(Create(e1), Create(e2), Write(matrix_label), run_time=1.0)
    self.play(
        Rotate(e1, angle=3.14159265 / 2, about_point=ORIGIN),
        Rotate(e2, angle=3.14159265 / 2, about_point=ORIGIN),
        run_time=3.5,
    )
    self.wait(1.0)