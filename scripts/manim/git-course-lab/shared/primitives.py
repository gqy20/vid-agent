from manim import DOWN, RIGHT, Arrow, Circle, RoundedRectangle, Text, VGroup

from .palette import CANVAS, LINE, MUTED, TEXT


def label(text: str, size: int = 30, color=TEXT, weight: str = "MEDIUM") -> Text:
    return Text(text, font="Noto Sans CJK SC", font_size=size, color=color, weight=weight)


def object_card(title: str, detail: str, color, width: float = 3.0, height: float = 1.3) -> VGroup:
    box = RoundedRectangle(
        width=width,
        height=height,
        corner_radius=0.16,
        color=color,
        stroke_width=4,
        fill_color=CANVAS,
        fill_opacity=1,
    )
    title_text = label(title, size=30, color=color, weight="BOLD")
    detail_text = label(detail, size=18, color=MUTED)
    copy = VGroup(title_text, detail_text).arrange(DOWN, buff=0.1).move_to(box.get_center())
    return VGroup(box, copy)


def dot_label(text: str, color) -> VGroup:
    dot = Circle(radius=0.11, color=color, fill_color=color, fill_opacity=1, stroke_width=0)
    copy = label(text, size=22, color=TEXT)
    return VGroup(dot, copy).arrange(RIGHT, buff=0.18)


def arrow_between(start, end, color=LINE) -> Arrow:
    return Arrow(start.get_right(), end.get_left(), buff=0.18, color=color, stroke_width=4, max_tip_length_to_length_ratio=0.08)

