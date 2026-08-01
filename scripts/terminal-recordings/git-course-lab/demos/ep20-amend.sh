#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/_lib.sh"
cd "$TERMINAL_RECORDING_WORKDIR/repo"
export GIT_COMMITTER_DATE='2026-02-20T09:05:00+08:00'
begin_terminal
type_command "git commit --amend -m 'C3 complete note'"
git commit --amend -m 'C3 complete note'
finish_terminal
