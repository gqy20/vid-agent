import sys
from pathlib import Path

from manim import Create, DOWN, LEFT, RIGHT, Scene, Text, UP, VGroup

sys.path.append(str(Path(__file__).resolve().parents[1]))

from shared.palette import LINE, MAIN, TEXT
from shared.primitives import branch_label, commit_node, graph_edge


class GitDAGScene(Scene):
    def construct(self):
        title = Text("Git history is a DAG", font_size=36, color=TEXT).to_edge(UP)
        c0 = commit_node("C0").shift(3 * LEFT)
        c1 = commit_node("C1")
        c2 = commit_node("C2").shift(3 * RIGHT)
        edge_01 = graph_edge(c0, c1, color=LINE, width=8)
        edge_12 = graph_edge(c1, c2, color=LINE, width=8)
        branch = branch_label("main", MAIN).next_to(c2, DOWN, buff=0.55)
        graph = VGroup(edge_01, edge_12, c0, c1, c2, branch)

        self.play(Create(title))
        self.play(Create(graph), run_time=2.0)
        self.wait(0.8)
