#!/usr/bin/env bash
# Build segmented Git course narration with one fixed MiniMax voice.
#
# Run from the Remotion project root.
#
# Usage:
#   scripts/git-course-build-voiceover.sh <episode-id> <manifest.tsv> [main-video]
#
# Manifest columns, tab-separated:
#   segment_id  voice_start_seconds  scene_end_seconds
#
# Example:
#   01_hook  0.2  12.0
#
# Outputs:
#   renders/git-course/<episode-id>/renders/current/audio/voiceover-aligned.m4a
#   renders/git-course/<episode-id>/renders/current/audio/mix.m4a
#
# Optional env:
#   TTS_MODEL=speech-2.8-hd
#   TTS_VOICE='Chinese (Mandarin)_Gentleman'
#   TTS_LANGUAGE=zh
#   TTS_SPEED=1.3
#   SKIP_TTS=1
#   SKIP_NORM=1
#   SKIP_REMUX=1
#   BGM_FILE=<path>
#   OUT_VIDEO=<path>
set -euo pipefail

usage() {
  sed -n '2,34p' "$0" >&2
}

[ $# -ge 2 ] || {
  usage
  exit 1
}

EPISODE_ID="$1"
MANIFEST="$2"
MAIN_VIDEO="${3:-}"

AUDIO_DIR="renders/git-course/${EPISODE_ID}/renders/current/audio"
if [ -d "${AUDIO_DIR}/voiceover_segments" ]; then
  SEGMENTS_DIR="${AUDIO_DIR}/voiceover_segments"
elif [ -d "${AUDIO_DIR}/segments" ]; then
  SEGMENTS_DIR="${AUDIO_DIR}/segments"
else
  echo "Segments directory not found under ${AUDIO_DIR}" >&2
  exit 1
fi

TTS_MODEL="${TTS_MODEL:-speech-2.8-hd}"
TTS_VOICE="${TTS_VOICE:-Chinese (Mandarin)_Gentleman}"
TTS_LANGUAGE="${TTS_LANGUAGE:-zh}"
TTS_SPEED="${TTS_SPEED:-1.3}"
EPISODE_DURATION="${EPISODE_DURATION:-180}"
BGM_VOLUME="${BGM_VOLUME:-0.05}"
BGM_FILE="${BGM_FILE:-}"

if [ -z "$BGM_FILE" ]; then
  if [ -f "${AUDIO_DIR}/bgm.mp3" ]; then
    BGM_FILE="${AUDIO_DIR}/bgm.mp3"
  elif [ -f "${AUDIO_DIR}/bgm_180.mp3" ]; then
    BGM_FILE="${AUDIO_DIR}/bgm_180.mp3"
  else
    echo "BGM file not found. Set BGM_FILE or add bgm.mp3 / bgm_180.mp3 under ${AUDIO_DIR}" >&2
    exit 1
  fi
fi

[ -f "$MANIFEST" ] || {
  echo "Manifest not found: $MANIFEST" >&2
  exit 1
}
[ -f "$BGM_FILE" ] || {
  echo "BGM file not found: $BGM_FILE" >&2
  exit 1
}

VOICEOVER_OUT="${AUDIO_DIR}/voiceover-aligned.m4a"
MIX_OUT="${AUDIO_DIR}/mix.m4a"
TMP_DIR="renders/git-course/${EPISODE_ID}/renders/tmp/voiceover-build"
mkdir -p "$TMP_DIR"
trap 'rm -rf "$TMP_DIR"' EXIT

SEGMENTS=()
STARTS=()
ENDS=()

while IFS=$'\t' read -r segment start end rest; do
  case "${segment:-}" in
    ''|'#'*) continue ;;
  esac
  if [ -n "${rest:-}" ]; then
    echo "Invalid manifest row for ${segment}: expected 3 tab-separated columns" >&2
    exit 1
  fi
  SEGMENTS+=("$segment")
  STARTS+=("$start")
  ENDS+=("$end")
done < "$MANIFEST"

[ "${#SEGMENTS[@]}" -gt 0 ] || {
  echo "Manifest has no segments: $MANIFEST" >&2
  exit 1
}

if [ "${SKIP_TTS:-0}" != "1" ]; then
  for segment in "${SEGMENTS[@]}"; do
    text_file="${SEGMENTS_DIR}/${segment}.txt"
    audio_file="${SEGMENTS_DIR}/${segment}.mp3"
    [ -f "$text_file" ] || {
      echo "Text file not found: $text_file" >&2
      exit 1
    }
    mmx speech synthesize \
      --model "$TTS_MODEL" \
      --voice "$TTS_VOICE" \
      --language "$TTS_LANGUAGE" \
      --speed "$TTS_SPEED" \
      --text-file "$text_file" \
      --subtitles \
      --out "$audio_file" \
      --non-interactive \
      --quiet
  done
fi

srt_check="${TMP_DIR}/srt-marker-check.txt"
if rg -n '<#|#>' "${SEGMENTS_DIR}"/*.srt >"$srt_check" 2>/dev/null; then
  cat "$srt_check" >&2
  echo "Pause marker leaked into SRT output." >&2
  exit 1
fi
rm -f "$srt_check"

if [ "${SKIP_NORM:-0}" != "1" ]; then
  for segment in "${SEGMENTS[@]}"; do
    ffmpeg -y -hide_banner -nostats \
      -i "${SEGMENTS_DIR}/${segment}.mp3" \
      -af "acompressor=threshold=-22dB:ratio=2.0:attack=8:release=120:makeup=1.0,loudnorm=I=-20:TP=-3:LRA=7,alimiter=limit=0.90" \
      -ar 44100 -ac 1 -c:a libmp3lame -b:a 128k \
      "${SEGMENTS_DIR}/${segment}_norm.mp3"
  done
fi

inputs=()
filters=()
mix_inputs="[base]"
for idx in "${!SEGMENTS[@]}"; do
  segment="${SEGMENTS[$idx]}"
  norm_file="${SEGMENTS_DIR}/${segment}_norm.mp3"
  [ -f "$norm_file" ] || {
    echo "Normalized audio not found: $norm_file" >&2
    exit 1
  }

  duration="$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$norm_file")"
  start="${STARTS[$idx]}"
  end="${ENDS[$idx]}"
  overflow="$(awk -v start="$start" -v dur="$duration" -v end="$end" 'BEGIN {print (start + dur > end) ? 1 : 0}')"
  if [ "$overflow" = "1" ]; then
    echo "Segment ${segment} exceeds its scene window: start=${start}, duration=${duration}, end=${end}" >&2
    exit 1
  fi

  delay_ms="$(awk -v start="$start" 'BEGIN {printf "%d", start * 1000}')"
  inputs+=("-i" "$norm_file")
  filters+=("[${idx}:a]adelay=${delay_ms}:all=1[a${idx}]")
  mix_inputs="${mix_inputs}[a${idx}]"
done

base_index="${#SEGMENTS[@]}"
inputs+=("-f" "lavfi" "-t" "$EPISODE_DURATION" "-i" "anullsrc=channel_layout=mono:sample_rate=44100")
filters+=("[${base_index}:a]anull[base]")
filter_complex="$(IFS=';'; echo "${filters[*]}");${mix_inputs}amix=inputs=$((${#SEGMENTS[@]} + 1)):duration=first:dropout_transition=0,atrim=0:${EPISODE_DURATION}[out]"

ffmpeg -y -hide_banner -nostats \
  "${inputs[@]}" \
  -filter_complex "$filter_complex" \
  -map "[out]" -ar 44100 -ac 1 -c:a aac -b:a 192k \
  "$VOICEOVER_OUT"

ffmpeg -y -hide_banner -nostats \
  -i "$VOICEOVER_OUT" \
  -i "$BGM_FILE" \
  -filter_complex "[0:a]aresample=44100,volume=1.0[vo];[1:a]volume=${BGM_VOLUME}[bg];[vo][bg]amix=inputs=2:duration=longest:dropout_transition=0,alimiter=limit=0.94,atrim=0:${EPISODE_DURATION}[out]" \
  -map "[out]" -ar 44100 -c:a aac -b:a 192k \
  "$MIX_OUT"

if [ -n "$MAIN_VIDEO" ] && [ "${SKIP_REMUX:-0}" != "1" ]; then
  [ -f "$MAIN_VIDEO" ] || {
    echo "Main video not found: $MAIN_VIDEO" >&2
    exit 1
  }
  OUT_VIDEO="${OUT_VIDEO:-$MAIN_VIDEO}"
  tmp_video="${TMP_DIR}/$(basename "$OUT_VIDEO")"
  ffmpeg -y -hide_banner -nostats \
    -i "$MAIN_VIDEO" \
    -i "$MIX_OUT" \
    -map 0:v:0 -map 1:a:0 -c:v copy -c:a copy -shortest \
    "$tmp_video"
  mv "$tmp_video" "$OUT_VIDEO"
fi

echo "Voiceover: $VOICEOVER_OUT"
echo "Mix: $MIX_OUT"
if [ -n "$MAIN_VIDEO" ] && [ "${SKIP_REMUX:-0}" != "1" ]; then
  echo "Muxed: ${OUT_VIDEO:-$MAIN_VIDEO}"
fi
