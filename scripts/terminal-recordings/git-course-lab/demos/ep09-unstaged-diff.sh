#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/_lib.sh"
cd "$TERMINAL_RECORDING_WORKDIR"
begin_terminal

type_command 'git diff -- app.js'
git -c color.ui=always --no-pager diff -- app.js
finish_terminal
