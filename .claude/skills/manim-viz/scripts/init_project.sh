#!/usr/bin/env bash
# init_project.sh — 在 renders/ 下建完整动画项目骨架
#
# 用法:
#   scripts/init_project.sh <topic_slug> [date]
#
# 参数:
#   topic_slug    小写连字符（如 fourier-square-wave）
#   date          YYYY-MM-DD；默认今天
#
# 创建:
#   renders/<YYYY-MM-DD>-<topic_slug>/
#     ├── meta.json           (任务模板)
#     ├── README.md           (空模板)
#     ├── src/<topic_slug>.py (Hello-world Scene 占位)
#     ├── scripts/  tts/  bgm/  renders/{debug,final}/
#
# 例:
#   scripts/init_project.sh fourier-square-wave
#   scripts/init_project.sh rlc-circuit 2026-08-01
#
# 实现说明:
#   所有 heredoc 使用带单引号的 'EOF_TPL'（禁用变量扩展、命令替换、历史扩展），
#   从而避免 heredoc 内的关键字（如 Python 的 `from`）被外层 bash 误当作命令。
#   占位符 __ID__ / __SLUG__ 在写完后用 sed 替换。

set -euo pipefail

if [[ $# -lt 1 ]]; then
    echo "用法: $0 <topic_slug> [YYYY-MM-DD]" >&2
    exit 1
fi

slug="$1"
date="${2:-$(date +%Y-%m-%d)}"

# 校验 slug
if [[ ! "$slug" =~ ^[a-z0-9][a-z0-9-]{0,30}$ ]]; then
    echo "错误: topic_slug 必须是 ≤32 字符小写字母+连字符；收到 '$slug'" >&2
    exit 1
fi

# 校验 date
if [[ ! "$date" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
    echo "错误: date 必须是 YYYY-MM-DD；收到 '$date'" >&2
    exit 1
fi

id="${date}-${slug}"
proj="renders/${id}"

if [[ -d "$proj" ]]; then
    echo "错误: 已存在 $proj，拒绝覆盖。" >&2
    exit 1
fi

mkdir -p "$proj/src" "$proj/scripts" "$proj/tts" "$proj/bgm" "$proj/renders/debug" "$proj/renders/final"
echo "✓ 建目录 $proj/{src,scripts,tts,bgm,renders/{debug,final}}"

# ---- 1. src/<slug>.py 占位 Scene ----
# 注意 heredoc 标签是 'EOF_TPL'（带单引号，禁用变量扩展和命令替换）。
# 占位符 __ID__ / __SLUG__ 在写完后用 sed 替换。
cat > "$proj/src/__SLUG__.py" <<'EOF_TPL'
"""
__ID__ — 占位 Scene

真实写代码时替换下面 HelloScene 类。约定：
- 显式 import（不要 `from manim import *`）
- 不调 MathTex（除非 pdflatex 装了）
- 走反模式清单：.claude/skills/manim/references/anti-patterns.md
"""

from manim import Scene, Text, BLUE


class HelloScene(Scene):
    def construct(self):
        msg = Text("Replace me", color=BLUE)
        self.play(msg.animate.set_color(BLUE).scale(1.5), run_time=1.0)
        self.wait(0.5)


if __name__ == "__main__":
    import sys
    from manim import config
    config.media_dir = "/tmp/media"
    config.quality = "low_quality"
    HelloScene().render()
    sys.exit(0)
EOF_TPL

# 重命名 + 替换占位符
mv "$proj/src/__SLUG__.py" "$proj/src/__SLUG__.py.tmp"
sed -e "s|__SLUG__|${slug}|g" -e "s|__ID__|${id}|g" \
    "$proj/src/__SLUG__.py.tmp" > "$proj/src/__SLUG__.py"
rm -f "$proj/src/__SLUG__.py.tmp"
# 注意 mv+rename 已替代占位符
mv "$proj/src/__SLUG__.py" "$proj/src/${slug}.py" 2>/dev/null || true
echo "✓ 写 $proj/src/${slug}.py"

# ---- 2. meta.json ----
cat > "$proj/meta.json" <<EOF
{
  "id": "${id}",
  "title": "",
  "created": "${date}T00:00:00+08:00",
  "description": "",
  "scene_class": "HelloScene",
  "script_path": "src/${slug}.py",
  "theme_tags": [],
  "env": {
    "manim_version": "",
    "python": "",
    "latex": "absent",
    "uv_lock_sha": null
  },
  "renders": [],
  "thumbnail": "thumbnail.png",
  "reproduce": {
    "debug": "cd ${proj} && uv run manim -ql --media_dir renders/debug/_build src/${slug}.py HelloScene",
    "final": "cd ${proj} && uv run manim -qh --media_dir renders/final/_build src/${slug}.py HelloScene"
  },
  "notes": "Init Project 模板；填 title/description/env 后删掉这行。"
}
EOF
echo "✓ 写 $proj/meta.json"

# ---- 3. README.md ----
cat > "$proj/README.md" <<EOF
# ${id}

> 一句话描述待填

## 渲染

\`\`\`bash
# debug
uv run manim -ql --media_dir renders/debug/_build src/${slug}.py HelloScene
mv renders/debug/_build/videos/${slug}/480p15/HelloScene.mp4 \\
   renders/debug/${slug}_480p15_\$(date +%Y%m%d-%H%M%S).mp4
rm -rf renders/debug/_build

# final
uv run manim -qh --media_dir renders/final/_build src/${slug}.py HelloScene
mv renders/final/_build/videos/${slug}/1080p60/HelloScene.mp4 \\
   renders/final/${slug}_1080p60_\$(date +%Y%m%d-%H%M%S).mp4
rm -rf renders/final/_build
\`\`\`

## 抽帧检查

\`\`\`bash
.claude/skills/manim/scripts/extract_frames.sh renders/final/${slug}_*.mp4 frames 0.1 0.3 0.5 0.7 0.9
\`\`\`
EOF
echo "✓ 写 $proj/README.md"

# ---- 4. .gitignore ----
cat > "$proj/.gitignore" <<'EOF_TPL'
**/_build/
**/__pycache__/
*.pyc
frames/
EOF_TPL
echo "✓ 写 $proj/.gitignore"

echo
echo "项目建在: $proj"
echo "  ├─ src/${slug}.py          (Hello-world Scene 占位)"
echo "  ├─ meta.json               (任务模板)"
echo "  ├─ README.md               (摘要模板)"
echo "  ├─ renders/{debug,final}/"
echo "  └─ {scripts,tts,bgm}/      (空目录)"
echo
echo "下一步: 改 src/${slug}.py 写真正的 Scene，然后:"
echo "  .claude/skills/manim/scripts/render_scene.sh \\"
echo "    $proj/src/${slug}.py <Scene> ql $proj/renders/debug"
