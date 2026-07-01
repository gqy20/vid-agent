#!/usr/bin/env bash
# Post-process: voice + BGM, muxed onto brand-concat.mp4.
# Uses mmx-cli for TTS and BGM generation.
#
# Prerequisites (install once):
#   curl -fsSL https://minimax.ai/install.sh | bash   # hypothetical
#   mmx voice --help
#   mmx music --help
#
# Usage:
#   bash scripts/mmx_post.sh

set -euo pipefail

CONCAT="renders/final/brand-concat.mp4"
VOICE_OUT="tts/voice.wav"
BGM_OUT="bgm/bgm.wav"
SCRIPT="scripts/voice-script.txt"
FINAL="renders/final/brand-final.mp4"

[[ -f "$CONCAT" ]]  || { echo "Run concat.sh first"; exit 1; }
[[ -f "$SCRIPT" ]]  || { echo "Missing $SCRIPT"; exit 1; }
mkdir -p tts bgm

echo "==> generating voice"
mmx voice --script "$SCRIPT" --lang zh --output "$VOICE_OUT"

echo "==> generating BGM (35s, tech+calm)"
mmx music --mood "tech, calm, modern, educational" --length 35s --output "$BGM_OUT"

echo "==> muxing voice + BGM into concat"
ffmpeg -y -hide_banner \
       -i "$CONCAT" -i "$VOICE_OUT" -i "$BGM_OUT" \
       -filter_complex "[1:a]volume=0.95[v]; [2:a]volume=0.18[b]; [v][b]amix=inputs=2:duration=longest[m]; [m][1:a]amix=inputs=2:duration=longest[aout]" \
       -map 0:v -map "[aout]" \
       -c:v copy -c:a aac -b:a 192k \
       -shortest \
       "$FINAL"

echo "Wrote: $FINAL"
