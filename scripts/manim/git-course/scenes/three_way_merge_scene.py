from __future__ import annotations

import sys
from pathlib import Path

from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    Arrow,
    Circle,
    Create,
    FadeIn,
    FadeOut,
    Line,
    ManimColor,
    RoundedRectangle,
    Scene,
    Text,
    Transform,
    TransformFromCopy,
    VGroup,
    WHITE,
    config,
)

sys.path.append(str(Path(__file__).resolve().parents[1]))

from shared.palette import CANVAS, FEATURE, LINE, MAIN, MUTED, TEXT
from shared.primitives import assert_inside_frame, assert_no_overlap


def label(text: str, size: int = 34, color: ManimColor = TEXT, weight: str = "MEDIUM") -> Text:
    return Text(text, font_size=size, color=color, weight=weight, font="Noto Sans CJK SC")


def commit(label_text: str, color: ManimColor = TEXT) -> VGroup:
    circle = Circle(radius=0.38, color=color, stroke_width=6).set_fill(CANVAS, opacity=1)
    text = label(label_text, size=34, color=TEXT, weight="BOLD").move_to(circle.get_center())
    return VGroup(circle, text)


def branch_tag(text: str, color: ManimColor, width: float = 1.72) -> VGroup:
    box = RoundedRectangle(
        width=width,
        height=0.58,
        corner_radius=0.1,
        color=color,
        fill_color=color,
        fill_opacity=1,
        stroke_width=0,
    )
    txt = label(text, size=31, color=WHITE, weight="BOLD").move_to(box.get_center())
    return VGroup(box, txt)


def field_row(field: str, value: str, value_color: ManimColor = MUTED) -> VGroup:
    key = label(f"{field}:", size=35, color=MUTED)
    val = label(value, size=35, color=value_color, weight="BOLD" if value_color != MUTED else "MEDIUM")
    return VGroup(key, val).arrange(RIGHT, buff=0.13)


def snapshot_card(
    name: str,
    commit_id: str,
    title_value: str,
    body_value: str,
    tone: ManimColor,
    title_color: ManimColor = MUTED,
    body_color: ManimColor = MUTED,
) -> VGroup:
    box = RoundedRectangle(
        width=3.5,
        height=2.38,
        corner_radius=0.14,
        color=tone,
        fill_color=CANVAS,
        fill_opacity=1,
        stroke_width=4.5,
    )
    title = label(name, size=42, color=tone, weight="BOLD")
    subtitle = label(commit_id, size=30, color=MUTED)
    rows = VGroup(
        field_row("title", title_value, title_color),
        field_row("body", body_value, body_color),
    ).arrange(DOWN, aligned_edge=LEFT, buff=0.14)
    stack = VGroup(title, subtitle, rows).arrange(DOWN, aligned_edge=LEFT, buff=0.13).move_to(box.get_center())
    return VGroup(box, stack)


def changed_rows(card: VGroup) -> VGroup:
    return card[1][2]


class ThreeWayMergeScene(Scene):
    def construct(self):
        config.background_color = CANVAS
        self.camera.background_color = CANVAS

        # DAG: the persistent source of truth at the top of the frame.
        c0 = commit("C0").move_to([-5.45, 2.55, 0])
        c1 = commit("C1").move_to([-4.05, 2.55, 0])
        c2 = commit("C2").move_to([-2.65, 2.55, 0])
        c3 = commit("C3", MAIN).move_to([-0.85, 2.68, 0])
        c4 = commit("C4", FEATURE).move_to([-0.85, 2.05, 0])
        edges = VGroup(
            Line(c0.get_right(), c1.get_left(), color=LINE, stroke_width=8),
            Line(c1.get_right(), c2.get_left(), color=LINE, stroke_width=8),
            Line(c2.get_right(), c3.get_left(), color=LINE, stroke_width=8),
            Line(c2.get_right(), c4.get_left(), color=LINE, stroke_width=8),
        )
        main_tag = branch_tag("main", MAIN).next_to(c3, UP, buff=0.22)
        main_stem = Line(main_tag.get_bottom(), c3.get_top(), color=MAIN, stroke_width=5)
        feature_tag = branch_tag("feature", FEATURE, width=2.05).next_to(c4, DOWN, buff=0.22)
        feature_stem = Line(feature_tag.get_top(), c4.get_bottom(), color=FEATURE, stroke_width=5)
        dag = VGroup(edges, c0, c1, c2, c3, c4, main_stem, main_tag, feature_stem, feature_tag)

        base_card = snapshot_card("base", "C2 / 共同祖先", "A", "old", TEXT).move_to([0, -0.72, 0])
        base_label = label("用于分离共同内容与双方变化", size=32, color=MUTED).next_to(base_card, DOWN, buff=0.2)
        base_marker = label("base  C2", size=32, color=TEXT, weight="BOLD").next_to(c2, DOWN, buff=0.38)

        ours_card = snapshot_card(
            "ours",
            "C3 / main",
            "main",
            "old",
            MAIN,
            title_color=MAIN,
        ).move_to([-4.55, -0.72, 0])
        theirs_card = snapshot_card(
            "theirs",
            "C4 / feature",
            "A",
            "feature",
            FEATURE,
            body_color=FEATURE,
        ).move_to([4.55, -0.72, 0])
        ours_role = label("当前分支的变化", size=32, color=MAIN).next_to(ours_card, DOWN, buff=0.2)
        theirs_role = label("待合入分支的变化", size=32, color=FEATURE).next_to(theirs_card, DOWN, buff=0.2)

        result_card = snapshot_card(
            "result",
            "result tree",
            "main",
            "feature",
            TEXT,
            title_color=MAIN,
            body_color=FEATURE,
        ).move_to([0, -0.72, 0])
        result_shell = VGroup(result_card[0], result_card[1][0], result_card[1][1])
        result_rows = changed_rows(result_card)
        result_label = label("独立修改自动组合", size=32, color=TEXT, weight="BOLD").next_to(result_card, DOWN, buff=0.2)

        ours_to_result = Arrow(
            changed_rows(ours_card)[0].get_right(),
            result_rows[0].get_left(),
            color=MAIN,
            stroke_width=6,
            buff=0.16,
            max_tip_length_to_length_ratio=0.12,
        )
        theirs_to_result = Arrow(
            changed_rows(theirs_card)[1].get_left(),
            result_rows[1].get_right(),
            color=FEATURE,
            stroke_width=6,
            buff=0.16,
            max_tip_length_to_length_ratio=0.12,
        )

        m1 = commit("M1").move_to([1.28, 2.55, 0])
        merge_edges = VGroup(
            Line(c3.get_right(), m1.get_left(), color=MAIN, stroke_width=8),
            Line(c4.get_right(), m1.get_left(), color=FEATURE, stroke_width=8),
        )
        result_link = Line(m1.get_bottom(), result_card.get_top(), color=TEXT, stroke_width=4)
        result_link_label = label("tree", size=28, color=MUTED).next_to(result_link, RIGHT, buff=0.08)
        main_at_m1 = branch_tag("main", MAIN).next_to(m1, UP, buff=0.22)
        main_stem_at_m1 = Line(main_at_m1.get_bottom(), m1.get_top(), color=MAIN, stroke_width=5)
        parent_label = label("两个 parent", size=30, color=TEXT, weight="BOLD").move_to([3.35, 2.55, 0])

        final_objects = VGroup(
            dag,
            ours_card,
            ours_role,
            theirs_card,
            theirs_role,
            result_card,
            result_label,
            ours_to_result,
            theirs_to_result,
            m1,
            merge_edges,
            result_link,
            result_link_label,
            main_at_m1,
            main_stem_at_m1,
            parent_label,
        )
        assert_inside_frame(final_objects, margin=0.1)
        assert_no_overlap(ours_card, result_card, padding=0.1)
        assert_no_overlap(result_card, theirs_card, padding=0.1)
        assert_no_overlap(ours_card, theirs_card, padding=0.1)
        assert_no_overlap(dag, ours_card, padding=0.08)
        assert_no_overlap(dag, result_card, padding=0.08)
        assert_no_overlap(dag, theirs_card, padding=0.08)
        assert_no_overlap(m1, parent_label, padding=0.1)

        # Beat table: 5 + 9 + 9 + 10 + 7 = 40 seconds.
        # 0-5s: DAG enters and settles.
        self.play(Create(edges), FadeIn(VGroup(c0, c1, c2, c3, c4), shift=0.08 * UP), run_time=2.2)
        self.play(FadeIn(VGroup(main_stem, main_tag, feature_stem, feature_tag)), run_time=0.8)
        self.wait(2.0)

        # 5-14s: C2 becomes the neutral merge base snapshot.
        self.play(TransformFromCopy(c2, base_card), run_time=1.8)
        self.play(FadeIn(base_label, shift=0.08 * UP), FadeIn(base_marker, shift=0.08 * UP), run_time=0.5)
        self.wait(6.7)

        # 14-23s: both sides are derived from the same base; only changed values carry branch color.
        self.play(
            TransformFromCopy(base_card, ours_card),
            TransformFromCopy(base_card, theirs_card),
            FadeOut(base_label),
            run_time=2.0,
        )
        self.play(
            FadeOut(base_card),
            FadeIn(ours_role, shift=0.08 * UP),
            FadeIn(theirs_role, shift=0.08 * UP),
            run_time=1.0,
        )
        self.wait(6.0)

        # 23-33s: changed fields, not whole cards, flow into the result.
        self.play(FadeIn(result_shell, shift=0.08 * UP), run_time=1.0)
        self.play(Create(ours_to_result), Create(theirs_to_result), run_time=1.0)
        self.play(
            TransformFromCopy(changed_rows(ours_card)[0], result_rows[0]),
            TransformFromCopy(changed_rows(theirs_card)[1], result_rows[1]),
            run_time=1.6,
        )
        self.play(FadeIn(result_label, shift=0.08 * UP), run_time=0.4)
        self.wait(6.0)

        # 33-40s: the result remains visible while a two-parent commit is created above it.
        self.play(
            FadeOut(VGroup(ours_to_result, theirs_to_result, ours_role, theirs_role)),
            ours_card.animate.set_opacity(0.18),
            theirs_card.animate.set_opacity(0.18),
            run_time=0.5,
        )
        self.play(
            Create(merge_edges),
            FadeIn(m1, shift=0.08 * LEFT),
            Create(result_link),
            FadeIn(result_link_label),
            run_time=1.3,
        )
        self.play(
            Transform(main_tag, main_at_m1),
            Transform(main_stem, main_stem_at_m1),
            FadeIn(parent_label, shift=0.08 * LEFT),
            run_time=1.2,
        )
        self.wait(4.0)
