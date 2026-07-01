# 示例 — NL → ManimCE 代码

三个由易到难的示例。每个：用户请求 → 最终脚本 + 渲染说明。

## 1. 易：形状形变

**用户请求：**

> 5 秒 `-ql` 动画：
> - 蓝色实心圆平滑变成红色实心正方形（圆心位置不动）
> - 顶部始终显示 `Text("Shape morph")` 标题
> - 默认 15 fps

**最终脚本（`scene_morph.py`）：**

```python
"""
示例 1 — 形状形变

用户请求:
    5 秒 `-ql` 动画:
      - 蓝色实心圆平滑变成红色实心正方形
        (圆心位置不动)。
      - 顶部始终显示 Text("Shape morph")。
      - 默认 15 fps。

设计要点（见 SKILL.md / examples.md #1 / anti-patterns.md）:
    - 显式分组 import —— 禁 `from manim import *`（反模式 #1, #2）。
    - `Transform(circle, square)` 用同一 Python handle，
      圆心保持在原 circle 位置上。
    - `Create(circle)` 描边再填充——视觉上"画圆"，不是"弹出"。
    - 标题用 `self.add(title)` 一次性添加，永不移除，符合
      "始终在顶部"的需求。
    - 时长预算: 0.5 (Create) + 3.5 (Transform) + 1.0 (wait) = 5.0 s
      (反模式 #16)。
    - 15 fps 是 -ql 默认，无需额外 -r / --fps。
    - 无 LaTeX——纯 Text 即可（反模式 #3, #13）。
"""

from manim import (
    Scene, Text, Circle, Square,
    Create, Transform,
    BLUE, RED, UP,
)


class ShapeMorph(Scene):
    def construct(self):
        # 标题 —— 始终在顶部，从不动画出场。
        title = Text("Shape morph").to_edge(UP)

        # 源：蓝色、实心、默认居中在 ORIGIN。
        circle = Circle(
            color=BLUE, fill_color=BLUE,
            fill_opacity=1.0,
        ).scale(1.5)

        # 目标：红色、实心，也居中于 ORIGIN，与 circle 等大。
        # 半径 1 的圆直径为 2，所以 side_length=2 让方块视觉上相当。
        square = Square(
            color=RED, fill_color=RED,
            fill_opacity=1.0,
            side_length=2,
        )

        # 阶段 1 —— 标题一次添加（瞬时；用户要求"始终"）。
        self.add(title)

        # 阶段 2 —— 画圆（0.5s）。
        self.play(Create(circle), run_time=0.5)

        # 阶段 3 —— 平滑形变 circle -> square，圆心保持在
        # circle 当前位置（ORIGIN），所以 square 也在中心。
        self.play(Transform(circle, square), run_time=3.5)

        # 阶段 4 —— 末帧停顿（1.0s）。总 wall-clock = 5.0s。
        self.wait(1.0)


if __name__ == "__main__":
    # 允许 `python scene_morph.py` 烟雾检测，
    # 标准调用仍是 `uv run manim -ql ...`。
    import sys
    from manim import config
    config.media_dir = "/tmp/media"
    config.quality = "low_quality"
    ShapeMorph().render()
    sys.exit(0)
```

渲染：

```bash
uv run manim -ql --media_dir /tmp/media scene_morph.py ShapeMorph
```

**为什么这样写：**

- `Transform(src, target)` 而非 `ReplacementTransform` —— 我们只想要一个 Python handle。
- `Create` 而非 `FadeIn` —— 描边读作"画"，不是"淡入"。
- 标题通过 `self.add(title)` 添加，永不移除；顶着 morph 一直显示。
- 时长预算：`0.5 + 3.5 + 1.0 = 5.0 s`。

## 2. 中：二次方程求根公式

**用户请求：**

> 8 秒动画，求根公式几何演示：
> - 抛物线 `Axes + graph y=x²-5x+6`，蓝
> - x 轴标记两个根 x=2 与 x=3（绿点）
> - 顶部依次 Text：
>   - `"y = x² − 5x + 6"`
>   - `"D = b² − 4ac = 25 − 24 = 1"`
>   - `"x = (−b ± √D) / 2a = (5 ± 1) / 2"`
> - 末尾两个根点亮起来

**最终脚本（`scene_quadratic.py`）：**

```python
"""
示例 2 — 求根公式

用户请求:
    8 秒，求根公式几何演示:
    - 抛物线 y=x²-5x+6（Axes + graph）
    - x 轴标记 x=2 与 x=3（绿点）
    - 顶部依次 Text:
      - "y = x² − 5x + 6"
      - "D = b² − 4ac = 25 − 24 = 1"
      - "x = (−b ± √D) / 2a = (5 ± 1) / 2"
    - 末尾两个根点亮起来

设计要点:
    - 显式 import（manim 0.20 无 Polyline）
    - 不用 MathTex / MathAxisLabels —— LaTeX 缺失。
      手动 Text + next_to 替代。
    - `x_range=[0.5, 4.5]` 让抛物线完整可见，不被轴端切。
    - flash = root.copy().set_color(YELLOW).scale(1.6)
      解决 Dot.color 不能直接 .animate 的问题（反模式 #12）。
    - 时长预算: 0.7 + 2.0 + 0.3 + 0.6 + 0.6 + 0.5 + 0.7 + 0.5 + 0.7 + 0.4 + 0.6 + 0.4 + 0.5 ≈ 8.5s
"""

from manim import (
    Scene, Axes, Dot, Text, VGroup,
    Create, Write, FadeIn, ReplacementTransform,
    GREEN, BLUE, YELLOW, WHITE, UP, DOWN, RIGHT,
)


class QuadraticRoots(Scene):
    def construct(self):
        # --- 坐标框（手动标签避开 get_axis_labels 的 MathTex） ---
        axes = Axes(
            x_range=[0, 5, 1],
            y_range=[-1, 4, 1],
            x_length=7, y_length=4,
            tips=False,
            axis_config={"color": WHITE},
        )
        x_label = Text("x", font_size=28).next_to(axes.x_axis.get_end(), RIGHT, buff=0.2)
        y_label = Text("y", font_size=28).next_to(axes.y_axis.get_end(), UP, buff=0.2)
        labels = VGroup(x_label, y_label)

        parabola = axes.plot(
            lambda x: x ** 2 - 5 * x + 6,
            x_range=[0.5, 4.5],
            color=BLUE,
        )
        root_2 = Dot(axes.c2p(2, 0), color=GREEN, radius=0.12)
        root_3 = Dot(axes.c2p(3, 0), color=GREEN, radius=0.12)

        # --- 三个公式横幅顶部堆叠（Unicode，无 LaTeX） ---
        f1 = Text("y = x² − 5x + 6",                font_size=36, color=YELLOW)
        f2 = Text("D = b² − 4ac = 25 − 24 = 1",     font_size=36, color=YELLOW)
        f3 = Text("x = (−b ± √D) / 2a = (5 ± 1) / 2", font_size=36, color=YELLOW)
        banner = VGroup(f1, f2, f3).arrange(DOWN, buff=0.25).to_edge(UP)

        # --- 时序 ---
        self.play(Create(axes), Write(labels))
        self.play(Create(parabola), run_time=2)
        self.wait(0.3)
        self.play(Write(f1))
        self.play(FadeIn(root_2), FadeIn(root_3))
        self.wait(0.5)
        self.play(ReplacementTransform(f1, f2))
        self.wait(0.5)
        self.play(ReplacementTransform(f2, f3))
        self.wait(0.4)

        # --- 高亮两个根 ---
        flash_2 = root_2.copy().set_color(YELLOW).scale(1.6)
        flash_3 = root_3.copy().set_color(YELLOW).scale(1.6)
        self.play(FadeIn(flash_2, scale=1.4), FadeIn(flash_3, scale=1.4), run_time=0.6)
        self.play(
            ReplacementTransform(flash_2, root_2.copy().set_color(GREEN)),
            ReplacementTransform(flash_3, root_3.copy().set_color(GREEN)),
            run_time=0.4,
        )
        self.wait(0.5)


if __name__ == "__main__":
    import sys
    from manim import config
    config.media_dir = "/tmp/media"
    config.quality = "low_quality"
    QuadraticRoots().render()
    sys.exit(0)
```

> 注意 `banner = VGroup(f1, f2, f3)...to_edge(UP)` 一次性建顶部插槽；
> 因为 `ReplacementTransform(f1, f2)` 在原地换 handle，**一次只一个公式在屏**。

渲染：

```bash
uv run manim -ql --media_dir /tmp/media scene_quadratic.py QuadraticRoots
```

**为什么这样写：**

- 不用 `MathTex` —— 替换为 `Text` + Unicode 上标（反模式 #3）。
- `ReplacementTransform(f1, f2)` 让公式横幅稳住顶部。
- 高亮根用 `copy().set_color(YELLOW).scale(1.6)` —— 因为 `Dot.color` 在 0.20.x 不能直接 `.animate`（反模式 #12）。

## 3. 难：双井势粒子（Euler 积分）

**用户请求：**

> 8 秒动画：画 `U(x) = x⁴ − x²`，x∈[−1.5,1.5]，再模拟粒子从 x=0.1, v=0 出发的 Euler 积分（dt=0.02），画出轨迹。角落用 `Text` 显示当前 x/v/E（不依赖 MathTex）。

**最终脚本（`scene_doublewell.py`）：**

```python
"""
示例 3 — 双井势（Euler 积分）

用户请求:
    8 秒动画：U(x) = x⁴ − x² 在 x∈[−1.5, 1.5] + 粒子
    Euler 积分（x=0.1, v=0, dt=0.02），轨迹驻留。x/v/E
    角落 readout。无 MathTex（LaTeX 缺失）。

Wall-clock: 8 秒
"""

import os
import sys

# 让 src/brand/ 子目录里的 Scene 找到 src/_lib.py
_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(_HERE))

from manim import (
    Scene, Axes, Dot, VGroup, Text,
    always_redraw,
    RED, YELLOW, BLUE, WHITE,
    RIGHT, UP, DOWN, DR, UR,
)

from _lib import (
    BRAND, BRAND_DARK, HIGH_RED, MED_AMBER,
    TITLE_SIZE, SUBTITLE_SIZE, BODY_SIZE, SMALL_SIZE, TINY_SIZE,
    BLACK, WHITE, GREY,
    UP, DOWN, LEFT, RIGHT, ORIGIN, UR, UL, DR, DL,
)


DT = 0.02
STEPS_PER_FRAME = 3
DURATION = 8.0


def U(x):        return x ** 4 - x ** 2
def accel(x):    return -4.0 * x ** 3 + 2.0 * x
def energy(x, v): return 0.5 * v * v + U(x)


class DoubleWellParticle(Scene):
    """8 秒 Euler 积分的双井势粒子"""

    def construct(self):
        # ---- 坐标 + 势能曲线 ----
        axes = Axes(
            x_range=[-1.6, 1.6, 0.5],
            y_range=[-1.0, 3.2, 1.0],
            tips=False,
        ).scale(0.9)

        # 势能曲线
        pot = axes.plot(U, color=RED, x_range=[-1.5, 1.5, 0.01], stroke_width=3)

        # 标题 + 坐标标签
        title = Text(
            "Scenario 4 — Double well + Euler particle",
            font_size=26, color=YELLOW,
        ).to_edge(UP)

        # 手动刻度标签（避免 add_coordinates 的 MathTex）
        ticks = VGroup(*[
            Text(f"{x:+.1f}", font_size=16).next_to(
                axes.c2p(x, 0), DOWN, buff=0.12,
            )
            for x in (-1.5, -1.0, -0.5, 0.0, 0.5, 1.0, 1.5)
        ])

        # ---- 仿真状态挂在 self 上 ----
        self.sim_x = 0.1
        self.sim_v = 0.0
        self.sim_t = 0.0
        self.history = [(self.sim_x, U(self.sim_x))]

        # 粒子（Dot）初始放在势能曲线上
        particle = Dot(color=BLUE, radius=0.07)
        particle.move_to(axes.c2p(self.sim_x, U(self.sim_x)))

        # ⚠️ silent-freeze 陷阱：updater 形参必须字面叫 `dt`。
        # manim 0.20 用 inspect.signature 字面检查若改名
        # (dt_wall, Δt, dt_secs 等) 完全跳过 updater。
        # 没报错，画面冻结，manim 日志只输出"Played N animations"。
        # 见 SKILL.md "关键陷阱"节。
        def step(mob, dt):
            for _ in range(STEPS_PER_FRAME):
                a = accel(self.sim_x)
                self.sim_v += a * DT
                self.sim_x += self.sim_v * DT
                self.sim_t += DT
                self.history.append((self.sim_x, U(self.sim_x)))
            mob.move_to(axes.c2p(self.sim_x, U(self.sim_x)))

        particle.add_updater(step)

        # ---- 轨迹点（从 self.history 每帧重建） ----
        TRAIL_MAX = 1500

        def make_trail():
            pts = self.history[-TRAIL_MAX:]
            return VGroup(*[
                Dot(axes.c2p(x, y), radius=0.018, color=YELLOW)
                for (x, y) in pts
            ])

        trail = always_redraw(make_trail)

        # ---- 角落 readout（纯 Text，非 MathTex / DecimalNumber） ----
        def make_readout():
            E = energy(self.sim_x, self.sim_v)
            return Text(
                f"t_phys = {self.sim_t:5.2f}\n"
                f"x      = {self.sim_x:+.3f}\n"
                f"v      = {self.sim_v:+.3f}\n"
                f"E      = {E:+.3f}",
                font_size=22,
            ).to_corner(DR)

        readout = always_redraw(make_readout)

        # ---- 组装 + 启动 ----
        self.add(title, axes, label_x, label_U, ticks, pot,
                 trail, particle, readout)
        self.wait(DURATION)
```

渲染：

```bash
uv run manim -ql --media_dir /tmp/media scene_doublewell.py DoubleWellParticle
```

**为什么这样写：**

- 状态放 `self` 而非闭包 —— 跨 `self.wait()` tick 读到最新。
- `def step(mob, dt):` —— `dt` 字面必需（SKILL.md silent-freeze 陷阱）。
- `STEPS_PER_FRAME * DT * frames = total physics time` 在脚本头部写公式，让后续调参不踩坑。
- `always_redraw(make_trail)` 每帧从 `self.history` 重建——本规模够用，长跑用环形缓冲。
- Energy 漂移是预期（Euler 不 symplectic）。`E` 放进 readout 教学点更鲜明。
