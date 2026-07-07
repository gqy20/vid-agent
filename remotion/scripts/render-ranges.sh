#!/usr/bin/env bash
# Render one Remotion composition in parallel frame ranges, then concat.
# Run from the Remotion project root.
#
# Usage:
#   scripts/render-ranges.sh <CompId> <slug> [total_frames|auto] [chunk_frames]
#
# Environment:
#   ENTRY=src/index.ts  Remotion entrypoint
#   JOBS=10             number of parallel render processes
#   CONCURRENCY=2       Remotion concurrency per process
#   TIMEOUT=120000      Remotion browser/delayRender timeout in milliseconds
#   COMMAND_TIMEOUT_SECONDS=900 shell-level timeout for each Remotion render
#   MUTED=1             render chunks without audio; mux final audio separately if needed
#   AUDIO_FILE=         optional premixed audio file to mux after video concat
#   CRF=                optional Remotion --crf value
#   FPS=30              fps used when encoding image-sequence chunks
#   RENDER_MODE=sequence sequence uses jpeg frames + ffmpeg; mp4 uses direct Remotion mp4 chunks
#   REMOTION_VIDEO_FILTER= optional src/videos/<slug> filter for Root aggregation
#   RESUME=1            skip already valid chunk files
#   STATS_FILE=         optional JSONL file for per-chunk timing stats
#   OUT_ROOT=renders/tmp/ranges output directory root
#   TS=                 optional timestamp/run id
#   RUN_DIR=            optional exact run directory; overrides OUT_ROOT/TS naming
#   CLEAN_RUN_DIR=0     remove RUN_DIR before rendering; useful for fixed scene folders
#   FINAL_PATH=         optional exact concat output path
#   RANGES_FILE=        optional TSV with index,start,end frame ranges; overrides chunk_frames
#   AUDIT_SEGMENTS=0    run still/scene-change audit for each segment before concat
#   SEGMENT_AUDIT_JOBS=4 parallel segment audit jobs
#   SKIP_CONCAT=0       stop after segment validation/audit, useful for per-segment review
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
JOBS="${JOBS:-10}"
CONCURRENCY="${CONCURRENCY:-2}"
TIMEOUT="${TIMEOUT:-120000}"
COMMAND_TIMEOUT_SECONDS="${COMMAND_TIMEOUT_SECONDS:-900}"
MUTED="${MUTED:-1}"
AUDIO_FILE="${AUDIO_FILE:-}"
CRF="${CRF:-}"
FPS="${FPS:-30}"
RENDER_MODE="${RENDER_MODE:-sequence}"
REMOTION_VIDEO_FILTER="${REMOTION_VIDEO_FILTER:-}"
RESUME="${RESUME:-1}"
OUT_ROOT="${OUT_ROOT:-renders/tmp/ranges}"
TS="${TS:-$(date +%Y%m%d-%H%M%S)}"
RUN_DIR="${RUN_DIR:-}"
if [ -n "$RUN_DIR" ]; then
  DIR="$RUN_DIR"
else
  DIR="$OUT_ROOT/${SLUG}_${TS}"
fi
SEG_DIR="$DIR/segments"
MANIFEST="$DIR/segments.ffconcat"
FINAL="${FINAL_PATH:-$DIR/${SLUG}_chunked_${TS}.mp4}"
AUDIO_FINAL="$DIR/${SLUG}_chunked_${TS}_audio.mp4"
STATS_FILE="${STATS_FILE:-$DIR/chunk-stats.jsonl}"
RANGES_FILE="${RANGES_FILE:-}"
AUDIT_SEGMENTS="${AUDIT_SEGMENTS:-0}"
SEGMENT_AUDIT_JOBS="${SEGMENT_AUDIT_JOBS:-4}"
SKIP_CONCAT="${SKIP_CONCAT:-0}"
CLEAN_RUN_DIR="${CLEAN_RUN_DIR:-0}"

if [ "$CLEAN_RUN_DIR" = "1" ] && [ -n "$RUN_DIR" ]; then
  case "$RUN_DIR" in
    ""|"/"|".")
      echo "Refusing to clean unsafe RUN_DIR: $RUN_DIR" >&2
      exit 1
      ;;
    *)
      rm -rf "$RUN_DIR"
      ;;
  esac
fi

mkdir -p "$SEG_DIR"
: > "$MANIFEST"
: > "$STATS_FILE"

if [ "$RENDER_MODE" != "sequence" ] && [ "$RENDER_MODE" != "mp4" ]; then
  echo "RENDER_MODE must be either 'sequence' or 'mp4'" >&2
  exit 1
fi

run_with_timeout() {
  if command -v timeout >/dev/null 2>&1; then
    timeout "${COMMAND_TIMEOUT_SECONDS}s" "$@"
  else
    "$@"
  fi
}
export -f run_with_timeout

probe_total_frames() {
  REMOTION_VIDEO_FILTER="$REMOTION_VIDEO_FILTER" pnpm exec remotion compositions "$ENTRY" --timeout="$TIMEOUT" |
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
  set -euo pipefail
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

  echo "[$index] frames $start-$end -> $file ($RENDER_MODE)"
  local muted_flag=()
  if [ "$MUTED" = "1" ]; then
    muted_flag=(--muted)
  fi
  local crf_flag=()
  if [ -n "$CRF" ]; then
    crf_flag=(--crf="$CRF")
  fi
  if [ "$RENDER_MODE" = "sequence" ]; then
    local seq_dir
    local encode_crf
    local actual_frames
    local input_pattern
    seq_dir="$SEG_DIR/${name%.mp4}_frames"
    encode_crf="${CRF:-18}"
    actual_frames="$({ find "$seq_dir" -maxdepth 1 -name 'element-*.jpeg' 2>/dev/null || true; } | wc -l | tr -d ' ')"
    if [ "$actual_frames" = "$frames" ]; then
      echo "[$index] reuse sequence frames in $seq_dir"
    else
      rm -rf "$seq_dir"
      REMOTION_VIDEO_FILTER="$REMOTION_VIDEO_FILTER" run_with_timeout pnpm exec remotion render "$ENTRY" "$COMP" "$seq_dir" \
        --frames="$start-$end" \
        --sequence \
        --image-format=jpeg \
        --concurrency="$CONCURRENCY" \
        --timeout="$TIMEOUT" \
        "${muted_flag[@]}"
    fi
    actual_frames="$(find "$seq_dir" -maxdepth 1 -name 'element-*.jpeg' | wc -l | tr -d ' ')"
    if [ "$actual_frames" != "$frames" ]; then
      echo "[$index] expected $frames sequence frames, got $actual_frames in $seq_dir" >&2
      return 1
    fi
    if [ -f "$seq_dir/element-$start.jpeg" ]; then
      input_pattern="$seq_dir/element-%d.jpeg"
    else
      input_pattern=""
      for width in 2 3 4 5 6; do
        local padded
        padded="$(printf "%0${width}d" "$start")"
        if [ -f "$seq_dir/element-${padded}.jpeg" ]; then
          input_pattern="$seq_dir/element-%0${width}d.jpeg"
          break
        fi
      done
      if [ -z "$input_pattern" ]; then
        echo "[$index] could not detect sequence naming pattern in $seq_dir" >&2
        return 1
      fi
    fi
    ffmpeg -nostdin -y \
      -framerate "$FPS" \
      -start_number "$start" \
      -i "$input_pattern" \
      -frames:v "$frames" \
      -c:v libx264 \
      -pix_fmt yuv420p \
      -crf "$encode_crf" \
      -r "$FPS" \
      "$file"
    rm -rf "$seq_dir"
  else
    REMOTION_VIDEO_FILTER="$REMOTION_VIDEO_FILTER" run_with_timeout pnpm exec remotion render "$ENTRY" "$COMP" "$file" \
      --frames="$start-$end" \
      --concurrency="$CONCURRENCY" \
      --timeout="$TIMEOUT" \
      "${crf_flag[@]}" \
      "${muted_flag[@]}"
  fi

  finished_at="$(date +%s)"
  elapsed=$((finished_at - started_at))
  size="$(wc -c < "$file" | tr -d ' ')"
  printf '{"index":%s,"start":%s,"end":%s,"frames":%s,"status":"rendered","elapsedSeconds":%s,"bytes":%s,"file":"%s"}\n' \
    "$index" "$start" "$end" "$frames" "$elapsed" "$size" "$file" >> "$STATS_FILE"
}
export -f render_one
export ENTRY COMP SEG_DIR CONCURRENCY TIMEOUT COMMAND_TIMEOUT_SECONDS MUTED CRF FPS RENDER_MODE REMOTION_VIDEO_FILTER RESUME STATS_FILE

RANGES="$DIR/ranges.tsv"
: > "$RANGES"

if [ -n "$RANGES_FILE" ]; then
  [[ -f "$RANGES_FILE" ]] || {
    echo "ranges file not found: $RANGES_FILE" >&2
    exit 1
  }
  cp "$RANGES_FILE" "$RANGES"
else
  index=1
  start=0
  while [ "$start" -lt "$TOTAL_FRAMES" ]; do
    end=$((start + CHUNK_FRAMES - 1))
    if [ "$end" -ge "$TOTAL_FRAMES" ]; then
      end=$((TOTAL_FRAMES - 1))
    fi
    printf "%d\t%d\t%d\n" "$index" "$start" "$end" >> "$RANGES"
    index=$((index + 1))
    start=$((end + 1))
  done
fi

RANGE_TOTAL_FRAMES=0
RANGE_COUNT=0
while IFS=$'\t' read -r range_index range_start range_end; do
  if [ -z "${range_index:-}" ]; then
    continue
  fi
  if [ "$range_start" -lt 0 ] || [ "$range_end" -lt "$range_start" ]; then
    echo "Invalid range: $range_index $range_start $range_end" >&2
    exit 1
  fi
  name="$(printf "%03d_%06d-%06d.mp4" "$range_index" "$range_start" "$range_end")"
  printf "file 'segments/%s'\n" "$name" >> "$MANIFEST"
  RANGE_TOTAL_FRAMES=$((RANGE_TOTAL_FRAMES + range_end - range_start + 1))
  RANGE_COUNT=$((RANGE_COUNT + 1))
done < "$RANGES"

echo "Rendering $COMP as $RANGE_COUNT chunks, mode=$RENDER_MODE, jobs=$JOBS, per-process concurrency=$CONCURRENCY, resume=$RESUME"
if [ "$JOBS" = "1" ]; then
  while IFS=$'\t' read -r range_index range_start range_end; do
    render_one "$range_index" "$range_start" "$range_end"
  done < "$RANGES"
else
  xargs -P "$JOBS" -n 3 bash -c 'render_one "$@"' _ < "$RANGES"
fi

echo "== validate segments =="
while IFS=$'\t' read -r range_index range_start range_end; do
  segment_name="$(printf "%03d_%06d-%06d.mp4" "$range_index" "$range_start" "$range_end")"
  segment_file="$SEG_DIR/$segment_name"
  expected_frames=$((range_end - range_start + 1))
  if [ ! -f "$segment_file" ]; then
    echo "Missing segment: $segment_file" >&2
    exit 1
  fi
  actual_frames="$(ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames -of default=noprint_wrappers=1:nokey=1 "$segment_file" 2>/dev/null || true)"
  if [ "$actual_frames" != "$expected_frames" ]; then
    echo "Segment frame mismatch: $segment_file expected=$expected_frames actual=${actual_frames:-unknown}" >&2
    exit 1
  fi
done < "$RANGES"

if [ "$AUDIT_SEGMENTS" = "1" ]; then
  echo "== audit segments =="
  scripts/audit-range-segments.sh "$DIR" "$DIR/segment-audits" "$SEGMENT_AUDIT_JOBS"
fi

if [ "$SKIP_CONCAT" = "1" ]; then
  echo "Concat skipped."
  echo "Segments: $SEG_DIR"
  echo "Chunk stats: $STATS_FILE"
  if [ "$AUDIT_SEGMENTS" = "1" ]; then
    echo "Segment audits: $DIR/segment-audits"
  fi
  exit 0
fi

echo "Concatenating -> $FINAL"
ffmpeg -nostdin -y -f concat -safe 0 -i "$MANIFEST" -c copy "$FINAL"

FINAL_FRAMES="$(ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames -of default=noprint_wrappers=1:nokey=1 "$FINAL" 2>/dev/null || true)"
if [ "$FINAL_FRAMES" != "$RANGE_TOTAL_FRAMES" ]; then
  echo "Final frame mismatch: $FINAL expected=$RANGE_TOTAL_FRAMES actual=${FINAL_FRAMES:-unknown}" >&2
  exit 1
fi

if [ -n "$AUDIO_FILE" ]; then
  echo "Muxing audio $AUDIO_FILE -> $AUDIO_FINAL"
  ffmpeg -nostdin -y -i "$FINAL" -i "$AUDIO_FILE" \
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
