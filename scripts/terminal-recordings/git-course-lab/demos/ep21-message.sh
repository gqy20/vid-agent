#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/_lib.sh"; cd "$TERMINAL_RECORDING_WORKDIR/repo"; begin_terminal
type_command 'git log --grep=timeout --oneline'; git log --grep=timeout --oneline; finish_terminal
