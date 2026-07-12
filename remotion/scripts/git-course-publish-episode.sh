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
#   renders/git-course/<episode-id>/current/release/<episode-id>.mp4
set -euo pipefail

[ "${GIT_COURSE_ORCHESTRATED:-0}" = "1" ] || {
  echo "Direct publishing is disabled. Use: pnpm git-course release-build <episode-id>" >&2
  exit 1
}

[ $# -eq 2 ] || {
  echo "Usage: $0 <episode-id> <main-video>" >&2
  exit 1
}

EPISODE_ID="$1"
MAIN_VIDEO="$2"

INTRO_VIDEO="${INTRO_VIDEO:-renders/git-course/visible-system-intro/current/visible-system-intro.mp4}"
INTRO_AUDIO="${INTRO_AUDIO:-renders/git-course/visible-system-intro/current/audio/intro-bgm.m4a}"
OUTRO_VIDEO="${OUTRO_VIDEO:-renders/git-course/outro/current/ref-lightbox-outro.mp4}"
OUTRO_AUDIO="${OUTRO_AUDIO:-renders/git-course/outro/current/audio/outro-bgm.m4a}"
INTRO_AUDIO_GAIN_DB="${INTRO_AUDIO_GAIN_DB:-0}"
OUTRO_AUDIO_GAIN_DB="${OUTRO_AUDIO_GAIN_DB:--5}"
EXPECTED_WIDTH="${EXPECTED_WIDTH:-3840}"
EXPECTED_HEIGHT="${EXPECTED_HEIGHT:-2160}"
EXPECTED_FPS="${EXPECTED_FPS:-30/1}"

OUT_DIR="renders/git-course/${EPISODE_ID}/current/release"
TMP_DIR="renders/git-course/${EPISODE_ID}/tmp/release-build"
OUT_FILE="${OUT_FILE:-${OUT_DIR}/${EPISODE_ID}.mp4}"
INTRO_WITH_AUDIO="${TMP_DIR}/intro-with-audio.mp4"
MAIN_NORMALIZED="${TMP_DIR}/main-normalized.mp4"
OUTRO_WITH_AUDIO="${TMP_DIR}/outro-with-audio.mp4"
TMP_OUT="${TMP_DIR}/${EPISODE_ID}.mp4"
CONCAT_MANIFEST="${TMP_DIR}/release.ffconcat"

for file in "$INTRO_VIDEO" "$INTRO_AUDIO" "$MAIN_VIDEO" "$OUTRO_VIDEO" "$OUTRO_AUDIO"; do
  if [ ! -f "$file" ]; then
    echo "Required file not found: $file" >&2
    exit 1
  fi
done

for video in "$INTRO_VIDEO" "$MAIN_VIDEO" "$OUTRO_VIDEO"; do
  VIDEO_WIDTH="$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of default=nw=1:nk=1 "$video")"
  VIDEO_HEIGHT="$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of default=nw=1:nk=1 "$video")"
  VIDEO_FPS="$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of default=nw=1:nk=1 "$video")"
  if [ "$VIDEO_WIDTH" != "$EXPECTED_WIDTH" ] || [ "$VIDEO_HEIGHT" != "$EXPECTED_HEIGHT" ] || [ "$VIDEO_FPS" != "$EXPECTED_FPS" ]; then
    echo "Release video profile mismatch: $video is ${VIDEO_WIDTH}x${VIDEO_HEIGHT} ${VIDEO_FPS}, expected ${EXPECTED_WIDTH}x${EXPECTED_HEIGHT} ${EXPECTED_FPS}" >&2
    exit 1
  fi
done

rm -rf "$TMP_DIR"
mkdir -p "$TMP_DIR" "$OUT_DIR" "$(dirname "$OUT_FILE")"

ffmpeg -y -hide_banner \
  -i "$INTRO_VIDEO" \
  -i "$INTRO_AUDIO" \
  -filter_complex "[1:a]volume=${INTRO_AUDIO_GAIN_DB}dB[a]" \
  -map 0:v:0 \
  -map "[a]" \
  -c:v copy -video_track_timescale 15360 \
  -c:a aac -ar 48000 -ac 2 -b:a 192k -shortest \
  "$INTRO_WITH_AUDIO"

# Normalize only the container timebase and, for legacy mains, the audio format.
# Current orchestrator mains are already 48 kHz stereo, so both streams are copied.
MAIN_AUDIO_SPEC="$(ffprobe -v error -select_streams a:0 -show_entries stream=sample_rate,channels -of csv=p=0:s=x "$MAIN_VIDEO")"
MAIN_VIDEO_TIME_BASE="$(ffprobe -v error -select_streams v:0 -show_entries stream=time_base -of default=nw=1:nk=1 "$MAIN_VIDEO")"
MAIN_CONCAT="$MAIN_NORMALIZED"
if [ "$MAIN_AUDIO_SPEC" = "48000x2" ] && [ "$MAIN_VIDEO_TIME_BASE" = "1/15360" ]; then
  MAIN_CONCAT="$MAIN_VIDEO"
elif [ "$MAIN_AUDIO_SPEC" = "48000x2" ]; then
  ffmpeg -y -hide_banner \
    -i "$MAIN_VIDEO" \
    -map 0:v:0 -map 0:a:0 \
    -c copy -video_track_timescale 15360 \
    "$MAIN_NORMALIZED"
else
  ffmpeg -y -hide_banner \
    -i "$MAIN_VIDEO" \
    -map 0:v:0 -map 0:a:0 \
    -c:v copy -video_track_timescale 15360 \
    -c:a aac -ar 48000 -ac 2 -b:a 192k \
    "$MAIN_NORMALIZED"
fi

ffmpeg -y -hide_banner \
  -i "$OUTRO_VIDEO" \
  -i "$OUTRO_AUDIO" \
  -filter_complex "[1:a]volume=${OUTRO_AUDIO_GAIN_DB}dB[a]" \
  -map 0:v:0 \
  -map "[a]" \
  -c:v copy -video_track_timescale 15360 \
  -c:a aac -ar 48000 -ac 2 -b:a 192k -shortest \
  "$OUTRO_WITH_AUDIO"

if [[ "$MAIN_CONCAT" = /* ]]; then
  MAIN_CONCAT_ABS="$MAIN_CONCAT"
else
  MAIN_CONCAT_ABS="$PWD/$MAIN_CONCAT"
fi
printf "file '%s'\nfile '%s'\nfile '%s'\n" \
  "$PWD/$INTRO_WITH_AUDIO" "$MAIN_CONCAT_ABS" "$PWD/$OUTRO_WITH_AUDIO" > "$CONCAT_MANIFEST"

ffmpeg -y -hide_banner \
  -f concat -safe 0 -i "$CONCAT_MANIFEST" \
  -c copy -movflags +faststart \
  "$TMP_OUT"

mv "$TMP_OUT" "$OUT_FILE"
rm -rf "$TMP_DIR"

ffprobe -v error \
  -select_streams v:0 \
  -show_entries stream=width,height,pix_fmt,r_frame_rate,time_base,duration,nb_frames \
  -of default=nw=1 \
  "$OUT_FILE"
ffprobe -v error \
  -select_streams a:0 \
  -show_entries stream=codec_name,sample_rate,channels,duration \
  -of default=nw=1 \
  "$OUT_FILE"

echo "Published: $OUT_FILE"
