#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/_lib.sh"
cd "$TERMINAL_RECORDING_WORKDIR"
begin_terminal
type_command 'git tag -a v1.0 -m "release 1.0"'
git tag -a v1.0 -m 'release 1.0'
type_command 'git log --oneline --decorate -2'
git --no-pager log --oneline --decorate -2
finish_terminal
