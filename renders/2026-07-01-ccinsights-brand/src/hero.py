"""Hero shot — 4 seconds, brand colors only.

Layout:
    0.0–0.5s  black
    0.5–1.5s  draw the ❯ pulse polyline (logo top arm)
    1.5–3.0s  peak highlight pulses, "cc-insights" rises from below
    3.0–4.0s  subtitle fades in

Wall-clock budget
    Draw polyline     run_time=1.0  → 1.0s
    Show peak highlight + title    wait/anim 2.0s
    Fade subtitle     run_time=1.0  → 4.0s
"""

from manim import (
    Scene, Text, VGroup, Circle, VMobject,
    Create, FadeIn, FadeOut,
    UP, DOWN, UR, ORIGIN, BLACK, WHITE, GREY, BLUE,
)
import numpy as np

from _lib import BRAND, SUBTITLE_SIZE, SMALL_SIZE


def polyline(points, color=WHITE, stroke_width=8):
    m = VMobject(stroke_color=color, stroke_width=stroke_width)
    m.set_points_as_corners([np.array(p, dtype=float) for p in points])
    return m


class Hero(Scene):
    def construct(self):
        # ---- Logo geometry (matches docs/logo/cc-insights.svg) ----------
        # top-arm polyline + lower-arm of the ❯ prompt
        top_points = [
            [-4.0, 0.0, 0.0],
            [-2.5, 1.4, 0.0],
            [-1.5, 1.4, 0.0],
            [ 0.0, -1.4, 0.0],
            [ 1.0, 1.4, 0.0],
            [ 1.8, 1.4, 0.0],
            [ 2.6, 0.3, 0.0],
        ]
        bottom_points = [[-2.5, 1.4, 0.0], [-4.0, -1.4, 0.0]]

        top_arm = polyline(top_points)
        bottom_arm = polyline(bottom_points)

        peak_pos = [0.0, -1.4, 0.0]
        peak_glow = Circle(radius=0.55, color=BRAND, fill_color=BRAND, fill_opacity=0.16).move_to(peak_pos)
        peak_core = Circle(radius=0.30, color=BRAND, fill_color=BRAND, fill_opacity=1.0).move_to(peak_pos)

        # ---- Title -------------------------------------------------------
        title = Text("cc-insights", font_size=80, color=WHITE, weight="BOLD").next_to(peak_pos, DOWN, buff=1.0)

        subtitle = Text("Claude Code 的使用诊断",
                        font_size=SUBTITLE_SIZE, color=GREY).next_to(title, DOWN, buff=0.4)

        # ---- Sequence ---------------------------------------------------
        # 0.5–1.5s — draw the two arms + peak core (peak forms the brand spot)
        self.play(Create(top_arm), run_time=0.6)
        self.play(Create(bottom_arm), FadeIn(peak_glow), run_time=0.4)

        # 1.5–3.0s — peak pulses (light scale wobble) and title rises
        self.play(
            peak_core.animate.set_fill(opacity=1.0),
            peak_glow.animate.scale(1.4),
            FadeIn(title, shift=UP * 0.5),
            run_time=1.0,
        )
        self.play(
            peak_glow.animate.scale(1 / 1.4),
            run_time=0.4,
        )

        # 3.0–4.0s — subtitle fades in
        self.play(FadeIn(subtitle), run_time=0.8)
        self.wait(0.2)
