#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/_lib.sh"
cd "$TERMINAL_RECORDING_WORKDIR"
begin_terminal
type_command 'git add app.js'
git add app.js
sleep 0.6
type_command 'git status --short'
semantic_status
finish_terminal
