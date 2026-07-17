#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/_lib.sh"
cd "$TERMINAL_RECORDING_WORKDIR"
begin_terminal
type_command 'git revert --no-edit HEAD'
git revert --no-edit HEAD
sleep 0.6
type_command 'git log --oneline -2'
git log --oneline -2
finish_terminal
