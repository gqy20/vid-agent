#!/usr/bin/env bash
# render-final.sh — 渲染一个 Composition 到带日期的产物目录，并 ffprobe + 抽 thumbnail。
# 实现 render-project-layout.md 的步骤 4-6。在 Remotion 工程根目录运行。
#
# 用法: scripts/render-final.sh <CompId> <slug> [--debug] [--scale=S]
#   scripts/render-final.sh CCInsightsPromo cc-insights-promo          # final 1080p
#   scripts/render-final.sh CCInsightsPromo cc-insights-promo --debug  # debug 720p 草稿
set -euo pipefail
[ $# -ge 2 ] || { echo "用法: $0 <CompId> <slug> [--debug] [--scale=S]" >&2; exit 1; }
COMP="$1"; SLUG="$2"; shift 2
ROLE="final"; QUAL="1080p30"; SCALE=""
for a in "$@"; do
  case "$a" in
    --debug)   ROLE="debug"; QUAL="720p30"; SCALE="--scale=0.667" ;;
    --scale=*) SCALE="$a" ;;
  esac
done
ID="$(date +%Y-%m-%d)-$SLUG"; TS="$(date +%Y%m%d-%H%M%S)"
DIR="renders/$ID/renders/$ROLE"; mkdir -p "$DIR"
OUT="$DIR/${SLUG}_${QUAL}_${TS}.mp4"

echo "渲染 $COMP → $OUT"
pnpm exec remotion render "$COMP" "$OUT" --concurrency=4 $SCALE

echo "== ffprobe =="
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,r_frame_rate,nb_frames \
  -show_entries format=duration,bit_rate,size -of default=noprint_wrappers=1 "$OUT"

if [ "$ROLE" = "final" ]; then
  DUR=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$OUT")
  MID=$(awk "BEGIN{printf \"%.2f\", $DUR/2}")
  THUMB="renders/$ID/thumbnail.png"
  ffmpeg -y -ss "$MID" -i "$OUT" -frames:v 1 "$THUMB" 2>/dev/null && echo "thumbnail → $THUMB"
fi
echo "完成。记得写/更新 renders/$ID/meta.json 与 README.md"
