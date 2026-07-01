# vid-agent — 项目说明

## 环境

- Python 仅通过 **uv** 管理。`manim` 装在 `.venv`；PATH 里没有 `manim`。永远 `uv run manim ...`。
- **LaTeX 按 `check_latex.sh` 检测结果走，不写死**：当前机器 TeX Live 2025 装在 `~/workspace/soft/texlive/2025/`，pdflatex/latex/dvisvgm 三件套齐全，`MathTex`/`Tex` 可用；换环境若检测不可用则回退 `Text`+Unicode 上标。CJK 中文**始终**用 `Text`（Tex 无中文字体支持）。检测：`.claude/skills/manim-viz/scripts/check_latex.sh [--probe]`（exit 0 可用 / 1 不可用）。
- `ffmpeg` 在 PATH 里（manim 透明调用）。
- 调试默认质量 `-ql`（480p15）。`-qh` / `-qk` 留作最终导出。

## manim-viz skill

`.claude/skills/manim-viz/` 自动被 Claude Code 加载。对自然语言数学描述、几何变换、可视化证明触发。写 manim 代码前必读；遇到以下陷阱（silent updater freeze、隐式 LaTeX API、import 完整性、wall-clock 预算）务必按它说的做。

## remotion-vid skill

`.claude/skills/remotion-vid/` 覆盖打磨过的 Remotion（React → MP4）视频：产品宣传、品牌开场、解释视频、终端/数据动画。与 manim 同样的多文档布局（SKILL.md + 反模式 etc.）。写 Remotion 代码前必读。Top 陷阱：首次渲染卡住要等 ~150 MB Chrome Headless Shell 下载（修法：用 `setBrowserExecutable` 指本地 Chrome）、`@remotion/google-fonts` 在渲染时拉取（改用本地 `fc-list` 字体）、"看着不专业"=跳过了官方 github.com/remotion-dev/skills。工作的项目在 repo 根的 `remotion/`。

## 项目结构

```
vid-agent/
├── .claude/
│   ├── skills/manim-viz/                       # manim skill（SKILL.md + references/(8) + scripts/(8)）
│   ├── skills/remotion-vid/        # Remotion skill（SKILL.md + references/(8) + scripts/(6)）
│   └── CLAUDE.md                                # 本文件
├── pyproject.toml                                # uv 项目（dependencies: manim>=0.20.1）
├── uv.lock
├── .venv/                                        # gitignored
│   # 注：TDD-for-documentation 历史产物在 .claude/skills/manim-viz/baseline/（skill 内）。
└── renders/                                      # 用户作品动画，一项目一目录
    └── <YYYY-MM-DD>-<topic-slug>/
        ├── meta.json                             # 任务 + 环境 + 渲染命令 + ffprobe
        ├── README.md                             # 一句话摘要 + 重现步骤
        ├── thumbnail.png                         # 中点帧预览
        ├── src/<topic_slug>.py                   # Scene 脚本
        └── renders/
            ├── debug/<topic_slug>_480p15_<timestamp>.mp4
            └── final/<topic_slug>_1080p60_<timestamp>.mp4
```

（repo 根的 `remotion/` 是 remotion-vid skill 的工作项目。渲染视频与 manim 同款产物约定：`remotion/renders/<YYYY-MM-DD>-<slug>/` 含 `meta.json` + `README.md` + `thumbnail.png` + `renders/{debug,final}/<slug>_<q>_<ts>.mp4`。两个 demo 在那里：cc-insights-promo 和 brand-intro。与上方 manim/uv 工作独立。）

## 参考命令

烟雾测试渲染（最简单的 1 秒 fade in）：

```bash
mkdir -p /tmp/media
uv run manim -ql --media_dir /tmp/media .claude/skills/manim-viz/baseline/no-skill/scenes/scenario_6.py CircleFadeIn
```

按标准 `renders/` 项目布局渲染（debug）：

```bash
cd renders/<project-id>
uv run manim -ql --media_dir renders/debug/_build src/<topic_slug>.py <SceneName>
mv renders/debug/_build/videos/<basename>/480p15/<SceneName>.mp4 \
   renders/debug/<topic_slug>_480p15_$(date +%Y%m%d-%H%M%S).mp4
rm -rf renders/debug/_build
```

（完整模板、`meta.json` schema、最终渲染 / thumbnail 命令见 `.claude/skills/manim-viz/references/render-project-layout.md`。）

查 manim 版本：

```bash
uv run manim --version
```

写公式前检测 LaTeX 是否可用（决定用 `MathTex` 还是 `Text`+Unicode）：

```bash
.claude/skills/manim-viz/scripts/check_latex.sh            # exit 0 可用 / 1 不可用
.claude/skills/manim-viz/scripts/check_latex.sh --probe    # 试渲染权威确认
```

## 这个 skill 怎么写出来的（历史）

skill 按 TDD-for-documentation（RED → GREEN → REFACTOR）写：

1. **RED** —— 6 个 subagent 给同样的 NL 请求、但没有任何 skill 访问；它们的失败记在 `.claude/skills/manim-viz/baseline/no-skill/`。最关键发现：`Axes.get_axis_labels()` 隐式用 MathTex；updater 形参必须字面叫 `dt`（否则 silent freeze）；`from manim import *` 反复撞 `NameError`。
2. **GREEN** —— 写 `SKILL.md` + 4 份 supporting docs（api-cheatsheet / examples / environment / anti-patterns），针对那些具体失败。
3. **REFACTOR** —— 同 6 个 subagent 带 skill 再跑，验证 silent-freeze、MathTex 隐式依赖、权威暗示抵抗、渲染档默认这四条都顶住了。

`.claude/skills/manim-viz/baseline/{no-skill,with-skill}/` 记录全流程与剩余漏洞（主要是长多阶段场景的 wall-clock 预算漂移）。整个 `.claude/skills/manim-viz/baseline/` 写进 `.gitignore`，不进 git——它是该 skill 的开发过程产物，与 skill 同寿。
