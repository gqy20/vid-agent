#!/usr/bin/env bash
set -euo pipefail

VIDEO="${1:?usage: scripts/audit-video-stills.sh <video.mp4> [out-dir]}"
OUT_DIR="${2:-$(dirname "$VIDEO")/../tmp/audit-visual}"
BOUNDARIES_FILE="${BOUNDARIES_FILE:-}"
KEYFRAMES_FILE="${KEYFRAMES_FILE:-}"
REVIEW_FPS="${REVIEW_FPS:-2}"
BOUNDARY_FPS="${BOUNDARY_FPS:-10}"
FRAMES_PER_SHEET="${FRAMES_PER_SHEET:-5}"

for cmd in ffmpeg ffprobe sha256sum awk; do
  command -v "$cmd" >/dev/null 2>&1 || {
    echo "missing command: $cmd" >&2
    exit 1
  }
done

[[ -f "$VIDEO" ]] || { echo "video not found: $VIDEO" >&2; exit 1; }
[[ "$FRAMES_PER_SHEET" = "5" ]] || { echo "FRAMES_PER_SHEET must be 5" >&2; exit 1; }

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR/overview" "$OUT_DIR/review/frames" "$OUT_DIR/review/sheets" "$OUT_DIR/boundaries" "$OUT_DIR/keyframes" "$OUT_DIR/metrics"

DURATION="$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$VIDEO")"
SOURCE_FPS="$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of default=nw=1:nk=1 "$VIDEO")"
SHA256="$(sha256sum "$VIDEO" | awk '{print $1}')"
OVERVIEW_INTERVAL="$(awk -v d="$DURATION" 'BEGIN {printf "%.6f", (d - 0.1) / 15}')"
EXPECTED_REVIEW_FRAMES="$(awk -v d="$DURATION" -v fps="$REVIEW_FPS" 'BEGIN {v=d*fps; print int(v)+(v>int(v)?1:0)}')"

FONT_FILE="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
STAMP="drawtext=fontfile=${FONT_FILE}:text='%{pts\\:hms}':x=14:y=14:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.58"

# Overview is an index only: 16 samples in one 4x4 sheet.
ffmpeg -nostdin -y -i "$VIDEO" \
  -vf "fps=1/${OVERVIEW_INTERVAL},scale=480:-2,${STAMP},tile=4x4" \
  -frames:v 1 "$OUT_DIR/overview/contact-16.jpg" >/dev/null 2>&1

# Review evidence: encoded MP4 sampled continuously at 2fps.
ffmpeg -nostdin -y -i "$VIDEO" \
  -vf "fps=${REVIEW_FPS},scale=480:-2,${STAMP}" \
  -q:v 3 "$OUT_DIR/review/frames/frame-%06d.jpg" >/dev/null 2>&1

make_sheets() {
  local frames_dir="$1"
  local sheets_dir="$2"
  local prefix="$3"
  local files=()
  local index=0
  local page=1
  mapfile -t files < <(find "$frames_dir" -maxdepth 1 -type f -name '*.jpg' | sort)
  while [ "$index" -lt "${#files[@]}" ]; do
    local inputs=()
    local count=0
    while [ "$count" -lt 5 ] && [ $((index + count)) -lt "${#files[@]}" ]; do
      inputs+=("-i" "${files[$((index + count))]}")
      count=$((count + 1))
    done
    if [ "$count" -eq 1 ]; then
      cp "${files[$index]}" "$sheets_dir/${prefix}-$(printf '%03d' "$page").jpg"
    else
      ffmpeg -nostdin -y "${inputs[@]}" \
        -filter_complex "hstack=inputs=${count}" \
        -frames:v 1 "$sheets_dir/${prefix}-$(printf '%03d' "$page").jpg" >/dev/null 2>&1
    fi
    index=$((index + count))
    page=$((page + 1))
  done
}

make_sheets "$OUT_DIR/review/frames" "$OUT_DIR/review/sheets" "contact"
ACTUAL_REVIEW_FRAMES="$(find "$OUT_DIR/review/frames" -maxdepth 1 -type f -name '*.jpg' | wc -l | tr -d ' ')"
ACTUAL_REVIEW_SHEETS="$(find "$OUT_DIR/review/sheets" -maxdepth 1 -type f -name '*.jpg' | wc -l | tr -d ' ')"
EXPECTED_REVIEW_SHEETS=$(((EXPECTED_REVIEW_FRAMES + 4) / 5))

[[ "$ACTUAL_REVIEW_FRAMES" = "$EXPECTED_REVIEW_FRAMES" ]] || {
  echo "review frame mismatch: expected=$EXPECTED_REVIEW_FRAMES actual=$ACTUAL_REVIEW_FRAMES" >&2
  exit 1
}
[[ "$ACTUAL_REVIEW_SHEETS" = "$EXPECTED_REVIEW_SHEETS" ]] || {
  echo "review sheet mismatch: expected=$EXPECTED_REVIEW_SHEETS actual=$ACTUAL_REVIEW_SHEETS" >&2
  exit 1
}

BOUNDARY_COUNT=0
if [ -n "$BOUNDARIES_FILE" ]; then
  [[ -f "$BOUNDARIES_FILE" ]] || { echo "boundaries file not found: $BOUNDARIES_FILE" >&2; exit 1; }
  while IFS=$'\t' read -r label center rest; do
    [[ -n "${label:-}" ]] || continue
    [[ -z "${rest:-}" ]] || { echo "invalid boundary row: $label" >&2; exit 1; }
    start="$(awk -v c="$center" 'BEGIN {v=c-0.5; printf "%.3f", v<0?0:v}')"
    dir="$OUT_DIR/boundaries/$label"
    mkdir -p "$dir/frames" "$dir/sheets"
    ffmpeg -nostdin -y -ss "$start" -t 1.0 -i "$VIDEO" \
      -vf "fps=${BOUNDARY_FPS},scale=480:-2,${STAMP}" \
      -q:v 3 "$dir/frames/frame-%03d.jpg" >/dev/null 2>&1
    make_sheets "$dir/frames" "$dir/sheets" "contact"
    count="$(find "$dir/frames" -maxdepth 1 -type f -name '*.jpg' | wc -l | tr -d ' ')"
    [[ "$count" -ge 9 ]] || { echo "boundary $label has only $count frames" >&2; exit 1; }
    BOUNDARY_COUNT=$((BOUNDARY_COUNT + 1))
  done < "$BOUNDARIES_FILE"
fi

KEYFRAME_COUNT=0
if [ -n "$KEYFRAMES_FILE" ]; then
  [[ -f "$KEYFRAMES_FILE" ]] || { echo "keyframes file not found: $KEYFRAMES_FILE" >&2; exit 1; }
  while IFS=$'\t' read -r label second rest; do
    [[ -n "${label:-}" ]] || continue
    [[ -z "${rest:-}" ]] || { echo "invalid keyframe row: $label" >&2; exit 1; }
    ffmpeg -nostdin -y -ss "$second" -i "$VIDEO" -frames:v 1 \
      -vf "scale=960:-2,${STAMP}" "$OUT_DIR/keyframes/$label.jpg" >/dev/null 2>&1
    KEYFRAME_COUNT=$((KEYFRAME_COUNT + 1))
  done < "$KEYFRAMES_FILE"
fi

ffmpeg -nostdin -i "$VIDEO" -filter:v "select='gt(scene,0.015)',showinfo" -f null - \
  2> "$OUT_DIR/metrics/scene-changes.log" || true
ffmpeg -nostdin -i "$VIDEO" -vf "blackdetect=d=0.10:pix_th=0.10" -an -f null - \
  2> "$OUT_DIR/metrics/black-frames.log" || true
ffmpeg -nostdin -i "$VIDEO" -vf "freezedetect=n=-50dB:d=1.5" -an -f null - \
  2> "$OUT_DIR/metrics/freeze-frames.log" || true

cat > "$OUT_DIR/manifest.json" <<JSON
{
  "schemaVersion": 1,
  "artifact": "$VIDEO",
  "artifactSha256": "$SHA256",
  "durationSeconds": $DURATION,
  "sourceFps": "$SOURCE_FPS",
  "sampling": {
    "overview": {"count": 16, "layout": "4x4"},
    "review": {
      "fps": $REVIEW_FPS,
      "frameStepAt30Fps": 15,
      "framesPerSheet": 5,
      "layout": "5x1",
      "expectedFrames": $EXPECTED_REVIEW_FRAMES,
      "actualFrames": $ACTUAL_REVIEW_FRAMES,
      "expectedSheets": $EXPECTED_REVIEW_SHEETS,
      "actualSheets": $ACTUAL_REVIEW_SHEETS
    },
    "boundaries": {"fps": $BOUNDARY_FPS, "windowBeforeSeconds": 0.5, "windowAfterSeconds": 0.5, "count": $BOUNDARY_COUNT},
    "keyframes": {"count": $KEYFRAME_COUNT}
  }
}
JSON

cat > "$OUT_DIR/verdict.json" <<JSON
{
  "schemaVersion": 1,
  "artifact": "$VIDEO",
  "artifactSha256": "$SHA256",
  "verdict": "needs_review",
  "coverage": {"overview": true, "continuous2fps": true, "boundaries10fps": $([ "$BOUNDARY_COUNT" -gt 0 ] && echo true || echo false), "keyframes": $([ "$KEYFRAME_COUNT" -gt 0 ] && echo true || echo false)},
  "checks": [
    {"id": "sampling.review.frames", "status": "pass", "details": "$ACTUAL_REVIEW_FRAMES/$EXPECTED_REVIEW_FRAMES"},
    {"id": "sampling.review.sheets", "status": "pass", "details": "$ACTUAL_REVIEW_SHEETS/$EXPECTED_REVIEW_SHEETS"},
    {"id": "visual.human-review", "status": "needs_review", "details": "$OUT_DIR/report.html"}
  ]
}
JSON

{
  echo '<!doctype html><html><head><meta charset="utf-8"><title>Git Course Audit</title><style>body{font-family:sans-serif;background:#f7f7f4;color:#182321;margin:32px}img{max-width:100%;display:block;margin:12px 0 28px;border:1px solid #c7cec5}details{margin:16px 0}code{font-family:monospace}</style></head><body>'
  echo "<h1>Audit report</h1><p><code>$VIDEO</code></p>"
  echo '<h2>Overview index</h2><img src="overview/contact-16.jpg">'
  echo '<h2>Boundary bursts</h2>'
  find "$OUT_DIR/boundaries" -type f -path '*/sheets/*.jpg' | sort | while read -r file; do echo "<img src=\"${file#$OUT_DIR/}\">"; done
  echo '<h2>Keyframes</h2>'
  find "$OUT_DIR/keyframes" -type f -name '*.jpg' | sort | while read -r file; do echo "<img src=\"${file#$OUT_DIR/}\">"; done
  echo '<h2>Continuous 2fps review</h2><details open><summary>Review sheets</summary>'
  find "$OUT_DIR/review/sheets" -type f -name '*.jpg' | sort | while read -r file; do echo "<img loading=\"lazy\" src=\"${file#$OUT_DIR/}\">"; done
  echo '</details></body></html>'
} > "$OUT_DIR/report.html"

echo "overview: $OUT_DIR/overview/contact-16.jpg"
echo "review: $ACTUAL_REVIEW_FRAMES frames, $ACTUAL_REVIEW_SHEETS sheets"
echo "report: $OUT_DIR/report.html"
echo "verdict: $OUT_DIR/verdict.json"
