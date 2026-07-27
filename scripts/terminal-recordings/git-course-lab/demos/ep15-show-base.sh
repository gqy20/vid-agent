#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/_lib.sh"
cd "$TERMINAL_RECORDING_WORKDIR/repo"
begin_terminal
type_command 'git show :1:app.js'
git show :1:app.js
finish_terminal
