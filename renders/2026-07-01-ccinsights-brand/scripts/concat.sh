#!/usr/bin/env bash
# Concatenate the 10 brand segments (s01…s10) into one mp4.
# Hero (hero.mp4) is a separate 4s asset and is NOT included here.
#
# Usage:
#   bash scripts/concat.sh <input_dir> <output>
# Example:
#   bash scripts/concat.sh renders/debug renders/final/brand-concat.mp4

set -euo pipefail

IN_DIR="${1:-renders/debug}"
OUT="${2:-renders/final/brand-concat.mp4}"

mkdir -p "$(dirname "$OUT")"

# Enumerate inputs in order, fail loudly if any are missing.
inputs=()
for i in 01 02 03 04 05 06 07 08 09 10; do
    # newest mtime in IN_DIR matching s<i>_*.mp4
    f=$(ls -t "$IN_DIR"/s${i}_*.mp4 2>/dev/null | head -1 || true)
    if [[ -z "${f:-}" ]]; then
        echo "ERROR: missing s${i} segment in $IN_DIR" >&2
        exit 1
    fi
    inputs+=("$f")
done

echo "Concat order:"
for f in "${inputs[@]}"; do echo "  $f"; done

# Re-encode to a consistent intermediate for clean concat (cuts at keyframes
# would otherwise glitch). Use copy when segments are identical codec/profile.
ffmpeg -y -hide_banner \
       -f concat -safe 0 \
       -i <(printf "file '%s'\n" "${inputs[@]}") \
       -c:v libx264 -preset medium -crf 20 \
       -pix_fmt yuv420p \
       -movflags +faststart \
       "$OUT"

echo "Wrote: $OUT"
