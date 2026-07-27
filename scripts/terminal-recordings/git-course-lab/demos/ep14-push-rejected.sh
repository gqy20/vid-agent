#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/_lib.sh"
cd "$TERMINAL_RECORDING_WORKDIR/local"
begin_terminal
type_command 'git push origin main'
git push origin main || true
finish_terminal
