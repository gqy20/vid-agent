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

### 2. LaTeX 类 API —— 先 `check_latex.sh` 再决定，否则隐式崩

`MathTex` / `Tex` / `Axes.get_axis_labels` / `Axes.add_coordinates` / `DecimalNumber` / `Integer` 都**内部 spawn pdflatex**。LaTeX 缺失时全崩，stack trace 末端 `FileNotFoundError: 'latex'` 让人以为是 LaTeX 问题、实际是 manim 隐式调用。

**先检测，按退出码选路：**

```bash
scripts/check_latex.sh            # 快检 which 三件套（exit 0 可用 / 1 不可用）
scripts/check_latex.sh --probe    # 慢检：试渲染 MathTex 权威确认
```

- **可用（exit 0）** → MathTex / Tex / 轴标签 / DecimalNumber 放心用（真公式 `∫₀¹x²dx=⅓` 比 Unicode 上标专业）。
- **不可用（exit 1）** → 全改 `Text`+Unicode 上标（`Text("x²")`），见 `anti-patterns.md` #3-6 #13。

CJK 中文**始终用 `Text`**（Pango）——Tex/MathTex 无中文字体，与 LaTeX 是否可用无关。

### 3. 渲染每个 Scene 后必须抽帧检查

manim bug**不崩**、**只在像素层面**暴露：文字偏心、色块没盖住副标题、卡片溢出、polyline 中心非 0。完全套用 `references/anti-patterns.md #19-22` 与 `references/frame-check.md` 的 13 条 checklist 解决。

## Wall-clock 预算门禁（编码前必须完成）

> 从"建议"升级为**硬门禁**。这是 manim-viz baseline 里最大的剩余漏洞——
> 跳过规划直接写代码，实际时长经常比目标**短 1–5 秒**（已观察 13.07s vs 12s）。
> 根因：没在编码前把每个 beat 的时长钉死，让 manim 默认 `run_time=1.0` 替你决定节奏。

**写第一行 `construct` 之前，先产出一张 beat × 时长表**（可见计划）：

| beat | 内容 | 动画 | run_time | wait | 小计 |
|------|------|------|----------|------|------|
| 1 标题入场 | FadeIn 标题 | FadeIn | 0.6 | 0.4 | 1.0 |
| 2 主体揭示 | Create 图形 | Create | 1.2 | 0.3 | 1.5 |
| 3 强调 | Indicate 焦点 | Indicate | 0.8 | 0.2 | 1.0 |
| … | | | | | |
| **合计** | | | | | **≈ 目标秒数** |

公式 `total = Σ run_time + Σ wait`，合计应 = 设计目标 ±0.3s。beat 内容骨架见 `references/examples.md`。

**门禁：没有这张表不算"开始编码"。** 照表填 `run_time=`，别留默认。

**验收（渲染后，对应 frame-check.md #12）：**

```bash
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 renders/.../debug/*.mp4
```

实测 vs 表合计，偏差 >0.5s 就回表查哪个 beat 漂移（通常是 wait 漏算，或 Transform 默认 1s 没覆盖）。

## 渲染分辨率：480p 迭代 / 1080p 定稿

调试**别**上来就 `-qh`（1080p60，单次 ~5min）。分阶段省 ~4× 时间：

| 阶段 | 质量 | 分辨率 / fps | 命令 |
|------|------|-------------|------|
| 写代码 + 迭代 | `-ql` | 480p15（<30s/次）| `scripts/render_scene.sh ... ql` |
| 视觉验证（frame-check + frame_audit）| `-ql` 起，看不清升 `-qm` | 480p15 / 720p30 | 同上 |
| **最终定稿** | `-qh` | **1080p60** | `scripts/render_scene.sh ... qh` |

**设计基准 ≠ 渲染分辨率。** 字号、间距、坐标一律按 **1080p 基准** 写（坐标系 14.22×8、字号层级见 `references/style-guide.md`），但**视觉行为在 480p/720p 上验证就够**——几何碰撞、溢出、拥挤都与分辨率无关（`frame_audit.py` 用的就是 1080p 坐标基准）。所有改动在低分辨率跑通后再升 `-qh` 定稿，别在 1080p 上 debug。

## References 索引

8 份长尾文档按需求查阅：

| 文档 | 何时查 |
| --- | --- |
| [`references/api-cheatsheet.md`](references/api-cheatsheet.md) | 写 Scene 时：要哪个 `Scene`/`Transform`/动画常量怎么 import |
| [`references/examples.md`](references/examples.md) | 写第一个 Scene 需要 NL→代码范例 |
| [`references/environment.md`](references/environment.md) | uv 装包、ffmpeg 探测、LaTeX 状态排查 |
| [`references/anti-patterns.md`](references/anti-patterns.md) | 撞错或抽帧不通过：22 条反模式 + 修法 |
| [`references/manim-internals.md`](references/manim-internals.md) | **源码层**：silent freeze 的 `inspect.signature("dt")` 根因、LaTeX subprocess 链、质量档定义、partial_movie_files 分片 |
| [`references/frame-check.md`](references/frame-check.md) | **写完每个 Scene 必读** 13 条视觉检查清单 |
| [`references/geometry-math.md`](references/geometry-math.md) | 文字偏心 / 卡片溢出 / 中心错时：坐标 + 字符宽度公式 |
| [`references/style-guide.md`](references/style-guide.md) | 配色语义 / 1080p 字号层级 / 屏幕分区：让画面"好看"，不只"能跑" |
| [`references/render-project-layout.md`](references/render-project-layout.md) | 渲完 -qh 后：项目目录结构、meta.json schema、命名规则 |

helper 脚本（8 个，缺哪个调哪个）：

| 脚本 | 何时用 |
| --- | --- |
| `scripts/render_scene.sh <script.py> <Scene> <quality> <out_dir>` | 渲一个 Scene（含 cd/mv/清 build）。替换 SKILL.md "5 步" 里 step 2/4 那一串手动命令 |
| `scripts/extract_frames.sh <mp4> <out_dir> [t1 t2 ...]` | 渲完抽 5 帧 → frame-check 13 条 |
| `scripts/bbox_audit.py` | 渲染期包围盒采集：scene.py 继承 `AuditedScene` 即用（render_scene.sh 自动配 PYTHONPATH） |
| `scripts/frame_audit.py [bbox.jsonl] [--strict]` | 渲染后自动审计溢出/重叠/拥挤，退出码可阻断（配合 frame-check） |
| `scripts/check_env.sh` | 任何 install/迁移后确认环境健康（uv/ffmpeg/pdflatex/manim） |
| `scripts/check_latex.sh [--probe]` | 写公式前检测 LaTeX 可用性（exit 0→可用 MathTex / 1→回退 Text+Unicode） |
| `scripts/cleanup.sh [dir] [--dry-run/--force]` | 删 `_build/` `partial_movie_files/` `*.pyc`，迭代多了能盘胀 |
| `scripts/init_project.sh <slug> [date]` | 开新动画一键建 `renders/<date>-<slug>/` 骨架（含 meta/README/占位 src） |

## 怎么选 manim 还是 Remotion

- **manim（这个 skill）**：数学 / 算法可视化，几何变换，**程序化**的科普视频
- **Remotion**（`remotion-vid` skill）：**React 组件驱动**视频，营销 / 产品展示，rich motion design

两个 skill 互补不同范式——选对工具再开始写。
