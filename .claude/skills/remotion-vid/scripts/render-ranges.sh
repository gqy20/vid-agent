#!/usr/bin/env bash
# Render one Remotion composition in parallel frame ranges, then concat.
# Copy this script into the Remotion project root scripts/ directory before use.
#
# Usage:
#   scripts/render-ranges.sh <CompId> <slug> [total_frames] [chunk_frames]
#
# Environment:
#   JOBS=4              number of parallel render processes
#   CONCURRENCY=4       Remotion concurrency per process
#   TIMEOUT=120000      Remotion browser/delayRender timeout in milliseconds
#   MUTED=1             render chunks without audio; mux final audio separately if needed
#   OUT_ROOT=out/ranges output directory root
set -euo pipefail

[ $# -ge 2 ] || {
  echo "Usage: $0 <CompId> <slug> [total_frames] [chunk_frames]" >&2
  exit 1
}

COMP="$1"
SLUG="$2"
TOTAL_FRAMES="${3:-}"
CHUNK_FRAMES="${4:-600}"
JOBS="${JOBS:-4}"
CONCURRENCY="${CONCURRENCY:-4}"
TIMEOUT="${TIMEOUT:-120000}"
MUTED="${MUTED:-1}"
OUT_ROOT="${OUT_ROOT:-out/ranges}"
TS="$(date +%Y%m%d-%H%M%S)"
DIR="$OUT_ROOT/${SLUG}_${TS}"
SEG_DIR="$DIR/segments"
MANIFEST="$DIR/segments.ffconcat"
FINAL="$DIR/${SLUG}_chunked_${TS}.mp4"

mkdir -p "$SEG_DIR"
: > "$MANIFEST"

if [ -z "$TOTAL_FRAMES" ]; then
  echo "total_frames was not provided; pass it explicitly if composition probing is unavailable." >&2
  exit 1
fi

if [ "$TOTAL_FRAMES" -le 0 ] || [ "$CHUNK_FRAMES" -le 0 ]; then
  echo "total_frames and chunk_frames must be positive integers" >&2
  exit 1
fi

render_one() {
  local index="$1"
  local start="$2"
  local end="$3"
  local name
  name="$(printf "%03d_%06d-%06d.mp4" "$index" "$start" "$end")"
  echo "[$index] frames $start-$end -> $SEG_DIR/$name"
  local muted_flag=()
  if [ "$MUTED" = "1" ]; then
    muted_flag=(--muted)
  fi
  pnpm exec remotion render "$COMP" "$SEG_DIR/$name" \
    --frames="$start-$end" \
    --concurrency="$CONCURRENCY" \
    --timeout="$TIMEOUT" \
    "${muted_flag[@]}"
}
export -f render_one
export COMP SEG_DIR CONCURRENCY TIMEOUT MUTED

RANGES="$DIR/ranges.tsv"
: > "$RANGES"

index=1
start=0
while [ "$start" -lt "$TOTAL_FRAMES" ]; do
  end=$((start + CHUNK_FRAMES - 1))
  if [ "$end" -ge "$TOTAL_FRAMES" ]; then
    end=$((TOTAL_FRAMES - 1))
  fi
  printf "%d\t%d\t%d\n" "$index" "$start" "$end" >> "$RANGES"
  name="$(printf "%03d_%06d-%06d.mp4" "$index" "$start" "$end")"
  printf "file 'segments/%s'\n" "$name" >> "$MANIFEST"
  index=$((index + 1))
  start=$((end + 1))
done

echo "Rendering $COMP as $((index - 1)) chunks, jobs=$JOBS, per-process concurrency=$CONCURRENCY"
xargs -P "$JOBS" -n 3 bash -c 'render_one "$@"' _ < "$RANGES"

echo "Concatenating -> $FINAL"
ffmpeg -y -f concat -safe 0 -i "$MANIFEST" -c copy "$FINAL"

echo "== ffprobe =="
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,r_frame_rate,nb_frames \
  -show_entries format=duration,bit_rate,size -of default=noprint_wrappers=1 "$FINAL"

echo "Done: $FINAL"
