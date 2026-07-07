from manim import Circle, Text, VGroup

from .palette import CANVAS, TEXT


def commit_node(label: str, radius: float = 0.32) -> VGroup:
    circle = Circle(radius=radius, color=TEXT, stroke_width=5).set_fill(CANVAS, opacity=1)
    text = Text(label, font_size=24, weight="BOLD", color=TEXT)
    return VGroup(circle, text)
