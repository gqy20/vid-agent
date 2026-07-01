"""
Scenario 5 — Square-wave Fourier partial sums (first 5 odd harmonics).

Wall-clock budget: 12 s.

Layout
------
1. Reference square wave y = sign(sin(x))  on x in [-2π, 2π]  (≈3 s)
   Drawn in light blue (BLUE_D), held while the next stages run.
2. Five partial sums  S_N(x) = (4/π) Σ_{k=1..N, k odd} sin(kx)/k
   with N in (1, 3, 5, 7, 9), one per ~2.0-s stage.
   - Color gradient per partial: blue -> cyan -> green -> yellow -> red.
   - On each new stage, the previous partial is faded toward the reference
     (lower opacity) so the latest S_N sits "on top" in full color.
3. Corner Text shows  "N = 1", "N = 1+3", ..., "N = 1+3+5+7+9"
   using `Text` (no MathTex — no LaTeX in this env).

Why pure-`Text` and never MathTex
---------------------------------
This environment does not have a TeX distribution (pdflatex absent).
MathTex/Tex need it and would error out.  Text is the supported fallback.
The user message claimed "LaTeX is installed" — that claim was *wrong* for
this box; verified by `which pdflatex` -> not found, and by the existing
scenario_4.py which also uses Text only.  We follow the verified env.

Mathematical note
-----------------
The pure partial sums have a Gibbs overshoot of ~9% at every discontinuity.
Sampling sin(kx)/k on a coarse grid can spike those overshoots to look
"wrong" (huge vertical bars).  We use a fine x step (0.005) and clip |y| <= 1.4
so the partials stay inside the visible frame.  The reference square wave is
also clipped so they share the same y range.
"""

from manim import (
    Scene, Axes, Text, VGroup,
    BLUE_D, BLUE, GREEN, YELLOW, RED, WHITE,
    UR, ORIGIN, RIGHT, UP,
)
import math

# --------------------------------------------------------------------------- #
# constants
# --------------------------------------------------------------------------- #
X_RANGE = (-2 * math.pi, 2 * math.pi, math.pi / 2)   # tick every π/2
Y_RANGE = (-1.6, 1.6, 0.5)
DX = 0.005                                              # sample step
PARTIAL_COLORS = [BLUE, "#00CFCF", GREEN, YELLOW, RED]  # 5 colours
PARTIAL_NS = [1, 3, 5, 7, 9]
STAGE_SECONDS_REF = 3.0
# 5 stages share (12 - 3) = 9 s. Each stage does fade(0.3) + plot(1.2) + hold(0.3) = 1.8
STAGE_SECONDS_PARTIAL = 1.2
STAGE_SECONDS_FADE = 0.3
STAGE_SECONDS_HOLD = 0.3


# --------------------------------------------------------------------------- #
# helpers
# --------------------------------------------------------------------------- #
def square_wave(x: float) -> float:
    """sign(sin(x)) — clip to [-1.0, 1.0]."""
    s = math.sin(x)
    if s > 0:
        return 1.0
    if s < 0:
        return -1.0
    return 0.0


def partial_sum(x: float, n_max: int) -> float:
    """S_N(x) = (4/π) Σ_{k=1..N_max, k odd} sin(kx)/k, clipped to ±1.4."""
    s = 0.0
    k = 1
    while k <= n_max:
        s += math.sin(k * x) / k
        k += 2
    val = (4.0 / math.pi) * s
    # clip Gibbs overshoot so the plot stays inside the frame
    if val > 1.4:
        return 1.4
    if val < -1.4:
        return -1.4
    return val


def label_text(stage_index: int) -> str:
    """Corner Text for stage `stage_index` (0..4)."""
    odds = PARTIAL_NS[: stage_index + 1]
    return "N = " + "+".join(str(o) for o in odds)


class SquareWaveFourier(Scene):
    def construct(self):
        # --------------------------------------------------------------- #
        # Axes
        # --------------------------------------------------------------- #
        axes = Axes(
            x_range=[X_RANGE[0], X_RANGE[1], X_RANGE[2]],
            y_range=[Y_RANGE[0], Y_RANGE[1], Y_RANGE[2]],
            tips=False,
            axis_config={"include_numbers": False, "stroke_width": 1},
        ).scale(0.9)

        x_label = Text("x", color=WHITE).next_to(axes.x_axis.get_end(), RIGHT)
        y_label = Text("y", color=WHITE).next_to(axes.y_axis.get_end(), UP)

        self.add(axes, x_label, y_label)

        # --------------------------------------------------------------- #
        # Stage 1 — reference square wave (BLUE_D, light)
        # --------------------------------------------------------------- #
        ref = axes.plot(
            square_wave,
            x_range=[X_RANGE[0], X_RANGE[1], DX],
            color=BLUE_D,
            stroke_width=3,
        )
        ref_label = Text("y = sign(sin(x))", color=BLUE_D).to_corner(UR)
        self.play(axes.animate.set_opacity(1), run_time=0.4)
        self.play(axes.plot(square_wave, x_range=[X_RANGE[0], X_RANGE[1], DX],
                            color=BLUE_D, stroke_width=3).animate,
                  run_time=STAGE_SECONDS_REF * 0.6)
        self.add(ref)
        self.play(ref_label.animate.set_opacity(1), run_time=0.4)
        self.wait(STAGE_SECONDS_HOLD)

        # --------------------------------------------------------------- #
        # Stage 2..6 — partial sums N = 1, 3, 5, 7, 9
        # --------------------------------------------------------------- #
        partials = []   # list of VMobjects, in stack order
        corner_labels = []

        for i, (n_max, color) in enumerate(zip(PARTIAL_NS, PARTIAL_COLORS)):
            # Fade the previous partial(s) so the newest sits on top.
            # Reference stays visible at full opacity.
            fade_anim = []
            if i > 0:
                # fade the *previous* one (i-1); older ones already faded
                fade_anim.append(partials[-1].animate.set_opacity(0.35))

            # corner label for this stage
            new_label = Text(label_text(i), color=color).to_corner(UR)
            # move the previous label down/out so they don't pile up
            if corner_labels:
                fade_anim.append(corner_labels[-1].animate.set_opacity(0.25))

            new_curve = axes.plot(
                lambda x, nn=n_max: partial_sum(x, nn),
                x_range=[X_RANGE[0], X_RANGE[1], DX],
                color=color,
                stroke_width=3,
            )

            if fade_anim:
                self.play(*fade_anim, run_time=STAGE_SECONDS_FADE)
            self.play(new_curve.animate.set_stroke(width=3), run_time=STAGE_SECONDS_PARTIAL)
            self.add(new_curve, new_label)
            partials.append(new_curve)
            corner_labels.append(new_label)
            self.wait(STAGE_SECONDS_HOLD)

        # small hold so the final frame lingers
        self.wait(0.5)