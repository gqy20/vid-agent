"""Scenario 3: 90-degree rotation of basis vectors via R = [[0,-1],[1,0]].

Both unit vectors rotate simultaneously:
  - e1 = (1,0) (blue)  rotates 90 deg CCW to (0,1)
  - e2 = (0,1) (red)   rotates 90 deg CCW to (-1,0)

Total length: 6 seconds at the default 15 fps.
"""

from manim import (
    Scene,
    Axes,
    Text,
    Arrow,
    VGroup,
    ORIGIN,
    RIGHT,
    UP,
    LEFT,
    DOWN,
    BLUE,
    RED,
    WHITE,
    PI,
    DEGREES,
    Create,
    Write,
    Rotate,
    Transform,
)


class RotationMatrix(Scene):
    def construct(self):
        # ---- Coordinate system ---------------------------------------------
        # `Axes` gives us a real Cartesian frame with tick marks and labels,
        # which makes the rotation legible. The x/y range covers the rotated
        # endpoints (-1, 0) and (0, 1) plus a margin so the arrows breathe.
        axes = Axes(
            x_range=[-2, 2, 1],
            y_range=[-2, 2, 1],
            x_length=5,
            y_length=5,
            tips=True,
            axis_config={"color": WHITE},
        )

        # ---- Original basis vectors ----------------------------------------
        # `Arrow` (not `Vector`) so the visual reads as a thick shaft with a
        # triangular tip -- standard for "vector from origin". `buff=0` so the
        # tail sits exactly at the origin; otherwise the arrow floats.
        e1 = Arrow(
            start=ORIGIN,
            end=RIGHT,
            color=BLUE,
            buff=0,
            stroke_width=8,
            max_tip_length_to_length_ratio=0.15,
        )
        e2 = Arrow(
            start=ORIGIN,
            end=UP,
            color=RED,
            buff=0,
            stroke_width=8,
            max_tip_length_to_length_ratio=0.15,
        )

        # Labels for the original vectors, placed slightly past the tip.
        label_e1 = Text("e1", color=BLUE).scale(0.5).next_to(RIGHT, RIGHT, buff=0.1)
        label_e2 = Text("e2", color=RED).scale(0.5).next_to(UP, UP, buff=0.1)

        # ---- Rotation matrix label (no LaTeX -- plain Text) -----------------
        # The user explicitly asked for `Text`, not `MathTex`. No LaTeX in this
        # env, so this is also the only option. Row-major layout, plain ASCII.
        matrix_title = Text("Rotation matrix R").scale(0.5).to_edge(UP)
        matrix_body = Text("R = [ [0, -1],\n      [1,  0] ]").scale(0.5)
        matrix_box = VGroup(matrix_title, matrix_body).arrange(DOWN, aligned_edge=LEFT)
        matrix_box.to_corner(UP + RIGHT)

        # ---- Build the scene up to the rotation moment ----------------------
        self.add(axes)
        self.play(
            Create(e1),
            Create(e2),
            Write(label_e1),
            Write(label_e2),
            Write(matrix_box),
            run_time=1.5,
        )

        # ---- Rotate both vectors 90 deg CCW about the origin ----------------
        # `Rotate` is the right tool here:
        #   - It's a pure rotation animation (no morph / no matrix compose).
        #   - `about_point=ORIGIN` keeps the tail pinned at the origin (a
        #     default about_point of mobject.get_center() would also work
        #     because the tail IS the center, but being explicit is clearer).
        #   - Both arrows rotate in the same `play` so the viewer sees the
        #     simultaneous action (e1 -> up, e2 -> left).
        # We do NOT use `ApplyMatrix` because that is a one-shot transform that
        # instantly snaps the mobject to its rotated position; we want a
        # continuous animation. We do NOT use `.animate.rotate(...)` because
        # the `Rotate` animation gives us explicit control over `about_point`
        # and reads more naturally for a geometric rotation.
        angle = 90 * DEGREES  # PI / 2

        # End-state labels so the viewer sees where each vector landed.
        label_e1_target = Text("e1", color=BLUE).scale(0.5).next_to(UP, UP, buff=0.1)
        label_e2_target = Text("e2", color=RED).scale(0.5).next_to(LEFT, LEFT, buff=0.1)

        self.play(
            Rotate(e1, angle=angle, about_point=ORIGIN),
            Rotate(e2, angle=angle, about_point=ORIGIN),
            Transform(label_e1, label_e1_target),
            Transform(label_e2, label_e2_target),
            run_time=3.5,
        )

        # ---- Hold the final state for the rest of the 6s budget ------------
        self.wait(1.0)