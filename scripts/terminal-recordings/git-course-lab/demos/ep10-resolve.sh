#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/_lib.sh"
cd "$TERMINAL_RECORDING_WORKDIR"
begin_terminal
type_command 'git rev-parse --short main'
git rev-parse --short main
type_command 'git rev-parse --short feature'
git rev-parse --short feature
type_command 'git rev-parse --short HEAD~2'
git rev-parse --short HEAD~2
finish_terminal
