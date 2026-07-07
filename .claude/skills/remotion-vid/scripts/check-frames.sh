#!/usr/bin/env bash
# 抽帧自检（见 still-check.md）。
# 用法:
#   ./check-frames.sh <CompId> <帧号> [帧号 ...]       # Remotion still 快速检查
#   ./check-frames.sh --video out.mp4 [输出目录]       # encoded mp4 每秒 2 帧连续检查
set -euo pipefail

if [ "${1:-}" = "--video" ]; then
  [ $# -ge 2 ] || { echo "用法: $0 --video <mp4> [输出目录]" >&2; exit 1; }
  VIDEO="$2"
  OUT="${3:-out/check}"
  [ -f "$VIDEO" ] || { echo "找不到视频: $VIDEO" >&2; exit 1; }
  mkdir -p "$OUT"
  find "$OUT" -maxdepth 1 -type f \( -name 'f_*.jpg' -o -name 'contact_2fps*.jpg' \) -delete
  echo "--- 从 encoded mp4 每秒抽 2 帧: $VIDEO ---"
  ffmpeg -hide_banner -loglevel error -y -i "$VIDEO" -vf fps=2 "$OUT/f_%04d.jpg"
  echo "--- 生成 2fps contact sheet（多页，每页最多 5 帧）---"
  ffmpeg -hide_banner -loglevel error -y -i "$VIDEO" \
    -vf "fps=2,scale=960:-1,tile=5x1" "$OUT/contact_2fps_%03d.jpg"
  echo "完成 -> $OUT/  （逐张 f_*.jpg + contact_2fps_*.jpg）"
  exit 0
fi

[ $# -ge 2 ] || { echo "用法: $0 <CompId> <帧号> [帧号 ...] 或 $0 --video <mp4> [输出目录]" >&2; exit 1; }
COMP="$1"; shift
OUT="out/check"; mkdir -p "$OUT"

for fr in "$@"; do
  echo "--- 抽帧 $fr ---"
  pnpm exec remotion still "$COMP" "$OUT/f$fr.png" --frame="$fr" 2>&1 | tail -1
done
echo "完成 -> $OUT/  （全片渲染前逐张检查 PNG）"
