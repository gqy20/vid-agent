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
    ReplacementTransform,
    Scene,
    TransformFromCopy,
    VGroup,
    config,
)

sys.path.append(str(Path(__file__).resolve().parents[1]))

from shared.git_kit import (
    SnapshotField,
    causal_arrow,
    commit_node,
    field_change_chip,
    field_to_snapshot_arrow,
    git_text,
    head_badge,
    ref_pointer,
    semantic_line,
    snapshot_card,
    snapshot_rows,
)
from shared.palette import CANVAS
from shared.primitives import assert_inside_frame, assert_no_overlap


class GitKitReferenceScene(Scene):
    def construct(self):
        config.background_color = CANVAS
        self.camera.background_color = CANVAS

        # Scene 1 — refs and identities. No course title: Remotion owns the shell.
        c0 = commit_node("C0").move_to([-4.9, 0, 0])
        c1 = commit_node("C1").move_to([-3.4, 0, 0])
        c2 = commit_node("C2", role="merge_base").move_to([-1.9, 0, 0])
        c3 = commit_node("C3", role="main").move_to([0.45, 0.55, 0])
        c4 = commit_node("C4", role="feature").move_to([0.45, -0.55, 0])
        history_edges = VGroup(
            semantic_line(c0, c1),
            semantic_line(c1, c2),
            semantic_line(c2, c3),
            semantic_line(c2, c4),
        )
        main_pointer = ref_pointer("main", c3, role="main", placement=UP)
        feature_pointer = ref_pointer("feature", c4, role="feature", placement=DOWN, width=2.05)
        head = head_badge().next_to(main_pointer[1], RIGHT, buff=0.18)
        base_note = git_text("merge base", size=28, role="muted", font_role="latin").next_to(
            c2, DOWN, buff=0.36
        )
        refs_graph = VGroup(
            history_edges,
            c0,
            c1,
            c2,
            c3,
            c4,
            main_pointer,
            feature_pointer,
            head,
            base_note,
        ).scale(1.2).move_to([0, 0, 0])

        # Scene 2 — the base snapshot separates into two branch snapshots.
        base_card = snapshot_card(
            "base",
            "C2 / 共同祖先",
            [SnapshotField("title", "A"), SnapshotField("body", "old")],
            role="merge_base",
            width=4.6,
            height=2.6,
        ).move_to([0, 0.2, 0])
        ours_card = snapshot_card(
            "ours",
            "C3 / main",
            [SnapshotField("title", "main", "main"), SnapshotField("body", "old")],
            role="main",
        ).move_to([-2.4, 0.2, 0])
        theirs_card = snapshot_card(
            "theirs",
            "C4 / feature",
            [SnapshotField("title", "A"), SnapshotField("body", "feature", "feature")],
            role="feature",
        ).move_to([2.4, 0.2, 0])
        ours_rows = snapshot_rows(ours_card)
        theirs_rows = snapshot_rows(theirs_card)
        branch_snapshots = VGroup(ours_card, theirs_card)

        # Scene 3 — changed fields flow into one result, then sources fully leave.
        result_card = snapshot_card(
            "result",
            "result tree",
            [SnapshotField("title", "main", "main"), SnapshotField("body", "feature", "feature")],
            role="result",
            width=4.1,
            height=2.6,
        ).move_to([0, -0.65, 0])
        result_shell = VGroup(result_card[0], result_card[1][0], result_card[1][1])
        result_rows = snapshot_rows(result_card)
        ours_change = field_change_chip(
            SnapshotField("title", "main", "main"),
            role="main",
        ).move_to([-4.7, result_rows[0].get_center()[1], 0])
        theirs_change = field_change_chip(
            SnapshotField("body", "feature", "feature"),
            role="feature",
            width=3.2,
        ).move_to([4.7, result_rows[1].get_center()[1], 0])
        ours_arrow = field_to_snapshot_arrow(
            ours_change,
            result_card,
            0,
            role="main",
        )
        theirs_arrow = field_to_snapshot_arrow(
            theirs_change,
            result_card,
            1,
            role="feature",
            direction=LEFT,
        )

        # The final frame contains two parallel answers, not a vertical flow:
        # parents on the left, the resulting tree on the right.
        result_final_center = [3.25, 0, 0]
        final_result_card = result_card.copy().move_to(result_final_center)
        merge_c3 = commit_node("C3", role="main").move_to([-4.15, 0.72, 0])
        merge_c4 = commit_node("C4", role="feature").move_to([-4.15, -0.72, 0])
        merge_m1 = commit_node("M1").move_to([-1.85, 0, 0])
        merge_edges = VGroup(
            semantic_line(merge_c3, merge_m1, role="main"),
            semantic_line(merge_c4, merge_m1, role="feature"),
        )
        result_pointer = ref_pointer("main", merge_m1, role="main", placement=UP)
        result_head = head_badge().next_to(result_pointer[1], UP, buff=0.12)
        result_graph = VGroup(
            merge_edges,
            merge_c3,
            merge_c4,
            merge_m1,
            result_pointer,
            result_head,
        )
        tree_arrow = causal_arrow(
            merge_m1,
            final_result_card,
            role="muted",
            width=6,
            buff=0.14,
        )
        tree_label = git_text(
            "tree",
            size=28,
            role="muted",
            font_role="mono",
        ).next_to(tree_arrow, DOWN, buff=0.08)

        assert_inside_frame(refs_graph, margin=0.18)
        assert_inside_frame(VGroup(base_card, branch_snapshots), margin=0.18)
        assert_inside_frame(
            VGroup(ours_change, theirs_change, result_card),
            margin=0.18,
        )
        assert_inside_frame(
            VGroup(result_graph, final_result_card, tree_arrow, tree_label),
            margin=0.18,
        )
        assert_no_overlap(ours_card, theirs_card, padding=0.24)
        assert_no_overlap(ours_change, result_card, padding=0.18)
        assert_no_overlap(result_card, theirs_change, padding=0.18)
        assert_no_overlap(result_graph, final_result_card, padding=0.24)

        # Beat table: 5 + 5 + 6 = 16 seconds.
        # 0-5s: C2 stays visually continuous as it unfolds into the base tree.
        self.play(
            Create(history_edges),
            FadeIn(VGroup(c0, c1, c2, c3, c4), shift=0.08 * UP),
            run_time=1.4,
        )
        self.play(FadeIn(VGroup(main_pointer, feature_pointer, head, base_note)), run_time=0.7)
        self.wait(1.7)
        self.play(
            TransformFromCopy(c2, base_card[0]),
            FadeIn(base_card[1], shift=0.06 * UP),
            FadeOut(refs_graph),
            run_time=1.2,
        )

        # 5-10s: one base separates into two snapshots; changed rows persist.
        self.wait(0.8)
        base_copy_box = base_card[0].copy()
        self.add(base_copy_box)
        self.play(
            ReplacementTransform(base_card[0], ours_card[0]),
            ReplacementTransform(base_copy_box, theirs_card[0]),
            FadeOut(base_card[1]),
            run_time=0.8,
        )
        self.play(
            FadeIn(ours_card[1]),
            FadeIn(theirs_card[1]),
            run_time=0.4,
        )
        self.wait(2.2)
        self.play(
            TransformFromCopy(ours_rows[0], ours_change[1]),
            TransformFromCopy(theirs_rows[1], theirs_change[1]),
            FadeIn(VGroup(ours_change[0], theirs_change[0])),
            FadeOut(branch_snapshots),
            run_time=0.8,
        )
        self.add(ours_change[1], theirs_change[1])

        # 10-16s: changed fields form the tree, then the tree is attached to M1.
        self.play(FadeIn(result_shell, shift=0.06 * UP), run_time=0.5)
        self.play(Create(ours_arrow), Create(theirs_arrow), run_time=0.6)
        self.play(
            ReplacementTransform(ours_change[1], result_rows[0]),
            ReplacementTransform(theirs_change[1], result_rows[1]),
            run_time=0.9,
        )
        self.add(result_rows[0], result_rows[1])
        self.wait(0.7)
        self.play(
            FadeOut(VGroup(ours_arrow, theirs_arrow, ours_change[0], theirs_change[0])),
            run_time=0.5,
        )
        self.play(result_card.animate.move_to(result_final_center), run_time=0.5)
        # Nodes become opaque masks first; connectors then grow underneath.
        # The two plays retain the original 0.8-second beat budget.
        self.play(
            FadeIn(VGroup(merge_c3, merge_c4, merge_m1), shift=0.06 * UP),
            run_time=0.3,
        )
        self.play(
            Create(merge_edges),
            FadeIn(VGroup(result_pointer, result_head)),
            run_time=0.5,
        )
        self.play(Create(tree_arrow), FadeIn(tree_label), run_time=0.5)
        self.wait(1.0)
