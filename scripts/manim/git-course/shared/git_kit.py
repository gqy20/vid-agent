from __future__ import annotations

from dataclasses import dataclass
from typing import Literal, Sequence

import numpy as np
from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    Arrow,
    Circle,
    DashedVMobject,
    Line,
    ManimColor,
    Mobject,
    RoundedRectangle,
    Text,
    VGroup,
    WHITE,
)

from .palette import CANVAS, CONFLICT, FEATURE, HEAD, LINE, MAIN, MUTED, TEXT

GitRole = Literal[
    "commit",
    "main",
    "feature",
    "head",
    "merge_base",
    "conflict",
    "result",
    "muted",
]
FontRole = Literal["sans", "latin", "mono"]

FONT_FAMILIES: dict[FontRole, str] = {
    "sans": "Noto Sans CJK SC",
    "latin": "Inter",
    "mono": "JetBrains Mono",
}

# Match the Remotion course body rhythm (1.48) while keeping Manim card text
# comfortably above the requested 1.5× minimum.  This is a centre-to-centre
# line-box ratio, calculated from the real Pango bounds of adjacent lines.
CARD_LINE_HEIGHT = 1.55

# Manim clips are authored at 1920x1080, then displayed inside the Remotion
# course shell at roughly 81% scale.  These are native Manim widths chosen so
# their *composited* weight matches the 1080p GitGraph screen tokens:
# graph 14px, commit outline 9px, ref/flow connector 7px.
COURSE_CLIP_SCALE = 876 / 1080
GRAPH_EDGE_WIDTH = 17
COMMIT_OUTLINE_WIDTH = 11
MERGE_BASE_RING_WIDTH = 5
REF_STEM_WIDTH = 8.5
FLOW_ARROW_WIDTH = 8.5

# Stable painter's order for Git diagrams.  Manim otherwise falls back to the
# order in which animated mobjects enter the scene, so a late merge edge can
# cover an existing commit outline.  Edges stay underneath the opaque node
# body; labels and refs stay above it.
GRAPH_EDGE_Z = 0
REF_STEM_Z = 1
NODE_BODY_Z = 2
NODE_LABEL_Z = 3
REF_TAG_Z = 4
REF_LABEL_Z = 5


ROLE_COLORS: dict[GitRole, ManimColor] = {
    "commit": TEXT,
    "main": MAIN,
    "feature": FEATURE,
    "head": HEAD,
    "merge_base": TEXT,
    "conflict": CONFLICT,
    "result": TEXT,
    "muted": MUTED,
}


@dataclass(frozen=True)
class SnapshotField:
    name: str
    value: str
    role: GitRole = "muted"


def role_color(role: GitRole) -> ManimColor:
    return ROLE_COLORS[role]


def git_text(
    text: str,
    size: int = 34,
    role: GitRole = "commit",
    weight: str = "MEDIUM",
    font_role: FontRole = "sans",
) -> Text:
    return Text(
        text,
        font_size=size,
        color=role_color(role),
        weight=weight,
        font=FONT_FAMILIES[font_role],
    )


def commit_node(
    label: str,
    role: GitRole = "commit",
    radius: float = 0.38,
) -> VGroup:
    color = role_color(role)
    circle = (
        Circle(radius=radius, color=color, stroke_width=COMMIT_OUTLINE_WIDTH)
        .set_fill(CANVAS, opacity=1)
        .set_z_index(NODE_BODY_Z)
    )
    text = git_text(
        label,
        size=34,
        role="commit",
        weight="BOLD",
        font_role="mono",
    ).move_to(circle.get_center()).set_z_index(NODE_LABEL_Z)
    parts: list[Mobject] = [circle, text]
    if role == "merge_base":
        outer = DashedVMobject(
            Circle(radius=radius + 0.11, color=color, stroke_width=MERGE_BASE_RING_WIDTH),
            num_dashes=18,
            dashed_ratio=0.52,
        ).set_z_index(NODE_BODY_Z)
        parts.insert(0, outer)
    return VGroup(*parts)


def branch_tag(
    text: str,
    role: GitRole,
    width: float = 1.72,
    height: float = 0.58,
) -> VGroup:
    color = role_color(role)
    box = RoundedRectangle(
        width=width,
        height=height,
        corner_radius=0.1,
        color=color,
        fill_color=color,
        fill_opacity=1,
        stroke_width=0,
    ).set_z_index(REF_TAG_Z)
    txt = Text(
        text,
        font_size=31,
        color=WHITE,
        weight="BOLD",
        font=FONT_FAMILIES["latin"],
    ).move_to(box.get_center()).set_z_index(REF_LABEL_Z)
    return VGroup(box, txt)


def ref_pointer(
    text: str,
    target: Mobject,
    role: GitRole,
    placement=UP,
    buff: float = 0.22,
    width: float = 1.72,
) -> VGroup:
    tag = branch_tag(text, role=role, width=width).next_to(target, placement, buff=buff)
    color = role_color(role)
    if np.allclose(placement, UP):
        stem = Line(tag.get_bottom(), target.get_top(), color=color, stroke_width=REF_STEM_WIDTH)
    elif np.allclose(placement, DOWN):
        stem = Line(tag.get_top(), target.get_bottom(), color=color, stroke_width=REF_STEM_WIDTH)
    elif np.allclose(placement, LEFT):
        stem = Line(tag.get_right(), target.get_left(), color=color, stroke_width=REF_STEM_WIDTH)
    elif np.allclose(placement, RIGHT):
        stem = Line(tag.get_left(), target.get_right(), color=color, stroke_width=REF_STEM_WIDTH)
    else:
        stem = Line(tag.get_center(), target.get_center(), color=color, stroke_width=REF_STEM_WIDTH)
    stem.set_z_index(REF_STEM_Z)
    return VGroup(stem, tag)


def head_badge(width: float = 1.46) -> VGroup:
    box = RoundedRectangle(
        width=width,
        height=0.52,
        corner_radius=0.26,
        color=HEAD,
        fill_color=CANVAS,
        fill_opacity=1,
        stroke_width=4,
    ).set_z_index(REF_TAG_Z)
    txt = git_text(
        "HEAD",
        size=27,
        role="head",
        weight="BOLD",
        font_role="mono",
    ).move_to(box.get_center()).set_z_index(REF_LABEL_Z)
    return VGroup(box, txt)


def field_row(field: SnapshotField, font_size: int = 35) -> VGroup:
    key = git_text(f"{field.name}:", size=font_size, role="muted", font_role="mono")
    value = git_text(
        field.value,
        size=font_size,
        role=field.role,
        weight="BOLD" if field.role != "muted" else "MEDIUM",
        font_role="mono",
    )
    return VGroup(key, value).arrange(RIGHT, buff=0.13)


def field_change_chip(
    field: SnapshotField,
    role: GitRole,
    width: float = 2.9,
    height: float = 0.88,
) -> VGroup:
    box = RoundedRectangle(
        width=width,
        height=height,
        corner_radius=0.12,
        color=role_color(role),
        fill_color=CANVAS,
        fill_opacity=1,
        stroke_width=4,
    )
    row = field_row(field, font_size=32).move_to(box.get_center())
    return VGroup(box, row)


def _stack_text_lines(
    lines: Sequence[Mobject],
    line_height: float = CARD_LINE_HEIGHT,
) -> VGroup:
    if line_height < 1.5:
        raise ValueError("Git course card line height must be at least 1.5")
    group = VGroup(*lines)
    for previous, current in zip(lines, lines[1:]):
        gap = (line_height - 1) * (previous.height + current.height) / 2
        current.next_to(previous, DOWN, buff=gap, aligned_edge=LEFT)
    return group


def snapshot_card(
    name: str,
    commit_id: str,
    fields: Sequence[SnapshotField],
    role: GitRole = "result",
    width: float = 3.8,
    height: float = 2.38,
) -> VGroup:
    tone = role_color(role)
    title = git_text(name, size=42, role=role, weight="BOLD", font_role="latin")
    subtitle = git_text(commit_id, size=30, role="muted", font_role="mono")
    rows = VGroup(*(field_row(field) for field in fields))
    _stack_text_lines(
        [title, subtitle, *rows],
        line_height=CARD_LINE_HEIGHT,
    )
    stack = VGroup(title, subtitle, rows)

    # `height` is a minimum.  The card grows with its text instead of silently
    # compressing the requested line height back into a fixed shell.
    resolved_height = max(height, stack.height + 0.62)
    box = RoundedRectangle(
        width=width,
        height=resolved_height,
        corner_radius=0.14,
        color=tone,
        fill_color=CANVAS,
        fill_opacity=1,
        stroke_width=4.5,
    )
    stack.move_to(box.get_center())
    return VGroup(box, stack)


def snapshot_rows(card: VGroup) -> VGroup:
    return card[1][2]


def snapshot_flow_arrow(
    source_card: VGroup,
    source_row_index: int,
    target_card: VGroup,
    target_row_index: int,
    role: GitRole,
    direction=RIGHT,
    width: float = FLOW_ARROW_WIDTH,
    buff: float = 0.12,
) -> Arrow:
    source_row = snapshot_rows(source_card)[source_row_index]
    target_row = snapshot_rows(target_card)[target_row_index]
    if np.allclose(direction, RIGHT):
        start = np.array([source_card.get_right()[0], source_row.get_center()[1], 0])
        end = np.array([target_card.get_left()[0], target_row.get_center()[1], 0])
    elif np.allclose(direction, LEFT):
        start = np.array([source_card.get_left()[0], source_row.get_center()[1], 0])
        end = np.array([target_card.get_right()[0], target_row.get_center()[1], 0])
    else:
        raise ValueError("snapshot_flow_arrow only supports LEFT or RIGHT flow")
    return Arrow(
        start,
        end,
        color=role_color(role),
        stroke_width=width,
        buff=buff,
        max_tip_length_to_length_ratio=0.12,
    )


def field_to_snapshot_arrow(
    source: Mobject,
    target_card: VGroup,
    target_row_index: int,
    role: GitRole,
    direction=RIGHT,
    width: float = FLOW_ARROW_WIDTH,
    buff: float = 0.12,
) -> Arrow:
    target_row = snapshot_rows(target_card)[target_row_index]
    if np.allclose(direction, RIGHT):
        start = source.get_right()
        end = np.array([target_card.get_left()[0], target_row.get_center()[1], 0])
    elif np.allclose(direction, LEFT):
        start = source.get_left()
        end = np.array([target_card.get_right()[0], target_row.get_center()[1], 0])
    else:
        raise ValueError("field_to_snapshot_arrow only supports LEFT or RIGHT flow")
    return Arrow(
        start,
        end,
        color=role_color(role),
        stroke_width=width,
        buff=buff,
        max_tip_length_to_length_ratio=0.12,
    )


def semantic_line(
    start: Mobject,
    end: Mobject,
    role: GitRole = "muted",
    start_direction=RIGHT,
    end_direction=LEFT,
    width: float = GRAPH_EDGE_WIDTH,
) -> Line:
    color = LINE if role == "muted" else role_color(role)
    return Line(
        start.get_boundary_point(start_direction),
        end.get_boundary_point(end_direction),
        color=color,
        stroke_width=width,
    ).set_z_index(GRAPH_EDGE_Z)


def causal_arrow(
    start: Mobject,
    end: Mobject,
    role: GitRole,
    start_direction=RIGHT,
    end_direction=LEFT,
    width: float = FLOW_ARROW_WIDTH,
    buff: float = 0.16,
) -> Arrow:
    return Arrow(
        start.get_critical_point(start_direction),
        end.get_critical_point(end_direction),
        color=role_color(role),
        stroke_width=width,
        buff=buff,
        max_tip_length_to_length_ratio=0.12,
    )
