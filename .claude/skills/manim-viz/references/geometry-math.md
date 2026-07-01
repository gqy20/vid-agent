# 几何数学 — Manim 坐标系速查

> 这里讲的是 manim 2D 坐标系——避免那些"不崩但看起来不对"的几何 bug 的数学基础。交叉参考：`frame-check.md` 看视觉 debug SOP，`api-cheatsheet.md` 看 API 表面。

## 画布

manim 默认 16:9 画布。在 Scene 单位（抽象的 manim 1.0 网格）下：

| 分辨率 | 宽 (x) | 高 (y) | 中心 → 边缘 |
| --- | --- | --- | --- |
| `-ql` (854×480, 16:9) | 14.22 | 8.00 | `(-7.11, 7.11)` × `(-4.00, 4.00)` |
| `-qm` (1280×720) | 14.22 | 8.00 | 同 `-ql`（manim 单位网格恒定） |
| `-qh` (1920×1080) | 14.22 | 8.00 | 同上，像素密度变化而非单位空间 |
| `-qk` (3840×2160) | 14.22 | 8.00 | 同上 |

画布中心是 `(0, 0)`。**y+ 上，x+ 右**。

> manim 也有 `.scale()` 和 `frame_width=` 覆盖——一旦 Scene 改了它们，下面的数字得重算。

## 常用形状的"尺寸"

| 形状 | 默认尺寸（unit） | 备注 |
| --- | --- | --- |
| `Circle()` | 半径 1.0 | bbox `[-1, +1]` |
| `Square()` | 边长 2.0 | bbox `[-1, +1]` |
| `Rectangle(width=w, height=h)` | 显式 | 默认无 `square_side_length` 参数 |
| `Text(s, font_size=N)` | 高度 ≈ `N / 96` unit | 宽度取决于 `len(s)`（见下） |

## 文本宽度估算

manim 通过 Pango 度量 Text。粗略启发式判断"这个能塞下吗"：

```python
char_width_units = font_size / 96 * 0.55     # 中文，全角
char_width_units = font_size / 96 * 0.45     # 拉丁 / 数字
```

示例：

| 字符串 | font_size | 估算宽度（unit） |
| --- | --- | --- |
| `"110,375"`（6 字符，数字） | 32 | `32/96 × 0.45 × 6 = 0.90` |
| `"消息数"`（3 字符，中文） | 20 | `20/96 × 0.55 × 3 = 0.34` |
| `"命令调用"`（4 字符，中文） | 20 | `20/96 × 0.55 × 4 = 0.46` |
| `"AI 驱动的 Claude Code 使用诊断"`（混合） | 32 | ~6 |

**经验法则：容器宽 ≥ ~1.4 × 文本宽。** 32pt 下 6 位数字要 `card_w ≥ 1.4 × 0.90 = 1.26` unit，但实际有 padding 时要 `card_w ≥ 2 × 0.90 + 0.6 = 2.4` 才有边距。

## 居中的三种方式 — 选对

| 方法 | 效果 | 使用时机 |
| --- | --- | --- |
| `mob.center()` | 把 mobject 的 bbox 中心移到画布中心 `(0,0)` | 想对 mobject 做真正的几何居中 |
| `mob.move_to([x, y, 0])` | mobject 的**中心**（或指定 anchor）落在给定坐标 | 想放到精确 x/y，**尤其是 Text** |
| `mob.shift(UP * y)` | 在 mobject **当前位置**上加相对偏移；对 Text 而言是 baseline-left 的位移 | 在已有位置上加小偏移 |

**经典 bug：**`Text("foo", font_size=44).shift(UP * 0.3)` 肉眼看起来居中，但 `Text` 默认 baseline-left 锚定，`shift` 移动 0.3 单位向上，**不重新居中**。不同宽度的文字，视觉中心不同。

**修法：**`Text("foo", font_size=44).move_to([0, 0.3, 0])` 总是居中，因为 manim 把 mobject 的 bbox 中心放到指定坐标。

## `next_to` vs `move_to`

| 方法 | 锚点 | 模式 |
| --- | --- | --- |
| `a.next_to(b, DOWN, buff=0.3)` | `a` 的中心放在 `b` 中心 `0.3` 下方 | 适合"标签在对象下"布局 |
| `a.next_to(b, DOWN, buff=0.3, aligned_edge=LEFT)` | `a` 的左缘对齐 `b` 的左缘，下方 `0.3` | 适合"标签在对象下，且水平对齐" |
| `a.move_to([x, y, 0])` | 绝对位置 | 适合屏幕锚定元素（标题、页脚、卡片） |

注意：`next_to` 也依赖 bbox 中心——`a` 远小于 `b` 时效果不错；`a` 远大于 `b` 时会溢出偏心。

## Polyline / 多边形居中

要让 polyline 或多边形**视觉居中**：

```
x_min + x_max = 0
y_min + y_max = 0   （如果你也关心垂直居中）
```

如果手画 polyline，绝不能出现 `[-2.4, ..., +1.6]`——视觉中心偏到 `x = -0.4`，不归零。永远镜像：

```python
# 居中，x ∈ [-2, +2]：
top_points = [
    [-2.0,  0.6, 0.0],
    [-1.5,  0.6, 0.0],
    [-1.0,  0.6, 0.0],
    [ 0.0, -0.7, 0.0],  # 峰（向下）
    [ 1.0,  0.6, 0.0],
    [ 1.5,  0.6, 0.0],
    [ 2.0,  0.6, 0.0],
]
```

峰点对齐：标记（如品牌色圆）必须**正好放在**polyline 峰顶点上，即示例的 `(0, -0.7, 0)`。如果放在 `[-0.3, -0.5, 0]`"靠近"峰，视觉上会漂移。

## 网格布局（Group arrangement）

`n` 列 × `m` 行的网格：

```python
card_w, card_h = 3.4, 1.4
hgap, vgap = 0.3, 0.3

# 总宽  = n*card_w + (n-1)*hgap = 3*3.4 + 2*0.3 = 10.8
# 总高  = m*card_h + (m-1)*vgap = 2*1.4 + 1*0.3 = 3.1

# 把组居中到 (0, 0)：
grid_origin_x = -((n - 1) * (card_w + hgap)) / 2       # 最左卡片 CENTER
grid_origin_y =  ((m - 1) * (card_h + vgap)) / 2 + 0.2 # 最上卡片 CENTER（向上偏一点）

# 定位每张卡：
for i in range(n*m):
    r, c = divmod(i, n)
    x = grid_origin_x + c * (card_w + hgap)
    y = grid_origin_y - r * (card_h + vgap)  # 减，往下排
```

`n=3, m=2, card_w=3.4, card_h=1.4, hgap=vgap=0.3`：
- `grid_origin_x = -(2 × 3.7) / 2 = -3.7`
- 列 x 值：`-3.7, 0.0, +3.7`
- 行 y 值：`+0.9, -0.5`
- 总 bbox：x `[-5.4, +5.4]`，y `[-1.2, +1.6]`——在 `[-7.11, +7.11] × [-4, +4]` 内，舒服。

`card_w=4.2`（最初 cc-insights 的 bug）：grid bbox 到 `±5.9`；`font_size=32` 下 6 位数字要约 3.6 unit 宽——**最右文本右缘 `= +5.9 + 1.8 = +7.7`，过画布右缘 +7.11**。**被切。** 那是 bug。

## "在色块里"——覆盖范围检查

如果一个色块（`Rectangle(fill_color=BRAND)`）给副标题/数值当背景，白字/对象必须落在**块顶和块底之间的 y 范围**。

```python
block = Rectangle(width=16, height=10,
                 fill_color=BRAND, fill_opacity=1.0).move_to(ORIGIN)
# 块覆盖 y ∈ [-5, +5]

title    = Text(...).move_to([0,  0.5, 0])   # y=+0.5  ✓ 在内
subtitle = Text(...).move_to([0, -0.6, 0])   # y=-0.6  ✓ 在内
foot     = Text(...).move_to([0, -4.5, 0])   # y=-4.5  ✓ 在内（贴着边）
```

在 s04 reveal 的 bug 里，`align_to(ORIGIN, DOWN)` 只让块覆盖 `[−5, 0]`。副标题在 `y=−0.7`，落在色块**外**——黑底吞字。教训：块要"边到边"，不是"边到中线"。

## rate_functions 让动画更自然

不调 `run_time` 也能调顺滑度的现成函数：

| 函数 | 感觉 | 用途 |
| --- | --- | --- |
| `rate_functions.linear` | 匀速 | 默认 |
| `rate_functions.smooth` | 减速停下 | 文本出现、淡入 |
| `rate_functions.rush_from` | 突然开始，慢收 | 强调"抵达" |
| `rate_functions.there_and_back` | 来回 | 脉动、呼吸（品牌色峰） |
| `rate_functions.ease_in_out_sine` | 对称平滑 | 通用 ease |

cc-insights 风格的品牌色峰脉动：`there_and_back` 是规范选。

## 本文档**不**包含什么

- **3D mobject** — manim 3D 用不同单位体系；超出 v0.20.x CE 动画范围
- **Cairo 形状渲染怪癖** — `Rectangle(corner_radius=...)` 等能用，但 bbox 可能与你预期差零点几单位；务必抽帧检查
- **高 DPI 缩放** — 4K 导出时按 `-ql` 设计，**别**假设像素密度问题

如果真的需要这些，加小节而非新开一份。
