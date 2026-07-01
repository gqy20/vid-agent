#!/usr/bin/env bash
# extract_frames.sh — 从 manim 产出的 mp4 按时间戳抽帧成 PNG
#
# 用法:
#   scripts/extract_frames.sh <mp4_path> <output_dir> [t1 t2 t3 ...]
#
# 时间单位为秒（允许小数）。输出名用毫秒后缀:
#   <mp4_basename>_<ms>P.png  (例: s04_reveal_2000ms.png)
#
# 例子:
#   scripts/extract_frames.sh renders/debug/s04_reveal_*.mp4 frames/s04 0.4 1.2 2.0 3.0 3.6
#   scripts/extract_frames.sh mp4 out/ 0.10 0.30 0.50 0.75 0.90
#
# 输出:
#   <output_dir>/<mp4_basename>_<ms>P.png
#
# 为什么写这个脚本:
#   原版 skill 只教怎么写 manim，没教怎么验证结果。大部分 manim bug 不崩——
#   只是难看（文字偏心、卡溢出、副标题被色块遮住）。修法就是抽帧 + 眼检。
#   见 frame-check.md。

set -euo pipefail

if [[ $# -lt 3 ]]; then
    echo "用法: $0 <mp4_path> <output_dir> <t1> [t2] [t3] ..." >&2
    echo "时间单位为秒，允许小数如 0.10 1.20 2.50。" >&2
    exit 1
fi

mp4="$1"
out_dir="$2"
shift 2

if [[ ! -f "$mp4" ]]; then
    echo "错误: mp4 不存在: $mp4" >&2
    exit 1
fi

mkdir -p "$out_dir"

base=$(basename "$mp4" .mp4)

# 可选：拿时长做合法性检查
duration=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$mp4" 2>/dev/null || echo "0")

extracted=0
for t in "$@"; do
    # 把秒转成毫秒整数（前导零使文件名按字典序就是按时间序）
    ms=$(awk -v t="$t" 'BEGIN { printf "%04d", int(t * 1000) }')
    out="$out_dir/${base}_${ms}ms.png"
    if [[ "$duration" != "0" ]] && (( $(awk -v t="$t" -v d="$duration" 'BEGIN { print (t > d ? 1 : 0) }') )); then
        echo "警告: t=$t 超过时长 $duration — 帧可能是空白" >&2
    fi
    ffmpeg -y -hide_banner -loglevel error \
           -ss "$t" -i "$mp4" -frames:v 1 "$out"
    echo "  $t -> $out"
    extracted=$((extracted + 1))
done

echo "抽取了 $extracted 帧到 $out_dir"
