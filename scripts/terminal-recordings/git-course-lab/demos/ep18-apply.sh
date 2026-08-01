#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/_lib.sh"
cd "$TERMINAL_RECORDING_WORKDIR/repo"
begin_terminal
type_command 'git stash apply --index stash@{0}'
git stash apply --index 'stash@{0}' >/dev/null
type_command 'git status --short'
semantic_status
finish_terminal
