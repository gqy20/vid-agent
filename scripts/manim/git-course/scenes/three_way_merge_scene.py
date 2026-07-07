import sys
from pathlib import Path

from manim import Create, DOWN, LEFT, RIGHT, Scene, Text, UP, VGroup

sys.path.append(str(Path(__file__).resolve().parents[1]))

from shared.palette import CONFLICT, FEATURE, MAIN, TEXT


class ThreeWayMergeScene(Scene):
    def construct(self):
        title = Text("three-way merge", font_size=36, color=TEXT).to_edge(UP)
        base = Text("base", font_size=30, color=TEXT).shift(2 * DOWN)
        ours = Text("ours", font_size=30, color=MAIN).shift(2 * LEFT)
        theirs = Text("theirs", font_size=30, color=FEATURE).shift(2 * RIGHT)
        result = Text("merge result", font_size=30, color=CONFLICT).shift(1.2 * DOWN)
        group = VGroup(base, ours, theirs, result)

        self.play(Create(title))
        self.play(Create(group), run_time=2.0)
        self.wait(0.8)
