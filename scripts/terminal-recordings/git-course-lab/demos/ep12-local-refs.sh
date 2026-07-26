#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/_lib.sh"
cd "$TERMINAL_RECORDING_WORKDIR/local"
begin_terminal
type_command 'git branch -avv'
git --no-pager branch -avv
finish_terminal
