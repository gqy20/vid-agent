from manim import (
    BLACK,
    BLUE_C,
    Circle,
    Create,
    DOWN,
    FadeIn,
    FadeOut,
    GREEN_C,
    LEFT,
    Line,
    MoveToTarget,
    ORANGE,
    RIGHT,
    RoundedRectangle,
    Scene,
    Text,
    UP,
    VGroup,
    WHITE,
    YELLOW_C,
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

config.background_color = CANVAS_BASE


class BranchPointer(Scene):
    """EP04 Manim cutaway: a Git branch is a movable pointer."""

    def label(self, text, size=30, color=TEXT_PRIMARY):
        return Text(text, font_size=size, color=color, font="Noto Sans CJK SC")

    def commit(self, name, x):
        dot = Circle(radius=0.24, color=TEXT_PRIMARY, fill_color=CANVAS_BASE, fill_opacity=1, stroke_width=4)
        dot.move_to([x, 0, 0])
        label = self.label(name, size=26).move_to(dot.get_center())
        return VGroup(dot, label)

    def pointer(self, name, color, target, y=-1.25):
        box = RoundedRectangle(
            width=1.45,
            height=0.48,
            corner_radius=0.1,
            color=color,
            fill_color=color,
            fill_opacity=1,
            stroke_width=0,
        )
        box.next_to(target, DOWN, buff=abs(y) - 0.24)
        txt = self.label(name, size=25, color=WHITE).move_to(box.get_center())
        stem = Line(box.get_top(), target.get_bottom(), color=color, stroke_width=5)
        return VGroup(stem, box, txt)

    def construct(self):
        # Beat table:
        # 1 title 1.4s, 2 commit chain 1.9s, 3 main pointer 1.4s,
        # 4 feature pointer 1.8s, 5 feature moves 2.0s, 6 takeaway 2.0s.
        title = self.label("分支不是副本，是指针", size=58)
        subtitle = self.label("branch = 一个名字，指向某个 commit", size=31, color=TEXT_SECONDARY)
        title_group = VGroup(title, subtitle).arrange(DOWN, buff=0.18).to_edge(UP, buff=0.55)

        self.play(FadeIn(title_group, shift=UP * 0.15), run_time=0.8)
        self.wait(0.6)

        commits = VGroup(
            self.commit("C0", -3.6),
            self.commit("C1", -1.35),
            self.commit("C2", 0.9),
        )
        lines = VGroup(
            Line(commits[0].get_right(), commits[1].get_left(), color=STROKE_DEFAULT, stroke_width=6),
            Line(commits[1].get_right(), commits[2].get_left(), color=STROKE_DEFAULT, stroke_width=6),
        )
        graph = VGroup(lines, commits).move_to([0, 0.15, 0])

        self.play(Create(lines), run_time=0.7)
        self.play(FadeIn(commits, lag_ratio=0.12), run_time=0.8)
        self.wait(0.4)

        main = self.pointer("main", GIT_MAIN, commits[2][0], y=-1.3)
        main_note = self.label("main 指向当前最新提交", size=28, color=GIT_MAIN).next_to(main, DOWN, buff=0.32)
        self.play(FadeIn(main, shift=UP * 0.15), FadeIn(main_note), run_time=0.9)
        self.wait(0.5)

        feature = self.pointer("feature", GIT_FEATURE, commits[2][0], y=1.35)
        feature[0].put_start_and_end_on(feature[1].get_bottom(), commits[2][0].get_top())
        feature[1].next_to(commits[2][0], UP, buff=1.12)
        feature[2].move_to(feature[1].get_center())
        feature_note = self.label("git branch feature：只新增一个指针", size=28, color=GIT_FEATURE)
        feature_note.move_to([-3.25, 1.45, 0])
        self.play(FadeIn(feature, shift=DOWN * 0.15), FadeIn(feature_note), run_time=1.1)
        self.wait(0.7)

        c3 = self.commit("C3", 3.15)
        new_line = Line(commits[2].get_right(), c3.get_left(), color=STROKE_DEFAULT, stroke_width=6)
        action = self.label("在 feature 上提交一次", size=30, color=TEXT_PRIMARY).to_edge(DOWN, buff=0.75)
        self.play(FadeIn(action), Create(new_line), FadeIn(c3), run_time=0.9)

        feature.generate_target()
        feature.target[1].next_to(c3[0], UP, buff=1.12)
        feature.target[2].move_to(feature.target[1].get_center())
        feature.target[0].put_start_and_end_on(feature.target[1].get_bottom(), c3[0].get_top())
        self.play(
            MoveToTarget(feature),
            c3[0].animate.set_stroke(color=GIT_HEAD, width=6),
            rate_func=rate_functions.ease_in_out_cubic,
            run_time=1.1,
        )
        self.wait(0.3)

        main_stays = self.label("main 没有复制，也没有前进", size=29, color=GIT_MAIN)
        main_stays.next_to(main, DOWN, buff=0.32)
        self.play(FadeOut(main_note), FadeIn(main_stays), run_time=0.5)
        self.wait(0.9)

        takeaway_box = RoundedRectangle(
            width=8.0,
            height=0.88,
            corner_radius=0.16,
            color=BLACK,
            fill_color=BLACK,
            fill_opacity=0.88,
            stroke_width=0,
        )
        takeaway = self.label("创建分支很快，因为它只是写下一个名字。", size=32, color=WHITE)
        takeaway.move_to(takeaway_box.get_center())
        close = VGroup(takeaway_box, takeaway).to_edge(DOWN, buff=0.55)
        self.play(FadeOut(action), FadeIn(close, shift=UP * 0.15), run_time=0.7)
        self.wait(1.3)
