import sys
from pathlib import Path

from manim import Create, DOWN, RIGHT, Scene, Text, UP, VGroup

sys.path.append(str(Path(__file__).resolve().parents[1]))

from shared.palette import FEATURE, HEAD, MAIN, TEXT


class GitObjectModelScene(Scene):
    def construct(self):
        title = Text("blob -> tree -> commit", font_size=36, color=TEXT).to_edge(UP)
        blob = Text("blob\nfile content", font_size=28, color=FEATURE)
        tree = Text("tree\nfolder shape", font_size=28, color=MAIN).next_to(blob, RIGHT, buff=1.4)
        commit = Text("commit\nmetadata + parent", font_size=28, color=HEAD).next_to(tree, RIGHT, buff=1.4)
        row = VGroup(blob, tree, commit).move_to(0.3 * DOWN)

        self.play(Create(title))
        self.play(Create(row), run_time=2.0)
        self.wait(0.8)
