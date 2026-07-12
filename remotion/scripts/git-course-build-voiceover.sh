#!/usr/bin/env bash
# Build segmented Git course narration with one fixed MiniMax voice.
#
# Run from the Remotion project root.
#
# Usage:
#   scripts/git-course-build-voiceover.sh <episode-id> [main-video]
#
# Manifest columns, tab-separated:
#   segment_id  voice_start_seconds  scene_end_seconds
#
# Example:
#   01_hook  0.2  12.0
#
# Outputs:
#   renders/git-course/<episode-id>/current/audio/voiceover-aligned.m4a
#   renders/git-course/<episode-id>/current/audio/mix.m4a
#
# Optional env:
#   TTS_MODEL=speech-2.8-hd
#   TTS_VOICE='Chinese (Mandarin)_Gentleman'
#   TTS_LANGUAGE=zh
#   TTS_SPEED=1.25
#   SKIP_TTS=1
#   SKIP_NORM=1
#   SKIP_REMUX=1
#   TTS_SEGMENTS=01_hook,02_model  only regenerate these segments
#   TTS_JOBS=all                    synthesize all dirty segments concurrently
#   NORMALIZE_JOBS=all              normalize all dirty segments concurrently
#   CLEAN_SRT_PUNCTUATION=0
#   BGM_FILE=<path>
#   OUT_VIDEO=<path>
#   MASTER_LUFS=-16
#   MASTER_TRUE_PEAK=-2.2
#   FINAL_TRUE_PEAK_CEILING=-1.5
#   MASTER_LRA=7
set -euo pipefail

usage() {
  sed -n '2,34p' "$0" >&2
}

[ $# -ge 1 ] || {
  usage
  exit 1
}

EPISODE_ID="$1"
MAIN_VIDEO="${2:-}"
MANIFEST="$(node scripts/git-course.mjs narration "$EPISODE_ID" | tail -n 1)"

AUDIO_DIR="renders/git-course/${EPISODE_ID}/current/audio"
SOURCE_SEGMENTS_DIR="$(dirname "$MANIFEST")"
SEGMENTS_DIR="${AUDIO_DIR}/segments"
mkdir -p "$SEGMENTS_DIR"

TTS_MODEL="${TTS_MODEL:-speech-2.8-hd}"
TTS_VOICE="${TTS_VOICE:-Chinese (Mandarin)_Gentleman}"
TTS_LANGUAGE="${TTS_LANGUAGE:-zh}"
TTS_SPEED="${TTS_SPEED:-1.25}"
TTS_SEGMENTS="${TTS_SEGMENTS:-}"
TTS_JOBS="${TTS_JOBS:-all}"
NORMALIZE_JOBS="${NORMALIZE_JOBS:-all}"
BGM_VOLUME="${BGM_VOLUME:-0.05}"
BGM_FILE="${BGM_FILE:-}"
MASTER_LUFS="${MASTER_LUFS:--16}"
MASTER_TRUE_PEAK="${MASTER_TRUE_PEAK:--2.2}"
MASTER_LRA="${MASTER_LRA:-7}"
FINAL_TRUE_PEAK_CEILING="${FINAL_TRUE_PEAK_CEILING:--1.5}"

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

# Keep maintainable narration sources under git-course; stage only the files
# needed by the media build into current.
cp "$MANIFEST" "${SEGMENTS_DIR}/manifest.tsv"
[ -f "$BGM_FILE" ] || {
  echo "BGM file not found: $BGM_FILE" >&2
  exit 1
}

VOICEOVER_OUT="${AUDIO_DIR}/voiceover-aligned.m4a"
MIX_OUT="${AUDIO_DIR}/mix.m4a"
TMP_DIR="renders/git-course/${EPISODE_ID}/tmp/voiceover-build"
PREMASTER_OUT="${TMP_DIR}/premaster.m4a"
LOUDNORM_STATS="${TMP_DIR}/loudnorm-pass1.log"
FINAL_LOUDNESS_STATS="${TMP_DIR}/loudness-qa.log"
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

segment_selected() {
  local segment="$1"
  [ -z "$TTS_SEGMENTS" ] || [[ ",$TTS_SEGMENTS," == *",$segment,"* ]]
}

wait_for_slot() {
  local limit="$1"
  if [ "$limit" = "all" ]; then
    return
  fi
  while [ "$(jobs -pr | wc -l | tr -d ' ')" -ge "$limit" ]; do
    wait -n
  done
}

last_segment_index=$((${#ENDS[@]} - 1))
EPISODE_DURATION="${EPISODE_DURATION:-${ENDS[$last_segment_index]}}"

clean_srt_punctuation() {
  local srt_file="$1"
  perl -0pi -e '
    s/\r\n/\n/g;
    my @lines = split /\n/, $_, -1;
    for my $line (@lines) {
      next if $line =~ /^\s*$/;
      next if $line =~ /^\d+$/;
      next if $line =~ /-->/;
      $line =~ s/^\s*\((?:breath|sighs?|sigh|clear-throat|clears throat|laughs?|chuckles?)\)\s*//ig;
      $line =~ s/[。；;]+\s*$//;
      $line =~ s/(?<=[\p{Han}A-Za-z0-9])\.\s*$//;
    }
    $_ = join "\n", @lines;
  ' "$srt_file"
}

if [ "${SKIP_TTS:-0}" != "1" ]; then
  for segment in "${SEGMENTS[@]}"; do
    segment_selected "$segment" || continue
    wait_for_slot "$TTS_JOBS"
    source_text_file="${SOURCE_SEGMENTS_DIR}/${segment}.txt"
    text_file="${SEGMENTS_DIR}/${segment}.txt"
    audio_file="${SEGMENTS_DIR}/${segment}.mp3"
    [ -f "$source_text_file" ] || {
      echo "Text file not found: $source_text_file" >&2
      exit 1
    }
    (
      cp "$source_text_file" "$text_file"
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
    ) &
  done
  wait
fi

if [ "${CLEAN_SRT_PUNCTUATION:-1}" != "0" ]; then
  for segment in "${SEGMENTS[@]}"; do
    segment_selected "$segment" || continue
    srt_file="${SEGMENTS_DIR}/${segment}.srt"
    [ -f "$srt_file" ] || {
      echo "SRT file not found: $srt_file" >&2
      exit 1
    }
    clean_srt_punctuation "$srt_file"
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
    segment_selected "$segment" || continue
    wait_for_slot "$NORMALIZE_JOBS"
    (
      ffmpeg -y -hide_banner -nostats \
        -i "${SEGMENTS_DIR}/${segment}.mp3" \
        -af "acompressor=threshold=-22dB:ratio=2.0:attack=8:release=120:makeup=1.0,loudnorm=I=-20:TP=-3:LRA=7,alimiter=limit=0.90" \
        -ar 44100 -ac 1 -c:a libmp3lame -b:a 128k \
        "${SEGMENTS_DIR}/${segment}_norm.mp3"
    ) &
  done
  wait
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
filter_complex="$(IFS=';'; echo "${filters[*]}");${mix_inputs}amix=inputs=$((${#SEGMENTS[@]} + 1)):duration=first:dropout_transition=0:normalize=0,atrim=0:${EPISODE_DURATION}[out]"

ffmpeg -y -hide_banner -nostats \
  "${inputs[@]}" \
  -filter_complex "$filter_complex" \
  -map "[out]" -ar 44100 -ac 1 -c:a aac -b:a 192k \
  "$VOICEOVER_OUT"

ffmpeg -y -hide_banner -nostats \
  -i "$VOICEOVER_OUT" \
  -stream_loop -1 \
  -i "$BGM_FILE" \
  -filter_complex "[0:a]aresample=48000,volume=1.0[vo];[1:a]aresample=48000,volume=${BGM_VOLUME},atrim=0:${EPISODE_DURATION},asetpts=N/SR/TB[bg];[vo][bg]amix=inputs=2:duration=first:dropout_transition=0:normalize=0,alimiter=limit=0.94,atrim=0:${EPISODE_DURATION}[out]" \
  -map "[out]" -ar 48000 -ac 2 -c:a aac -b:a 256k \
  "$PREMASTER_OUT"

# Measure the complete programme first, then apply a deterministic second pass.
# Segment-level normalization keeps narration takes consistent; this programme-level
# pass makes the actual upload file consistent after narration and BGM are combined.
ffmpeg -hide_banner -nostats \
  -i "$PREMASTER_OUT" \
  -af "loudnorm=I=${MASTER_LUFS}:TP=${MASTER_TRUE_PEAK}:LRA=${MASTER_LRA}:print_format=json" \
  -f null - >/dev/null 2>"$LOUDNORM_STATS"

LOUDNORM_FILTER="$(node - "$LOUDNORM_STATS" "$MASTER_LUFS" "$MASTER_TRUE_PEAK" "$MASTER_LRA" <<'NODE'
const fs = require('node:fs');
const [statsPath, targetI, targetTp, targetLra] = process.argv.slice(2);
const log = fs.readFileSync(statsPath, 'utf8');
const match = log.match(/\{\s*"input_i"[\s\S]*?\}/);
if (!match) throw new Error(`Could not parse loudnorm stats from ${statsPath}`);
const stats = JSON.parse(match[0]);
for (const key of ['input_i', 'input_tp', 'input_lra', 'input_thresh', 'target_offset']) {
  if (!Number.isFinite(Number(stats[key]))) throw new Error(`Invalid loudnorm ${key}: ${stats[key]}`);
}
process.stdout.write([
  `loudnorm=I=${targetI}`,
  `TP=${targetTp}`,
  `LRA=${targetLra}`,
  `measured_I=${stats.input_i}`,
  `measured_TP=${stats.input_tp}`,
  `measured_LRA=${stats.input_lra}`,
  `measured_thresh=${stats.input_thresh}`,
  `offset=${stats.target_offset}`,
  'linear=true',
  'print_format=summary',
].join(':'));
NODE
)"

ffmpeg -y -hide_banner -nostats \
  -i "$PREMASTER_OUT" \
  -af "${LOUDNORM_FILTER},alimiter=limit=0.98" \
  -ar 48000 -ac 2 -c:a aac -b:a 256k \
  "$MIX_OUT"

ffmpeg -hide_banner -nostats \
  -i "$MIX_OUT" \
  -af "loudnorm=I=${MASTER_LUFS}:TP=${MASTER_TRUE_PEAK}:LRA=${MASTER_LRA}:print_format=json" \
  -f null - >/dev/null 2>"$FINAL_LOUDNESS_STATS"

node - "$FINAL_LOUDNESS_STATS" "$MASTER_LUFS" "$FINAL_TRUE_PEAK_CEILING" <<'NODE'
const fs = require('node:fs');
const [statsPath, targetIText, truePeakCeilingText] = process.argv.slice(2);
const log = fs.readFileSync(statsPath, 'utf8');
const match = log.match(/\{\s*"input_i"[\s\S]*?\}/);
if (!match) throw new Error(`Could not parse final loudness stats from ${statsPath}`);
const stats = JSON.parse(match[0]);
const integrated = Number(stats.input_i);
const truePeak = Number(stats.input_tp);
const targetI = Number(targetIText);
const truePeakCeiling = Number(truePeakCeilingText);
if (!Number.isFinite(integrated) || Math.abs(integrated - targetI) > 0.6) {
  throw new Error(`Final integrated loudness ${integrated} LUFS is outside ${targetI} +/- 0.6 LU`);
}
if (!Number.isFinite(truePeak) || truePeak > truePeakCeiling) {
  throw new Error(`Final true peak ${truePeak} dBTP exceeds ${truePeakCeiling} dBTP`);
}
console.log(`Loudness QA: ${integrated.toFixed(1)} LUFS, ${truePeak.toFixed(1)} dBTP`);
NODE

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
