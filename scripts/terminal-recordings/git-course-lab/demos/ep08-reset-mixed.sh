#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/_lib.sh"
cd "$TERMINAL_RECORDING_WORKDIR"
begin_terminal
type_command 'git reset HEAD~'
git reset HEAD~ >/dev/null
type_command 'git status --short'
semantic_status
finish_terminal
