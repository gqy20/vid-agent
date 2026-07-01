"""scenario_6: minimal circle fade-in (1 second).

Renders to /tmp/red-media/.
Render:
    .venv/bin/manim -qh red-baseline/scenes/scenario_6.py CircleFadeIn -o /tmp/red-media/scenario_6.mp4
"""

from manim import Scene, Circle, Create, WHITE


class CircleFadeIn(Scene):
    def construct(self):
        circle = Circle(color=WHITE, radius=1.0)
        self.play(Create(circle), run_time=1.0)
        self.wait(0.5)
