"""
Scenario 5 — Draft / Baseline (NOT meant to be rendered).

Square-wave Fourier series — first 5 odd-harmonic partial sums stacked.
Wall-clock target: 12 s, split into 5 stages of ~3 s each + an opening beat.

Sections
--------
1. show reference square wave y = sign(sin(x))            (≈3 s)
2. for N in (1, 3, 5, 7, 9):                              (≈3 s each = 15 s, but compressed)
   - fade reference lighter
   - plot S_N(x) = (4/π) Σ_{k=1..N, k odd} sin(kx)/k
   - corner Text shows "N = 1", "N = 1+3", ..., "N = 1+3+5+7+9"

Note
----
Wall-clock budget is 12 s.  Five stages @ 3 s = 15 s.  We squeeze by
ramping the reference faster (1.5 s) and giving each partial 2.1 s.

This draft is the planning scaffold.  scenario_5.py is the realised version
that runs end-to-end with `uv run manim -ql`.

LaTeX:  None.  All labels are plain `Text`.
"""

from manim import Scene, Axes, Text, VGroup, BLUE, WHITE, RED


class SquareWaveFourierDraft(Scene):
    def construct(self):
        # Stage plan (in seconds).
        REF_HOLD = 1.5
        PER_PARTIAL = 2.1

        # Reference signal and partial sums.
        def square(x):
            # sign(sin(x)); avoid sign(0) blowups at multiples of pi
            import math
            return 1.0 if math.sin(x) > 0 else -1.0

        # Stage 1: reference
        ref_label = Text("y = sign(sin(x))", color=BLUE).to_corner(UP_RIGHT)
        self.add(ref_label)