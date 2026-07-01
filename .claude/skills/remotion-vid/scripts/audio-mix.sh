#!/usr/bin/env bash
# audio-mix.sh — 配音 + BGM 混音，并 mux 进 Remotion 视频生成 with-audio 版本
# 实现 references/audio-mmx.md 的步骤 3 + 5(方案 A：后端 ffmpeg mux)。
#
# 用法: scripts/audio-mix.sh <id> <slug> [voiceover.mp3] [bgm.mp3]
#   scripts/audio-mix.sh 2026-07-01-cc-insights-promo cc-insights-promo
#   scripts/audio-mix.sh 2026-07-01-cc-insights-promo cc-insights-promo voice.mp3 bgm.mp3
#
# 前置: 配音/BGM 已生成在 renders/<id>/renders/ 下（或自定路径传入）。
# 产出:
#   renders/<id>/renders/mix.mp3                     (混音)
#   renders/<id>/renders/final/<slug>_with-audio_*.mp4 (合流版)
set -euo pipefail
[ $# -ge 2 ] || { echo "用法: $0 <id> <slug> [voiceover.mp3] [bgm.mp3]" >&2; exit 1; }
ID="$1"; SLUG="$2"
DIR="renders/$ID/renders"
VO="${3:-$DIR/voiceover.mp3}"
BGM="${4:-$DIR/bgm.mp3}"
MIX="$DIR/mix.mp3"
[ -f "$VO" ]  || { echo "找不到配音 $VO"; exit 1; }
[ -f "$BGM" ] || { echo "找不到 BGM  $BGM"; exit 1; }

echo "混音: $VO + $BGM → $MIX"
ffmpeg -y -i "$VO" -i "$BGM" \
  -filter_complex "[1:a]volume=0.22[bg];[0:a][bg]amix=inputs=2:duration=first:dropout_transition=0" \
  -c:a libmp3lame -b:a 192k "$MIX"

# 找最新的 silent final mp4
SILENT=$(ls "$DIR/final/${SLUG}_1080p30_"*.mp4 2>/dev/null | grep -v with-audio | tail -1)
if [ -z "$SILENT" ]; then
  echo "找不到 $DIR/final/${SLUG}_1080p30_*.mp4；先跑 scripts/render-final.sh"; exit 1
fi
TS=$(date +%Y%m%d-%H%M%S)
OUT="$DIR/final/${SLUG}_with-audio_${TS}.mp4"
echo "合流: $SILENT + $MIX → $OUT"
ffmpeg -y -i "$SILENT" -i "$MIX" \
  -c:v copy -c:a aac -b:a 192k -shortest "$OUT"
echo "完成 → $OUT"
