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
    GrowArrow,
    Line,
    ManimColor,
    MoveToTarget,
    ReplacementTransform,
    RoundedRectangle,
    Scene,
    Text,
    TransformFromCopy,
    VGroup,
    WHITE,
    config,
)

sys.path.append(str(Path(__file__).resolve().parents[1]))

from shared.palette import CANVAS, CONFLICT, FEATURE, HEAD, LINE, MAIN, MUTED, TEXT
from shared.primitives import assert_inside_frame, assert_no_overlap


def label(text: str, size: int = 30, color: ManimColor = TEXT, weight: str = "MEDIUM") -> Text:
    return Text(text, font_size=size, color=color, weight=weight, font="Noto Sans CJK SC")


def commit(label_text: str, color: ManimColor = TEXT) -> VGroup:
    circle = Circle(radius=0.31, color=color, stroke_width=5).set_fill(CANVAS, opacity=1)
    text = label(label_text, size=22, color=TEXT, weight="BOLD").move_to(circle.get_center())
    return VGroup(circle, text)


def branch_tag(text: str, color: ManimColor) -> VGroup:
    box = RoundedRectangle(width=1.35, height=0.44, corner_radius=0.09, color=color, fill_color=color, fill_opacity=1, stroke_width=0)
    txt = label(text, size=22, color=WHITE, weight="BOLD").move_to(box.get_center())
    return VGroup(box, txt)


def snapshot_card(name: str, commit_id: str, lines: list[str], color: ManimColor) -> VGroup:
    box = RoundedRectangle(width=3.0, height=2.1, corner_radius=0.13, color=color, fill_color=CANVAS, fill_opacity=1, stroke_width=4)
    title = label(name, size=25, color=color, weight="BOLD")
    subtitle = label(commit_id, size=18, color=MUTED)
    rows = VGroup(*[label(line, size=19, color=TEXT if idx == 0 else MUTED) for idx, line in enumerate(lines)])
    rows.arrange(DOWN, aligned_edge=LEFT, buff=0.08)
    stack = VGroup(title, subtitle, rows).arrange(DOWN, aligned_edge=LEFT, buff=0.12).move_to(box.get_center())
    return VGroup(box, stack)


def flow_arrow(start, end, color: ManimColor = HEAD) -> Arrow:
    return Arrow(start.get_right(), end.get_left(), color=color, stroke_width=5, buff=0.16, max_tip_length_to_length_ratio=0.08)


class ThreeWayMergeScene(Scene):
    def construct(self):
        config.background_color = CANVAS
        self.camera.background_color = CANVAS

        title = label("three-way merge", size=34, color=TEXT, weight="BOLD").to_edge(UP, buff=0.44)
        subtitle = label("base / ours / theirs -> result", size=23, color=MUTED).next_to(title, DOWN, buff=0.1)

        c0 = commit("C0").shift(4.2 * LEFT + 0.9 * UP)
        c1 = commit("C1").shift(2.85 * LEFT + 0.9 * UP)
        c2 = commit("C2", HEAD).shift(1.5 * LEFT + 0.9 * UP)
        c3 = commit("C3", MAIN).shift(0.1 * LEFT + 1.65 * UP)
        c4 = commit("C4", FEATURE).shift(0.1 * LEFT + 0.15 * UP)
        main = branch_tag("main", MAIN).next_to(c3, UP, buff=0.28)
        feature = branch_tag("feature", FEATURE).next_to(c4, DOWN, buff=0.28)
        edges = VGroup(
            Line(c0.get_right(), c1.get_left(), color=LINE, stroke_width=7),
            Line(c1.get_right(), c2.get_left(), color=LINE, stroke_width=7),
            Line(c2.get_right(), c3.get_left(), color=LINE, stroke_width=7),
            Line(c2.get_right(), c4.get_left(), color=LINE, stroke_width=7),
        )
        dag = VGroup(edges, c0, c1, c2, c3, c4, main, feature).shift(0.35 * RIGHT)

        base_card = snapshot_card("base", "C2", ["title: A", "body: old"], HEAD).shift(4.2 * LEFT + 1.55 * DOWN)
        ours_card = snapshot_card("ours", "C3 / main", ["title: A", "body: main"], MAIN).shift(0.25 * LEFT + 2.5 * UP)
        theirs_card = snapshot_card("theirs", "C4 / feature", ["title: A", "body: feature"], FEATURE).shift(0.25 * LEFT + 1.65 * DOWN)
        result_card = snapshot_card("result", "ready for M1", ["title: A", "body: merged"], CONFLICT).shift(3.25 * RIGHT + 0.15 * UP)

        base_label = label("共同祖先", size=20, color=HEAD).next_to(base_card, DOWN, buff=0.18)
        ours_label = label("当前分支", size=20, color=MAIN).next_to(ours_card, RIGHT, buff=0.2)
        theirs_label = label("要合进来", size=20, color=FEATURE).next_to(theirs_card, RIGHT, buff=0.2)
        result_label = label("自动判断的修改合成结果", size=20, color=CONFLICT).next_to(result_card, DOWN, buff=0.18)

        base_arrow = flow_arrow(base_card, result_card, HEAD)
        ours_arrow = flow_arrow(ours_card, result_card, MAIN)
        theirs_arrow = flow_arrow(theirs_card, result_card, FEATURE)

        m1 = commit("M1", CONFLICT).shift(3.45 * RIGHT + 1.6 * DOWN)
        m1_tag = branch_tag("merge commit", CONFLICT).next_to(m1, DOWN, buff=0.28)
        m1_arrow = Arrow(result_card.get_bottom(), m1.get_top(), color=CONFLICT, stroke_width=5, buff=0.18, max_tip_length_to_length_ratio=0.12)

        all_objects = VGroup(title, subtitle, dag, base_card, ours_card, theirs_card, result_card, m1, m1_tag)
        assert_inside_frame(all_objects, margin=0.12)
        assert_no_overlap(ours_card, theirs_card, padding=0.1)
        assert_no_overlap(base_card, result_card, padding=0.12)

        # Beat table:
        # 0-5s title + DAG, 5-14s base extraction, 14-23s ours/theirs,
        # 23-33s result flow, 33-40s M1 handoff.
        self.play(FadeIn(title, shift=0.15 * DOWN), FadeIn(subtitle, shift=0.12 * DOWN), run_time=0.9)
        self.play(Create(edges), FadeIn(VGroup(c0, c1, c2, c3, c4), shift=0.08 * UP), run_time=1.9)
        self.play(FadeIn(main, shift=0.1 * DOWN), FadeIn(feature, shift=0.1 * UP), run_time=0.8)
        self.wait(0.9)
        self.play(FadeOut(VGroup(title, subtitle)), run_time=0.5)

        self.play(TransformFromCopy(c2, base_card), FadeIn(base_label, shift=0.1 * UP), run_time=2.0)
        self.play(c2.animate.set_color(HEAD), run_time=0.6)
        self.wait(6.4)

        self.play(TransformFromCopy(c3, ours_card), FadeIn(ours_label, shift=0.1 * LEFT), run_time=1.7)
        self.play(TransformFromCopy(c4, theirs_card), FadeIn(theirs_label, shift=0.1 * LEFT), run_time=1.7)
        self.wait(5.6)

        self.play(GrowArrow(base_arrow), run_time=1.2)
        self.play(GrowArrow(ours_arrow), GrowArrow(theirs_arrow), run_time=1.6)
        self.play(FadeIn(result_card, shift=0.1 * LEFT), FadeIn(result_label, shift=0.1 * UP), run_time=1.4)
        self.wait(5.8)

        result_card.generate_target()
        result_card.target.scale(0.62).move_to(m1.get_center())
        self.play(FadeOut(VGroup(base_label, ours_label, theirs_label, result_label)), run_time=0.5)
        self.play(MoveToTarget(result_card), run_time=1.4)
        self.play(ReplacementTransform(result_card, m1), GrowArrow(m1_arrow), FadeIn(m1_tag, shift=0.1 * UP), run_time=1.3)
        self.wait(3.8)
