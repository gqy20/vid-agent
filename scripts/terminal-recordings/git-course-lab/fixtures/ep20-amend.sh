#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/_ep20_rewrite.sh"
printf 'amended note\n' >> "$TERMINAL_RECORDING_WORKDIR/repo/notes.md"
git -C "$TERMINAL_RECORDING_WORKDIR/repo" add notes.md
