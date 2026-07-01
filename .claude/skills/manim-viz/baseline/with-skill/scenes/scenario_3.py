"""
Scenario 3 — 90° rotation of basis vectors
User request:
    6s `-ql` animation:
      1. Axes range [-2, 2]; draw e1=(1,0) blue and e2=(0,1) red.
      2. Show R = [[0, -1], [1, 0]] next to the axes (Text, NOT MathTex).
      3. Rotate: e1 -> (0,1) (stays blue), e2 -> (-1,0) (stays red).
      4. wait 1s.

Design notes (see SKILL.md / api-cheatsheet.md / anti-patterns.md):
    - Explicit, grouped imports — avoid `from manim import *` (#1, #2).
    - Use `Axes(...)` with explicit `x_range=[-2,2,1]`, `y_range=[-2,2,1]`.
    - No `Axes.get_axis_labels()` / `Axes.add_coordinates()` — those spawn
      MathTex and would crash with `FileNotFoundError: 'latex'` since
      pdflatex is not installed (#3, #4, #13).
    - Use `Arrow` (or `Vector`) to render the basis vectors from ORIGIN.
    - Use `Rotate(mob, angle=90*DEGREES, about_point=ORIGIN)` to rotate —
      NOT `Transform(arrow, rotated_arrow)` (#11: Transform interpolates
      stroke_width / max_tip_length_to_length_ratio and head looks weird).
    - The rotation maps e1 -> e2 visually, but the BLUE identity is tied
      to the Python handle that started as e1. We Rotate the SAME arrow
      object 90°, so its color stays BLUE. Same for RED.
    - The matrix R is shown as plain `Text` (multi-line, no MathTex).
      User explicitly said "Text, not MathTex".
    - Wall-clock budget: 0.5 (Create axes + arrows) + 0.3 (FadeIn R) +
      4.0 (Rotate e1 + Rotate e2) + 1.0 (wait) = 5.8s, then wait 0.2 = 6.0s.
      (anti-pattern #16 budget verification)
    - Use `-ql` debug (anti-pattern #10); can step up to `-qh` later.
    - Default 15 fps is fine.
"""

from manim import (
    Scene, Text,
    Axes, Arrow,
    Create, FadeIn, Rotate,
    ORIGIN, UR, DEGREES,
    BLUE, RED, WHITE,
)


class RotationMatrix(Scene):
    def construct(self):
        # ------------------------------------------------------------------
        # Stage 0 — Axes (no labels; no LaTeX-safe get_axis_labels)
        # ------------------------------------------------------------------
        axes = Axes(
            x_range=[-2, 2, 1],
            y_range=[-2, 2, 1],
            x_length=6,
            y_length=6,
            axis_config={"color": WHITE, "include_tip": True},
            tips=True,
        )

        # ------------------------------------------------------------------
        # Stage 1 — Basis vectors e1 (blue) and e2 (red)
        # ------------------------------------------------------------------
        # Arrow from ORIGIN to (1, 0) in axes-coords.
        e1 = Arrow(
            start=axes.c2p(0, 0),
            end=axes.c2p(1, 0),
            color=BLUE,
            buff=0,
            stroke_width=6,
            max_tip_length_to_length_ratio=0.25,
        )
        # Arrow from ORIGIN to (0, 1) in axes-coords.
        e2 = Arrow(
            start=axes.c2p(0, 0),
            end=axes.c2p(0, 1),
            color=RED,
            buff=0,
            stroke_width=6,
            max_tip_length_to_length_ratio=0.25,
        )

        # ------------------------------------------------------------------
        # Stage 2 — Display R matrix as plain Text (NOT MathTex).
        #   Multiline Text; unicode minus "−" rather than "-" to read clean.
        # ------------------------------------------------------------------
        matrix_text = Text(
            "R = [ [ 0 , -1 ] ,\n"
            "      [ 1 ,  0 ] ]",
            font_size=28,
        )
        matrix_text.to_corner(UR, buff=0.6)

        # ------------------------------------------------------------------
        # Wall-clock budget
        #   Create axes           0.5 s
        #   FadeIn arrows         0.4 s
        #   FadeIn matrix_text    0.3 s
        #   Rotate (parallel)     4.0 s
        #   wait                  0.6 s
        #   final wait            0.2 s
        #   total                 6.0 s
        # ------------------------------------------------------------------

        # Stage A — create axes (0.5s)
        self.play(Create(axes), run_time=0.5)

        # Stage B — fade in both basis arrows (0.4s)
        self.play(FadeIn(e1), FadeIn(e2), run_time=0.4)

        # Stage C — fade in matrix R (0.3s)
        self.play(FadeIn(matrix_text), run_time=0.3)

        # Stage D — rotate each arrow 90° about ORIGIN.
        # Same handle, color preserved (BLUE stays BLUE, RED stays RED).
        self.play(
            Rotate(e1, angle=90 * DEGREES, about_point=axes.c2p(0, 0)),
            Rotate(e2, angle=90 * DEGREES, about_point=axes.c2p(0, 0)),
            run_time=4.0,
        )

        # Stage E — settle (0.6s) so the rotation reads cleanly.
        self.wait(0.6)

        # Stage F — explicit final hold required by brief.
        self.wait(0.2)


if __name__ == "__main__":
    # Allow `python scenario_3.py` smoke-check too,
    # though canonical invocation is `uv run manim -ql ...`.
    import sys
    from manim import config
    config.media_dir = "/tmp/green-media"
    config.quality = "low_quality"
    RotationMatrix().render()
    sys.exit(0)