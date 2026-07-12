from manim import (
    Arrow,
    Circle,
    Create,
    DOWN,
    FadeIn,
    FadeOut,
    LEFT,
    Line,
    MoveToTarget,
    ReplacementTransform,
    RIGHT,
    RoundedRectangle,
    Scene,
    Text,
    TransformFromCopy,
    UP,
    VGroup,
    WHITE,
    config,
    rate_functions,
)

config.pixel_width = 1920
config.pixel_height = 1080
config.frame_rate = 30

CANVAS_BASE = "#f4f0e8"
TEXT_PRIMARY = "#1f2523"
TEXT_SECONDARY = "#6f766f"
STROKE_DEFAULT = "#c8c1b4"
GIT_MAIN = "#2f6f73"
GIT_FEATURE = "#b4664d"
GIT_HEAD = "#d8a63f"
GIT_CONFLICT = "#c0574a"
FONT_CJK = "Noto Sans CJK SC"
FONT_LATIN = "Inter"
FONT_MONO = "Source Code Pro"

config.background_color = CANVAS_BASE


def label(text: str, size: int = 30, color: str = TEXT_PRIMARY, weight: str = "MEDIUM", font: str | None = None) -> Text:
    resolved_font = font or (FONT_CJK if any("\u4e00" <= char <= "\u9fff" for char in text) else FONT_LATIN)
    return Text(text, font_size=size, color=color, weight=weight, font=resolved_font)


def object_box(kind: str, detail: str, color: str, width: float = 2.7, height: float = 1.2) -> VGroup:
    box = RoundedRectangle(
        width=width,
        height=height,
        corner_radius=0.14,
        color=color,
        fill_color=CANVAS_BASE,
        fill_opacity=1,
        stroke_width=4,
    )
    title = label(kind, size=31, color=color, weight="BOLD")
    detail_font = FONT_CJK if any("\u4e00" <= char <= "\u9fff" for char in detail) else FONT_MONO
    subtitle = label(detail, size=24, color=TEXT_SECONDARY, font=detail_font)
    body = VGroup(title, subtitle).arrange(DOWN, buff=0.08).move_to(box.get_center())
    return VGroup(box, body)


def small_field(
    key: str,
    value: str,
    color: str = TEXT_SECONDARY,
    width: float = 3.7,
    key_size: int = 22,
    value_size: int = 22,
) -> VGroup:
    box = RoundedRectangle(
        width=width,
        height=0.46,
        corner_radius=0.08,
        color=STROKE_DEFAULT,
        fill_color=WHITE,
        fill_opacity=0.5,
        stroke_width=1.5,
    )
    k = label(key, size=key_size, color=color, weight="BOLD", font=FONT_MONO).move_to(box.get_left() + RIGHT * 0.52)
    v = label(value, size=value_size, color=TEXT_PRIMARY, font=FONT_MONO).move_to(box.get_right() + LEFT * 0.95)
    return VGroup(box, k, v)


def commit_node(name: str, color: str = TEXT_PRIMARY, radius: float = 0.44) -> VGroup:
    circle = Circle(radius=radius, color=color, fill_color=CANVAS_BASE, fill_opacity=1, stroke_width=6)
    txt = label(name, size=30, color=TEXT_PRIMARY, weight="BOLD", font=FONT_MONO).move_to(circle.get_center())
    return VGroup(circle, txt)


def ref_arrow(start, end, color: str = GIT_MAIN, width: int = 6) -> Arrow:
    return Arrow(
        start,
        end,
        color=color,
        stroke_width=width,
        buff=0.18,
        max_tip_length_to_length_ratio=0.08,
    )


class Ep03ObjectModel(Scene):
    """Commit references tree; tree references blobs."""

    def construct(self):
        # Beat table, target 36.0s:
        # 1 snapshot chips 3.0s, 2 blobs 5.0s, 3 tree entries 7.0s,
        # 4 commit shell 5.0s, 5 arrows/reference scan 8.0s, 6 final hold 8.0s.
        header = label("commit  →  tree  →  blob", size=42, color=TEXT_PRIMARY, weight="BOLD")
        header.to_edge(UP, buff=0.42)

        chip_a = small_field("file", "app.js", color=GIT_FEATURE, width=2.8)
        chip_b = small_field("file", "search.js", color=GIT_FEATURE, width=3.2)
        chips = VGroup(chip_a, chip_b).arrange(DOWN, buff=0.18).move_to([-4.7, 1.35, 0])
        snapshot = label("Index 里的快照", size=23, color=TEXT_SECONDARY).next_to(chips, UP, buff=0.22)

        blob_a = object_box("blob", "app.js 内容", GIT_FEATURE, width=3.15, height=1.38).move_to([-4.45, 0.5, 0])
        blob_b = object_box("blob", "search.js 内容", GIT_FEATURE, width=3.15, height=1.38).move_to([-4.45, -1.25, 0])
        blobs = VGroup(blob_a, blob_b)

        tree_box = RoundedRectangle(
            width=3.95,
            height=2.18,
            corner_radius=0.14,
            color=GIT_HEAD,
            fill_color=CANVAS_BASE,
            fill_opacity=1,
            stroke_width=5,
        ).move_to([0.0, -0.35, 0])
        tree_title = label("tree", size=43, color=GIT_HEAD, weight="BOLD").move_to(tree_box.get_center() + UP * 0.7)
        tree_subtitle = label("目录结构", size=24, color=TEXT_SECONDARY).move_to(tree_box.get_center() + UP * 0.28)
        tree = VGroup(tree_box, tree_title, tree_subtitle)
        entry_a = small_field("app.js", "blob a1f3", color=GIT_HEAD, width=3.55, key_size=20, value_size=20).move_to(
            tree_box.get_center() + DOWN * 0.28
        )
        entry_b = small_field("search.js", "blob 9c2e", color=GIT_HEAD, width=3.55, key_size=20, value_size=20).move_to(
            tree_box.get_center() + DOWN * 0.86
        )

        commit_box = RoundedRectangle(
            width=3.7,
            height=2.05,
            corner_radius=0.14,
            color=GIT_MAIN,
            fill_color=CANVAS_BASE,
            fill_opacity=1,
            stroke_width=5,
        ).move_to([4.65, -0.35, 0])
        commit_title = label("commit", size=43, color=GIT_MAIN, weight="BOLD").move_to(commit_box.get_center() + UP * 0.68)
        commit_subtitle = label("历史记录", size=24, color=TEXT_SECONDARY).move_to(commit_box.get_center() + UP * 0.28)
        commit = VGroup(commit_box, commit_title, commit_subtitle)
        commit_tree = small_field("tree", "7b4d2e1", color=GIT_MAIN, width=3.2).move_to(commit_box.get_center() + DOWN * 0.28)
        commit_parent = small_field("parent", "C1", color=GIT_FEATURE, width=3.2).move_to(commit_box.get_center() + DOWN * 0.86)

        arrow_tree_a = ref_arrow(entry_a.get_left(), blob_a.get_right(), color=STROKE_DEFAULT, width=7)
        arrow_tree_b = ref_arrow(entry_b.get_left(), blob_b.get_right(), color=STROKE_DEFAULT, width=7)
        arrow_commit_tree = ref_arrow(commit_tree.get_left(), tree.get_right(), color=GIT_MAIN, width=10)

        self.play(FadeIn(header, shift=UP * 0.12), run_time=0.8)
        self.play(FadeIn(snapshot), FadeIn(chips, lag_ratio=0.15), run_time=1.2)
        self.wait(1.0)

        self.play(FadeOut(snapshot), FadeOut(chips), run_time=0.45)
        self.play(
            FadeIn(blob_a, shift=DOWN * 0.18, scale=0.9),
            FadeIn(blob_b, shift=DOWN * 0.18, scale=0.9),
            run_time=1.8,
        )
        self.wait(2.35)

        self.play(FadeIn(tree, shift=LEFT * 0.15), run_time=1.1)
        self.play(FadeIn(entry_a), FadeIn(entry_b), run_time=1.0)
        self.play(Create(arrow_tree_a), Create(arrow_tree_b), run_time=1.4)
        self.play(tree_box.animate.set_stroke(color=GIT_HEAD, width=8), run_time=0.8)
        self.play(tree_box.animate.set_stroke(color=GIT_HEAD, width=5), run_time=0.4)
        self.wait(2.3)

        self.play(FadeIn(commit, shift=LEFT * 0.18), run_time=1.2)
        self.play(FadeIn(commit_tree), FadeIn(commit_parent), run_time=1.2)
        self.wait(2.6)

        self.play(Create(arrow_commit_tree), run_time=1.2)
        self.play(commit_box.animate.set_stroke(color=GIT_MAIN, width=8), run_time=0.35)
        self.play(
            commit_box.animate.set_stroke(color=GIT_MAIN, width=7),
            tree_box.animate.set_stroke(color=GIT_HEAD, width=7),
            blob_a[0].animate.set_stroke(color=GIT_FEATURE, width=6),
            blob_b[0].animate.set_stroke(color=GIT_FEATURE, width=6),
            run_time=1.05,
        )
        self.play(commit_box.animate.set_stroke(color=GIT_MAIN, width=5), run_time=0.4)
        self.wait(2.2)
        self.play(commit_box.animate.set_stroke(color=GIT_MAIN, width=9), run_time=0.8)
        self.play(tree_box.animate.set_stroke(color=GIT_HEAD, width=9), run_time=0.8)
        self.play(
            blob_a[0].animate.set_stroke(color=GIT_FEATURE, width=8),
            blob_b[0].animate.set_stroke(color=GIT_FEATURE, width=8),
            run_time=0.8,
        )
        self.play(arrow_commit_tree.animate.set_stroke(width=14, opacity=1), run_time=1.0)
        self.wait(1.0)
        self.play(
            arrow_tree_a.animate.set_stroke(width=11, opacity=1),
            arrow_tree_b.animate.set_stroke(width=11, opacity=1),
            run_time=1.0,
        )
        self.wait(1.0)
        self.play(
            arrow_commit_tree.animate.set_stroke(width=10, opacity=1),
            arrow_tree_a.animate.set_stroke(width=7, opacity=1),
            arrow_tree_b.animate.set_stroke(width=7, opacity=1),
            run_time=1.0,
        )
        self.wait(3.8)


class Ep03ParentChain(Scene):
    """A commit stores a parent pointer back to history."""

    def construct(self):
        # Beat table, target 28.0s:
        # 1 title 2.0s, 2 C0/C1/C2 appear 5.0s, 3 parent pointers 7.0s,
        # 4 inspect C2 metadata 6.0s, 5 final hold 8.0s.
        title = label("parent  →  过去", size=48, color=TEXT_PRIMARY, weight="BOLD").to_edge(UP, buff=0.5)
        c0 = commit_node("C0", color=TEXT_SECONDARY, radius=0.68).move_to([-4.7, -0.1, 0])
        c1 = commit_node("C1", color=TEXT_SECONDARY, radius=0.68).move_to([0.0, -0.1, 0])
        c2 = commit_node("C2", color=TEXT_PRIMARY, radius=0.68).move_to([4.7, -0.1, 0])

        history_rail = Line(c0.get_center(), c2.get_center(), color=STROKE_DEFAULT, stroke_width=12, stroke_opacity=0.18)
        a21 = ref_arrow(c2.get_left(), c1.get_right(), color=GIT_FEATURE, width=11)
        a10 = ref_arrow(c1.get_left(), c0.get_right(), color=GIT_FEATURE, width=11)
        parent_21 = label("parent", size=34, color=GIT_FEATURE, weight="BOLD").next_to(a21, UP, buff=0.22)
        parent_10 = label("parent", size=34, color=GIT_FEATURE, weight="BOLD").next_to(a10, UP, buff=0.22)

        meta = VGroup(
            small_field("tree", "7b4d2e1", color=GIT_MAIN, width=3.65),
            small_field("parent", "C1", color=GIT_FEATURE, width=3.65),
            small_field("message", "add search", color=GIT_HEAD, width=3.65),
        ).arrange(DOWN, buff=0.12)
        meta_box = RoundedRectangle(
            width=4.35,
            height=2.2,
            corner_radius=0.14,
            color=STROKE_DEFAULT,
            fill_color=WHITE,
            fill_opacity=0.38,
            stroke_width=2,
        ).move_to([4.25, -2.35, 0])
        meta.move_to(meta_box.get_center())
        meta_group = VGroup(meta_box, meta)

        self.play(FadeIn(title, shift=UP * 0.12), run_time=0.8)
        self.wait(1.2)
        self.play(FadeIn(history_rail), FadeIn(c0, scale=0.9), run_time=0.9)
        self.play(FadeIn(c1, scale=0.9), run_time=0.9)
        self.play(FadeIn(c2, scale=0.9), run_time=0.9)
        self.wait(2.3)

        self.play(Create(a21), FadeIn(parent_21), run_time=1.3)
        self.play(Create(a10), FadeIn(parent_10), run_time=1.3)
        self.play(c2[0].animate.set_stroke(color=GIT_MAIN, width=8), run_time=0.8)
        self.play(c2[0].animate.set_stroke(color=TEXT_PRIMARY, width=6), run_time=0.4)
        self.wait(3.2)

        self.play(FadeIn(meta_group, shift=UP * 0.18), run_time=1.2)
        self.play(meta[1][0].animate.set_fill(GIT_FEATURE, opacity=0.14), run_time=0.8)
        self.play(
            c1[0].animate.set_stroke(color=GIT_FEATURE, width=7),
            rate_func=rate_functions.ease_in_out_cubic,
            run_time=0.8,
        )
        self.play(c1[0].animate.set_stroke(color=GIT_FEATURE, width=9), run_time=0.35)
        self.play(c1[0].animate.set_stroke(color=GIT_FEATURE, width=7), run_time=0.35)
        self.wait(2.5)

        self.play(c2[0].animate.set_stroke(color=GIT_MAIN, width=9), run_time=0.35)
        self.play(c2[0].animate.set_stroke(color=TEXT_PRIMARY, width=6), c1[0].animate.set_stroke(color=GIT_FEATURE, width=9), run_time=0.55)
        self.play(c1[0].animate.set_stroke(color=GIT_FEATURE, width=7), c0[0].animate.set_stroke(color=TEXT_SECONDARY, width=9), run_time=0.55)
        self.play(c0[0].animate.set_stroke(color=TEXT_SECONDARY, width=6), run_time=0.35)
        self.play(a21.animate.set_stroke(width=15, opacity=1), run_time=1.0)
        self.wait(1.0)
        self.play(a21.animate.set_stroke(width=11, opacity=1), a10.animate.set_stroke(width=15, opacity=1), run_time=1.0)
        self.wait(1.0)
        self.play(a10.animate.set_stroke(width=11, opacity=1), run_time=1.0)
        self.wait(1.2)


class Ep03HashIdentity(Scene):
    """Any commit-field change creates a different identity."""

    def construct(self):
        # Beat table, target 26.0s:
        # 1 fields enter 4.0s, 2 hash machine 4.0s, 3 output A 4.0s,
        # 4 mutate message 5.0s, 5 output B differs 4.0s, 6 final hold 5.0s.
        title = label("字段变化  →  新 hash", size=48, color=TEXT_PRIMARY, weight="BOLD")
        title.to_edge(UP, buff=0.5)

        fields = VGroup(
            small_field("tree", "7b4d2e1", color=GIT_MAIN, width=4.2, key_size=22, value_size=22),
            small_field("parent", "C1", color=GIT_FEATURE, width=4.2, key_size=22, value_size=22),
            small_field("author", "Lin", color=TEXT_SECONDARY, width=4.2, key_size=22, value_size=22),
            small_field("time", "10:20", color=TEXT_SECONDARY, width=4.2, key_size=22, value_size=22),
            small_field("message", "add search", color=GIT_HEAD, width=4.2, key_size=22, value_size=22),
        ).arrange(DOWN, buff=0.17).move_to([-4.45, -0.15, 0])

        machine = RoundedRectangle(
            width=2.85,
            height=1.85,
            corner_radius=0.18,
            color=GIT_MAIN,
            fill_color=CANVAS_BASE,
            fill_opacity=1,
            stroke_width=5,
        ).move_to([0.1, -0.15, 0])
        machine_text = label("hash", size=42, color=GIT_MAIN, weight="BOLD").move_to(machine.get_center())
        machine_group = VGroup(machine, machine_text)

        output_a = object_box("commit A", "9f31a2e", GIT_MAIN, width=3.35, height=1.45).move_to([4.65, 0.9, 0])
        output_b = object_box("commit B", "42c8d19", GIT_CONFLICT, width=3.35, height=1.45).move_to([4.65, -1.55, 0])

        into_hash = ref_arrow(fields.get_right(), machine.get_left(), color=STROKE_DEFAULT, width=7)
        out_hash_a = ref_arrow(machine.get_right(), output_a.get_left(), color=GIT_MAIN, width=10)
        out_hash_b = ref_arrow(machine.get_right(), output_b.get_left(), color=GIT_CONFLICT, width=10)

        changed_message = small_field("message", "add Search", color=GIT_CONFLICT, width=4.2, key_size=22, value_size=22)
        changed_message.move_to(fields[-1].get_center())
        diff_note = label("只改一个字符", size=32, color=GIT_CONFLICT, weight="BOLD")
        diff_note.next_to(fields, DOWN, buff=0.32)

        self.play(FadeIn(title, shift=UP * 0.12), run_time=0.8)
        self.play(FadeIn(fields, lag_ratio=0.08), run_time=1.6)
        self.wait(1.6)

        self.play(FadeIn(machine_group, scale=0.92), Create(into_hash), run_time=1.4)
        self.play(machine.animate.set_stroke(color=GIT_HEAD, width=8), run_time=0.8)
        self.play(machine.animate.set_stroke(color=GIT_MAIN, width=5), run_time=0.35)
        self.wait(1.45)

        self.play(Create(out_hash_a), FadeIn(output_a, shift=LEFT * 0.12), run_time=1.2)
        self.wait(2.8)

        self.play(ReplacementTransform(fields[-1], changed_message), FadeIn(diff_note), run_time=1.1)
        self.play(machine.animate.set_stroke(color=GIT_CONFLICT, width=8), run_time=0.8)
        self.wait(3.1)

        self.play(Create(out_hash_b), FadeIn(output_b, shift=LEFT * 0.12), run_time=1.2)
        self.play(output_b[0].animate.set_stroke(color=GIT_CONFLICT, width=7), run_time=0.8)
        self.wait(2.0)

        self.play(
            output_a[0].animate.set_stroke(color=GIT_MAIN, width=7),
            output_b[0].animate.set_stroke(color=GIT_CONFLICT, width=7),
            run_time=1.0,
        )
        self.wait(4.0)
