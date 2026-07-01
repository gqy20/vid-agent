# uv / LaTeX / ffmpeg 环境契约

> 解释 manim 物理层（Python 版本、依赖、二进制探测）。代码片段、命令、文件名按惯例保留英文。

## uv 工作流（仅此一种）

### 首次安装

```bash
cd /home/qy/workspace/project/ai/manim
uv init --bare --no-readme --name vid-agent       # 仅在 pyproject.toml 缺失时
uv add manim                                     # 把 manim 装到 .venv
uv run manim --version                           # 期望: Manim Community v0.20.x
```

### 渲染

```bash
uv run manim -ql --media_dir /tmp/media scene.py SceneName    # 调试 (480p15)
uv run manim -qm --media_dir /tmp/media scene.py SceneName    # 中等 (720p30)
uv run manim -qh --media_dir /tmp/media scene.py SceneName    # 高清 (1080p60)
uv run manim -qk --media_dir /tmp/media scene.py SceneName    # 4K
```

质量档对照：

| Flag | 分辨率 | fps | 用途 |
| --- | --- | --- | --- |
| `-ql` | 854×480 | 15 | 默认调试 |
| `-qm` | 1280×720 | 30 | 中等复审 |
| `-qh` | 1920×1080 | 60 | 最终复审 |
| `-qk` | 3840×2160 | 60 | 最终导出 |

### 安装验证

```bash
uv run python -c "import manim; print(manim.__version__, manim.__file__)"
```

期望：`0.20.1 /home/qy/workspace/project/ai/manim/.venv/lib/python3.13/site-packages/manim/__init__.py`。

## **不要**做的事

```bash
# ❌ pip 装到错 Python（绑定 miniforge 的 3.12，不会进 .venv）
pip install manim
python -m pip install manim

# ❌ 直接调 manim（PATH 里有 manim 二进制吗？没有）
manim -ql scene.py SceneName

# ❌ 调试期就 -qh（浪费时间）
uv run manim -qh ...    # 做 30 帧测试场景时
```

## LaTeX 探测

写公式或轴标签前：

```bash
which pdflatex latex
# 如都返回 "not found"，每个 MathTex/Tex/DecimalNumber 都会崩
# FileNotFoundError: [Errno 2] No such file or directory: 'latex'
```

### 两种工作模式

**无 LaTeX（本项目默认）：**
- `Text("x²")` Unicode 上标
- `Axes.get_axis_labels()` → 手动 `Text("x") + next_to`
- `Axes.add_coordinates()` → 手动 `Text(f"{x}")` 刻度
- `DecimalNumber(v)` → `Text(f"{v:.2f}")`

**有 LaTeX 装好后：**

```bash
# Linux
sudo apt install texlive-latex-extra texlive-fonts-recommended texlive-science dvisvgm

# macOS（MacTeX ~5GB）
brew install --cask mactex

# 社区推荐轻量：tectonic
# https://tectonic-typesetting.github.io/

# 验证
which pdflatex && pdflatex --version
```

只有 `pdflatex --version` 退出码 0 时才能切回 `MathTex` / `Tex`。

## ffmpeg 探测

```bash
which ffmpeg && ffmpeg -version | head -1
```

manim 透明调用 ffmpeg，按 PATH 寻找。如缺失：

```bash
# macOS
brew install ffmpeg

# Linux
sudo apt install ffmpeg
```

## 缓存陷阱

manim 把 partial-movie 文件缓存在 `media/videos/<scene>/<quality>/partial_movie_files/`。当改 updater 行为或场景结构时，**缓存可能让本应失败的场景糊弄过去**（它重放旧的 partial movie）。

```bash
# 强制重渲
rm -rf media/videos/<scene>/<quality>/partial_movie_files/

# 一行带参数
uv run manim -ql --media_dir /tmp/media --disable_caching scene.py SceneName
```

## 常见渲染错与修法

| 错误 | 原因 | 修法 |
| --- | --- | --- |
| `FileNotFoundError: 'latex'` | LaTeX 缺失但代码调了 `MathTex` / `Axes.get_axis_labels` / `Axes.add_coordinates` / `DecimalNumber` | 用 `Text` 替代；见 SKILL.md "隐式 LaTeX 黑名单" |
| `NameError: name 'DOWN'/'RIGHT'/'UR' is not defined` | 用了 `from manim import *`（不导入常量） | 改用显式 import |
| `NameError: name 'Transform' is not defined` | 忘了 import 动画类 | 加进显式 import 块 |
| `AttributeError: module 'manim' has no attribute 'UP_RIGHT'` | 错短名 | 用 `UR` |
| `Called Scene.play with no animations` | 循环里 `self.play(*[])` | `if fade_anim:` 守护 |
| `KeyError: 'latex'` 或 partial hang | `latex` 子进程找不到 | 同 LaTeX 检测 |
| mp4 产出但只有首帧 | updater silent-freeze | 重命名参数为字面 `dt` |
| `Polyline` 不存在的 import 错误 | manim 0.20.1 无此名 | 用 `VMobject.set_points_as_corners([...])` |

## 快速诊断脚本

```bash
# 1. uv 在 PATH
which uv && uv --version

# 2. manim 在 venv
uv run manim --version

# 3. LaTeX 状态
which pdflatex || echo "LaTeX 缺失 — 只能纯 Text"

# 4. ffmpeg
which ffmpeg && ffmpeg -version | head -1

# 5. 最简 Scene 烟雾测试（圆形 fade in）
uv run manim -ql --media_dir /tmp/media .claude/skills/manim-viz/baseline/no-skill/scenes/scenario_6.py CircleFadeIn

# 6. 检查产出 mp4
ffprobe -show_entries stream=codec_name,width,height,duration \
        -of default=noprint_wrappers=1 \
        /tmp/media/.../CircleFadeIn.mp4
```

如果第 5 步成功并产出 1–2s、有效尺寸的 mp4，环境就是健康的。
