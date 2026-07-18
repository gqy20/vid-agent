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

from shared.palette import CANVAS, FEATURE, HEAD, LINE, MAIN, MUTED, TEXT
from shared.primitives import assert_inside_frame, assert_no_overlap


def label(text: str, size: int = 30, color: ManimColor = TEXT, weight: str = "MEDIUM") -> Text:
    return Text(text, font_size=size, color=color, weight=weight, font="Noto Sans CJK SC")


def commit(label_text: str, color: ManimColor = TEXT) -> VGroup:
    circle = Circle(radius=0.31, color=color, stroke_width=5).set_fill(CANVAS, opacity=1)
    text = label(label_text, size=22, color=TEXT, weight="BOLD").move_to(circle.get_center())
    return VGroup(circle, text)


def tag(text: str, color: ManimColor, width: float = 1.28) -> VGroup:
    box = RoundedRectangle(width=width, height=0.44, corner_radius=0.09, color=color, fill_color=color, fill_opacity=1, stroke_width=0)
    txt = label(text, size=21, color=WHITE, weight="BOLD").move_to(box.get_center())
    return VGroup(box, txt)


def patch_card(name: str, detail: str, color: ManimColor) -> VGroup:
    box = RoundedRectangle(width=2.15, height=1.12, corner_radius=0.12, color=color, fill_color=CANVAS, fill_opacity=1, stroke_width=4)
    title = label(name, size=24, color=color, weight="BOLD")
    subtitle = label(detail, size=18, color=MUTED)
    stack = VGroup(title, subtitle).arrange(DOWN, buff=0.09).move_to(box.get_center())
    return VGroup(box, stack)


def commit_card(name: str, parent: str, tree: str, hash_text: str, color: ManimColor) -> VGroup:
    box = RoundedRectangle(width=3.3, height=2.38, corner_radius=0.13, color=color, fill_color=CANVAS, fill_opacity=1, stroke_width=4)
    title = label(name, size=27, color=color, weight="BOLD")
    parent_line = label(f"parent: {parent}", size=21, color=TEXT, weight="MEDIUM")
    tree_line = label(f"tree:   {tree}", size=21, color=MUTED)
    hash_line = label(f"hash:   {hash_text}", size=21, color=TEXT, weight="BOLD")
    rows = VGroup(title, parent_line, tree_line, hash_line).arrange(DOWN, aligned_edge=LEFT, buff=0.12).move_to(box.get_center())
    return VGroup(box, rows)


def graph_edge(start: VGroup, end: VGroup) -> Line:
    return Line(start.get_right(), end.get_left(), color=LINE, stroke_width=7)


def vertical_edge(start: VGroup, end: VGroup) -> Line:
    return Line(start.get_right(), end.get_left(), color=LINE, stroke_width=7)


class RebaseReplayScene(Scene):
    def construct(self):
        config.background_color = CANVAS
        self.camera.background_color = CANVAS

        title = label("rebase = replay patches", size=34, color=TEXT, weight="BOLD").to_edge(UP, buff=0.42)
        subtitle = label("find base → extract unique changes → replay on new base", size=22, color=MUTED).next_to(title, DOWN, buff=0.08)

        c0 = commit("C0").shift(5.0 * LEFT + 1.15 * UP)
        c1 = commit("C1").shift(3.55 * LEFT + 1.15 * UP)
        c2 = commit("C2", HEAD).shift(2.1 * LEFT + 1.15 * UP)
        c3 = commit("C3", MAIN).shift(0.8 * LEFT + 1.95 * UP)
        c4 = commit("C4", FEATURE).shift(0.8 * LEFT + 0.36 * UP)
        c5 = commit("C5", FEATURE).shift(0.65 * RIGHT + 0.36 * UP)
        main_tag = tag("main", MAIN).next_to(c3, UP, buff=0.26)
        feature_tag = tag("feature", FEATURE, width=1.55).next_to(c5, DOWN, buff=0.25)
        edges = VGroup(
            graph_edge(c0, c1),
            graph_edge(c1, c2),
            Line(c2.get_right(), c3.get_left(), color=LINE, stroke_width=7),
            Line(c2.get_right(), c4.get_left(), color=LINE, stroke_width=7),
            graph_edge(c4, c5),
        )
        old_graph = VGroup(edges, c0, c1, c2, c3, c4, c5, main_tag, feature_tag)

        base_label = label("共同祖先 C2", size=22, color=HEAD, weight="BOLD").next_to(c2, DOWN, buff=0.48)

        p4 = patch_card("patch 1", "from C4", FEATURE).shift(1.45 * RIGHT + 2.15 * DOWN)
        p5 = patch_card("patch 2", "from C5", FEATURE).next_to(p4, RIGHT, buff=0.42)
        patch_title = label("feature 独有修改", size=22, color=FEATURE, weight="BOLD").next_to(VGroup(p4, p5), UP, buff=0.22)

        c4p = commit("C4'", FEATURE).shift(2.7 * RIGHT + 1.95 * UP)
        c5p = commit("C5'", FEATURE).shift(4.15 * RIGHT + 1.95 * UP)
        replay_edges = VGroup(graph_edge(c3, c4p), graph_edge(c4p, c5p))
        new_feature_tag = tag("feature", FEATURE, width=1.55).next_to(c5p, UP, buff=0.26)
        replay_note = label("在 C3 后按原顺序重放", size=22, color=MAIN, weight="BOLD").next_to(VGroup(c4p, c5p), DOWN, buff=0.45)

        arrow4 = Arrow(p4.get_top(), c4p.get_bottom(), color=FEATURE, stroke_width=5, buff=0.16, max_tip_length_to_length_ratio=0.08)
        arrow5 = Arrow(p5.get_top(), c5p.get_bottom(), color=FEATURE, stroke_width=5, buff=0.16, max_tip_length_to_length_ratio=0.08)

        all_objects = VGroup(title, subtitle, old_graph, base_label, p4, p5, patch_title, c4p, c5p, new_feature_tag, replay_note)
        assert_inside_frame(all_objects, margin=0.12)
        assert_no_overlap(p4, c4p, padding=0.1)
        assert_no_overlap(p5, c5p, padding=0.1)

        # 0-6s setup, 6-17s find base, 17-27s extract patches,
        # 27-39s replay on C3, 39-44s stable result.
        self.play(FadeIn(title, shift=0.12 * DOWN), FadeIn(subtitle, shift=0.1 * DOWN), run_time=0.9)
        self.play(Create(edges), FadeIn(VGroup(c0, c1, c2, c3, c4, c5), shift=0.08 * UP), run_time=2.2)
        self.play(FadeIn(main_tag, shift=0.08 * DOWN), FadeIn(feature_tag, shift=0.08 * UP), run_time=0.8)
        self.wait(2.1)

        self.play(FadeIn(base_label, shift=0.1 * UP), c2.animate.set_color(HEAD), run_time=1.0)
        self.wait(10.0)

        self.play(TransformFromCopy(c4, p4), FadeIn(patch_title, shift=0.08 * DOWN), run_time=1.4)
        self.play(TransformFromCopy(c5, p5), run_time=1.2)
        self.wait(7.4)

        self.play(GrowArrow(arrow4), TransformFromCopy(p4, c4p), Create(replay_edges[0]), run_time=1.8)
        self.play(GrowArrow(arrow5), TransformFromCopy(p5, c5p), Create(replay_edges[1]), FadeIn(new_feature_tag, shift=0.08 * DOWN), run_time=1.9)
        self.play(FadeIn(replay_note, shift=0.1 * UP), run_time=0.8)
        self.wait(7.5)

        self.play(FadeOut(VGroup(patch_title, base_label, p4, p5, arrow4, arrow5)), run_time=0.8)
        self.wait(4.2)


class RebaseIdentityScene(Scene):
    def construct(self):
        config.background_color = CANVAS
        self.camera.background_color = CANVAS

        title = label("same patch, new commit identity", size=34, color=TEXT, weight="BOLD").to_edge(UP, buff=0.44)
        subtitle = label("parent changes → hash changes", size=23, color=MUTED).next_to(title, DOWN, buff=0.09)

        old = commit_card("C4", "C2", "patch-A", "8f31a2", FEATURE).shift(2.65 * LEFT + 0.35 * UP)
        new = commit_card("C4'", "C3", "patch-A", "b7c91e", FEATURE).shift(2.65 * RIGHT + 0.35 * UP)
        old_label = tag("before", FEATURE, width=1.45).next_to(old, UP, buff=0.28)
        new_label = tag("after rebase", MAIN, width=2.05).next_to(new, UP, buff=0.28)
        arrow = Arrow(old.get_right(), new.get_left(), color=HEAD, stroke_width=6, buff=0.2, max_tip_length_to_length_ratio=0.08)

        parent_old = label("旧 parent: C2", size=24, color=FEATURE, weight="BOLD").shift(2.65 * LEFT + 2.05 * DOWN)
        parent_new = label("新 parent: C3", size=24, color=MAIN, weight="BOLD").shift(2.65 * RIGHT + 2.05 * DOWN)
        conclusion = label("内容可以等价，但身份已经不同", size=26, color=TEXT, weight="BOLD").to_edge(DOWN, buff=0.54)

        all_objects = VGroup(title, subtitle, old, new, old_label, new_label, arrow, parent_old, parent_new, conclusion)
        assert_inside_frame(all_objects, margin=0.12)
        assert_no_overlap(old, new, padding=0.18)

        # 0-6s setup, 6-16s parent comparison, 16-25s hash comparison, 25-30s conclusion.
        self.play(FadeIn(title, shift=0.12 * DOWN), FadeIn(subtitle, shift=0.1 * DOWN), run_time=0.9)
        self.play(FadeIn(old, shift=0.1 * RIGHT), FadeIn(old_label, shift=0.08 * DOWN), run_time=1.4)
        self.wait(3.7)

        self.play(GrowArrow(arrow), TransformFromCopy(old, new), FadeIn(new_label, shift=0.08 * DOWN), run_time=1.8)
        self.play(FadeIn(parent_old, shift=0.1 * UP), FadeIn(parent_new, shift=0.1 * UP), run_time=1.0)
        self.wait(7.2)

        hash_old = old[1][3]
        hash_new = new[1][3]
        self.play(hash_old.animate.set_color(HEAD), hash_new.animate.set_color(HEAD), run_time=0.8)
        self.wait(8.2)

        self.play(FadeIn(conclusion, shift=0.1 * UP), run_time=0.8)
        self.wait(4.25)
