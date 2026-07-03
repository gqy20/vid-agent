#!/usr/bin/env bash
# Stable final-render pipeline for Remotion compositions.
# Run from the Remotion project root.
#
# Usage:
#   scripts/render-final.sh [CompId] [slug]
#
# Environment:
#   ENTRY=src/index.ts
#   OUT_ROOT=renders/2026-07-01-cc-insights-promo/renders/final
#   AUDIO_FILE=public/mix-cc-insights-52s.m4a
#   CHUNK_FRAMES=600
#   JOBS=1
#   CONCURRENCY=8
#   TIMEOUT=120000
#   CRF=18
#   END_FRAME_OFFSET=1   render 0..duration-1-END_FRAME_OFFSET, avoids unstable tail frame
#   RESUME=1             reuse already valid chunks in the same TS work dir
#   SKIP_AUDIO=0         set 1 to only keep visual output
set -euo pipefail

COMP="${1:-CCInsightsPromo}"
SLUG="${2:-cc-insights-promo}"
ENTRY="${ENTRY:-src/index.ts}"
OUT_ROOT="${OUT_ROOT:-renders/2026-07-01-cc-insights-promo/renders/final}"
AUDIO_FILE="${AUDIO_FILE:-public/mix-cc-insights-52s.m4a}"
CHUNK_FRAMES="${CHUNK_FRAMES:-600}"
JOBS="${JOBS:-1}"
CONCURRENCY="${CONCURRENCY:-8}"
TIMEOUT="${TIMEOUT:-120000}"
CRF="${CRF:-18}"
END_FRAME_OFFSET="${END_FRAME_OFFSET:-1}"
RESUME="${RESUME:-1}"
SKIP_AUDIO="${SKIP_AUDIO:-0}"
TS="${TS:-$(date +%Y%m%d-%H%M%S)}"

RUN_DIR="$OUT_ROOT/${SLUG}_${TS}_work"
VISUAL="$OUT_ROOT/${SLUG}_${TS}_visual.mp4"
AUDIO_TRIMMED="$RUN_DIR/audio_${TS}.m4a"
FINAL="$OUT_ROOT/${SLUG}_${TS}_final.mp4"
REPORT="$RUN_DIR/render-report.json"
FRAMES_DIR="$RUN_DIR/check-frames"
CHUNK_STATS="$RUN_DIR/chunk-stats.jsonl"
FINAL_PROBE="$RUN_DIR/final-ffprobe.json"
STARTED_AT="$(date +%s)"

mkdir -p "$OUT_ROOT" "$RUN_DIR" "$FRAMES_DIR"

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    exit 1
  }
}

need_cmd pnpm
need_cmd ffmpeg
need_cmd ffprobe

probe_comp_line() {
  pnpm exec remotion compositions "$ENTRY" --timeout="$TIMEOUT" |
    awk -v comp="$COMP" '$1 == comp {print $0; found=1; exit} END {if (!found) exit 1}'
}

echo "== preflight =="
COMP_LINE="$(probe_comp_line)" || {
  echo "Could not find composition '$COMP' in $ENTRY" >&2
  exit 1
}
FPS="$(awk '{print $2}' <<<"$COMP_LINE")"
WIDTH_HEIGHT="$(awk '{print $3}' <<<"$COMP_LINE")"
TOTAL_FRAMES="$(awk '{print $4}' <<<"$COMP_LINE")"

if [ "$TOTAL_FRAMES" -le 0 ]; then
  echo "Invalid frame count: $TOTAL_FRAMES" >&2
  exit 1
fi
if [ "$END_FRAME_OFFSET" -lt 0 ]; then
  echo "END_FRAME_OFFSET must be >= 0" >&2
  exit 1
fi

RENDER_FRAMES=$((TOTAL_FRAMES - END_FRAME_OFFSET))
if [ "$RENDER_FRAMES" -le 0 ]; then
  echo "END_FRAME_OFFSET leaves no frames to render" >&2
  exit 1
fi
END_FRAME=$((RENDER_FRAMES - 1))
DURATION="$(awk -v f="$RENDER_FRAMES" -v fps="$FPS" 'BEGIN {printf "%.6f", f / fps}')"
END_FRAME_OFFSET_REASON=""
if [ "$END_FRAME_OFFSET" -gt 0 ]; then
  END_FRAME_OFFSET_REASON="Avoids the unstable full-range tail frame observed in direct Remotion renders."
fi

echo "composition=$COMP fps=$FPS size=$WIDTH_HEIGHT total_frames=$TOTAL_FRAMES"
echo "render_frames=$RENDER_FRAMES frame_range=0-$END_FRAME duration=$DURATION"

if [ "$SKIP_AUDIO" != "1" ] && [ ! -f "$AUDIO_FILE" ]; then
  echo "Audio file not found: $AUDIO_FILE" >&2
  exit 1
fi

echo "== render visual chunks =="
ENTRY="$ENTRY" \
JOBS="$JOBS" \
CONCURRENCY="$CONCURRENCY" \
TIMEOUT="$TIMEOUT" \
MUTED=1 \
CRF="$CRF" \
RESUME="$RESUME" \
OUT_ROOT="$RUN_DIR/ranges" \
TS="$TS" \
FINAL_PATH="$VISUAL" \
STATS_FILE="$CHUNK_STATS" \
scripts/render-ranges.sh "$COMP" "$SLUG" "$RENDER_FRAMES" "$CHUNK_FRAMES"

if [ "$SKIP_AUDIO" = "1" ]; then
  echo "== audio skipped =="
  FINAL="$VISUAL"
else
  echo "== trim audio =="
  ffmpeg -y -i "$AUDIO_FILE" -t "$DURATION" -c:a aac -b:a 192k "$AUDIO_TRIMMED"

  echo "== mux final =="
  ffmpeg -y \
    -i "$VISUAL" \
    -i "$AUDIO_TRIMMED" \
    -map 0:v:0 -map 1:a:0 \
    -c:v copy -c:a aac -b:a 192k -shortest \
    "$FINAL"
fi

echo "== ffprobe final =="
ffprobe -v error \
  -show_entries stream=index,codec_type,codec_name,width,height,r_frame_rate,nb_frames \
  -show_entries format=duration,bit_rate,size \
  -of json "$FINAL" | tee "$FINAL_PROBE"

echo "== extract check frames =="
MID_FRAME=$((RENDER_FRAMES / 2))
LAST_FRAME=$((RENDER_FRAMES - 1))
ffmpeg -y -i "$FINAL" \
  -vf "select='eq(n,20)+eq(n,$((FPS * 7)))+eq(n,$MID_FRAME)+eq(n,$((RENDER_FRAMES * 3 / 4)))+eq(n,$LAST_FRAME)',scale=960:-1" \
  -vsync 0 "$FRAMES_DIR/frame_%03d.jpg"

FINISHED_AT="$(date +%s)"
ELAPSED_SECONDS=$((FINISHED_AT - STARTED_AT))
REMOTION_VERSION="$(node -p "require('./node_modules/remotion/package.json').version" 2>/dev/null || echo unknown)"
GIT_REV="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
GIT_DIRTY_COUNT="$(git status --short -- . 2>/dev/null | wc -l | tr -d ' ')"

cat > "$REPORT" <<EOF
{
  "composition": "$COMP",
  "slug": "$SLUG",
  "entry": "$ENTRY",
  "timestamp": "$TS",
  "gitRev": "$GIT_REV",
  "gitDirtyCount": $GIT_DIRTY_COUNT,
  "remotionVersion": "$REMOTION_VERSION",
  "fps": $FPS,
  "size": "$WIDTH_HEIGHT",
  "totalFrames": $TOTAL_FRAMES,
  "renderFrames": $RENDER_FRAMES,
  "endFrameOffset": $END_FRAME_OFFSET,
  "endFrameOffsetReason": "$END_FRAME_OFFSET_REASON",
  "durationSeconds": $DURATION,
  "elapsedSeconds": $ELAPSED_SECONDS,
  "renderOptions": {
    "chunkFrames": $CHUNK_FRAMES,
    "jobs": $JOBS,
    "concurrency": $CONCURRENCY,
    "timeout": $TIMEOUT,
    "crf": "$CRF",
    "resume": "$RESUME",
    "skipAudio": "$SKIP_AUDIO"
  },
  "visual": "$VISUAL",
  "final": "$FINAL",
  "audioFile": "$([ "$SKIP_AUDIO" = "1" ] && echo "" || echo "$AUDIO_FILE")",
  "audioTrimmed": "$([ "$SKIP_AUDIO" = "1" ] && echo "" || echo "$AUDIO_TRIMMED")",
  "chunkStatsFile": "$CHUNK_STATS",
  "finalProbeFile": "$FINAL_PROBE",
  "checkFramesDir": "$FRAMES_DIR"
}
EOF

echo "Done final: $FINAL"
echo "Report: $REPORT"
