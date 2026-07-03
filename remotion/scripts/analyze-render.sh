#!/usr/bin/env bash
# Analyze a rendered mp4 and write a compact QA bundle.
# Run from the Remotion project root.
#
# Usage:
#   scripts/analyze-render.sh [video.mp4]
#
# If no file is provided, the latest *_final.mp4 under renders/ is used.
set -euo pipefail

SEARCH_ROOT="${SEARCH_ROOT:-renders}"
VIDEO="${1:-}"
TS="${TS:-$(date +%Y%m%d-%H%M%S)}"

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    exit 1
  }
}

need_cmd ffmpeg
need_cmd ffprobe

if [ -z "$VIDEO" ]; then
  VIDEO="$(find "$SEARCH_ROOT" -type f -name '*_final.mp4' -printf '%T@ %p\n' 2>/dev/null | sort -nr | awk 'NR==1 {$1=""; sub(/^ /, ""); print; exit}')"
fi

if [ -z "$VIDEO" ] || [ ! -f "$VIDEO" ]; then
  echo "No render found. Pass a video file or set SEARCH_ROOT." >&2
  exit 1
fi

BASE="$(basename "$VIDEO")"
STEM="${BASE%.*}"
OUT_DIR="${OUT_DIR:-$(dirname "$VIDEO")/${STEM}_analysis_${TS}}"
FRAMES_DIR="$OUT_DIR/check-frames"
PROBE_JSON="$OUT_DIR/ffprobe.json"
BLACK_LOG="$OUT_DIR/blackdetect.log"
SIGNAL_LOG="$OUT_DIR/signalstats.log"
SUMMARY="$OUT_DIR/summary.txt"
REPORT="$OUT_DIR/analysis-report.json"

mkdir -p "$FRAMES_DIR"

echo "== ffprobe =="
ffprobe -v error \
  -show_entries stream=index,codec_type,codec_name,width,height,r_frame_rate,avg_frame_rate,nb_frames \
  -show_entries format=duration,bit_rate,size \
  -of json "$VIDEO" | tee "$PROBE_JSON"

VIDEO_FRAMES="$(ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames -of default=noprint_wrappers=1:nokey=1 "$VIDEO" 2>/dev/null || true)"
if [ -z "$VIDEO_FRAMES" ] || [ "$VIDEO_FRAMES" = "N/A" ]; then
  VIDEO_FRAMES="$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of default=noprint_wrappers=1:nokey=1 "$VIDEO")"
fi
FPS_RATIO="$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of default=noprint_wrappers=1:nokey=1 "$VIDEO")"
FPS="$(awk -F/ '{if ($2 && $2 != 0) printf "%.0f", $1 / $2; else print $1}' <<<"$FPS_RATIO")"
DURATION="$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$VIDEO")"
WIDTH="$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of default=noprint_wrappers=1:nokey=1 "$VIDEO")"
HEIGHT="$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of default=noprint_wrappers=1:nokey=1 "$VIDEO")"
AUDIO_STREAMS="$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$VIDEO" | wc -l | tr -d ' ')"
SIZE_BYTES="$(wc -c < "$VIDEO" | tr -d ' ')"

echo "== blackdetect =="
ffmpeg -hide_banner -nostats -i "$VIDEO" \
  -vf "blackdetect=d=0.20:pix_th=0.10" \
  -an -f null - > /dev/null 2> "$BLACK_LOG" || true
BLACK_SEGMENTS="$(grep -c 'black_start:' "$BLACK_LOG" || true)"

echo "== signalstats =="
ffmpeg -hide_banner -nostats -i "$VIDEO" \
  -vf "fps=1,signalstats,metadata=print:file=$SIGNAL_LOG" \
  -an -f null - > /dev/null 2>&1 || true
AVG_LUMA="$(awk -F= '/lavfi.signalstats.YAVG/ {sum += $2; n += 1} END {if (n) printf "%.2f", sum / n; else print ""}' "$SIGNAL_LOG")"

echo "== extract check frames =="
MID_FRAME=$((VIDEO_FRAMES / 2))
THREE_QUARTER_FRAME=$((VIDEO_FRAMES * 3 / 4))
LAST_FRAME=$((VIDEO_FRAMES - 1))
ffmpeg -hide_banner -y -i "$VIDEO" \
  -vf "select='eq(n,20)+eq(n,$((FPS * 7)))+eq(n,$MID_FRAME)+eq(n,$THREE_QUARTER_FRAME)+eq(n,$LAST_FRAME)',scale=960:-1" \
  -vsync 0 "$FRAMES_DIR/frame_%03d.jpg" > /dev/null 2>&1 || true
FRAME_COUNT="$(find "$FRAMES_DIR" -type f -name 'frame_*.jpg' | wc -l | tr -d ' ')"

WORK_DIR="${VIDEO%_final.mp4}_work"
CHUNK_STATS=""
if [ -f "$WORK_DIR/chunk-stats.jsonl" ]; then
  CHUNK_STATS="$WORK_DIR/chunk-stats.jsonl"
fi

{
  echo "video=$VIDEO"
  echo "duration=$DURATION"
  echo "size=${WIDTH}x${HEIGHT}"
  echo "fps=$FPS_RATIO"
  echo "frames=$VIDEO_FRAMES"
  echo "audio_streams=$AUDIO_STREAMS"
  echo "bytes=$SIZE_BYTES"
  echo "black_segments=$BLACK_SEGMENTS"
  echo "avg_luma=$AVG_LUMA"
  echo "check_frames=$FRAME_COUNT"
  echo "check_frames_dir=$FRAMES_DIR"
  echo "ffprobe=$PROBE_JSON"
  echo "blackdetect_log=$BLACK_LOG"
  echo "signalstats_log=$SIGNAL_LOG"
  echo "chunk_stats=$CHUNK_STATS"
} | tee "$SUMMARY"

cat > "$REPORT" <<EOF
{
  "video": "$VIDEO",
  "durationSeconds": $DURATION,
  "width": $WIDTH,
  "height": $HEIGHT,
  "fps": "$FPS_RATIO",
  "frames": $VIDEO_FRAMES,
  "audioStreams": $AUDIO_STREAMS,
  "bytes": $SIZE_BYTES,
  "blackSegments": $BLACK_SEGMENTS,
  "averageLuma": "$AVG_LUMA",
  "checkFrames": $FRAME_COUNT,
  "checkFramesDir": "$FRAMES_DIR",
  "ffprobeFile": "$PROBE_JSON",
  "blackdetectLog": "$BLACK_LOG",
  "signalstatsLog": "$SIGNAL_LOG",
  "chunkStatsFile": "$CHUNK_STATS",
  "summaryFile": "$SUMMARY"
}
EOF

echo "Done analysis: $REPORT"
