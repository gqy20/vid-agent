# vid-agent

面向技术课程和独立动画的视频生产仓库。当前课程包括 Git Course、GitHub Course 和 Claude Code Course；Remotion 负责课程结构与最终合成，Manim 负责几何关系复杂的原理动画。

## 用途

仓库同时支持系列课程和独立视频，两种主要表达引擎是：

- **算法/数学/品牌叙事** → 用 `manim-viz` skill（程序化，几何精确）
- **产品演示/营销/Rich motion** → 用 `remotion-vid` skill（React 组件，UI 友好）

项目只使用 `.claude/skills/` 内的本地 skill。课程生产还必须经过对应 orchestrator，不能用通用脚本绕过审查与发布门禁。

## 课程体系

| 课程 | 内容目录 | 制作源码 | 当前生产状态 |
| --- | --- | --- | --- |
| Git Course | `git-course/` | `remotion/src/videos/git-course/` | 完整 build、audit、promote、release、publish |
| GitHub Course | `github-course/` | `remotion/src/videos/github-course/` | 1080p candidate/audit 已实现，4K 和发布链阻断 |
| Claude Code Course | `claude-code-course/` | `remotion/src/videos/claude-code-course/` | 内容与旧 composition 迁移中，统一 orchestrator 未实现 |

跨课程共享的生命周期、episode 契约、产物所有权和审查基线见 [`docs/course-production.md`](docs/course-production.md)。各课程的视觉语言和证据要求由自己的 `workflow.md`、`checklist.md` 继续收敛。

## Quickstart

第一次来这个 repo：

```bash
# 装 uv-managed 的 manim
uv sync                              # 装 pyproject 里的依赖

# 烟雾测试
mkdir -p /tmp/media
uv run manim -ql --media_dir /tmp/media \
   .claude/skills/manim-viz/baseline/no-skill/scenes/scenario_6.py CircleFadeIn
```

应该产出：`/tmp/media/videos/.../CircleFadeIn.mp4`。

新做一个动画：

```bash
# 1. 开新项目骨架
.claude/skills/manim-viz/scripts/init_project.sh my-slug 2026-07-01

# 2. 改 src/my-slug.py 写 Scene（先读 .claude/skills/manim-viz/SKILL.md 5 步流程）

# 3. 渲 debug + 抽帧检查
.claude/skills/manim-viz/scripts/render_scene.sh src/my-slug.py <Scene> ql renders/my-slug/renders/debug
.claude/skills/manim-viz/scripts/extract_frames.sh   renders/my-slug/renders/debug/*.mp4 frames 0.1 0.3 0.5 0.7 0.9

# 4. 通过 13 条 checklist 后，渲 final + 出 thumbnail
.claude/skills/manim-viz/scripts/render_scene.sh src/my-slug.py <Scene> qh renders/my-slug/renders/final
ffmpeg -ss MID -i renders/my-slug/renders/final/*.mp4 -frames:v 1 renders/my-slug/thumbnail.png
```

详见 `.claude/skills/manim-viz/SKILL.md` "5 步快速上手"。

## 目录

```
vid-agent/
├── .claude/
│   ├── skills/manim-viz/             # manim skill（自动加载）：SKILL.md + references/(7) + scripts/(5) + baseline/
│   ├── skills/remotion-vid/          # Remotion skill（自动加载）：React → MP4
│   └── CLAUDE.md                     # 项目说明（环境、命令、Skill 索引）
├── git-course/                       # Git 课程内容与规范
├── github-course/                    # GitHub 课程内容与规范
├── claude-code-course/               # Claude Code 课程内容与规范
├── renders/                          # 独立 Manim 项目与 Demo
│   ├── 2026-07-01-ccinsights-brand/  # manim 品牌片：cc-insights 宣传
│   └── 2026-07-01-circle-to-square/  # manim demo：圆→方形变
├── remotion/                         # Remotion 工作项目（pnpm）
│   ├── src/                          # React 组件
│   ├── renders/                      # Remotion 产物
│   └── package.json
├── docs/course-production.md         # 跨课程共享生产契约
├── docs/explore/                     # manim/Remotion 技术调研
├── pyproject.toml                    # uv 项目入口：dependencies: manim>=0.20.1
├── uv.lock
├── .venv/                            # uv 虚拟环境（gitignored）
├── .gitignore                        # baseline / .venv / media 等不提交
└── README.md                         # 本文件
```

`renders/` 保存独立 Manim 项目；`remotion/renders/` 保存 Remotion 与课程产物。独立项目可以各自发布，课程所需的 Manim 片段必须先作为输入资产进入课程 orchestrator，再由 Remotion 合成和统一审查。

## 已发布 Demo

| 主题 | 引擎 | 路径 |
| --- | --- | --- |
| cc-insights 品牌叙事 | manim（带 voice + BGM）| `renders/2026-07-01-ccinsights-brand/` |
| 圆→方形变入门 | manim 入门 | `renders/2026-07-01-circle-to-square/` |

每个 demo 目录里有：`src/<slug>.py` + `renders/debug/<slug>_480p15_*.mp4` + `renders/final/<slug>_1080p60_*.mp4` + `meta.json` + `README.md` + `thumbnail.png`。**完整产物约定见 `.claude/skills/manim-viz/references/render-project-layout.md`**。

## 独立 Manim 项目产物约定

**目录命名**：`renders/<YYYY-MM-DD>-<topic-slug>/`（一条命令 `init_project.sh` 一键起）

**文件约定**（manim）：
```
renders/<date>-<slug>/
├── src/<slug>.py              # Scene 脚本
├── meta.json                  # 任务 + 环境 + 渲染命令 + ffprobe
├── README.md                  # 一句话摘要 + 重现步骤
├── thumbnail.png              # 中点帧预览
└── renders/
    ├── debug/<slug>_480p15_<YYYYMMDD-HHMMSS>.mp4
    └── final/<slug>_1080p60_<YYYYMMDD-HHMMSS>.mp4
```

课程类 Remotion 产物不得套用这套独立项目目录，必须遵守 `docs/course-production.md` 和课程 adapter。

## 怎么选 manim 还是 Remotion

| | manim | Remotion |
| --- | --- | --- |
| 擅长 | 算法/数学/几何可视化、调试动画、品牌叙事 | UI 流程、数据可视化、rich motion design |
| 范式 | Python 程序化（LaTeX-free 用 Unicode）| React 组件 |
| debug 速度 | `-ql` 单 Scene 几秒 | 单 Component 几秒 |
| 视频后处理 | `mmx-cli`：voice（shaonv）、BGM、concat | 内置 `remotion render` |

通常：**数学/算法概念 → manim**；**产品演示/营销 → Remotion**。

## 环境约束

- **uv-only**：用 `uv sync`、`uv add`，**绝不用 `pip install`**（manim 装在 `.venv`，PATH 没 `manim`）。直接调 `manim` 会找不到。
- **无 LaTeX**：`pdflatex`/`latex` 未装。manim 代码里**禁用** `MathTex`、`Tex`、`DecimalNumber`、`Axes.get_axis_labels`、`Axes.add_coordinates`——内部都 spawn `pdflatex`，崩在 `FileNotFoundError: 'latex'`。改用 `Text` + Unicode 上标（`² √ ± − π ∑`）。
- **ffmpeg** 在 PATH（manim 透明调用）。
- **Python >= 3.13**。

## 调试工作流

manim bug **不崩**——只在像素层面暴露（文字偏心、副标题被色块遮、卡片溢出）。**别省抽帧**：

1. 写完 Scene 必须 `-ql` 跑
2. `extract_frames.sh` 抽 5 帧（中点 + 4 分位）
3. 对照 `.claude/skills/manim-viz/references/frame-check.md` 的 13 条 checklist
4. **没通过不能上 -qh、不能 concat**

详细排查 22 条反模式 + 修法见 `references/anti-patterns.md`。

## 后续扩展

- 加新 skill：复制 `.claude/skills/<existing>/` 模板、改 `name:` 描述、`mkdir baseline/`
- 加新独立 Demo：在 `renders/<date>-<slug>/` 下跑 `init_project.sh`
- 加新课程：依次建立 episode schema、workflow/checklist、orchestrator、门禁和 Dashboard adapter，不能先做前端假接入
- 技术调研材料：`docs/explore/`（如 `manim-video-stack.md`、`remotion-license.md`、`cli-video-tools.md`）

## 仓库元信息

- 项目名：`vid-agent`（`pyproject.toml` 里）
- 作者：gqy20（GitHub）
- 创建：2026-06
- 用途：技术课程与宣传/科普/品牌动画生产
- Skills（自动加载）：`.claude/skills/manim-viz` + `.claude/skills/remotion-vid`
- 相关：cc-insights（数据诊断 CLI，gqy20/cc-insights）、cc_plugins（skill 系统，gqy20/cc_plugins）
