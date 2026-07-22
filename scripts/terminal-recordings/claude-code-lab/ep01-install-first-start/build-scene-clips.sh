#!/usr/bin/env bash
set -euo pipefail

INPUT=${1:?usage: build-scene-clips.sh <masked-input.mp4> <output-dir> [recording-id]}
OUTPUT_DIR=${2:?usage: build-scene-clips.sh <masked-input.mp4> <output-dir> [recording-id]}
RECORDING_ID=${3:-ep01-install-first-start}

mkdir -p "$OUTPUT_DIR"

build_clip() {
  local name=$1
  local start=$2
  local duration=$3
  local output="$OUTPUT_DIR/$RECORDING_ID-$name-clip.mp4"
  local frame_dir="$OUTPUT_DIR/$RECORDING_ID-$name-clip-frames"

  ffmpeg -hide_banner -loglevel error -y \
    -ss "$start" -i "$INPUT" -t "$duration" -an \
    -c:v libx264 -preset fast -crf 14 -pix_fmt yuv420p \
    -g 15 -keyint_min 15 -sc_threshold 0 -bf 0 -movflags +faststart \
    "$output"

  ffprobe -v error -select_streams v:0 \
    -show_entries stream=width,height,r_frame_rate \
    -of csv=p=0 "$output" >/dev/null

  mkdir -p "$frame_dir"
  ffmpeg -hide_banner -loglevel error -y -i "$output" \
    -fps_mode passthrough -compression_level 3 -pred mixed \
    "$frame_dir/f_%05d.png"
}

# These windows are sourced from the recording timeline and intentionally begin
# at frame zero in Remotion. Dense keyframes keep 4K frame extraction bounded.
build_clip install 3.45 24.57
build_clip shell 28.05 8.19
build_clip settings 36.27 10.27
build_clip first-start 46.58 26.20
