#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_lib.sh"

cd "$TERMINAL_RECORDING_WORKDIR/repo"
git repack -ad >/dev/null 2>&1
idx="$(find .git/objects/pack -name '*.idx' -print -quit)"
git verify-pack -v "$idx" | awk 'NF >= 7 {found=1} END {exit !found}'

begin_terminal
type_command 'git verify-pack -v .git/objects/pack/*.idx'
git verify-pack -v "$idx" | awk 'NF >= 7 && found < 3 {print; found++}'
type_command 'git verify-pack -v ... | tail -1'
git verify-pack -v "$idx" | tail -1
finish_terminal
