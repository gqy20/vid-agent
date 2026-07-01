"""
Scenario 4 — Draft / Baseline (NOT meant to be rendered).

A "you wrote it steady" scaffold: 8-second double-well U(x)=x^4-x^2
with a particle integrated by Euler's method.

Choice of timestep mapping (see scenario_4.py for the realised version):
    - real animation wall time: 8 s at 30 fps -> 240 frames
    - dt (physics) = 0.02
    - STEPS_PER_FRAME = 3  -> 0.06 s of physics per frame -> 14.4 s of physics total
    - This is enough for the particle to cross the barrier several times
      and produce a visible trajectory on screen.

Design notes:
    - Updater-based: the Dot gets add_updater that re-integration uses mutable
      state held on self (scene.x, scene.v, scene.t).
    - Trajectory: a Python list of past (x, y) screen positions kept on self,
      drawn each frame by `always_redraw` returning a VGroup of small Dots.
    - Why not a single ParametricCurve? Because the trajectory is built
      *incrementally* as the simulation progresses. always_redraw + list-of-dots
      is the textbook idiom in vanilla manim without TracedPath side effects.
"""

from manim import Scene, Axes, Dot, VGroup, Text, RED, YELLOW, WHITE, BLUE


class DoubleWellDraft(Scene):
    def construct(self):
        # --- coordinate frame ---
        axes = Axes(
            x_range=[-1.6, 1.6, 0.5],
            y_range=[-1.0, 1.0, 0.5],
            tips=False,
        ).scale(0.9)

        # --- potential curve U(x) = x^4 - x^2 on screen-coords ---
        def u(x):
            return x**4 - x**2

        pot = axes.plot(u, color=YELLOW, x_range=[-1.5, 1.5, 0.01])
        self.add(axes, pot)
