from manim import (
    DOWN,
    LEFT,
    ORIGIN,
    RIGHT,
    UP,
    Arrow,
    Circle,
    Create,
    Dot,
    FadeIn,
    FadeOut,
    Line,
    MovingCameraScene,
    ReplacementTransform,
    RoundedRectangle,
    Text,
    VGroup,
    Write,
    config,
)

config.frame_width = 16
config.frame_height = 9
config.pixel_width = 1920
config.pixel_height = 1080
config.frame_rate = 30
config.background_color = "#F4F1EA"

BG = "#F4F1EA"
PANEL = "#FFFDF8"
INK = "#24211D"
MUTED = "#6F6A61"
LINE = "#C9C3B8"
SAGE = "#4E5F4F"
SAGE_SOFT = "#8F9B86"
CLAY = "#B87963"
GOLD = "#C6A15B"
RISK = "#8E718C"
MONO = "JetBrains Mono"
SANS = "Noto Sans CJK SC"
SERIF = "Noto Serif CJK SC"


def text(value, size=32, color=INK, font=SANS):
    return Text(value, font=font, font_size=size, color=color)


def card(value, color, width=2.05):
    box = RoundedRectangle(
        width=width,
        height=0.56,
        corner_radius=0.14,
        stroke_width=1.6,
        stroke_color=color,
        fill_color=PANEL,
        fill_opacity=0.92,
    )
    label = text(value, 23, color, SANS).move_to(box)
    return VGroup(box, label)


def polyline(points, color, width=6):
    lines = VGroup()
    for start, end in zip(points[:-1], points[1:]):
        lines.add(Line(start, end, color=color, stroke_width=width))
    return lines


class ActionPattern(MovingCameraScene):
    def construct(self):
        self.camera.background_color = BG

        title = text("系统看见的不是分数，而是行动模式。", 50, INK, SERIF).to_edge(UP, buff=0.48)
        subtitle = text("同一所学校，两条完全不同的路径", 26, MUTED).next_to(title, DOWN, buff=0.12)

        panel = RoundedRectangle(
            width=12.2,
            height=5.55,
            corner_radius=0.2,
            stroke_width=1.8,
            stroke_color=LINE,
            fill_color=PANEL,
            fill_opacity=0.96,
        ).move_to(ORIGIN + DOWN * 0.12)

        self.play(FadeIn(title, shift=DOWN * 0.18), FadeIn(subtitle, shift=DOWN * 0.18), FadeIn(panel), run_time=0.8)
        self.wait(0.2)

        left_label = text("第一次模拟 / safe path", 24, MUTED, MONO).move_to(LEFT * 3.9 + UP * 2.24)
        right_label = text("第二次模拟 / action path", 24, SAGE, MONO).move_to(RIGHT * 3.9 + UP * 2.24)
        baseline = Line(LEFT * 5.1 + DOWN * 2.0, RIGHT * 5.1 + DOWN * 2.0, color=LINE, stroke_width=2)
        self.play(FadeIn(left_label), Create(baseline), run_time=0.45)

        x0 = -5.0
        safe_stability = [LEFT * 5 + DOWN * 1.2, LEFT * 3.5 + DOWN * 0.82, LEFT * 2.2 + DOWN * 0.18, LEFT * 0.7 + UP * 0.45]
        safe_connection = [LEFT * 5 + UP * 0.55, LEFT * 3.5 + UP * 0.28, LEFT * 2.2 + DOWN * 0.54, LEFT * 0.7 + DOWN * 1.08]
        safe_radius = [LEFT * 5 + UP * 0.02, LEFT * 3.5 + DOWN * 0.28, LEFT * 2.2 + DOWN * 0.96, LEFT * 0.7 + DOWN * 1.34]
        safe_curves = VGroup(
            polyline(safe_stability, SAGE, 7),
            polyline(safe_connection, CLAY, 7),
            polyline(safe_radius, RISK, 7),
        )
        safe_dots = VGroup(*[Dot(points[-1], radius=0.08, color=color) for points, color in [(safe_stability, SAGE), (safe_connection, CLAY), (safe_radius, RISK)]])
        labels = VGroup(
            text("稳定性", 24, SAGE).next_to(safe_stability[0], LEFT, buff=0.18),
            text("连接感", 24, CLAY).next_to(safe_connection[0], LEFT, buff=0.18),
            text("行动半径", 24, RISK).next_to(safe_radius[0], LEFT, buff=0.18),
        )
        self.play(Create(safe_curves), FadeIn(safe_dots), FadeIn(labels), run_time=1.4)
        self.wait(0.4)

        warning = card("稳，但世界变窄", CLAY, width=2.85).move_to(LEFT * 2.55 + DOWN * 2.76)
        focus = RoundedRectangle(
            width=4.85,
            height=1.05,
            corner_radius=0.18,
            stroke_width=2.2,
            stroke_color=CLAY,
            fill_opacity=0,
        ).move_to(LEFT * 2.7 + DOWN * 1.15)
        self.play(FadeIn(warning, scale=0.96), Create(focus), run_time=0.8)
        self.wait(0.4)

        action_stability = [RIGHT * 0.25 + DOWN * 1.1, RIGHT * 1.65 + DOWN * 0.92, RIGHT * 3.15 + DOWN * 0.45, RIGHT * 5 + UP * 0.06]
        action_connection = [RIGHT * 0.25 + DOWN * 0.68, RIGHT * 1.65 + DOWN * 0.2, RIGHT * 3.15 + UP * 0.5, RIGHT * 5 + UP * 1.16]
        action_radius = [RIGHT * 0.25 + DOWN * 1.32, RIGHT * 1.65 + DOWN * 0.72, RIGHT * 3.15 + UP * 0.1, RIGHT * 5 + UP * 0.92]
        action_curves = VGroup(
            polyline(action_stability, SAGE, 7),
            polyline(action_connection, CLAY, 7),
            polyline(action_radius, RISK, 7),
        )
        action_dots = VGroup(*[Dot(points[-1], radius=0.08, color=color) for points, color in [(action_stability, SAGE), (action_connection, CLAY), (action_radius, RISK)]])
        action_labels = VGroup(
            text("稳定性", 24, SAGE).next_to(action_stability[-1], RIGHT, buff=0.2),
            text("连接感", 24, CLAY).next_to(action_connection[-1], RIGHT, buff=0.2),
            text("行动半径", 24, RISK).next_to(action_radius[-1], RIGHT, buff=0.2),
        )
        self.play(
            ReplacementTransform(safe_curves.copy(), action_curves),
            FadeOut(focus),
            FadeOut(warning),
            FadeIn(right_label),
            run_time=1.6,
        )
        self.play(FadeIn(action_dots), FadeIn(action_labels), run_time=0.15)
        self.wait(0.3)

        nodes = VGroup(
            card("打招呼", GOLD, 1.55),
            card("报名", GOLD, 1.32),
            card("求助", GOLD, 1.32),
            card("复盘", GOLD, 1.32),
        ).arrange(RIGHT, buff=0.26).move_to(DOWN * 2.78)
        arrows = VGroup()
        for left, right in zip(nodes[:-1], nodes[1:]):
            arrows.add(
                Arrow(
                    left.get_right() + RIGHT * 0.05,
                    right.get_left() + LEFT * 0.05,
                    buff=0,
                    stroke_width=2.2,
                    color=SAGE_SOFT,
                    max_tip_length_to_length_ratio=0.16,
                )
            )
        self.play(FadeIn(nodes[0], scale=0.96), run_time=0.3)
        for arrow, node in zip(arrows, nodes[1:]):
            self.play(Create(arrow), FadeIn(node, scale=0.96), run_time=0.3)
        self.wait(0.4)

        closing_box = RoundedRectangle(
            width=8.15,
            height=0.78,
            corner_radius=0.16,
            stroke_width=1.6,
            stroke_color=SAGE,
            fill_color="#EEF3EA",
            fill_opacity=0.98,
        ).to_edge(DOWN, buff=0.38)
        closing = text("第九个志愿：不是另一所学校，是别只做稳的人。", 28, INK).move_to(closing_box)
        self.play(FadeIn(closing_box, shift=UP * 0.16), Write(closing), run_time=1.0)
        self.wait(1.5)
