import sys
from pathlib import Path

from manim import DOWN, LEFT, RIGHT, UP, Create, FadeIn, FadeOut, MovingCameraScene, ReplacementTransform, TransformFromCopy, VGroup, config

sys.path.append(str(Path(__file__).resolve().parents[1]))

from shared.palette import BLOB, CANVAS, COMMIT, TEXT, TREE
from shared.primitives import arrow_between, label, object_card

config.pixel_width = 1920
config.pixel_height = 1080
config.frame_rate = 30
config.background_color = CANVAS


class GitObjectTransformScene(MovingCameraScene):
    """Prototype: file content becomes blob, tree, then commit."""

    def construct(self):
        title = label("commit object graph", size=34, color=TEXT, weight="BOLD").to_edge(UP, buff=0.55)
        file_card = object_card("README.md", "hello git", color=TEXT, width=3.2).shift(LEFT * 4.2 + UP * 0.2)

        self.play(FadeIn(title, shift=DOWN * 0.16), run_time=0.65)
        self.play(FadeIn(file_card, shift=RIGHT * 0.22), run_time=0.75)
        self.wait(0.25)

        blob = object_card("blob", "content identity", color=BLOB).move_to(file_card).shift(RIGHT * 3.05)
        blob_arrow = arrow_between(file_card, blob, color=BLOB)
        self.play(Create(blob_arrow), TransformFromCopy(file_card, blob), run_time=1.1)
        self.wait(0.25)

        tree = object_card("tree", "README.md -> blob", color=TREE).next_to(blob, RIGHT, buff=1.0)
        tree_arrow = arrow_between(blob, tree, color=TREE)
        self.play(Create(tree_arrow), TransformFromCopy(blob, tree), run_time=1.1)
        self.wait(0.2)

        commit = object_card("commit", "tree + message + parent", color=COMMIT, width=3.45).next_to(tree, RIGHT, buff=1.0)
        commit_arrow = arrow_between(tree, commit, color=COMMIT)
        self.play(Create(commit_arrow), TransformFromCopy(tree, commit), run_time=1.1)

        graph = VGroup(file_card, blob_arrow, blob, tree_arrow, tree, commit_arrow, commit)
        self.play(self.camera.frame.animate.scale(1.28).move_to(graph.get_center()), run_time=0.8)
        self.play(FadeOut(title, shift=UP * 0.08), run_time=0.45)
        self.wait(1.45)

        conclusion = label("commit is not a folder copy", size=42, color=COMMIT, weight="BOLD").move_to(title)
        self.play(FadeIn(conclusion, shift=DOWN * 0.08), run_time=0.8)
        self.wait(0.8)
