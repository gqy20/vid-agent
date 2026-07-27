#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/_lib.sh"
cd "$TERMINAL_RECORDING_WORKDIR/repo"
begin_terminal
type_command 'git -c core.editor=true merge --continue'
git -c core.editor=true merge --continue
finish_terminal
