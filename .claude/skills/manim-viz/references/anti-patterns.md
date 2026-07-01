# 反模式（22 条，含修法）

每条都是 baseline subagent 真实撞过的坑。对上症状 → 套修法。

## 1. `from manim import *`

**症状：** `construct` 深处的随机 `NameError: name 'DOWN' / 'RIGHT' / 'UR' / 'ORIGIN' is not defined`。

**为什么：** `from manim import *` **不导入**方向/角点/颜色常量——只导入 public 类。manim 的常量在 `__all__` 之外，星号导入拿不到。

**修法：** 显式分组 import。见 [`api-cheatsheet.md`](api-cheatsheet.md)。

## 2. 方向常量没 import

**症状：** `NameError: name 'DOWN' / 'UR' / 'RIGHT' is not defined`。

**修法：** 加进显式 import：

```python
from manim import UP, DOWN, LEFT, RIGHT, ORIGIN, UR, UL, DR, DL
```

## LaTeX 类 API 的统一前置（#3-6 通用）

`#3-6` 只在 **`scripts/check_latex.sh` 报不可用（exit 1）** 时适用——此时 `Axes.get_axis_labels` / `add_coordinates` / `NumberLine.add_labels` / `DecimalNumber` 内部的 `MathTex` 会崩，需手动用 `Text` 替代。
若 `check_latex.sh` 报可用（exit 0），这些 API 直接用，跳过 #3-6。

## 3. `Axes.get_axis_labels()`

**症状：** 即使代码里没用 `MathTex`，渲染时崩 `FileNotFoundError: [Errno 2] No such file or directory: 'latex'`。

**为什么：** `get_axis_labels` 内部构造 `MathTex("x")` / `MathTex("y")`。

**修法：**

```python
x_label = Text("x", font_size=28).next_to(axes.x_axis.get_end(), RIGHT, buff=0.2)
y_label = Text("y", font_size=28).next_to(axes.y_axis.get_end(), UP,   buff=0.2)
```

## 4. `Axes.add_coordinates()`

**症状：** 同上的 `latex` 文件找不到。

**为什么：** 同——内部 `MathTex` 给数字刻度。

**修法：** 手动用 `Text(f"{x:+.1f}")` 摆刻度：

```python
Text(f"{x:+.1f}", font_size=16).next_to(axes.c2p(x, 0), DOWN, buff=0.12)
```

## 5. `NumberLine.add_labels(...)`

**症状：** 同上。

**修法：** 同 #4。

## 6. `DecimalNumber(value)` / `Integer(value)`

**症状：** 同上。

**为什么：** 两者都通过 `MathTex` 渲染数字，让数字可以动画。

**修法：** `Text(f"{value:.2f}", font_size=28)`。每帧更新则配 `always_redraw(make_text)`。

## 7. updater 形参改名，非 `dt`

**症状：** 动画照跑但 mobject 不动。manim 日志照常输出 `Played N animations`。

**为什么：** manim 0.20.x `Mobject.has_time_based_updater()` 做的检查是 `"dt" in inspect.signature(...).parameters`。任何别的名字，`self.wait()` 调用 updater 0 次。

**修法：** 改回字面 `dt`：

```python
particle.add_updater(lambda m, dt: m.move_to(...))
# ❌ silent freeze
particle.add_updater(lambda m, dt_wall: m.move_to(...))
```

## 8. `UP_RIGHT` / `DOWN_LEFT`

**症状：** `AttributeError: module 'manim' has no attribute 'UP_RIGHT'`。

**修法：** 用 `UR` / `UL` / `DR` / `DL`。（`OUT`/`IN` 存在；`UP_RIGHT` 等不存在。）

## 9. `self.play(*[])` 空动画

**症状：** `Called Scene.play with no animations`。

**为什么：** 循环里 build 的 fade-list 在第一次迭代时空了。

**修法：**

```python
fade_anim = []
if i > 0:
    fade_anim.append(prev_mob.animate.set_opacity(0.3))
if fade_anim:
    self.play(*fade_anim, run_time=STAGE_SECONDS_FADE)
```

## 10. 调试默认 `-qh`

**症状：** 30 秒迭代要 5 分钟（1080p60）。

**修法：** 调试默认 `-ql`（480p15）。只在上 final 导出时切 `-qh` / `-qk`。

## 11. `Transform(arrow, new_arrow)` 当"旋转"

**症状：** 箭头头部旋转中看起来不对，`stroke_width` 插值怪。

**为什么：** `Transform` 把每个几何属性都插值，包括 `stroke_width` 和 `max_tip_length_to_length_ratio`。

**修法：** 用 `Rotate(mob, angle, about_point=ORIGIN)`。只动旋转，不动几何。

## 12. `Dot.color` 当 `.animate` target

**症状：** manim 各版本上小 mobject 的颜色动画不稳定。

**修法：**

```python
flash = original.copy().set_color(YELLOW).scale(1.6)
self.play(FadeIn(flash, scale=1.4), run_time=0.6)
self.play(ReplacementTransform(flash, original.copy().set_color(GREEN)))
```

## 13. 没确认环境就写 LaTeX 原始字符串

**症状：** `MathTex(r"x^2")` 在 pdflatex 缺失时渲染崩。

**修法：** 先跑 `scripts/check_latex.sh`（exit 0 可用 / 1 不可用）。不可用就用 `Text("x²")`（Unicode 上标）。覆盖 Unicode 字符：`² ³ √ ± − π ∑ ∫ ≈ ≠`。

## 14. `axes.plot(...)` 不传 `x_range`

**症状：** 曲线在轴边界被切。

**修法：** 显式传 `x_range`。默认是 axes 范围，常常对函数形状意义不大：

```python
axes.plot(lambda x: x ** 2 - 5 * x + 6, x_range=[0.5, 4.5], color=BLUE)
```

## 15. 闭包捕获循环可变状态

**症状：** updater 每帧读到旧值。

**为什么：** Python 闭包按引用捕获，`for ... in iterable` 里需要每次迭代新闭包绑定。

**修法：** 可变状态挂 `self` 上（`self.sim_x`, `self.sim_v`）。闭包捕获 `self` 总看到最新值。

或者用默认参数绑当前值：

```python
new_curve = axes.plot(lambda x, nn=n_max: partial_sum(x, nn), ...)
```

## 16. 时长预算重复计算

**症状：** 最终 mp4 是 16s，但你要 12s（或 9s）。

**为什么：** 忘了 `run_time` 和 `wait` 都计入，或在一段多 `self.play` 没扣隐式 wait。

> 🔥 **subagent 反复犯的模式。** 即使反模式已经列出，长形式 Fourier 场景（5 个偏和 × 2s + 参考 + tail）仍在**第一次**渲染成 13.07s（目标 12s），调一次才到 11.13s。**先**写代码预算，**后**写代码。

**修法：** 写前算：

```
total = Σ self.play(..., run_time=X) + Σ self.wait(Y)
```

把公式放代码头注释里，调 `STAGE_SECONDS_*` 常量时可见：

```python
# 预算: 3.0 (ref) + 5 × (0.3 fade + 1.0 create + 0.3 hold) + 0.5 = 11.6s
# ffprobe 目标: ≤ 12.0s
STAGE_SECONDS_REF = 3.0
STAGE_SECONDS_FADE = 0.3
STAGE_SECONDS_PARTIAL = 1.0
STAGE_SECONDS_HOLD = 0.3
```

映射实际帧：`frames = total * fps`。用 `ffprobe -show_entries format=duration` 验证。

## 17. 把 `self.add` 当动画

**症状：** Mobject 瞬时出现，没转场。（意外：`self.add(mob)` 不动画。）

**修法：** 包进 `self.play(FadeIn(mob))` 或 `self.play(Create(mob))`。

（反向错误——`self.play(mob)` 错传非动画对象——直接 TypeError，相对安全。）

## 18. 缓存掩盖真正的修复

**症状：** 你"修"了 updater 再渲染，但输出和 bug 版本一样。

**为什么：** manim 把 partial-movie 文件内容哈希，没变就跳过再渲。updater 是确定性的，所以哈希和缓存撞了。

**修法：**

```bash
rm -rf media/videos/<scene>/<quality>/partial_movie_files/
# 或：
uv run manim -ql --disable_caching --media_dir /tmp/media scene.py SceneName
```

---

## 反合理化（堵住滑坡）

想放松规则时，看这张表：

| 诱惑 | 反驳 |
| --- | --- |
| "我就 `pip install` 一次测环境，回头切 uv" | uv 项目里 `pip install` 永久污染 .venv。直接用 `uv add`。 |
| "我们组都用 MathTex，LaTeX 肯定装了" | `scripts/check_latex.sh` 是唯一权威——去跑。 |
| "默认 `-qh`，好看点" | 迭代时间宝贵。先 `-ql`，只终版 `-qh`。 |
| "`from manim import *` 让 import 区简洁" | 是，等 `construct` 撞 `NameError` 你就后悔。显式 import 扩展性好。 |
| "把 `dt` 改名 `dt_secs` 更清楚" | manim 0.20.x 改名静默冻结。字面 `dt` 不动。 |
| "时长算太麻烦，肉眼看一下" | mp4 不会是你想要的长度。ffprobe + 改常量。 |
| "用户说 'fade in' 任何 fade 都行" | 字面严谨：`FadeIn` 是透明度，`Create` 是描边。 |

---

## 几何与布局（**只靠抽帧检查**才能发现）

下面这些不崩。它们只在像素层面暴露——所以每个 Scene 末尾必须有抽帧检查（见 [`frame-check.md`](frame-check.md)）。跳过抽帧检查、又把这些 bug 带进产品，第一个看动画的人就会发现。

## 19. 把 `Text().shift()` 当"居中"

**症状：** 文字偏心（左、右、对角），尽管 `.shift(UP * 0.3)` "看起来对"。

**为什么：** `Text` 默认 baseline-left 锚定。`.shift()` 是相对 `current center` 的偏移，但 `Text` 没有像 `Circle` 那样的固定 center——它随字形度量而变。两个几乎相同的 text mobject，字符串宽度不同，effective center 也不同。

**修法：** 用 `Text(...).move_to([x, y, 0])` 做绝对定位，总能居中。`Text(...).shift(...)` 只在已有位置上加小偏移。

**抽帧 checklist 第 1 项核实。**

## 20. 色块没盖住它该背的字

**症状：** 副标题/数值文字读作"不可见"，黑底看不见——虽然脚本明明有个 `Rectangle(fill_color=BRAND)` 挡在后面。

**为什么：** `Rectangle(width=16, height=10).align_to(ORIGIN, DOWN)` 只盖下半（y ∈ `[-5, 0]`）。`y=-0.6` 的文字落在块**外面**——画布黑底上，消失了。

**修法：** 要么块全屏（`move_to(ORIGIN)`），要么把文字放进块 y 范围。公式：`block.y_min ≤ text_y ≤ block.y_max`。见 [`geometry-math.md`](geometry-math.md)。

**抽帧 checklist 第 5 项核实。**

## 21. 卡片宽度装不下内容

**症状：** 数字右边的几位溢出卡片右缘；label 文字被切。

**为什么：** Pango Text 宽度 ≈ `font_size/96 × 0.45 × chars`（数字/拉丁）或 `× 0.55`（中文）。32pt 下 6 位数字约 0.9 unit 宽，加 padding。`card_w=4.2` 时 4 位数勉强 OK，5–6 位就装不下，"命令调用"4 个中文字 20pt 也装不下。

**修法：** 缩数值字号（32 → 24 或 20）或者加宽卡片（4.2 → 4.8 unit）。经验法则：`card_w ≥ 1.4 × widest_text_width`。见 [`geometry-math.md`](geometry-math.md)。

**抽帧 checklist 第 4 项核实。**

## 22. polyline x 范围不对称到 0

**症状：** logo polyline（或任何手绘形状）看着偏心，尽管"数学对"。峰/强调标记像在飘向某一边。

**为什么：** `x_min = -2.4` 与 `x_max = +1.6` 时，polyline 视觉中心在 `x = -0.4`，不归零。所以钉在 `(0, -0.7)` 的峰顶圆看起来跟实际峰是脱离的。

**修法：** 重选 x 值让 `x_min + x_max = 0`（对 0 镜像）。`[a, ..., b]` 选 `b = -a`。改完确认峰顶在 `(0, peak_y)`。

**抽帧 checklist 第 2 + 3 项核实。**
