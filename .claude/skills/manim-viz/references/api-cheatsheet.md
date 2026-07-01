# API 速查

> 🔥 **始终从显式分组 import 开始。** 跳过这步会撞 `NameError: DOWN/RIGHT/Create/UR is not defined`。下方有模板。

## 必需基础 import（每个 Scene 几乎都用到）

```python
from manim import (
    # Scene + 90% 概率用到的 mobject
    Scene, Text, Axes, Dot, VGroup,
    # 动画原语
    Create, FadeIn, FadeOut, Write,
    # 方向常量（to_edge / to_corner / next_to 都要）
    UP, DOWN, LEFT, RIGHT, ORIGIN, UR, UL, DR, DL,
    # 颜色常量
    BLUE, RED, GREEN, YELLOW, WHITE,
)
```

> 不写上面这些，import `Create` 又忘了，渲染首帧就 `NameError`。需要别的（`Replace`/`Rotate`/`always_redraw` 等）先建基础再加。

## Imports

### 几何与 mobject

```python
from manim import (
    # 几何原语
    Circle, Square, Rectangle, Triangle, Polygon, RegularPolygon, Arc,
    Dot, Line, Arrow, Vector, DoubleArrow,
    Text, MarkupText, Paragraph,
    VGroup, VMobject,
    Axes, NumberPlane, NumberLine, ComplexPlane,
    # 数值 / 状态
    ValueTracker, DecimalNumber, Integer,
    # 组合
    Group, VGroup, always_redraw,
)
```

### 动画

```python
from manim import (
    Create, Uncreate,              # 描边绘/擦
    FadeIn, FadeOut,               # 透明度
    Write,                         # 文本"打字"
    Transform, ReplacementTransform, TransformFromCopy,
    Rotate,                        # 绕点旋转
    MoveToTarget,                  # 预设目标态
    DrawBorderThenFill, ShowPassingFlash,
    AnimationGroup, Succession, LaggedStart,
)
```

### 常量

```python
from manim import (
    ORIGIN, IN, OUT,
    UP, DOWN, LEFT, RIGHT,
    UL, UR, DL, DR,                 # 不是 UP_RIGHT
    PI, TAU, DEGREES,
    # 颜色
    WHITE, BLACK, GREY,
    BLUE, BLUE_D, BLUE_E, BLUE_B, BLUE_C,
    RED, RED_D, RED_E,
    GREEN, GREEN_D, GREEN_E,
    YELLOW, YELLOW_D, YELLOW_E,
    ORANGE, PURPLE, PINK, TEAL, MAROON,
)

from manim import rate_functions  # smooth / linear / there_and_back ...
```

## 变换三件套

```python
# 同 handle 形变（一个形在屏，一个 Python 变量）
self.play(Transform(mob, new_mob))

# 换 handle（两份 Python 引用都活着，post-play 后两对象都可见）
self.play(ReplacementTransform(old_mob, new_mob))

# 原物保留，再做一份拷贝变换
self.play(TransformFromCopy(source_mob, target_mob))
```

## 旋转

```python
self.play(Rotate(arrow, angle=90 * DEGREES, about_point=ORIGIN))

# 同时旋转 + 移动标签
self.play(
    Rotate(e1, angle=90 * DEGREES, about_point=ORIGIN),
    Rotate(e2, angle=90 * DEGREES, about_point=ORIGIN),
    Transform(label_e1, label_e1_target),
)
```

## 物理 updater 模板（避免 silent-freeze）

```python
# 状态在 self 上以便闭包读到最新
self.sim_x = 0.1
self.sim_v = 0.0
self.sim_t = 0.0
self.history = [(self.sim_x, U(self.sim_x))]
DT = 0.02
STEPS_PER_FRAME = 3

# ⚠️ 形参名必须字面叫 `dt`（manim 0.20 用 inspect.signature 字面检查）
def step(mob, dt):
    for _ in range(STEPS_PER_FRAME):
        a = accel(self.sim_x)              # a = -dU/dx
        self.sim_v += a * DT
        self.sim_x += self.sim_v * DT
        self.sim_t += DT
        self.history.append((self.sim_x, U(self.sim_x)))
    mob.move_to(axes.c2p(self.sim_x, U(self.sim_x)))

particle.add_updater(step)
```

用 `always_redraw` 重建轨迹（每帧从头构图）：

```python
def make_trail():
    pts = self.history[-TRAIL_MAX:]
    return VGroup(*[Dot(axes.c2p(x, U(x)), radius=0.02, color=YELLOW)
                    for x in (p[0] for p in pts)])

trail = always_redraw(make_trail)
```

## 坐标变换

```python
# axes 是 Axes()
data_point = axes.c2p(x, y)            # 数 → 屏
x, y = axes.p2d(screen_point)          # 屏 → 数

# 画函数（无 LaTeX）
curve = axes.plot(lambda x: x ** 2 - 5 * x + 6,
                  x_range=[0.5, 4.5],
                  color=BLUE)

# 手画轴标签（不要 get_axis_labels，会触发 MathTex）
x_label = Text("x", font_size=24).next_to(axes.x_axis.get_end(), RIGHT, buff=0.2)
y_label = Text("y", font_size=24).next_to(axes.y_axis.get_end(), UP, buff=0.2)
```

## 动画时长

```python
self.play(animation, run_time=2)        # 秒
self.play(anim1, anim2, run_time=1.5)   # 多动画并行，run_time 是公共值
self.wait(0.5)                          # 停顿 0.5 秒

# 缓动
self.play(mob.animate.shift(RIGHT), rate_func=rate_functions.there_and_back, run_time=2)
```

## `.animate` 链

```python
self.play(square.animate.shift(RIGHT).scale(2).rotate(PI / 2))
self.play(square.animate(run_time=2).rotate(PI / 2))
```

## 无 LaTeX 画函数/折线

```python
# 方波（sign(sin)，跳过零点）
def square_wave(x: float) -> float:
    s = math.sin(x)
    return 1.0 if s > 0 else (-1.0 if s < 0 else 0.0)

ref = axes.plot(square_wave, x_range=[-2 * math.pi, 2 * math.pi, 0.005],
                color=BLUE_D, stroke_width=3)
```

## 快速运行时诊断（无需写脚本）

```python
with tempconfig({"quality": "medium_quality", "preview": True}):
    scene = DemoScene()
    scene.render()
```
