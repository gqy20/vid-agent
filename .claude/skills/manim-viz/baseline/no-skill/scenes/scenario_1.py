"""Scenario 1: A blue filled circle morphs smoothly into a red filled square.

The center position stays fixed. A title `Text("Shape morph")` is shown at the
top of the screen for the whole animation. Total length: 5 seconds at the
default 15 fps.
"""

from manim import Scene, Text, Circle, Square, UP, BLUE, RED, Create, Transform


class ShapeMorph(Scene):
    def construct(self):
        # Title stays on screen the whole time (added first, never removed).
        title = Text("Shape morph").to_edge(UP)

        # Source shape: blue filled circle.
        circle = Circle(fill_opacity=1.0, color=BLUE, fill_color=BLUE)
        # Make the circle a bit larger so the morph reads well; keep center.
        circle.scale(1.5)

        # Add title first so it renders behind nothing else.
        self.add(title)

        # Briefly show the circle before the morph (so the viewer sees the
        # starting state clearly). FadeIn would be overkill here -- Create
        # is the canonical way to introduce a shape.
        self.play(Create(circle), run_time=0.5)

        # Target shape: red filled square, same center as the circle.
        square = Square(fill_opacity=1.0, color=RED, fill_color=RED).scale(1.5)

        # Morph circle -> square. `Transform` interpolates point-by-point
        # between the two mobjects; for a circle -> square of similar size
        # this gives a clean, smooth morph. Because both are centered at
        # the origin, the center stays put (no shift needed).
        self.play(Transform(circle, square), run_time=3.5)

        # Hold the final state for the remainder of the 5s window.
        self.wait(1.0)