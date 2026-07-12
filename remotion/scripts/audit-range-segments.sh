#!/usr/bin/env bash
set -euo pipefail

RUN_DIR="${1:?usage: scripts/audit-range-segments.sh <ranges-run-dir> [out-dir] [jobs]}"
OUT_DIR="${2:-$RUN_DIR/segment-audits}"
JOBS="${3:-4}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AUDIT_SCRIPT="$SCRIPT_DIR/audit-video-stills.sh"
SEG_DIR="$RUN_DIR/segments"

[[ -d "$SEG_DIR" ]] || {
  echo "segments directory not found: $SEG_DIR" >&2
  exit 1
}

mkdir -p "$OUT_DIR"

if [ "$JOBS" = "all" ]; then
  JOBS="$(find "$SEG_DIR" -maxdepth 1 -type f -name '*.mp4' | wc -l | tr -d ' ')"
  [ "$JOBS" -gt 0 ] || JOBS=1
fi

audit_one() {
  set -euo pipefail
  local segment="$1"
  local out_root="$2"
  local audit_script="$3"
  local name
  local frames
  local duration
  local keyframes
  name="$(basename "$segment" .mp4)"
  frames="$(ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames -of default=noprint_wrappers=1:nokey=1 "$segment" 2>/dev/null || true)"
  if [ -z "$frames" ] || [ "$frames" = "N/A" ]; then
    echo "invalid segment: $name" >&2
    return 1
  fi
  duration="$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$segment")"
  mkdir -p "$out_root/.plans"
  keyframes="$out_root/.plans/$name-keyframes.tsv"
  awk -v d="$duration" 'BEGIN {printf "start\t0.100\nmid\t%.3f\nend\t%.3f\n", d/2, d-0.1}' > "$keyframes"
  AUDIT_METRICS=0 KEYFRAMES_FILE="$keyframes" "$audit_script" "$segment" "$out_root/$name" >/dev/null
  echo "audit segment: $name -> $out_root/$name/report.html"
}
export -f audit_one

find "$SEG_DIR" -maxdepth 1 -type f -name '*.mp4' | sort | \
  xargs -r -P "$JOBS" -I {} bash -c 'audit_one "$1" "$2" "$3"' _ "{}" "$OUT_DIR" "$AUDIT_SCRIPT"

cat > "$OUT_DIR/summary.json" <<JSON
{
  "runDir": "$RUN_DIR",
  "segmentsDir": "$SEG_DIR",
  "outDir": "$OUT_DIR",
  "jobs": $JOBS
}
JSON

cat > "$OUT_DIR/verdict.json" <<JSON
{
  "schemaVersion": 1,
  "verdict": "needs_review",
  "checks": [
    {"id": "segments.probe", "status": "pass"},
    {"id": "visual.human-review", "status": "needs_review", "details": "$OUT_DIR"}
  ]
}
JSON

echo "segment audits: $OUT_DIR"
echo "segment verdict: $OUT_DIR/verdict.json"
