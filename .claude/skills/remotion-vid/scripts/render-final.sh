#!/usr/bin/env bash
# render-final.sh — 渲染一个 Composition 到带日期产物目录的 tmp/，并 ffprobe。
# 实现 render-project-layout.md 的 tmp → candidates → current 流程前半段。在 Remotion 工程根目录运行。
#
# 用法: scripts/render-final.sh <CompId> <slug> [--debug] [--scale=S]
#   scripts/render-final.sh CCInsightsPromo cc-insights-promo          # tmp 1080p
#   scripts/render-final.sh CCInsightsPromo cc-insights-promo --debug  # debug 720p 草稿
set -euo pipefail
[ $# -ge 2 ] || { echo "用法: $0 <CompId> <slug> [--debug] [--scale=S]" >&2; exit 1; }
COMP="$1"; SLUG="$2"; shift 2
ROLE="tmp"; QUAL="1080p30"; SCALE=""
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

echo "完成。下一步用 scripts/promote.sh $SLUG <label> --candidate \"$OUT\"，评审后 --publish 到 current/"
