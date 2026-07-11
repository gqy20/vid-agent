#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PROJECT="${1:-}"
RECORDING_ID="${2:-}"

if [[ -z "$PROJECT" || -z "$RECORDING_ID" ]]; then
  echo "Usage: $0 <project> <recording-id|all|--list>" >&2
  exit 1
fi

BASE="$ROOT/scripts/terminal-recordings/$PROJECT"
DEMO_DIR="$BASE/demos"

if [[ "$RECORDING_ID" == "--list" || "$RECORDING_ID" == "list" ]]; then
  find "$DEMO_DIR" -maxdepth 1 -type f -name '*.sh' ! -name '_lib.sh' -printf '%f\n' | sed 's/\.sh$//' | sort
  exit 0
fi

if [[ "$RECORDING_ID" == "all" ]]; then
  while IFS= read -r recording; do
    "$0" "$PROJECT" "$recording" </dev/null
  done < <("$0" "$PROJECT" --list)
  exit 0
fi

DEMO="$DEMO_DIR/$RECORDING_ID.sh"
FIXTURE="$BASE/fixtures/$RECORDING_ID.sh"
OUT_DIR="$ROOT/remotion/public/$PROJECT/terminal"
OUT="$OUT_DIR/$RECORDING_ID.mp4"
HOLD="$OUT_DIR/$RECORDING_ID-hold.png"
METADATA="$OUT_DIR/$RECORDING_ID.json"
GENERATED_METADATA="$ROOT/remotion/src/videos/git-course/data/terminalRecordings.generated.ts"
TMP_ROOT="${TMPDIR:-/tmp}/vid-agent-terminal-recordings/$PROJECT/$RECORDING_ID-asciinema"
WORKDIR="$TMP_ROOT/work"
HOME_DIR="$TMP_ROOT/home"
CAST="$TMP_ROOT/$RECORDING_ID.cast"
GIF="$TMP_ROOT/$RECORDING_ID.gif"

case "$RECORDING_ID" in
  ep02-add) CURSOR_ROW=3 ;;
  ep02-status-mm) CURSOR_ROW=2 ;;
  ep02-commit) CURSOR_ROW=5 ;;
  *) CURSOR_ROW=-1 ;;
esac

[[ -f "$DEMO" ]] || { echo "Missing demo: $DEMO" >&2; exit 1; }
[[ -f "$FIXTURE" ]] || { echo "Missing fixture: $FIXTURE" >&2; exit 1; }

for command in asciinema agg ffmpeg ffprobe; do
  command -v "$command" >/dev/null || { echo "Missing command: $command" >&2; exit 1; }
done

rm -rf "$TMP_ROOT"
mkdir -p "$WORKDIR" "$HOME_DIR" "$OUT_DIR"

cat >"$HOME_DIR/.gitconfig" <<'EOF'
[user]
	name = Git Course
	email = course@example.local
[init]
	defaultBranch = main
[core]
	autocrlf = false
	pager = cat
[color]
	ui = never
EOF

export GIT_AUTHOR_NAME='Git Course'
export GIT_AUTHOR_EMAIL='course@example.local'
export GIT_COMMITTER_NAME='Git Course'
export GIT_COMMITTER_EMAIL='course@example.local'

TERMINAL_RECORDING_WORKDIR="$WORKDIR" HOME="$HOME_DIR" bash "$FIXTURE"

asciinema rec --quiet --headless --overwrite --return --window-size 72x14 \
  --command "TERMINAL_RECORDING_WORKDIR='$WORKDIR' bash '$DEMO'" "$CAST"

theme='141729,d8dee9,0d101c,d66d67,69a79b,d6a84a,6f93b8,a98bc2,72afa6,d8dee9,7f8a9a,e9827c,82b7aa,e2ba69,86a8c7,b99dce,8dc0b8,f1f4f8'
agg --quiet --cols 72 --rows 14 \
  --font-dir "$ROOT/remotion/public/fonts" --font-family 'GitCourseSourceCodeProMedium' \
  --font-size 32 --line-height 1.60 \
  --fps-cap 30 --last-frame-duration 2 --no-loop --theme "$theme" "$CAST" "$GIF"

GIF_DURATION="$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$GIF")"
CURSOR_START="$(awk -v duration="$GIF_DURATION" 'BEGIN {start = duration - 2 - (1 / 30); if (start < 0) start = 0; printf "%.6f", start}')"
if [[ "$CURSOR_ROW" -ge 0 ]]; then
  CURSOR_Y=$((35 + CURSOR_ROW * 51))
  VIDEO_FILTER="fps=30,drawbox=x=58:y=$CURSOR_Y:w=3:h=26:color=0x8bd49c:t=fill:enable='gte(t,$CURSOR_START)',pad=ceil(iw/2)*2:ceil(ih/2)*2"
else
  VIDEO_FILTER='fps=30,pad=ceil(iw/2)*2:ceil(ih/2)*2'
fi

ffmpeg -loglevel error -y -i "$GIF" -vf "$VIDEO_FILTER" \
  -c:v libx264 -crf 18 -pix_fmt yuv420p -movflags +faststart "$OUT"

ffmpeg -loglevel error -y -sseof -0.2 -i "$OUT" -frames:v 1 "$HOLD"

OUT_FRAMES="$(ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames -of default=noprint_wrappers=1:nokey=1 "$OUT")"
OUT_WIDTH="$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of default=noprint_wrappers=1:nokey=1 "$OUT")"
OUT_HEIGHT="$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of default=noprint_wrappers=1:nokey=1 "$OUT")"
HOLD_FROM_FRAME="$(awk -v start="$CURSOR_START" 'BEGIN {printf "%d", int(start * 30 + 0.5)}')"

printf '{\n  "id": "%s",\n  "durationInFrames": %s,\n  "holdFromFrame": %s,\n  "width": %s,\n  "height": %s,\n  "fps": 30,\n  "font": "Source Code Pro Medium",\n  "fontSize": 32,\n  "lineHeight": 1.6,\n  "theme": "git-course-termius-dark"\n}\n' \
  "$RECORDING_ID" "$OUT_FRAMES" "$HOLD_FROM_FRAME" "$OUT_WIDTH" "$OUT_HEIGHT" > "$METADATA"

node "$ROOT/scripts/terminal-recordings/build-metadata.mjs" "$OUT_DIR" "$GENERATED_METADATA"

printf '%s\n%s\n%s\n' "$OUT" "$HOLD" "$METADATA"
