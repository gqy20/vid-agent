#!/usr/bin/env bash
# Build a Git course published episode:
#   public intro with BGM + main episode with audio + public outro with BGM.
#
# Run from the Remotion project root.
#
# Usage:
#   scripts/git-course-publish-episode.sh <episode-id> <main-video>
#
# Output:
#   renders/git-course/<episode-id>/renders/current/published/<episode-id>_published.mp4
set -euo pipefail

[ $# -eq 2 ] || {
  echo "Usage: $0 <episode-id> <main-video>" >&2
  exit 1
}

EPISODE_ID="$1"
MAIN_VIDEO="$2"

INTRO_VIDEO="${INTRO_VIDEO:-renders/git-course/visible-system-intro/renders/current/visible-system-intro.mp4}"
INTRO_AUDIO="${INTRO_AUDIO:-renders/git-course/visible-system-intro/renders/current/audio/intro-bgm.m4a}"
OUTRO_VIDEO="${OUTRO_VIDEO:-renders/git-course/outro/current/ref-lightbox-outro.mp4}"
OUTRO_AUDIO="${OUTRO_AUDIO:-renders/git-course/outro/current/audio/outro-bgm.m4a}"

OUT_DIR="renders/git-course/${EPISODE_ID}/renders/current/published"
TMP_DIR="renders/git-course/${EPISODE_ID}/renders/tmp/published-build"
OUT_FILE="${OUT_DIR}/${EPISODE_ID}_published.mp4"
INTRO_WITH_AUDIO="${TMP_DIR}/intro-with-audio.mp4"
OUTRO_WITH_AUDIO="${TMP_DIR}/outro-with-audio.mp4"
TMP_OUT="${TMP_DIR}/${EPISODE_ID}_published.mp4"

for file in "$INTRO_VIDEO" "$INTRO_AUDIO" "$MAIN_VIDEO" "$OUTRO_VIDEO" "$OUTRO_AUDIO"; do
  if [ ! -f "$file" ]; then
    echo "Required file not found: $file" >&2
    exit 1
  fi
done

rm -rf "$TMP_DIR"
mkdir -p "$TMP_DIR" "$OUT_DIR"

ffmpeg -y -hide_banner \
  -i "$INTRO_VIDEO" \
  -i "$INTRO_AUDIO" \
  -map 0:v:0 -map 1:a:0 \
  -c:v copy -c:a copy -shortest \
  "$INTRO_WITH_AUDIO"

ffmpeg -y -hide_banner \
  -i "$OUTRO_VIDEO" \
  -i "$OUTRO_AUDIO" \
  -map 0:v:0 -map 1:a:0 \
  -c:v copy -c:a copy -shortest \
  "$OUTRO_WITH_AUDIO"

ffmpeg -y -hide_banner \
  -i "$INTRO_WITH_AUDIO" \
  -i "$MAIN_VIDEO" \
  -i "$OUTRO_WITH_AUDIO" \
  -filter_complex "[0:v]setpts=PTS-STARTPTS,format=yuv420p[v0];[0:a]asetpts=PTS-STARTPTS[a0];[1:v]setpts=PTS-STARTPTS,format=yuv420p[v1];[1:a]asetpts=PTS-STARTPTS[a1];[2:v]setpts=PTS-STARTPTS,format=yuv420p[v2];[2:a]asetpts=PTS-STARTPTS[a2];[v0][a0][v1][a1][v2][a2]concat=n=3:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" \
  -c:v libx264 -preset veryfast -crf 18 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -movflags +faststart \
  "$TMP_OUT"

mv "$TMP_OUT" "$OUT_FILE"
rm -rf "$TMP_DIR"

ffprobe -v error \
  -select_streams v:0 \
  -count_frames \
  -show_entries stream=width,height,r_frame_rate,duration,nb_read_frames \
  -of default=nw=1 \
  "$OUT_FILE"
ffprobe -v error \
  -select_streams a:0 \
  -show_entries stream=codec_name,sample_rate,channels,duration \
  -of default=nw=1 \
  "$OUT_FILE"

echo "Published: $OUT_FILE"
