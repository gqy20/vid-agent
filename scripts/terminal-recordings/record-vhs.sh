#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  scripts/terminal-recordings/record-vhs.sh <project> <recording-id>
  scripts/terminal-recordings/record-vhs.sh <project> --list
  scripts/terminal-recordings/record-vhs.sh <project> all

Example:
  scripts/terminal-recordings/record-vhs.sh git-course-lab ep00-git-object
  scripts/terminal-recordings/record-vhs.sh git-course-lab --list
  scripts/terminal-recordings/record-vhs.sh git-course-lab all

Inputs:
  scripts/terminal-recordings/<project>/presets/default.tape
  scripts/terminal-recordings/<project>/tapes/<recording-id>.tape

Optional:
  scripts/terminal-recordings/<project>/fixtures/<recording-id>.sh

Output:
  remotion/public/<project>/terminal/<recording-id>.mp4
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ $# -ne 2 ]]; then
  usage
  exit 1
fi

PROJECT="$1"
RECORDING_ID="$2"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BASE="$ROOT/scripts/terminal-recordings/$PROJECT"

if [[ "$RECORDING_ID" == "--list" || "$RECORDING_ID" == "list" ]]; then
  if [[ ! -d "$BASE/tapes" ]]; then
    echo "Missing tapes directory: $BASE/tapes" >&2
    exit 1
  fi

  find "$BASE/tapes" -maxdepth 1 -type f -name '*.tape' -printf '%f\n' | sed 's/\.tape$//' | sort
  exit 0
fi

if [[ "$RECORDING_ID" == "all" ]]; then
  if [[ ! -d "$BASE/tapes" ]]; then
    echo "Missing tapes directory: $BASE/tapes" >&2
    exit 1
  fi

  mapfile -t RECORDINGS < <(find "$BASE/tapes" -maxdepth 1 -type f -name '*.tape' -printf '%f\n' | sed 's/\.tape$//' | sort)
  if [[ ${#RECORDINGS[@]} -eq 0 ]]; then
    echo "No recordings found in $BASE/tapes" >&2
    exit 1
  fi

  for recording in "${RECORDINGS[@]}"; do
    "$0" "$PROJECT" "$recording"
  done
  exit 0
fi

PRESET="$BASE/presets/default.tape"
BODY="$BASE/tapes/$RECORDING_ID.tape"
FIXTURE="$BASE/fixtures/$RECORDING_ID.sh"
OUT="$ROOT/remotion/public/$PROJECT/terminal/$RECORDING_ID.mp4"

if [[ ! -f "$PRESET" ]]; then
  echo "Missing preset: $PRESET" >&2
  exit 1
fi

if [[ ! -f "$BODY" ]]; then
  echo "Missing recording tape: $BODY" >&2
  exit 1
fi

TMP_ROOT="${TMPDIR:-/tmp}/vid-agent-terminal-recordings/$PROJECT/$RECORDING_ID"
WORKDIR="$TMP_ROOT/work"
HOME_DIR="$TMP_ROOT/home"
SHELL_WRAPPER="$TMP_ROOT/shell"
TAPE="$TMP_ROOT/recording.tape"

rm -rf "$TMP_ROOT"
mkdir -p "$WORKDIR" "$HOME_DIR" "$(dirname "$OUT")"

cat > "$HOME_DIR/.gitconfig" <<'EOF'
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

cat > "$SHELL_WRAPPER" <<'EOF'
#!/usr/bin/env bash
export PS1=$'\[\e[38;2;101;209;200m\]› \[\e[0m\]'
export TERM='xterm-256color'
export PAGER='cat'
export LESS='FRX'
export GIT_PAGER='cat'
export GIT_AUTHOR_NAME='Git Course'
export GIT_AUTHOR_EMAIL='course@example.local'
export GIT_COMMITTER_NAME='Git Course'
export GIT_COMMITTER_EMAIL='course@example.local'
exec bash --noprofile --norc -i
EOF
chmod +x "$SHELL_WRAPPER"

if [[ -f "$FIXTURE" ]]; then
  TERMINAL_RECORDING_WORKDIR="$WORKDIR" HOME="$HOME_DIR" bash "$FIXTURE"
fi

{
  cat "$PRESET"
  printf '\n'
  cat "$BODY"
} > "$TAPE"

cd "$WORKDIR"
HOME="$HOME_DIR" SHELL="$SHELL_WRAPPER" vhs -o "$OUT" "$TAPE"

echo "$OUT"
