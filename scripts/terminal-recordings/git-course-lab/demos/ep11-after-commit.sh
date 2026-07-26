#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/_lib.sh"
cd "$TERMINAL_RECORDING_WORKDIR"
begin_terminal
type_command 'git log --oneline --decorate -3'
git --no-pager log --oneline --decorate -3
finish_terminal
