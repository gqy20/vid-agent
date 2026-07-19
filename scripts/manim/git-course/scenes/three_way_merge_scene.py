from __future__ import annotations

import sys
from pathlib import Path

from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    Create,
    FadeIn,
    FadeOut,
    Scene,
    Transform,
    TransformFromCopy,
    VGroup,
    config,
)

sys.path.append(str(Path(__file__).resolve().parents[1]))

from shared.git_kit import (
    SnapshotField,
    commit_node,
    git_text,
    ref_pointer,
    semantic_line,
    snapshot_card,
    snapshot_flow_arrow,
    snapshot_rows,
)
from shared.palette import CANVAS
from shared.primitives import assert_inside_frame, assert_no_overlap


class ThreeWayMergeScene(Scene):
    def construct(self):
        config.background_color = CANVAS
        self.camera.background_color = CANVAS

        # DAG: the persistent source of truth at the top of the frame.
        c0 = commit_node("C0").move_to([-5.45, 2.55, 0])
        c1 = commit_node("C1").move_to([-4.05, 2.55, 0])
        c2 = commit_node("C2", role="merge_base").move_to([-2.65, 2.55, 0])
        c3 = commit_node("C3", role="main").move_to([-0.85, 2.68, 0])
        c4 = commit_node("C4", role="feature").move_to([-0.85, 2.05, 0])
        edges = VGroup(
            semantic_line(c0, c1),
            semantic_line(c1, c2),
            semantic_line(c2, c3),
            semantic_line(c2, c4),
        )
        main_pointer = ref_pointer("main", c3, role="main", placement=UP)
        feature_pointer = ref_pointer("feature", c4, role="feature", placement=DOWN, width=2.05)
        main_stem, main_tag = main_pointer
        feature_stem, feature_tag = feature_pointer
        dag = VGroup(edges, c0, c1, c2, c3, c4, main_pointer, feature_pointer)

        base_card = snapshot_card(
            "base",
            "C2 / 共同祖先",
            [SnapshotField("title", "A"), SnapshotField("body", "old")],
            role="merge_base",
        ).move_to([0, -0.72, 0])
        base_label = git_text("用于分离共同内容与双方变化", size=32, role="muted").next_to(
            base_card, DOWN, buff=0.2
        )
        base_marker = git_text("base  C2", size=32, weight="BOLD").next_to(c2, DOWN, buff=0.38)

        ours_card = snapshot_card(
            "ours",
            "C3 / main",
            [SnapshotField("title", "main", "main"), SnapshotField("body", "old")],
            role="main",
        ).move_to([-4.55, -0.72, 0])
        theirs_card = snapshot_card(
            "theirs",
            "C4 / feature",
            [SnapshotField("title", "A"), SnapshotField("body", "feature", "feature")],
            role="feature",
        ).move_to([4.55, -0.72, 0])
        ours_role = git_text("当前分支的变化", size=32, role="main").next_to(ours_card, DOWN, buff=0.2)
        theirs_role = git_text("待合入分支的变化", size=32, role="feature").next_to(
            theirs_card, DOWN, buff=0.2
        )

        result_card = snapshot_card(
            "result",
            "result tree",
            [SnapshotField("title", "main", "main"), SnapshotField("body", "feature", "feature")],
            role="result",
        ).move_to([0, -0.97, 0])
        result_shell = VGroup(result_card[0], result_card[1][0], result_card[1][1])
        result_rows = snapshot_rows(result_card)
        result_label = git_text("独立修改自动组合", size=32, weight="BOLD").next_to(
            result_card, DOWN, buff=0.2
        )

        ours_to_result = snapshot_flow_arrow(
            ours_card,
            0,
            result_card,
            0,
            role="main",
        )
        theirs_to_result = snapshot_flow_arrow(
            theirs_card,
            1,
            result_card,
            1,
            role="feature",
            direction=LEFT,
        )

        m1 = commit_node("M1").move_to([1.28, 2.55, 0])
        merge_edges = VGroup(
            semantic_line(c3, m1, role="main"),
            semantic_line(c4, m1, role="feature"),
        )
        main_pointer_at_m1 = ref_pointer("main", m1, role="main", placement=UP)
        main_stem_at_m1, main_at_m1 = main_pointer_at_m1
        parent_label = git_text("两个 parent", size=30, weight="BOLD").move_to([3.35, 2.55, 0])

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
        self.play(FadeIn(base_card, shift=0.12 * UP), run_time=1.8)
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
            TransformFromCopy(snapshot_rows(ours_card)[0], result_rows[0]),
            TransformFromCopy(snapshot_rows(theirs_card)[1], result_rows[1]),
            run_time=1.6,
        )
        self.play(FadeIn(result_label, shift=0.08 * UP), run_time=0.4)
        self.wait(6.0)

        # 33-40s: the result remains visible while a two-parent commit is created above it.
        self.play(
            FadeOut(
                VGroup(
                    ours_to_result,
                    theirs_to_result,
                    ours_role,
                    theirs_role,
                    ours_card,
                    theirs_card,
                )
            ),
            run_time=0.5,
        )
        # Establish the opaque node mask before drawing its parent edges.  A
        # simultaneous FadeIn would briefly reveal the lines through M1.
        self.play(FadeIn(m1, shift=0.08 * LEFT), run_time=0.35)
        self.play(Create(merge_edges), run_time=0.95)
        self.play(
            Transform(main_tag, main_at_m1),
            Transform(main_stem, main_stem_at_m1),
            FadeIn(parent_label, shift=0.08 * LEFT),
            run_time=1.2,
        )
        self.wait(4.0)
