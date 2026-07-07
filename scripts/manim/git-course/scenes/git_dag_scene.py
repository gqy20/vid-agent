import sys
from pathlib import Path

from manim import Create, DOWN, LEFT, Line, RIGHT, Scene, Text, UP, VGroup

sys.path.append(str(Path(__file__).resolve().parents[1]))

from shared.palette import LINE, MAIN, TEXT
from shared.primitives import commit_node


class GitDAGScene(Scene):
    def construct(self):
        title = Text("Git history is a DAG", font_size=36, color=TEXT).to_edge(UP)
        c0 = commit_node("C0").shift(3 * LEFT)
        c1 = commit_node("C1")
        c2 = commit_node("C2").shift(3 * RIGHT)
        edge_01 = Line(c0.get_right(), c1.get_left(), color=LINE, stroke_width=8)
        edge_12 = Line(c1.get_right(), c2.get_left(), color=LINE, stroke_width=8)
        branch = Text("main", font_size=28, color=MAIN).next_to(c2, DOWN)
        graph = VGroup(edge_01, edge_12, c0, c1, c2, branch)

        self.play(Create(title))
        self.play(Create(graph), run_time=2.0)
        self.wait(0.8)
