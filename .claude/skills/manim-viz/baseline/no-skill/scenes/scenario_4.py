"""
Scenario 4 - Double-well potential U(x) = x^4 - x^2
                + Euler-integrated particle.

Wall-clock mapping
------------------
  * real animation wall time : 8 s  at 30 fps  -> 240 frames
  * physics dt              : 0.02            (we control this)
  * STEPS_PER_FRAME         : 3               (set on the particle's updater)
  * total physics time      : 240 * 3 * 0.02  = 14.4 s of simulated motion

Why STEPS_PER_FRAME = 3?
  * 1 step/frame (0.02 s of physics per frame) feels sluggish on screen.
  * >5 steps/frame and the discrete Euler jumps look like a step function.
  * 3 steps/frame keeps the motion lively while preserving "obviously
    discrete" character; the particle visibly bounces between the two
    wells a couple of times across the 8 s.

LaTeX handling
--------------
  No LaTeX distribution is installed.  We use `manim.Text` for *every*
  string - no `MathTex` / `Tex` / `DecimalNumber` etc., all of which
  spawn a LaTeX subprocess.

The "time-based updater" trap
-----------------------------
  In manim 0.20.1, `Mobject.has_time_based_updater()` does
  ``"dt" in inspect.signature(updater).parameters``.
  i.e. it asks if the literal parameter name ``dt`` exists.
  If you name your parameter anything else (``dt_wall``, etc.),
  manim concludes the updater is *static*, and during `self.wait()`
  the scene takes the "frozen frame" branch and **never calls your
  updater at all**.  Symptom: the particle / readout stay frozen
  even though the rest of the scene renders fine.

  So the param name below is exactly ``dt``.  See
  manim/mobject/mobject.py has_time_based_updater / get_time_based_updaters.
"""

from manim import (
    Scene, Axes, Dot, VGroup, Text,
    RED, YELLOW, BLUE,
    RIGHT, UP, DOWN, DR,
    always_redraw,
)

# --------------------------------------------------------------------------- #
# constants
# --------------------------------------------------------------------------- #
DT            = 0.02          # physics timestep (Euler)
STEPS_PER_FRAME = 3           # how many dt's per rendered frame
DURATION      = 8.0           # wall-clock seconds (manim)
AX_X_RANGE    = (-1.6, 1.6)
AX_Y_RANGE    = (-1.0, 3.2)   # U(1.5) = 5.0625-2.25 = 2.81 + headroom
PARTICLE_X0   = 0.1           # initial position
PARTICLE_V0   = 0.0           # initial velocity
TRAIL_MAX     = 1500          # cap on trail length


# --------------------------------------------------------------------------- #
# physics helpers (pure, no closures)
# --------------------------------------------------------------------------- #
def U(x):
    return x**4 - x**2


def accel(x):
    """a = -dU/dx = -4 x^3 + 2 x."""
    return -4.0 * x**3 + 2.0 * x


def total_energy(x, v):
    return 0.5 * v * v + U(x)


# --------------------------------------------------------------------------- #
# scene
# --------------------------------------------------------------------------- #
class DoubleWellParticle(Scene):
    """8-second Euler-integrated particle on the double-well potential."""

    def construct(self):
        # ------------------------------------------------------------------ #
        # coordinate frame + potential curve
        # ------------------------------------------------------------------ #
        axes = Axes(
            x_range=[AX_X_RANGE[0], AX_X_RANGE[1], 0.5],
            y_range=[AX_Y_RANGE[0], AX_Y_RANGE[1], 1.0],
            tips=False,
        ).scale(0.9)

        # potential curve.  No `axes.add_coordinates()` here because that
        # helper spawns MathTex -> LaTeX in 0.20.1 and we have no LaTeX.
        pot = axes.plot(U, color=RED, x_range=[-1.5, 1.5, 0.01])

        # axis labels in plain Text - same reason.
        label_x = Text("x",   font_size=22).next_to(axes.x_axis.get_end(), RIGHT)
        label_U = Text("U(x)", font_size=22).next_to(axes.y_axis.get_end(), UP)
        title   = Text("Scenario 4 - Double well + Euler particle",
                       font_size=26, color=YELLOW).to_edge(UP)

        # manual x-axis tick labels (Text, not MathTex)
        tick_labels = VGroup(*[
            Text(f"{x:+.1f}", font_size=16).next_to(
                axes.c2p(x, 0), DOWN, buff=0.12,
            )
            for x in (-1.5, -1.0, -0.5, 0.0, 0.5, 1.0, 1.5)
        ])

        # ------------------------------------------------------------------ #
        # simulation state - mutable, lives on `self`
        # ------------------------------------------------------------------ #
        # Holding these as plain attributes on the Scene lets the updater
        # closures (which capture `self`) read and write freely.  We avoid
        # closures over local variables, which would freeze at one value
        # each `self.wait()` tick.
        self.sim_x = PARTICLE_X0
        self.sim_v = PARTICLE_V0
        self.sim_t = 0.0
        self.history = [(PARTICLE_X0, U(PARTICLE_X0))]

        # ------------------------------------------------------------------ #
        # the particle: add_updater advances physics each frame
        # ------------------------------------------------------------------ #
        particle = Dot(color=BLUE, radius=0.06)
        # seed the dot at its initial physical position so the first frame
        # is sane (before the updater has ever been called).
        particle.move_to(axes.c2p(self.sim_x, U(self.sim_x)))

        def step(mob, dt):                      # <-- param name MUST be `dt`
            """Advance the integrator STEPS_PER_FRAME times.

            We *ignore* the wall-clock dt and march at our own DT,
            so the physics speed is decoupled from the manim fps.
            """
            for _ in range(STEPS_PER_FRAME):
                a = accel(self.sim_x)
                self.sim_v += a * DT
                self.sim_x += self.sim_v * DT
                self.sim_t += DT
                self.history.append((self.sim_x, U(self.sim_x)))
            mob.move_to(axes.c2p(self.sim_x, U(self.sim_x)))

        particle.add_updater(step)

        # ------------------------------------------------------------------ #
        # trajectory - always_redraw a VGroup of dots from `self.history`
        # ------------------------------------------------------------------ #
        # Why not a single VMobject / VMobject with add_updater appending?
        #   - we'd need to keep the Bézier control points aligned with the
        #     sample list, which is fiddly for non-monotonic paths.
        # Why not TracedPath?
        #   - TracedPath traces the *current* position of one mobject; but
        #     we want dots that *persist* at the visited U(x) heights, i.e.
        #     the full 2D curve, not just the polyline of (t -> x(t), U(t)).
        # So we just rebuild the dot list from `self.history` each frame.
        def make_trail():
            pts = self.history[-TRAIL_MAX:]
            return VGroup(*[
                Dot(axes.c2p(x, y), radius=0.018, color=YELLOW)
                for (x, y) in pts
            ])

        trail = always_redraw(make_trail)

        # ------------------------------------------------------------------ #
        # live readouts (Text-only, no MathTex / DecimalNumber)
        # ------------------------------------------------------------------ #
        def make_readout():
            E = total_energy(self.sim_x, self.sim_v)
            txt = (
                f"t_phys = {self.sim_t:5.2f}\n"
                f"x      = {self.sim_x:+.3f}\n"
                f"v      = {self.sim_v:+.3f}\n"
                f"E      = {E:+.3f}  (drifts: Euler is not symplectic)"
            )
            m = Text(txt, font_size=22)
            m.to_corner(DR)
            return m

        readout = always_redraw(make_readout)

        # ------------------------------------------------------------------ #
        # assemble the static frame
        # ------------------------------------------------------------------ #
        self.add(
            title, axes, pot,
            label_x, label_U, tick_labels,
            particle, trail, readout,
        )

        # 8 seconds at 30 fps = 240 frames; at 15 fps (low quality) = 120
        # frames.  Either way, STEPS_PER_FRAME=3 Euler steps per frame
        # runs the simulation for 14.4 s of physics.
        self.wait(DURATION)
