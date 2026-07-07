import sys
from pathlib import Path

from manim import Create, RIGHT, Scene, Text, UP, VGroup

sys.path.append(str(Path(__file__).resolve().parents[1]))

from shared.palette import FEATURE, HEAD, MAIN, TEXT
from shared.primitives import causal_arrow, object_box


class GitObjectModelScene(Scene):
    def construct(self):
        title = Text("blob -> tree -> commit", font_size=36, color=TEXT).to_edge(UP)
        blob = object_box("blob", "file content", color=FEATURE)
        tree = object_box("tree", "folder shape", color=MAIN).next_to(blob, RIGHT, buff=1.25)
        commit = object_box("commit", "metadata + parent", color=HEAD).next_to(tree, RIGHT, buff=1.25)
        arrows = VGroup(causal_arrow(blob, tree), causal_arrow(tree, commit))
        row = VGroup(blob, tree, commit, arrows)

        self.play(Create(title))
        self.play(Create(row), run_time=2.0)
        self.wait(0.8)
