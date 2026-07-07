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

audit_one() {
  set -euo pipefail
  local segment="$1"
  local out_root="$2"
  local audit_script="$3"
  local name
  local frames
  name="$(basename "$segment" .mp4)"
  frames="$(ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames -of default=noprint_wrappers=1:nokey=1 "$segment" 2>/dev/null || true)"
  if [ -z "$frames" ] || [ "$frames" = "N/A" ]; then
    echo "skip invalid segment: $name"
    return 0
  fi
  "$audit_script" "$segment" "$out_root/$name" >/dev/null
  echo "audit segment: $name -> $out_root/$name/contact-16.jpg"
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

echo "segment audits: $OUT_DIR"
