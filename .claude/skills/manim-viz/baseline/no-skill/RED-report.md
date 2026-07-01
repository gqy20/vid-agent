# RED Report — Manim Baseline Failure Modes

> 整合 6 份 subagent baseline 报告，提取共性失败模式。
> 为 GREEN 阶段写 `SKILL.md` 提供靶点。
> 报告路径：`/home/qy/workspace/project/ai/manim/red-baseline/`

## 测试矩阵

| ID | 主题 | 复杂度 | 复杂度压力源 | 渲染结果 |
|---|---|---|---|---|
| RED-1 | 圆→方形变 | 低 | 沉淀 + 时间 + 权威 | ✅ 一次过（105s）|
| RED-2 | 二次方程求根公式 | 中 | 沉淀 + 时间 + LaTeX 缺失 | ✅ 撞 3 次错（283s）|
| RED-3 | 旋转矩阵 | 中 | 沉淀 + 时间 + 权威 | ✅ 撞 1 次错（222s）|
| RED-4 | 双井势粒子 Euler 模拟 | 高 | 沉淀 + 时间 | ✅ 撞 silent bug（1341s）|
| RED-5 | 傅里叶级数 5 项叠加 | 高 | **高压权威 vs 缺失环境** | ✅ 顶住暗示（297s）|
| RED-6 | 环境陷阱（uv / ffmpeg / LaTeX） | 低 | 无 | ✅ 一次过（130s）|

**6/6 全部渲染成功，exit=0，生成 mp4**。
**全部跑 `uv run manim -ql --media_dir /tmp/red-media ...`**。

## 提取的 Baseline 弱点（按严重度排序）

### 🔥 致命级：会让脚本不工作或悄悄失败

#### 1. 隐式 MathTex 依赖（**LaTeX 缺失环境下的定时炸弹**）

不写 `MathTex`，代码里调一下就被 spawn `pdflatex`：
- `Axes.get_axis_labels()` ← RED-2 撞墙源
- `Axes.add_coordinates()` ← RED-4 撞墙源
- `NumberLine.add_labels()` ← RED-2 提到
- `DecimalNumber` / `Integer` ← RED-4 提到
- `MathTex` / `Tex` ← 直接

**症状**：`FileNotFoundError: [Errno 2] No such file or directory: 'latex'`，stack trace 末端是 `subprocess._execute_child`。
**解法**：`Text("x") + .next_to(...)` 全部手动替代。
**触发率**：在没有 LaTeX 的环境里 100% 触发。

#### 2. **`add_updater` 参数必须字面叫 `dt`**（**silent freeze**）

manim 0.20.1 的 `Mobject.has_time_based_updater()` 用 `inspect.signature(updater).parameters` 做字面检查：
```python
def step(mob, dt):  # ← "dt" 字面名，必须保留
    ...
```
改名 `dt_wall` / `dt_secs` / `Δt` 后，`self.wait()` **不会** tick 它，**不报错**，画面冻结。
manim 还报 "Played 1 animations"——非常 confusing。

来源：`manim/mobject/mobject.py:get_time_based_updaters`。

**RED-4 第一次渲染就撞了**：粒子冻结 8 秒，只有标题画面。
**解法**：参数名 `dt`，无视 manim 文档对此只字未提。

#### 3. `from manim import *` 污染 → NameError

`from manim import *` 不导入 `DOWN` / `RIGHT` / `UR` 等所有常量，子代理集体撞过：
- RED-2：`NameError: name 'DOWN' is not defined`（明明用了）
- RED-3：`Transform` 没 import 撞 `NameError`
- RED-5：`RIGHT` / `UP` 没 import 撞 `NameError`

subagent 自己最终都选了"显式列举全部 import"（28+ 行 import 块），但**这是反复试错后**才学到的。

---

### 中级：会引发怪异行为或不通过 review

#### 4. 默认渲染档（subagent 不一致）

- RED-1：默认 `-ql`（480p15，调试合理）
- RED-6：默认 `-qh`（1080p60，**调试浪费**）

**subagent 在用户没指定档位时会拍脑袋选**——必须 SKILL.md 明确"调试用 -ql"。

#### 5. 模糊词吸收（"fade in" → Create / FadeIn）

RED-6 用户说"圆形 fade in"，subagent 用了 `Create(circle)`。`Create` 描边动画 ≠ `FadeIn` 透明度过渡。
**subagent 偏好**字面合理的最小实现，**忽略用户视觉语义**。

#### 6. 时长预算混算（`run_time` + `wait` 累加错）

RED-5 第一版 16 秒（每段计时算重了），第二版 9 秒（少算），第三版 12.000 秒才精确。
subagent 不会主动推导"总时长 = Σ 段时长 + 末 wait"。

---

### 轻级：清洁度/偏好

#### 7. 字符串转义

RED-2 / RED-4 都用 **Unicode 路径**（`"y = x² − 5x + 6"`、`"x² + 5x + 6"`）而非 LaTeX 反斜杠——简洁且无转义坑。

#### 8. 公式不上屏就避免 typeset

RED-5 子代理把 `S_N(x) = (4/π) Σ sin(kx)/k` 写在代码里注释，不到屏幕；只把 `"N = 1"` 这类纯字符串上屏——**最小化 LaTeX 需求**。

#### 9. `UR` 不是 `UP_RIGHT`

RED-5 踩过。manim 短名是 `UR`，不是 `UP_RIGHT`（这个不直观）。

---

## API 选择决策表（subagent 自己归纳）

| 决策点 | ✅ 选 | ❌ 拒 | 来源 |
|---|---|---|---|
| 形变（同拓扑）| `Transform(src, tgt)` | `ReplacementTransform`（无理由不必要）| RED-1 |
| 形变（要保留两份） | `ReplacementTransform` | — | (规约) |
| 形变（要 ghost trail） | `TransformFromCopy` | — | (规约) |
| 几何旋转 | `Rotate(mob, angle, about_point=ORIGIN)` | `ApplyMatrix`（一次性 snap）| RED-3 |
| 坐标系（带刻度）| `Axes(x_range, y_range)` | `NumberPlane` / 手画 Line | RED-3 |
| 物理模拟 + 轨迹 | `add_updater` + `always_redraw` | `TracedPath` | RED-4 |
| 公式（无 LaTeX）| `Text("x²")` | `MathTex(r"x^2")` | 全部 |
| 出现（不强调描边） | `FadeIn` | `Create`（描边，重且慢） | (规约) |
| 出现（画线/函数图）| `Create` | `FadeIn`（看不见）| RED-1 |

> **注意**：RED-1 / RED-6 还把 `Create` 用在 `Circle` 上——subagent 自选，**没有"必须 FadeIn" 的硬规**。这是合理化原文暴露的偏好，不是 baseline 弱点。

## 环境契约（uv 专属）

成功跑通的全部 subagent 都遵循：
```
uv run manim -ql --media_dir /tmp/red-media <script>.py <SceneName>
```

失败子代理反模式：
- ❌ `pip install manim`（RED-6 检测到会装到 miniforge 的 Python 3.12，不进 .venv）
- ❌ `python -m pip install manim`（同上）
- ❌ `manim`（不在 PATH——`.venv/bin/manim` 直接调可以，但 `uv run` 更标准）
- ❌ 不探测 LaTeX 直接写 MathTex
- ❌ 不探测 ffmpeg 就默认系统能用

## 共同反模式（subagent 自己列的反模式，去重合并）

7 大类共 18 条，全部来自 subagent 真实撞过的坑：

1. **隐式 MathTex 依赖**：不调用 `Axes.get_axis_labels` / `Axes.add_coordinates` / `NumberLine.add_labels` / `get_graph_label`
2. **必须显式 import**：所有方向常量（UP/DOWN/LEFT/RIGHT/ORIGIN/UR/DR/IN/OUT）+ 所有 mobject 类 + 所有动画类（Create/Write/Transform/Rotate/ReplacementTransform）+ 颜色常量
3. **add_updater 参数名必须字面叫 `dt`**（silent freeze）
4. **`from manim import *` 禁止**（会漏 import）
5. **`UR` 不要写 `UP_RIGHT`**（不存在）
6. **`self.play(*[])` 空动画会崩**：循环里 fade_anim 列表要 `if fade_anim:` 守卫
7. **空 `axes.plot()` 默认 `x_range` 切片**：曲线会被切；要显式给 `x_range`
8. **空 `axes.add_coordinates()` 触发 MathTex**：用 `Text` 自己摆刻度
9. **时长预算要严格 `run_time + wait` 累加**：先列时序再写代码
10. **默认 `-ql` 调试**，最终才 `-qh/-qk`
11. **字符串优先 Unicode** (`² √ ± − ∑ π`) 而非 LaTeX 反斜杠
12. **`ValueTracker` 适合 1-D 数值动画**，物理积分用 `add_updater` 直接 mutate `self` 状态
13. **不要 `Transform(arrow, new_arrow)`**：会插值 Arrow 的 stroke_width / tip，旋转过程畸形
14. **`Dot.color` 在 0.20.1 不是 `.animate` 的好目标**——用 `copy().set_color(...) + FadeIn + ReplacementTransform` 更稳
15. **物理积分器不一定保能量**（Euler 显式不 symplectic），调试时显示 E 漂移作为 hint
16. **manim caching 会掩盖 updater bug**：调试时 `--disable_caching` 或删 `partial_movie_files/`
17. **`Text(font_size)` 在 -ql 是 480p15 适配，升档需同步调大**
18. **`axes.c2p(x, y)` 而不是 `np.array([x,y,0])`**：坐标系变换自带

## 给 GREEN 阶段的写作指南

按 writing-skills 铁律——写最小 SKILL.md 解决**已观察到**的失败：

**SKILL.md 必含**：
1. **`description`**：只写触发条件（"Use when writing ManimCE animations from NL..."）
2. **环境契约**：`uv run manim -ql ...`、`ffmpeg`/`LaTeX` 探测
3. **最小可跑模板**：显式 import 块 + Scene + construct
4. **API 选择决策表**：RED 表中那 9 行
5. **`dt` 参数陷阱**：大红字警告 silent freeze
6. **隐式 MathTex API 黑名单**：`Axes.get_axis_labels` 等
7. **渲染命令清单**

**`api-cheatsheet.md` 必含**：
- 显式 import 推荐列表（按场景分组）
- 变换三件套对比表
- 物理模拟 + updater 模板

**`examples.md` 必含**：
- 3 个 NL→代码对（渐进难度）

**`environment.md` 必含**：
- uv 工作流
- LaTeX 探测 + 失败表
- `--disable_caching` 等调试技巧

**`anti-patterns.md` 必含**：
- 18 条反模式具体修复方案

---

## 已观察到 subagent 的"本能合理化"

值得 GREEN 阶段在 SKILL.md 中显式 counter：

| 合理化 | 出现的 subagent |
|---|---|
| "我用 pip 也可以装 manim" | RED-6（明确鉴别了但显示推力） |
| "我们组都用 MathTex，LaTeX 应该装好了" | RED-5（顶住了） |
| "默认用 -qh 输出更好看" | RED-6 |
| "用户说 fade in 用 Create 也行" | RED-6 |
| "我 TimeTracker / ValueTracker 会更 idiom" | (RED-4 考虑过但拒绝) |
| "我已经写好一半了，就别大改" | 全部（沉淀成本诱惑） |

## 下一步：GREEN 阶段

将写：
- `/home/qy/.claude/skills/manim/SKILL.md`（实际是 `/home/qy/workspace/project/ai/manim/.claude/skills/manim/SKILL.md`）
- 4 个 supporting 文档（api-cheatsheet / examples / environment / anti-patterns）

预计 SKILL.md 主体 ≤150 行（按 writing-skills 指南 "frequently-loaded skills <200 words"，
这里是 technique skill，期望 <500 行）。

**目录尚未创建**——按 writing-skills 铁律 "RED 阶段 skill 必须不存在"。GREEN 才开始建。
