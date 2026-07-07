from __future__ import annotations

import numpy as np
from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    Arrow,
    Circle,
    Line,
    ManimColor,
    Mobject,
    RoundedRectangle,
    Text,
    VGroup,
    WHITE,
    config,
)

from .palette import CANVAS, HEAD, LINE, MUTED, TEXT


def label_text(text: str, size: int = 28, color: ManimColor = TEXT, weight: str = "MEDIUM") -> Text:
    return Text(text, font_size=size, color=color, weight=weight, font="Noto Sans CJK SC")


def commit_node(label: str, radius: float = 0.32, color: ManimColor = TEXT, fill: ManimColor = CANVAS) -> VGroup:
    circle = Circle(radius=radius, color=color, stroke_width=5).set_fill(fill, opacity=1)
    text = label_text(label, size=24, color=color, weight="BOLD")
    return VGroup(circle, text)


def branch_label(label: str, color: ManimColor, width: float = 1.45, height: float = 0.48) -> VGroup:
    box = RoundedRectangle(
        width=width,
        height=height,
        corner_radius=0.1,
        color=color,
        fill_color=color,
        fill_opacity=1,
        stroke_width=0,
    )
    text = label_text(label, size=25, color=WHITE, weight="BOLD").move_to(box.get_center())
    return VGroup(box, text)


def pointer_to(label: str, target: Mobject, color: ManimColor, direction=DOWN, buff: float = 0.82) -> VGroup:
    tag = branch_label(label, color)
    tag.next_to(target, direction, buff=buff)
    if np.allclose(direction, UP):
        stem = Line(tag.get_bottom(), target.get_top(), color=color, stroke_width=5)
    elif np.allclose(direction, DOWN):
        stem = Line(tag.get_top(), target.get_bottom(), color=color, stroke_width=5)
    elif np.allclose(direction, LEFT):
        stem = Line(tag.get_right(), target.get_left(), color=color, stroke_width=5)
    elif np.allclose(direction, RIGHT):
        stem = Line(tag.get_left(), target.get_right(), color=color, stroke_width=5)
    else:
        stem = Line(tag.get_center(), target.get_center(), color=color, stroke_width=5)
    return VGroup(stem, tag)


def object_box(kind: str, detail: str, color: ManimColor = TEXT, width: float = 2.45, height: float = 1.05) -> VGroup:
    box = RoundedRectangle(
        width=width,
        height=height,
        corner_radius=0.12,
        color=color,
        fill_color=CANVAS,
        fill_opacity=1,
        stroke_width=4,
    )
    title = label_text(kind, size=26, color=color, weight="BOLD")
    subtitle = label_text(detail, size=18, color=MUTED)
    text = VGroup(title, subtitle).arrange(DOWN, buff=0.08).move_to(box.get_center())
    return VGroup(box, text)


def graph_edge(start: Mobject, end: Mobject, color: ManimColor = LINE, width: float = 7) -> Line:
    return Line(start.get_right(), end.get_left(), color=color, stroke_width=width)


def causal_arrow(start: Mobject, end: Mobject, color: ManimColor = HEAD) -> Arrow:
    return Arrow(start.get_right(), end.get_left(), color=color, stroke_width=5, buff=0.12, max_tip_length_to_length_ratio=0.08)


def assert_inside_frame(mobject: Mobject, margin: float = 0.18) -> None:
    half_width = config.frame_width / 2 - margin
    half_height = config.frame_height / 2 - margin
    left, right = mobject.get_left()[0], mobject.get_right()[0]
    bottom, top = mobject.get_bottom()[1], mobject.get_top()[1]
    if left < -half_width or right > half_width or bottom < -half_height or top > half_height:
        raise ValueError(
            f"{mobject!r} outside frame: "
            f"left={left:.2f}, right={right:.2f}, bottom={bottom:.2f}, top={top:.2f}"
        )


def assert_no_overlap(a: Mobject, b: Mobject, padding: float = 0.08) -> None:
    a_left, a_right = a.get_left()[0] - padding, a.get_right()[0] + padding
    a_bottom, a_top = a.get_bottom()[1] - padding, a.get_top()[1] + padding
    b_left, b_right = b.get_left()[0] - padding, b.get_right()[0] + padding
    b_bottom, b_top = b.get_bottom()[1] - padding, b.get_top()[1] + padding
    overlaps = a_left < b_right and a_right > b_left and a_bottom < b_top and a_top > b_bottom
    if overlaps:
        raise ValueError(f"{a!r} overlaps {b!r}")
