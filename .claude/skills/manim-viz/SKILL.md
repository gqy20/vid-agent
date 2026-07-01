---
name: manim-viz
description: Use when writing Manim Community Edition (manim 0.20.x) animation scripts from natural-language or mathematical descriptions; symptoms include `FileNotFoundError: 'latex'` from `Axes.get_axis_labels`, silent updater freezes during `self.wait()` despite `Played N animations` log, repeated `NameError` on `DOWN`/`UR`/`RIGHT` after `from manim import *`, or defaulting to `-qh` renders during debug.
user-invocable: true
version: 1.0.0
tags:
  - animation
  - math
  - video
  - manim
dependencies:
  uv: any
  ffmpeg: ">=4.0"
---

# Manim Community Edition

> **5 步写出可发布的数学动画**：写 Scene → -ql 跑 → 抽帧检查 → -qh 跑 → 按 `renders/<date-topic>/` 发布。

## 何时用

写 **NL→manim 代码** 时。典型触发：
- `FileNotFoundError: 'latex'`（LaTeX 缺失 + 用了 `MathTex`/`Axes.get_axis_labels`）
- `NameError: 'DOWN'/'UR'/'RIGHT' after from manim import *`
- manim 跑过但画面冻结 / 数字变形 / 卡片溢出画面外
- 默认上 `-qh`，单次迭代 5 分钟

## 5 步快速上手

```
1. 项目骨架（如首次）
   scripts/init_project.sh my-slug 2026-07-01   ← 一次性建完整目录
   
2. 改 src/<slug>.py 写 Scene（参考 references/examples.md）
   ├─ 显式 import（绝不用 `from manim import *`）
   ├─ 不调 MathTex / Axes.get_axis_labels / DecimalNumber
   │  └─ 改用 Text + Unicode + 手动 next_to（references/api-cheatsheet.md）
   │
3. 渲 debug + 抽帧检查（scripted）
   scripts/render_scene.sh src/<slug>.py <Scene> ql renders/<id>/renders/debug
   scripts/extract_frames.sh   renders/<id>/renders/debug/*.mp4 frames 0.1 0.3 0.5 0.7 0.9
   ├─ 看 5 张 PNG，walk references/frame-check.md 的 13 条 checklist
   ├─ 失败 → 改 Scene，重跑 step 3（脚本会复用 build/)
   └─ 通过 → step 4
   │
4. 渲 final
   scripts/render_scene.sh src/<slug>.py <Scene> qh renders/<id>/renders/final
   │
5. thumbnail + 填 meta.json（参考 references/render-project-layout.md）
   ffmpeg -ss MID -i renders/<id>/renders/final/*.mp4 -frames:v 1 renders/<id>/thumbnail.png
```

## 3 个最致命的陷阱（其余 19 条在 references/anti-patterns.md）

### 1. updater 形参必须字面叫 `dt` —— 否则 silent freeze

`Mobject.has_time_based_updater()` 用 `inspect.signature` 字面检查形参名。改名 `dt_wall` 后 `self.wait()` 不 tick，**画面冻结**，manim 日志照常 `Played N animations`。

```python
particle.add_updater(lambda m, dt: m.move_to(...))     # ✅
particle.add_updater(lambda m, dt_wall: m.move_to(...)) # ❌ silent freeze
```

### 2. 不用 MathTex 系列 —— 隐式 LaTeX 崩你没商量

`MathTex` / `Tex` / `Axes.get_axis_labels` / `Axes.add_coordinates` / `DecimalNumber` / `Integer` 都**内部 spawn pdflatex**。LaTeX 缺失环境全崩，且 stack trace 末端 `FileNotFoundError: 'latex'` 让人以为是 LaTeX 的问题实际是 manim 隐式调用。

### 3. 渲染每个 Scene 后必须抽帧检查

manim bug**不崩**、**只在像素层面**暴露：文字偏心、色块没盖住副标题、卡片溢出、polyline 中心非 0。完全套用 `references/anti-patterns.md #19-22` 与 `references/frame-check.md` 的 13 条 checklist 解决。

## Wall-clock 预算硬规则

```
total = Σ self.play(..., run_time=X) + Σ self.wait(Y)
```

**先纸上列，后写代码**。subagent 跳过这一步后实际时长经常比目标**短 1–5 秒**（已观察到 13.07s vs 12s 目标）。

## References 索引

7 份长尾文档按需求查阅：

| 文档 | 何时查 |
| --- | --- |
| [`references/api-cheatsheet.md`](references/api-cheatsheet.md) | 写 Scene 时：要哪个 `Scene`/`Transform`/动画常量怎么 import |
| [`references/examples.md`](references/examples.md) | 写第一个 Scene 需要 NL→代码范例 |
| [`references/environment.md`](references/environment.md) | uv 装包、ffmpeg 探测、LaTeX 状态排查 |
| [`references/anti-patterns.md`](references/anti-patterns.md) | 撞错或抽帧不通过：22 条反模式 + 修法 |
| [`references/frame-check.md`](references/frame-check.md) | **写完每个 Scene 必读** 13 条视觉检查清单 |
| [`references/geometry-math.md`](references/geometry-math.md) | 文字偏心 / 卡片溢出 / 中心错时：坐标 + 字符宽度公式 |
| [`references/render-project-layout.md`](references/render-project-layout.md) | 渲完 -qh 后：项目目录结构、meta.json schema、命名规则 |

helper 脚本（5 个，缺哪个调哪个）：

| 脚本 | 何时用 |
| --- | --- |
| `scripts/render_scene.sh <script.py> <Scene> <quality> <out_dir>` | 渲一个 Scene（含 cd/mv/清 build）。替换 SKILL.md "5 步" 里 step 2/4 那一串手动命令 |
| `scripts/extract_frames.sh <mp4> <out_dir> [t1 t2 ...]` | 渲完抽 5 帧 → frame-check 13 条 |
| `scripts/check_env.sh` | 任何 install/迁移后确认环境健康（uv/ffmpeg/pdflatex/manim） |
| `scripts/cleanup.sh [dir] [--dry-run/--force]` | 删 `_build/` `partial_movie_files/` `*.pyc`，迭代多了能盘胀 |
| `scripts/init_project.sh <slug> [date]` | 开新动画一键建 `renders/<date>-<slug>/` 骨架（含 meta/README/占位 src） |

## 怎么选 manim 还是 Remotion

- **manim（这个 skill）**：数学 / 算法可视化，几何变换，**程序化**的科普视频
- **Remotion**（`remotion-vid` skill）：**React 组件驱动**视频，营销 / 产品展示，rich motion design

两个 skill 互补不同范式——选对工具再开始写。
