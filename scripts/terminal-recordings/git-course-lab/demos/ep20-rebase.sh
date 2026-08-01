#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/_lib.sh"
cd "$TERMINAL_RECORDING_WORKDIR/repo"
export GIT_SEQUENCE_EDITOR="$TERMINAL_RECORDING_WORKDIR/sequence-editor.sh"
export GIT_EDITOR=true
begin_terminal
type_command 'git rebase -i --root'
git rebase -i --root
finish_terminal
