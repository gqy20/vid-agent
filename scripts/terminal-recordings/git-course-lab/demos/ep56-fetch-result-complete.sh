#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_lib.sh"

cd "$TERMINAL_RECORDING_WORKDIR/client"
remote="$(cat ../remote-tip)"
begin_terminal
type_command 'git rev-parse origin/main'
git rev-parse origin/main
type_command 'git cat-file -e <remote-tip> || echo MISSING'
git cat-file -e "$remote" 2>/dev/null || printf 'MISSING\n'
type_command 'git fetch -q origin'
git fetch -q origin
type_command 'git rev-parse origin/main'
git rev-parse origin/main
type_command 'git branch --show-current'
git branch --show-current
finish_terminal
