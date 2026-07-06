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
config.background_color = "#14100d"

BG = "#14100d"
PAPER = "#fbfaf6"
INK = "#2c2924"
DIM = "#bcb2a3"
CLAY = "#c98b70"
SAGE = "#9aa78f"
BRASS = "#b99a5f"
OXIDE = "#a86659"
PANEL = "#1f1a15"
SANS = "Noto Sans CJK SC"
MONO = "JetBrains Mono"


def txt(value, size=34, color=PAPER, font=SANS):
    return Text(value, font=font, font_size=size, color=color)


def pill(value, color, width=2.4):
    box = RoundedRectangle(
        width=width,
        height=0.62,
        corner_radius=0.14,
        stroke_width=1.5,
        stroke_color=color,
        fill_color=PANEL,
        fill_opacity=0.88,
    )
    label = txt(value, 25, PAPER).move_to(box.get_center())
    return VGroup(box, label)


class DirectionToAction(MovingCameraScene):
    def construct(self):
        self.camera.background_color = BG

        title = txt("方向图不是故事", 58, PAPER).to_edge(UP, buff=0.62)
        subtitle = txt("角色真正需要的是：停顿、视线、回应", 28, DIM).next_to(title, DOWN, buff=0.16)
        self.play(FadeIn(title, shift=DOWN * 0.18), FadeIn(subtitle, shift=DOWN * 0.18), run_time=0.7)
        self.wait(0.25)

        center = ORIGIN + LEFT * 3.95 + DOWN * 0.12
        ring = Circle(radius=1.45, stroke_color=BRASS, stroke_width=2.2).move_to(center)
        dots = VGroup()
        labels = VGroup()
        directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
        for index, direction in enumerate(directions):
            angle = index * 45
            point = ring.point_at_angle(angle * 3.1415926535 / 180)
            dot = Dot(point, radius=0.065, color=BRASS)
            label = txt(direction, 18, DIM, MONO).move_to(point * 1.08 + center * -0.08)
            dots.add(dot)
            labels.add(label)

        spinner = Arrow(center + LEFT * 0.95, center + RIGHT * 0.95, buff=0, color=CLAY, stroke_width=5)
        left_caption = txt("八个方向", 30, BRASS).next_to(ring, DOWN, buff=0.34)
        self.play(Create(ring), FadeIn(dots), FadeIn(labels), FadeIn(left_caption), run_time=1.1)
        self.play(Create(spinner), run_time=0.35)
        self.play(spinner.animate.rotate(1.5708 * 3, about_point=center), run_time=1.15)
        self.wait(0.2)

        actions = VGroup(
            pill("停顿", CLAY),
            pill("视线", SAGE),
            pill("回应", BRASS),
        ).arrange(DOWN, buff=0.34).move_to(ORIGIN + RIGHT * 0.1 + DOWN * 0.08)
        action_title = txt("压缩成动作", 30, SAGE).next_to(actions, DOWN, buff=0.34)
        arrows_to_actions = VGroup()
        for index, action in enumerate(actions):
            arrows_to_actions.add(
                Arrow(
                    center + RIGHT * 1.65 + UP * (0.62 - index * 0.62),
                    action.get_left() + LEFT * 0.18,
                    buff=0,
                    stroke_width=2.2,
                    color=[CLAY, SAGE, BRASS][index],
                    max_tip_length_to_length_ratio=0.08,
                )
            )
        self.play(
            FadeOut(spinner),
            ring.animate.set_stroke(color="#5f5547", opacity=0.42),
            dots.animate.set_opacity(0.34),
            labels.animate.set_opacity(0.24),
            run_time=0.45,
        )
        self.play(Create(arrows_to_actions), FadeIn(actions, scale=0.96), FadeIn(action_title), run_time=1.25)
        self.wait(0.25)

        path_nodes = VGroup(
            pill("递出", CLAY, 1.45),
            pill("停住", CLAY, 1.45),
            pill("倾听", SAGE, 1.45),
            pill("回头", BRASS, 1.45),
        ).arrange(RIGHT, buff=0.16).move_to(ORIGIN + RIGHT * 4.85 + DOWN * 0.08)
        path_title = txt("连成选择", 30, BRASS).next_to(path_nodes, DOWN, buff=0.34)
        connectors = VGroup()
        for left, right in zip(path_nodes[:-1], path_nodes[1:]):
            connectors.add(
                Arrow(
                    left.get_right() + RIGHT * 0.04,
                    right.get_left() + LEFT * 0.04,
                    buff=0,
                    stroke_width=2.3,
                    color=SAGE,
                    max_tip_length_to_length_ratio=0.16,
                )
            )
        bridge = Arrow(actions.get_right() + RIGHT * 0.12, path_nodes.get_left() + RIGHT * 0.04, buff=0, stroke_width=2.4, color=PAPER)
        self.play(Create(bridge), run_time=0.35)
        self.play(FadeIn(path_nodes[0], scale=0.96), run_time=0.35)
        for connector, node in zip(connectors, path_nodes[1:]):
            self.play(Create(connector), FadeIn(node, scale=0.96), run_time=0.42)
        self.play(FadeIn(path_title), run_time=0.25)
        self.wait(0.35)

        takeaway_box = RoundedRectangle(
            width=8.2,
            height=0.82,
            corner_radius=0.16,
            stroke_width=1.4,
            stroke_color=BRASS,
            fill_color="#f8f4ec",
            fill_opacity=0.96,
        ).to_edge(DOWN, buff=0.54)
        takeaway = txt("更多方向只能让它转身，明确动作才会让它做选择。", 30, INK).move_to(takeaway_box)
        self.play(FadeIn(takeaway_box, shift=UP * 0.16), Write(takeaway), run_time=0.75)
        self.wait(0.9)

        self.play(
            FadeOut(VGroup(title, subtitle, ring, dots, labels, left_caption, arrows_to_actions, actions, action_title, bridge, path_nodes, connectors, path_title, takeaway_box, takeaway)),
            run_time=0.35,
        )
