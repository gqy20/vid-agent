#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/_lib.sh"
cd "$TERMINAL_RECORDING_WORKDIR/local"
begin_terminal
type_command 'git pull --ff-only origin main'
git pull --ff-only origin main
finish_terminal
