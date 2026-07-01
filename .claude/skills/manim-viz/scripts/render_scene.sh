#!/usr/bin/env bash
# render_scene.sh — 把"渲染单个 Scene + 移产物 + 清 build"做成一条原子命令
#
# 用法:
#   scripts/render_scene.sh <script.py> <SceneName> <quality> <output_dir> [extra_args...]
#
# 参数:
#   script.py    manim 脚本路径（绝对或相对）
#   SceneName    该脚本里要渲染的 Scene 类名
#   quality      ql | qm | qh | qk
#   output_dir   产物 mp4 落到的目录（自动 mkdir -p）
#   extra_args   透传给 manim，可选
#
# 行为:
#   1. cd 到 script.py 同目录（这样 brand/ 子目录能从同 src/ 找 _lib.py）
#   2. mktemp 建临时 build 目录
#   3. uv run manim -<q> --media_dir <build> <script>.py <SceneName> [extras]
#   4. 找产出的 <SceneName>.mp4，移走并按命名规范写
#   5. 删除临时 build，输出 ffprobe 时长
#
# 命名: <script_basename>_<quality>_<YYYYMMDD-HHMMSS>.mp4
# 例: src_brand_s06_demo_tease_qh_20260701-005500.mp4
#
# 例:
#   scripts/render_scene.sh src/brand/s06_demo_tease.py DemoTease qh renders/final
#   scripts/render_scene.sh /abs/hero.py Hero ql /tmp/out

set -euo pipefail

# ---- 参数检查 ----
if [[ $# -lt 4 ]]; then
    echo "用法: $0 <script.py> <SceneName> <quality> <output_dir> [extra manim args...]" >&2
    echo "       quality ∈ {ql|qm|qh|qk}" >&2
    exit 1
fi

script="$1"
scene="$2"
quality="$3"
output_dir="$4"
shift 4

case "$quality" in
    ql|qm|qh|qk) ;;
    *) echo "错误: quality 必须是 ql|qm|qh|qk 之一，收到 '$quality'" >&2; exit 1 ;;
esac

if [[ ! -f "$script" ]]; then
    echo "错误: 脚本文件不存在: $script" >&2
    exit 1
fi

# ---- 让 scene.py 能 import skill 自带的 Python helper（bbox_audit 等）----
# render_scene.sh 自己就在 skill/scripts/ 下；把它加进 PYTHONPATH，用户的
# scene.py 即可 `from bbox_audit import AuditedScene`，无需拷贝、无需改 sys.path。
SKILL_SCRIPTS=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
export PYTHONPATH="${SKILL_SCRIPTS}:${PYTHONPATH:-}"

# ---- 准备输出目录与临时 build ----
mkdir -p "$output_dir"
build_dir=$(mktemp -d -t manim-build-XXXXXX)
trap 'rm -rf "$build_dir"' EXIT   # 退出时必清理

# ---- 关键: cd 到 script.py 同目录 ----
# manim 0.20.x 把脚本所在目录加进 sys.path[0]。
# brand/*.py 走 src/_lib.py 必须 cwd 在 src/。
script_dir=$(dirname "$(realpath "$script")")
cd "$script_dir"

script_basename=$(basename "$script" .py)
ts=$(date +%Y%m%d-%H%M%S)
target="$output_dir/${script_basename}_${quality}_${ts}.mp4"

# ---- 渲染 ----
# 显式传 quality 与 media_dir。剩余的 extra args 透传 (例如 --disable_caching)
echo "▶ uv run manim -$quality --media_dir $build_dir $(basename "$script") $scene $*"
uv run manim "-${quality}" --media_dir "$build_dir" \
       "$(basename "$script")" "$scene" "$@"

# ---- 定位产物 ----
# manim 0.20.x 实际输出结构:
#   <media_dir>/videos/<script_basename_without_ext>/<quality>/<SceneName>.mp4
# 用文件名搜索最稳（mp4 名字在树中唯一）
src_mp4=$(find "$build_dir" -name "${scene}.mp4" 2>/dev/null | head -1)

if [[ -z "$src_mp4" ]]; then
    echo "错误: 渲染完没找到 ${scene}.mp4（预期: $build_dir/videos/${script_basename}/${quality}/${scene}.mp4）。Build 留在 $build_dir 排查。" >&2
    trap - EXIT   # 保留 build 供调试
    exit 2
fi

# ---- 移产物 ----
mv "$src_mp4" "$target"

# ---- 报时 ----
if command -v ffprobe >/dev/null 2>&1; then
    duration=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$target" 2>/dev/null)
    size=$(stat -c %s "$target" 2>/dev/null || stat -f %z "$target" 2>/dev/null)
    printf "✓ %s  %.2fs  %s B\n" "$target" "${duration:-?}" "${size:-?}"
else
    printf "✓ %s\n" "$target"
fi
