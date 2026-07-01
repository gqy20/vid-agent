"""Scenario 2 — 8s quadratic-formula geometry demo.

Anti-patterns avoided (#N from .claude/skills/manim/anti-patterns.md):
- #1/#2: explicit from-imports (no `from manim import *`); direction constants imported.
- #3/#4/#5: no `Axes.get_axis_labels()` / `Axes.add_coordinates()` /
  `NumberLine.add_labels()` — manual Text labels via `next_to`.
- #6: no `DecimalNumber` / `Integer` — pure Text.
- #8: only `UR`/`UL`/`DR`/`DL` short names, never `UP_RIGHT`.
- #13: no LaTeX. Formulas use Unicode (`²`, `−`, `√`, `±`) + `Text`.
- #14: `axes.plot(..., x_range=...)` explicit.
- #16: total run_time + wait budgeted to ~8.0 s.
- #17: mobjects appear via `self.play(FadeIn/Create/Write)`, not bare `self.add`
  used as a "transition".
"""
from manim import (
    Scene, Axes, Dot, Text, VGroup,
    Create, Write, FadeIn, ReplacementTransform,
    GREEN, BLUE, YELLOW, WHITE, UP, DOWN, RIGHT,
)


class QuadraticRoots(Scene):
    def construct(self):
        # --- Coordinate frame (manual labels to dodge get_axis_labels MathTex) ---
        axes = Axes(
            x_range=[0, 5, 1],
            y_range=[-1, 4, 1],
            x_length=7, y_length=4,
            tips=False,
            axis_config={"color": WHITE},
        )
        x_label = Text("x", font_size=28).next_to(axes.x_axis.get_end(), RIGHT, buff=0.2)
        y_label = Text("y", font_size=28).next_to(axes.y_axis.get_end(), UP,   buff=0.2)
        labels = VGroup(x_label, y_label)

        # --- Parabola & roots ---
        parabola = axes.plot(
            lambda x: x ** 2 - 5 * x + 6,
            x_range=[0.5, 4.5],
            color=BLUE,
        )
        root_2 = Dot(axes.c2p(2, 0), color=GREEN, radius=0.12)
        root_3 = Dot(axes.c2p(3, 0), color=GREEN, radius=0.12)

        # --- Three formula banners stacked at the top (Unicode, no LaTeX) ---
        f1 = Text("y = x² − 5x + 6",                font_size=32, color=YELLOW)
        f2 = Text("D = b² − 4ac = 25 − 24 = 1",     font_size=32, color=YELLOW)
        f3 = Text("x = (−b ± √D) / 2a = (5 ± 1) / 2", font_size=32, color=YELLOW)
        banner = VGroup(f1, f2, f3).arrange(DOWN, buff=0.25).to_edge(UP)

        # --- Stage 1: axes + labels  (~0.7 s) ---
        self.play(Create(axes), Write(labels), run_time=0.7)

        # --- Stage 2: draw parabola (~2.0 s) ---
        self.play(Create(parabola), run_time=2.0)
        self.wait(0.3)

        # --- Stage 3: drop f1, drop the two green root dots (~0.7 s) ---
        self.play(Write(f1), run_time=0.6)
        self.play(FadeIn(root_2), FadeIn(root_3), run_time=0.6)
        self.wait(0.5)

        # --- Stage 4: f1 -> f2 (banner anchored at top), ~0.7 s ---
        self.play(ReplacementTransform(f1, f2), run_time=0.7)
        self.wait(0.5)

        # --- Stage 5: f2 -> f3, ~0.7 s ---
        self.play(ReplacementTransform(f2, f3), run_time=0.7)
        self.wait(0.4)

        # --- Stage 6: highlight both roots (~1.0 s) ---
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
        self.wait(0.5)
