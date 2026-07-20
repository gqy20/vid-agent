#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/_lib.sh"
cd "$TERMINAL_RECORDING_WORKDIR"
begin_terminal

type_command 'git merge feature'
git merge feature || true
sleep 0.8

type_command 'git status --short'
semantic_status
finish_terminal
