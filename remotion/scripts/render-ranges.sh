#!/usr/bin/env bash
# Render one Remotion composition in parallel frame ranges, then concat.
# Run from the Remotion project root.
#
# Usage:
#   scripts/render-ranges.sh <CompId> <slug> [total_frames|auto] [chunk_frames]
#
# Environment:
#   ENTRY=src/index.ts  Remotion entrypoint
#   JOBS=1              number of parallel render processes
#   CONCURRENCY=8       Remotion concurrency per process
#   TIMEOUT=120000      Remotion browser/delayRender timeout in milliseconds
#   MUTED=1             render chunks without audio; mux final audio separately if needed
#   AUDIO_FILE=         optional premixed audio file to mux after video concat
#   CRF=                optional Remotion --crf value
#   RESUME=1            skip already valid chunk files
#   STATS_FILE=         optional JSONL file for per-chunk timing stats
#   OUT_ROOT=out/ranges output directory root
#   TS=                 optional timestamp/run id
#   FINAL_PATH=         optional exact concat output path
set -euo pipefail

[ $# -ge 2 ] || {
  echo "Usage: $0 <CompId> <slug> [total_frames] [chunk_frames]" >&2
  exit 1
}

COMP="$1"
SLUG="$2"
TOTAL_FRAMES="${3:-auto}"
CHUNK_FRAMES="${4:-600}"
ENTRY="${ENTRY:-src/index.ts}"
JOBS="${JOBS:-1}"
CONCURRENCY="${CONCURRENCY:-8}"
TIMEOUT="${TIMEOUT:-120000}"
MUTED="${MUTED:-1}"
AUDIO_FILE="${AUDIO_FILE:-}"
CRF="${CRF:-}"
RESUME="${RESUME:-1}"
OUT_ROOT="${OUT_ROOT:-out/ranges}"
TS="${TS:-$(date +%Y%m%d-%H%M%S)}"
DIR="$OUT_ROOT/${SLUG}_${TS}"
SEG_DIR="$DIR/segments"
MANIFEST="$DIR/segments.ffconcat"
FINAL="${FINAL_PATH:-$DIR/${SLUG}_chunked_${TS}.mp4}"
AUDIO_FINAL="$DIR/${SLUG}_chunked_${TS}_audio.mp4"
STATS_FILE="${STATS_FILE:-$DIR/chunk-stats.jsonl}"

mkdir -p "$SEG_DIR"
: > "$MANIFEST"
: > "$STATS_FILE"

probe_total_frames() {
  pnpm exec remotion compositions "$ENTRY" --timeout="$TIMEOUT" |
    awk -v comp="$COMP" '$1 == comp {print $4; found=1; exit} END {if (!found) exit 1}'
}

if [ -z "$TOTAL_FRAMES" ] || [ "$TOTAL_FRAMES" = "auto" ]; then
  echo "Probing duration for $COMP via $ENTRY"
  TOTAL_FRAMES="$(probe_total_frames)" || {
    echo "Could not probe duration for composition '$COMP'. Pass total_frames explicitly." >&2
    exit 1
  }
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
  local file
  local started_at
  local finished_at
  local elapsed
  local size
  local frames
  local existing_frames
  name="$(printf "%03d_%06d-%06d.mp4" "$index" "$start" "$end")"
  file="$SEG_DIR/$name"
  started_at="$(date +%s)"
  frames=$((end - start + 1))

  existing_frames=""
  if [ "$RESUME" = "1" ] && [ -f "$file" ]; then
    existing_frames="$(ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames -of default=noprint_wrappers=1:nokey=1 "$file" 2>/dev/null || true)"
  fi
  if [ "$RESUME" = "1" ] && [ "$existing_frames" = "$frames" ]; then
    finished_at="$(date +%s)"
    elapsed=$((finished_at - started_at))
    size="$(wc -c < "$file" | tr -d ' ')"
    echo "[$index] reuse frames $start-$end -> $file"
    printf '{"index":%s,"start":%s,"end":%s,"frames":%s,"status":"reused","elapsedSeconds":%s,"bytes":%s,"file":"%s"}\n' \
      "$index" "$start" "$end" "$frames" "$elapsed" "$size" "$file" >> "$STATS_FILE"
    return 0
  fi

  echo "[$index] frames $start-$end -> $file"
  local muted_flag=()
  if [ "$MUTED" = "1" ]; then
    muted_flag=(--muted)
  fi
  local crf_flag=()
  if [ -n "$CRF" ]; then
    crf_flag=(--crf="$CRF")
  fi
  pnpm exec remotion render "$ENTRY" "$COMP" "$file" \
    --frames="$start-$end" \
    --concurrency="$CONCURRENCY" \
    --timeout="$TIMEOUT" \
    "${crf_flag[@]}" \
    "${muted_flag[@]}"

  finished_at="$(date +%s)"
  elapsed=$((finished_at - started_at))
  size="$(wc -c < "$file" | tr -d ' ')"
  printf '{"index":%s,"start":%s,"end":%s,"frames":%s,"status":"rendered","elapsedSeconds":%s,"bytes":%s,"file":"%s"}\n' \
    "$index" "$start" "$end" "$frames" "$elapsed" "$size" "$file" >> "$STATS_FILE"
}
export -f render_one
export ENTRY COMP SEG_DIR CONCURRENCY TIMEOUT MUTED CRF RESUME STATS_FILE

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

echo "Rendering $COMP as $((index - 1)) chunks, jobs=$JOBS, per-process concurrency=$CONCURRENCY, resume=$RESUME"
xargs -P "$JOBS" -n 3 bash -c 'render_one "$@"' _ < "$RANGES"

echo "Concatenating -> $FINAL"
ffmpeg -y -f concat -safe 0 -i "$MANIFEST" -c copy "$FINAL"

if [ -n "$AUDIO_FILE" ]; then
  echo "Muxing audio $AUDIO_FILE -> $AUDIO_FINAL"
  ffmpeg -y -i "$FINAL" -i "$AUDIO_FILE" \
    -map 0:v:0 -map 1:a:0 \
    -c:v copy -c:a aac -b:a 192k -shortest \
    "$AUDIO_FINAL"
fi

echo "== ffprobe =="
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,r_frame_rate,nb_frames \
  -show_entries format=duration,bit_rate,size -of default=noprint_wrappers=1 "$FINAL"

echo "Done: $FINAL"
echo "Chunk stats: $STATS_FILE"
if [ -n "$AUDIO_FILE" ]; then
  echo "Done with audio: $AUDIO_FINAL"
fi
