"""
Scenario 6 — Minimal Circle fade-in
User request:
    The simplest possible 1s `-ql` animation:
      - One green solid Circle.
      - Fades in over 1 second.
      - Output mp4 ready to `open` / xdg-open.

Design notes (see SKILL.md / anti-patterns.md):
    - Explicit, grouped imports — avoid `from manim import *` (anti-pattern #1).
    - `FadeIn(circle)` is the literal pick for "fade in" — `Create` would
      draw the stroke, which reads as "drawing" not "fading" (SKILL.md
      "API decision table": fade in -> FadeIn).
    - Wall-clock budget: 1.0 (FadeIn) = 1.0s (anti-pattern #16).
    - 15 fps is the default for `-ql`; no extra config needed.
    - No LaTeX, no axes, no MathTex — pure `Text`-free primitive scene
      (anti-patterns #3, #13).
    - Scene name kept explicit (`CircleFadeIn`) so the `uv run manim ...`
      CLI arg is unambiguous.
"""

from manim import (
    Scene,
    Circle,
    FadeIn,
    GREEN,
)


class CircleFadeIn(Scene):
    def construct(self):
        # One green, solid (filled) circle, default radius at ORIGIN.
        circle = Circle(
            color=GREEN, fill_color=GREEN,
            fill_opacity=1.0,
        )

        # Literal "fade in" animation, 1 second total.
        self.play(FadeIn(circle), run_time=1.0)


if __name__ == "__main__":
    # Allow `python green-baseline/scenes/scenario_6.py` smoke-check too,
    # though the canonical invocation is `uv run manim -ql ...`.
    import sys
    from manim import config
    config.media_dir = "/tmp/green-media"
    config.quality = "low_quality"
    CircleFadeIn().render()
    sys.exit(0)
