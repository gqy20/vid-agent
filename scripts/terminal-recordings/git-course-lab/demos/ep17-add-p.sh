#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/_lib.sh"
cd "$TERMINAL_RECORDING_WORKDIR/repo"
begin_terminal
type_command 'git add -p app.js'
{ sleep 1.1; printf 'y\n' | tee /dev/tty; sleep 1.1; printf 'n\n' | tee /dev/tty; } | git add -p app.js
finish_terminal
