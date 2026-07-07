#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${1:?usage: scripts/sync-current-meta.sh <renders/project-dir> [command-label]}"
COMMAND_LABEL="${2:-}"
META="$PROJECT_DIR/meta.json"

for cmd in jq ffprobe ffmpeg sha256sum; do
  command -v "$cmd" >/dev/null 2>&1 || {
    echo "missing command: $cmd" >&2
    exit 1
  }
done

[[ -f "$META" ]] || {
  echo "meta.json not found: $META" >&2
  exit 1
}

CURRENT_REL="$(jq -r '.current.path' "$META")"
[[ "$CURRENT_REL" != "null" && -n "$CURRENT_REL" ]] || {
  echo "meta.current.path is missing: $META" >&2
  exit 1
}

VIDEO="$PROJECT_DIR/$CURRENT_REL"
[[ -f "$VIDEO" ]] || {
  echo "current video not found: $VIDEO" >&2
  exit 1
}

PROBE_JSON="$(mktemp)"
ffprobe -v error \
  -show_entries format=duration,size,bit_rate \
  -show_entries stream=codec_type,codec_name,width,height,r_frame_rate,nb_frames,sample_rate,channels \
  -of json "$VIDEO" > "$PROBE_JSON"

SHA="$(sha256sum "$VIDEO" | awk '{print $1}')"
NOW="$(date +%FT%T%z)"
TMP="$(mktemp)"

jq \
  --arg sha "$SHA" \
  --arg now "$NOW" \
  --arg command "$COMMAND_LABEL" \
  --slurpfile probe "$PROBE_JSON" '
  ($probe[0].streams | map(select(.codec_type == "video")) | .[0]) as $video |
  ($probe[0].streams | map(select(.codec_type == "audio")) | .[0]) as $audio |
  ($probe[0].format) as $format |
  .current.sha256 = $sha |
  .current.resolution = (($video.width | tostring) + "x" + ($video.height | tostring)) |
  .current.fps = (
    ($video.r_frame_rate | split("/") | map(tonumber)) as $r |
    if $r[1] == 0 then 0 else ($r[0] / $r[1]) end
  ) |
  .current.duration_s = ($format.duration | tonumber) |
  .current.bit_rate_bps = ($format.bit_rate | tonumber) |
  .current.size_bytes = ($format.size | tonumber) |
  .current.synced_at = $now |
  (if $command != "" then .current.command = $command else . end) |
  .checks.ffprobe.video = {
    codec: $video.codec_name,
    width: $video.width,
    height: $video.height,
    frames: (($video.nb_frames // "0") | tonumber),
    fps: $video.r_frame_rate
  } |
  .checks.ffprobe.audio = (
    if $audio == null then
      {codec: null, sampleRate: null, channels: 0, note: "no audio stream"}
    else
      {
        codec: $audio.codec_name,
        sampleRate: (($audio.sample_rate // "0") | tonumber),
        channels: $audio.channels,
        note: (.checks.ffprobe.audio.note // "")
      }
    end
  )
  ' "$META" > "$TMP"

mv "$TMP" "$META"
rm -f "$PROBE_JSON"

MID="$(jq -r '.current.duration_s / 2' "$META")"
ffmpeg -nostdin -y -ss "$MID" -i "$VIDEO" -frames:v 1 "$PROJECT_DIR/thumbnail.png" >/dev/null 2>&1 || true

echo "synced: $META"
echo "current: $CURRENT_REL"
echo "sha256: $SHA"
