#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/_lib.sh"
cd "$TERMINAL_RECORDING_WORKDIR"
begin_terminal
type_command 'git cat-file -t v1.0'
git cat-file -t v1.0
type_command 'git rev-parse --short "v1.0^{}"'
git rev-parse --short 'v1.0^{}'
finish_terminal
