"""
Scenario 5 — Square-wave Fourier partial sums (first 5 odd harmonics).

Wall-clock budget: 12 s.

Layout
------
- Stage 1 (≈3 s): reference square wave  y = sign(sin(x))  on [-2π, 2π],
  drawn in BLUE_D, persisted on the axes for the rest of the video.
- Stage 2..6 (≈1.8 s each, total ≈9 s): partial sum
    S_N(x) = (4/π) Σ_{k=1..N, k odd} sin(kx)/k
  for N in (1, 3, 5, 7, 9).  Color gradient per stage:
  BLUE -> TEAL -> GREEN -> YELLOW -> RED.
  On every new stage the previous partial is faded toward 35% opacity so
  the latest S_N sits visually on top; the reference is never touched.
- Corner Text shows  "N = 1", "N = 1+3", ..., "N = 1+3+5+7+9".

Why pure-`Text` and never MathTex / Tex
--------------------------------------
This environment does NOT have a TeX distribution:
    $ which pdflatex
    (not found)
Per SKILL.md (SKILL.md §"Implicit LaTeX API blacklist") and
environment.md §"LaTeX detection", every `MathTex` / `Tex` / `Axes.get_axis_labels`
/ `Axes.add_coordinates` / `DecimalNumber` call would raise
    FileNotFoundError: [Errno 2] No such file or directory: 'latex'
at render time.  The "we always used MathTex; LaTeX is installed" assertion
is unverified — `which pdflatex` is the only authority.  We use `Text` only.
"""

from manim import (
    Scene, Axes, Text, VGroup,
    Create, FadeIn,
    BLUE_D, BLUE, TEAL, GREEN, YELLOW, RED, WHITE,
    UR, ORIGIN, RIGHT, UP,
)
import math

# --------------------------------------------------------------------------- #
# constants
# --------------------------------------------------------------------------- #
X_RANGE = (-2 * math.pi, 2 * math.pi, math.pi / 2)   # tick every π/2
Y_RANGE = (-1.6, 1.6, 0.5)
DX = 0.005                                             # sample step on x
PARTIAL_COLORS = [BLUE, TEAL, GREEN, YELLOW, RED]     # gradient for 5 stages
PARTIAL_NS = [1, 3, 5, 7, 9]                          # odd harmonics 1..9
STAGE_SECONDS_REF = 3.0                               # reference stage
STAGE_SECONDS_FADE = 0.3                              # fade previous partial
STAGE_SECONDS_PARTIAL = 1.0                           # draw new partial
STAGE_SECONDS_HOLD = 0.3                              # hold the stage


# --------------------------------------------------------------------------- #
# helpers
# --------------------------------------------------------------------------- #
def square_wave(x: float) -> float:
    """sign(sin(x)).  Pinned to {-1, 0, +1}."""
    s = math.sin(x)
    if s > 0:
        return 1.0
    if s < 0:
        return -1.0
    return 0.0


def partial_sum(x: float, n_max: int) -> float:
    """S_N(x) = (4/π) Σ sin(kx)/k for odd k in 1..N, clipped to ±1.4."""
    s = 0.0
    k = 1
    while k <= n_max:
        s += math.sin(k * x) / k
        k += 2
    val = (4.0 / math.pi) * s
    # clip the Gibbs overshoot so the plot stays inside the visible frame
    if val > 1.4:
        return 1.4
    if val < -1.4:
        return -1.4
    return val


def corner_label_text(stage_index: int) -> str:
    """'N = 1', 'N = 1+3', ..., 'N = 1+3+5+7+9'."""
    odds = PARTIAL_NS[: stage_index + 1]
    return "N = " + "+".join(str(o) for o in odds)


class SquareWaveFourier(Scene):
    def construct(self):
        # ---------------------------------------------------------------- #
        # Axes + manual x/y labels (never `Axes.get_axis_labels` — uses
        # MathTex internally and would crash without pdflatex).
        # ---------------------------------------------------------------- #
        axes = Axes(
            x_range=[X_RANGE[0], X_RANGE[1], X_RANGE[2]],
            y_range=[Y_RANGE[0], Y_RANGE[1], Y_RANGE[2]],
            tips=False,
            axis_config={"include_numbers": False, "stroke_width": 1},
        ).scale(0.9)

        x_label = Text("x", color=WHITE, font_size=24).next_to(
            axes.x_axis.get_end(), RIGHT, buff=0.2
        )
        y_label = Text("y", color=WHITE, font_size=24).next_to(
            axes.y_axis.get_end(), UP, buff=0.2
        )

        self.add(axes, x_label, y_label)

        # ---------------------------------------------------------------- #
        # Stage 1 — reference square wave, ≈3 s
        # ---------------------------------------------------------------- #
        ref_curve = axes.plot(
            square_wave,
            x_range=[X_RANGE[0], X_RANGE[1], DX],
            color=BLUE_D,
            stroke_width=3,
        )
        ref_label = Text("y = sign(sin x)", color=BLUE_D).to_corner(UR)
        self.add(ref_label)
        self.play(Create(ref_curve), run_time=STAGE_SECONDS_REF)

        # ---------------------------------------------------------------- #
        # Stage 2..6 — partial sums N = 1, 3, 5, 7, 9
        # ---------------------------------------------------------------- #
        partials = []        # stack of partial-sum curves, oldest first
        corner_labels = []   # stack of corner labels, oldest first

        for i, (n_max, color) in enumerate(zip(PARTIAL_NS, PARTIAL_COLORS)):
            # Build the new curve with a default-bound lambda so the
            # closure captures THIS iteration's n_max (anti-pattern #15).
            new_curve = axes.plot(
                lambda x, nn=n_max: partial_sum(x, nn),
                x_range=[X_RANGE[0], X_RANGE[1], DX],
                color=color,
                stroke_width=3,
            )

            # Corner Text for this stage.
            new_label = Text(corner_label_text(i), color=color).to_corner(UR)

            # Fade the previous partial (NOT the reference, NOT older ones)
            # and the previous corner label so they don't pile up.
            fade_anims = []
            if partials:
                fade_anims.append(partials[-1].animate.set_opacity(0.35))
            if corner_labels:
                fade_anims.append(corner_labels[-1].animate.set_opacity(0.3))

            # Guard against empty self.play(*[]) on the first iteration
            # (anti-pattern #9).
            if fade_anims:
                self.play(*fade_anims, run_time=STAGE_SECONDS_FADE)
            self.play(Create(new_curve), run_time=STAGE_SECONDS_PARTIAL)
            self.add(new_curve, new_label)
            partials.append(new_curve)
            corner_labels.append(new_label)
            self.wait(STAGE_SECONDS_HOLD)

        # small hold so the final frame lingers
        self.wait(0.5)