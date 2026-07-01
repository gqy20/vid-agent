"""
Scenario 4 — Double-well potential + Euler-integrated particle.

Renders: U(x) = x⁴ − x² on x ∈ [−1.5, 1.5].
Particle starts at x=0.1, v=0, integrated with explicit Euler (dt=0.02,
3 sub-steps per frame). Live readout of x/v/E in the bottom-right corner.

No LaTeX: all text uses Unicode superscripts / dashes via manim Text.
"""
from manim import (
    Scene, Axes, Dot, VGroup, Text,
    always_redraw,
    RED, YELLOW, BLUE, WHITE,
    RIGHT, UP, DOWN, DR, UR,
)

# --- Physics constants ---------------------------------------------------
DT = 0.02                  # Euler step (per sub-step)
STEPS_PER_FRAME = 3        # sub-steps per rendered frame
DURATION = 8.0             # total wall-clock seconds


def U(x):
    """Double-well potential U(x) = x^4 - x^2."""
    return x ** 4 - x ** 2


def accel(x):
    """a = -dU/dx = -4x^3 + 2x."""
    return -4.0 * x ** 3 + 2.0 * x


def energy(x, v):
    """Total energy E = (1/2) v^2 + U(x)."""
    return 0.5 * v * v + U(x)


class Scenario4(Scene):
    def construct(self):
        # ---- Axes (no get_axis_labels / add_coordinates → no LaTeX) ----
        axes = Axes(
            x_range=[-1.6, 1.6, 0.5],
            y_range=[-1.0, 3.2, 1.0],
            tips=False,
        ).scale(0.9)

        # Manual axis labels
        label_x = Text("x",    font_size=22).next_to(axes.x_axis.get_end(), RIGHT)
        # Place U(x) inside the plot area near top-left so it doesn't collide with the title banner
        label_U = Text("U(x)", font_size=22, color=WHITE).next_to(axes.c2p(-1.4, 2.8), UR, buff=0.1)

        # Potential curve in red
        pot = axes.plot(U, color=RED, x_range=[-1.5, 1.5, 0.01], stroke_width=3)

        # Title banner
        title = Text(
            "Scenario 4 — Double well + Euler particle",
            font_size=26, color=YELLOW,
        ).to_edge(UP)

        # Manual tick labels (avoid add_coordinates MathTex)
        ticks = VGroup(*[
            Text(f"{x:+.1f}", font_size=16).next_to(axes.c2p(x, 0), DOWN, buff=0.12)
            for x in (-1.5, -1.0, -0.5, 0.0, 0.5, 1.0, 1.5)
        ])

        # ---- Simulation state lives on self (closures see fresh values) ----
        self.sim_x = 0.1
        self.sim_v = 0.0
        self.sim_t = 0.0
        self.history = [(self.sim_x, U(self.sim_x))]

        # Particle (a Dot) initially placed on the potential curve
        particle = Dot(color=BLUE, radius=0.07)
        particle.move_to(axes.c2p(self.sim_x, U(self.sim_x)))

        # ⚠️  Silent-freeze trap: the updater parameter MUST be literally `dt`.
        # manim 0.20.x inspects the signature and skips the updater entirely if
        # the param name is anything else (dt_wall, Δt, dt_secs, ...). No error,
        # no warning — the particle just sits still while `Played N animations`
        # rolls by. Keep this name `dt`!
        def step(mob, dt):
            for _ in range(STEPS_PER_FRAME):
                a = accel(self.sim_x)
                self.sim_v += a * DT
                self.sim_x += self.sim_v * DT
                self.sim_t += DT
                self.history.append((self.sim_x, U(self.sim_x)))
            mob.move_to(axes.c2p(self.sim_x, U(self.sim_x)))

        particle.add_updater(step)

        # ---- Trailing dots (rebuilt per frame from self.history) ----
        TRAIL_MAX = 1500

        def make_trail():
            pts = self.history[-TRAIL_MAX:]
            return VGroup(*[
                Dot(axes.c2p(x, y), radius=0.018, color=YELLOW)
                for (x, y) in pts
            ])

        trail = always_redraw(make_trail)

        # ---- Live readout in bottom-right corner (plain Text, not MathTex) ----
        def make_readout():
            E = energy(self.sim_x, self.sim_v)
            return Text(
                f"t_phys = {self.sim_t:5.2f}\n"
                f"x      = {self.sim_x:+.3f}\n"
                f"v      = {self.sim_v:+.3f}\n"
                f"E      = {E:+.3f}",
                font_size=22,
            ).to_corner(DR)

        readout = always_redraw(make_readout)

        # ---- Compose & run ----
        # Order: title, axes, potential, labels, ticks, particle (on top),
        # trail (between particle and readout), readout.
        self.add(title, axes, label_x, label_U, ticks, pot,
                 trail, particle, readout)
        self.wait(DURATION)