"""Scenario 2: Quadratic formula geometric demonstration.

Visualises y = x^2 - 5x + 6 on Axes, marks its two roots (x=2, x=3)
on the x-axis as bright green dots, then displays the discriminant
calculation and the resulting quadratic-formula solution step by step
using plain ``Text`` (LaTeX is not installed in this environment, so
``MathTex`` is intentionally avoided).
"""

from manim import (
    Axes,
    Create,
    Dot,
    GREEN,
    BLUE,
    YELLOW,
    WHITE,
    Text,
    UP,
    DOWN,
    RIGHT,
    Write,
    ReplacementTransform,
    FadeIn,
    Scene,
    VGroup,
)


class Scenario2(Scene):
    def construct(self):
        # ----- environment check: confirm LaTeX is unavailable -----
        # We confirmed ``latex`` / ``pdflatex`` are NOT on PATH earlier with
        # ``which latex`` (returned "not found"). Manim's Tex/MathTex classes
        # shell out to pdflatex internally, so we must avoid them entirely.
        # Plain ``Text`` is used for every formula and axis label below.

        # ----- axes & parabola -----
        axes = Axes(
            x_range=[0, 5, 1],
            y_range=[-1, 4, 1],
            x_length=7,
            y_length=4,
            tips=False,
            axis_config={"color": WHITE},
        )
        # Plain-Text axis labels — avoids Axes.get_axis_labels() which uses
        # MathTex under the hood and would invoke pdflatex.
        x_label = Text("x", font_size=28).next_to(axes.x_axis.get_end(), RIGHT, buff=0.2)
        y_label = Text("y", font_size=28).next_to(axes.y_axis.get_end(), UP, buff=0.2)
        labels = VGroup(x_label, y_label)

        parabola = axes.plot(
            lambda x: x ** 2 - 5 * x + 6,
            color=BLUE,
            x_range=[0.5, 4.5],
        )

        # ----- root markers on the x-axis -----
        root_2 = Dot(axes.c2p(2, 0), color=GREEN, radius=0.12)
        root_3 = Dot(axes.c2p(3, 0), color=GREEN, radius=0.12)

        # ----- formula banner near the top -----
        # Use plain Text() to avoid MathTex's pdflatex dependency.
        # Superscripts are written with the Unicode superscript digits
        # (x², x³ ...) so no LaTeX is needed.
        formula1 = Text("y = x² − 5x + 6", font_size=36, color=YELLOW)
        formula2 = Text(
            "D = b² − 4ac = 25 − 24 = 1",
            font_size=36,
            color=YELLOW,
        )
        formula3 = Text(
            "x = (−b ± √D) / 2a = (5 ± 1) / 2",
            font_size=36,
            color=YELLOW,
        )

        banner = VGroup(formula1, formula2, formula3).arrange(
            DOWN, buff=0.25
        ).to_edge(UP)

        # ----- assemble the scene -----
        self.play(Create(axes), Write(labels))
        self.play(Create(parabola), run_time=2)
        self.wait(0.3)

        # First formula appears together with the two root dots
        self.play(Write(formula1))
        self.play(FadeIn(root_2), FadeIn(root_3))
        self.wait(0.6)

        # Swap formula1 -> formula2 (transform keeps the banner position stable)
        self.play(ReplacementTransform(formula1, formula2))
        self.wait(0.6)

        # Swap formula2 -> formula3
        self.play(ReplacementTransform(formula2, formula3))
        self.wait(0.4)

        # Highlight the two roots at the end: scale + brighten via recolor.
        # Recolor via a brief flash (YELLOW -> GREEN_E) since Dot.color can't
        # be animated directly with FadeToColor on this manim version.
        flash_2 = root_2.copy().set_color(YELLOW).scale(1.6)
        flash_3 = root_3.copy().set_color(YELLOW).scale(1.6)
        self.play(
            FadeIn(flash_2, scale=1.4),
            FadeIn(flash_3, scale=1.4),
            run_time=0.6,
        )
        self.play(
            ReplacementTransform(flash_2, root_2.copy().set_color(GREEN)),
            ReplacementTransform(flash_3, root_3.copy().set_color(GREEN)),
            run_time=0.4,
        )
        self.wait(0.8)

        # Final wait so the last frame lingers in the rendered video.
        self.wait(0.5)