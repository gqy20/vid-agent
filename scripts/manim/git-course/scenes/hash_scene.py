import sys
from pathlib import Path

from manim import Create, DOWN, Scene, Text, Transform, UP

sys.path.append(str(Path(__file__).resolve().parents[1]))

from shared.palette import HEAD, TEXT


class HashScene(Scene):
    def construct(self):
        title = Text("content changes -> hash changes", font_size=36, color=TEXT).to_edge(UP)
        before = Text('print("hello")\nsha: a17c4', font_size=30, color=TEXT)
        after = Text('print("hello!")\nsha: f91b2', font_size=30, color=HEAD).move_to(before)
        note = Text("Same file name, different content identity.", font_size=26, color=TEXT).next_to(before, DOWN, buff=0.8)

        self.play(Create(title))
        self.play(Create(before))
        self.wait(0.4)
        self.play(Transform(before, after))
        self.play(Create(note))
        self.wait(0.8)
