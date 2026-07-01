#!/usr/bin/env bash
# 渲染前抽帧自检：每个代表帧渲一张 still（见 still-check.md）。
# 用法: ./check-frames.sh <CompId> <帧号> [帧号 ...]
#   ./check-frames.sh Promo 90 300 470 880 1200
# 输出: out/check/f<帧号>.png （全片渲染前逐张检查）
set -euo pipefail

[ $# -ge 2 ] || { echo "用法: $0 <CompId> <帧号> [帧号 ...]" >&2; exit 1; }
COMP="$1"; shift
OUT="out/check"; mkdir -p "$OUT"

for fr in "$@"; do
  echo "--- 抽帧 $fr ---"
  pnpm exec remotion still "$COMP" "$OUT/f$fr.png" --frame="$fr" 2>&1 | tail -1
done
echo "完成 -> $OUT/  （全片渲染前逐张检查 PNG）"
