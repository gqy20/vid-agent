#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/_lib.sh"
cd "$TERMINAL_RECORDING_WORKDIR/repo"
begin_terminal
type_command 'git rev-parse pick-source HEAD'
git rev-parse pick-source HEAD
finish_terminal
