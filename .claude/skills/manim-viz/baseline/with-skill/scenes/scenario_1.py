"""
Scenario 1 — Shape morph
User request:
    5s `-ql` animation:
      - A blue solid circle smoothly morphs into a red solid square
        (circle center stays put throughout).
      - Title `Text("Shape morph")` always at top.
      - Default 15 fps.

Design notes (see SKILL.md / examples.md #1 / anti-patterns.md):
    - Explicit, grouped imports — avoid `from manim import *` (#1, #2).
    - `Transform(circle, square)` keeps a single Python handle on screen,
      so the centerpoint is anchored on the original circle position.
    - `Create(circle)` draws the stroke first, then fills — reads as
      "drawing a circle", not "pop-in".
    - Title is added once via `self.add(title)` and never removed, so it
      persists across the morph (matches "always at top" in the brief).
    - Wall-clock budget: 0.5 (Create) + 3.5 (Transform) + 1.0 (wait) = 5.0 s
      (anti-pattern #16).
    - 15 fps is the default for `-ql`; no extra config needed.
    - No LaTeX — plain `Text` everywhere (anti-patterns #3, #13).
"""

from manim import (
    Scene, Text,
    Circle, Square,
    Create, Transform,
    BLUE, RED, UP,
)


class ShapeMorph(Scene):
    def construct(self):
        # Title — persistent at top, never animated away.
        title = Text("Shape morph").to_edge(UP)

        # Source: blue, solid, centered at ORIGIN (the default).
        circle = Circle(
            color=BLUE, fill_color=BLUE,
            fill_opacity=1.0,
        ).scale(1.5)

        # Target: red, solid, also centered at ORIGIN, same size as circle.
        # Circle with radius=1 has width=2, so side_length=2 makes the square
        # visually comparable in extent — keeps the morph visually clean.
        square = Square(
            color=RED, fill_color=RED,
            fill_opacity=1.0,
            side_length=2,
        )

        # Stage 1 — add title (instant; user wants it "always" at top).
        self.add(title)

        # Stage 2 — draw the circle (0.5s).
        self.play(Create(circle), run_time=0.5)

        # Stage 3 — smooth morph circle -> square, center anchored on circle's
        # current position (ORIGIN), so the square ends up centered too.
        self.play(Transform(circle, square), run_time=3.5)

        # Stage 4 — hold the final frame (1.0s). Total wall-clock = 5.0s.
        self.wait(1.0)


if __name__ == "__main__":
    # Allow `python green-baseline/scenes/scenario_1.py` smoke-check too,
    # though the canonical invocation is `uv run manim -ql ...`.
    import sys
    from manim import config
    config.media_dir = "/tmp/green-media"
    config.quality = "low_quality"
    ShapeMorph().render()
    sys.exit(0)
