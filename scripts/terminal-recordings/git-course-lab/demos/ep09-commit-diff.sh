#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/_lib.sh"
cd "$TERMINAL_RECORDING_WORKDIR"
begin_terminal

type_command 'git log --oneline -3'
git --no-pager log --oneline -3
sleep 0.7

type_command 'git diff HEAD~1 HEAD -- app.js'
git -c color.ui=always --no-pager diff HEAD~1 HEAD -- app.js
finish_terminal
