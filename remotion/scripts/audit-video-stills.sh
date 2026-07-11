#!/usr/bin/env bash
set -euo pipefail

VIDEO="${1:?usage: scripts/audit-video-stills.sh <video.mp4> [out-dir]}"
OUT_DIR="${2:-$(dirname "$VIDEO")/../tmp/audit-visual}"

for cmd in ffmpeg ffprobe sha256sum; do
  command -v "$cmd" >/dev/null 2>&1 || {
    echo "missing command: $cmd" >&2
    exit 1
  }
done

[[ -f "$VIDEO" ]] || {
  echo "video not found: $VIDEO" >&2
  exit 1
}

mkdir -p "$OUT_DIR/frames"

DURATION="$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$VIDEO")"
# 16 samples must cover both the opening and the final encoded moment.
INTERVAL="$(awk -v d="$DURATION" 'BEGIN { printf "%.6f", (d - 0.1) / 15 }')"

ffmpeg -nostdin -y -i "$VIDEO" \
  -vf "fps=1/${INTERVAL},scale=480:-1,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='%{pts\\:hms}':x=18:y=18:fontsize=24:fontcolor=white:box=1:boxcolor=black@0.55,tile=4x4" \
  -frames:v 1 "$OUT_DIR/contact-16.jpg" >/dev/null 2>&1

ffmpeg -nostdin -y -i "$VIDEO" \
  -vf "fps=1/5,scale=960:-1" \
  "$OUT_DIR/frames/frame-%03d.jpg" >/dev/null 2>&1

ffmpeg -nostdin -i "$VIDEO" \
  -filter:v "select='gt(scene,0.015)',showinfo" \
  -f null - 2> "$OUT_DIR/scene-changes.log" || true

cat > "$OUT_DIR/summary.json" <<JSON
{
  "video": "$VIDEO",
  "durationSeconds": $DURATION,
  "contactSheet": "$OUT_DIR/contact-16.jpg",
  "sampleFrames": "$OUT_DIR/frames/frame-%03d.jpg",
  "sceneChanges": "$OUT_DIR/scene-changes.log"
}
JSON

SHA256="$(sha256sum "$VIDEO" | awk '{print $1}')"
cat > "$OUT_DIR/verdict.json" <<JSON
{
  "schemaVersion": 1,
  "artifact": "$VIDEO",
  "artifactSha256": "$SHA256",
  "verdict": "needs_review",
  "checks": [
    {"id": "video.probe", "status": "pass", "details": "duration=${DURATION}s"},
    {"id": "visual.human-review", "status": "needs_review", "details": "$OUT_DIR/contact-16.jpg"}
  ],
  "evidence": {
    "contactSheet": "$OUT_DIR/contact-16.jpg",
    "frames": "$OUT_DIR/frames",
    "sceneChanges": "$OUT_DIR/scene-changes.log"
  }
}
JSON

echo "audit: $OUT_DIR/contact-16.jpg"
echo "frames: $OUT_DIR/frames"
echo "scene changes: $OUT_DIR/scene-changes.log"
echo "verdict: $OUT_DIR/verdict.json"
