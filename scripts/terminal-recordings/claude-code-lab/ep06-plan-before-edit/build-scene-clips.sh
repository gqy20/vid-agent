#!/usr/bin/env bash
# Derive only the 4K source ranges used by Remotion. This keeps the archived
# recording authoritative while avoiding repeated random seeks through a
# four-minute H.264 file during every chapter render.
set -euo pipefail

INPUT=${1:?usage: build-scene-clips.sh <recording.mp4> <output-dir> <recording-id>}
OUTPUT_DIR=${2:?usage: build-scene-clips.sh <recording.mp4> <output-dir> <recording-id>}
RECORDING_ID=${3:?usage: build-scene-clips.sh <recording.mp4> <output-dir> <recording-id>}
TIMELINE="$(dirname "$INPUT")/$RECORDING_ID.timeline.json"

[[ -f "$INPUT" ]] || { echo "recording is missing: $INPUT" >&2; exit 1; }
[[ -f "$TIMELINE" ]] || { echo "timeline is missing: $TIMELINE" >&2; exit 1; }
mkdir -p "$OUTPUT_DIR"

segment_value() {
  local segment_id=$1
  local field=$2
  python3 - "$TIMELINE" "$segment_id" "$field" <<'PY'
import json
import sys

timeline, segment_id, field = sys.argv[1:]
data = json.load(open(timeline, encoding="utf-8"))
segment = next((item for item in data["segments"] if item["id"] == segment_id), None)
if segment is None:
    raise SystemExit(f"timeline segment is missing: {segment_id}")
print(segment["source"][field])
PY
}

render_clip() {
  local output_name=$1
  local start=$2
  local end=$3
  local speed=$4
  local duration
  duration=$(python3 - "$start" "$end" <<'PY'
import sys
start, end = map(float, sys.argv[1:])
if end <= start:
    raise SystemExit("invalid terminal clip range")
print(f"{end - start:.6f}")
PY
)
  ffmpeg -loglevel error -y -ss "$start" -t "$duration" -i "$INPUT" \
    -an -vf "setpts=(PTS-STARTPTS)/$speed,fps=30" \
    -c:v libx264 -crf 18 -pix_fmt yuv420p -movflags +faststart \
    "$OUTPUT_DIR/$output_name"

  local frame_dir="$OUTPUT_DIR/${output_name%.mp4}-frames"
  rm -rf "$frame_dir"
  mkdir -p "$frame_dir"
  ffmpeg -loglevel error -y -i "$OUTPUT_DIR/$output_name" \
    -fps_mode passthrough -compression_level 3 -pred mixed \
    "$frame_dir/f_%05d.png"
}

investigation_start=$(segment_value 03_readonly_investigation startSeconds)
investigation_end=$(segment_value 03_readonly_investigation endSeconds)
review_end=$(segment_value 04_plan_review endSeconds)
revised_end=$(segment_value 05_revised_plan endSeconds)
workspace_end=$(segment_value 06_workspace_check endSeconds)

review_start=$(python3 - "$investigation_end" <<'PY'
import sys
print(f"{float(sys.argv[1]) - 4.17:.6f}")
PY
)
revised_start=$(python3 - "$revised_end" <<'PY'
import sys
print(f"{float(sys.argv[1]) - 7:.6f}")
PY
)

render_clip "$RECORDING_ID-readonly-investigation.mp4" "$investigation_start" "$investigation_end" 7.5
render_clip "$RECORDING_ID-plan-review.mp4" "$review_start" "$review_end" 1.2
render_clip "$RECORDING_ID-revised-plan.mp4" "$revised_start" "$workspace_end" 1.5
