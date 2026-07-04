from manim import (
    DOWN,
    LEFT,
    ORIGIN,
    RIGHT,
    UP,
    Arrow,
    Circle,
    Create,
    FadeIn,
    FadeOut,
    LaggedStart,
    Line,
    MovingCameraScene,
    Rectangle,
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
config.background_color = "#1a1917"

BG = "#1a1917"
PANEL = "#26241f"
TEXT = "#f5f3ee"
DIM = "#a8a39a"
CYAN = "#8fbdb6"
GREEN = "#6a9e79"
WARN = "#ce9646"
RED = "#cd5c5c"
TERRACOTTA = "#e08560"
MONO = "JetBrains Mono"
SANS = "Noto Sans CJK SC"


def label(text, size=30, color=TEXT, font=SANS):
    return Text(text, font=font, font_size=size, color=color)


def card(title, body, width=3.15, height=1.15, accent=CYAN, title_size=24, body_size=20):
    box = RoundedRectangle(
        width=width,
        height=height,
        corner_radius=0.12,
        stroke_width=1.8,
        stroke_color=accent,
        fill_color=PANEL,
        fill_opacity=0.82,
    )
    title_m = label(title, title_size, accent, MONO).move_to(box.get_center() + UP * 0.21)
    body_m = label(body, body_size, DIM, SANS).move_to(box.get_center() + DOWN * 0.22)
    return VGroup(box, title_m, body_m)


class JsonlToFinding(MovingCameraScene):
    def construct(self):
        self.camera.background_color = BG

        title = label("JSONL 不是日志噪声", 44, TEXT).to_edge(UP, buff=0.55)
        subtitle = label("事件被聚类成 finding：工具、项目、session、失败原因", 25, DIM).next_to(
            title, DOWN, buff=0.14
        )
        self.play(FadeIn(title, shift=DOWN * 0.18), FadeIn(subtitle, shift=DOWN * 0.18), run_time=0.5)

        rows = VGroup()
        samples = [
            ('tool=Bash  error=timeout', RED),
            ('project=article-mcp  tokens=612k', WARN),
            ('session=s_e2c1  duration=42m', CYAN),
            ('cmd=go-test  failure=47%', RED),
            ('model=sonnet  cache-read=0', WARN),
            ('tool=Read  path=node_modules', DIM),
        ]
        for idx, (txt, color) in enumerate(samples):
            row = label(txt, 18, color, MONO)
            row.move_to(LEFT * 4.92 + UP * (2.05 - idx * 0.58))
            bg = RoundedRectangle(
                width=5.15,
                height=0.38,
                corner_radius=0.06,
                stroke_width=0.8,
                stroke_color="#3a3833",
                fill_color="#151515",
                fill_opacity=0.72,
            ).move_to(row)
            rows.add(VGroup(bg, row))

        clusters = VGroup(
            card("tool", "Bash / Read", width=2.75, height=1.02, accent=CYAN),
            card("project", "article-mcp", width=2.75, height=1.02, accent=WARN),
            card("session", "s_e2c1", width=2.75, height=1.02, accent=GREEN),
            card("reason", "timeout-loop", width=2.75, height=1.02, accent=RED),
        ).arrange(DOWN, buff=0.16).move_to(ORIGIN + RIGHT * 0.05)

        finding = card(
            "finding",
            "Bash timeout cluster",
            width=3.25,
            height=1.15,
            accent=TERRACOTTA,
            title_size=22,
            body_size=18,
        )
        finding.move_to(RIGHT * 4.85 + UP * 0.35)

        self.play(LaggedStart(*[FadeIn(r, shift=RIGHT * 0.2) for r in rows], lag_ratio=0.07), run_time=1.1)
        arrows_to_cluster = VGroup()
        for idx, row in enumerate(rows):
            target = clusters[idx % len(clusters)]
            arrows_to_cluster.add(
                Arrow(
                    row.get_right() + RIGHT * 0.08,
                    target.get_left() + LEFT * 0.08,
                    buff=0,
                    stroke_width=2.2,
                    color=CYAN if idx % 2 else TERRACOTTA,
                    max_tip_length_to_length_ratio=0.08,
                )
            )
        self.play(
            LaggedStart(*[Create(a) for a in arrows_to_cluster], lag_ratio=0.04),
            LaggedStart(*[FadeIn(c, scale=0.96) for c in clusters], lag_ratio=0.08),
            run_time=1.3,
        )

        arrows_to_finding = VGroup()
        for cluster in clusters:
            arrows_to_finding.add(
                Arrow(
                    cluster.get_right() + RIGHT * 0.08,
                    finding.get_left() + LEFT * 0.08,
                    buff=0,
                    stroke_width=2.4,
                    color=TERRACOTTA,
                    max_tip_length_to_length_ratio=0.08,
                )
            )
        self.play(LaggedStart(*[Create(a) for a in arrows_to_finding], lag_ratio=0.08), run_time=0.7)
        self.play(FadeIn(finding, scale=0.95), run_time=0.85)

        halo = Circle(radius=2.15, stroke_color=TERRACOTTA, stroke_width=2.5, fill_opacity=0).move_to(
            finding
        )
        self.play(Create(halo), run_time=0.45)
        self.play(FadeOut(halo), run_time=0.35)
        self.wait(0.8)


class RecChain(MovingCameraScene):
    def construct(self):
        self.camera.background_color = BG

        title = label("rec 把异常变成下一步动作", 44, TEXT).to_edge(UP, buff=0.62)
        self.play(FadeIn(title, shift=DOWN * 0.14), run_time=0.35)

        nodes = VGroup(
            card("symptom", "慢 / 贵 / 失败", width=2.75, height=1.08, accent=RED),
            card("evidence", "Bash_echo · 27.1m", width=3.05, height=1.08, accent=WARN),
            card("root cause", "timeout-loop", width=2.75, height=1.08, accent=CYAN),
            card("next cmd", "cmd_reason", width=2.95, height=1.08, accent=GREEN),
        ).arrange(RIGHT, buff=0.42).move_to(ORIGIN + UP * 0.35)

        arrows = VGroup()
        for left, right in zip(nodes[:-1], nodes[1:]):
            arrows.add(
                Arrow(
                    left.get_right() + RIGHT * 0.04,
                    right.get_left() + LEFT * 0.04,
                    buff=0,
                    stroke_width=3,
                    color=CYAN,
                    max_tip_length_to_length_ratio=0.12,
                )
            )

        self.play(FadeIn(nodes[0], scale=0.96), run_time=0.35)
        for arrow, node in zip(arrows, nodes[1:]):
            self.play(Create(arrow), FadeIn(node, scale=0.96), run_time=0.45)

        rail = Line(LEFT * 5.8 + DOWN * 1.35, RIGHT * 5.8 + DOWN * 1.35, color="#3a3833", stroke_width=2)
        metric_a = label("28 failed commands", 28, RED, MONO).next_to(rail, DOWN, buff=0.32).shift(LEFT * 3.5)
        metric_b = label("61% token hotspot", 28, WARN, MONO).next_to(rail, DOWN, buff=0.32)
        metric_c = label("local evidence", 28, CYAN, MONO).next_to(rail, DOWN, buff=0.32).shift(RIGHT * 3.5)
        ticks = VGroup()
        for x, color in [(-4.5, RED), (0, WARN), (4.4, CYAN)]:
            ticks.add(Rectangle(width=0.08, height=0.42, stroke_width=0, fill_color=color, fill_opacity=1).move_to(rail.get_center() + RIGHT * x))

        self.play(Create(rail), FadeIn(ticks), run_time=0.45)
        self.play(FadeIn(metric_a, shift=UP * 0.1), FadeIn(metric_b, shift=UP * 0.1), FadeIn(metric_c, shift=UP * 0.1), run_time=0.55)

        final = label("不是多一张报表，而是可执行路径", 34, TEXT).to_edge(DOWN, buff=0.62)
        self.play(Write(final), run_time=0.55)
        self.wait(0.6)
