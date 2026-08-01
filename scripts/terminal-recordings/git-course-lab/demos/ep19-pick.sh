#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/_lib.sh"
cd "$TERMINAL_RECORDING_WORKDIR/repo"
export GIT_COMMITTER_DATE='2026-02-19T09:05:00+08:00'
begin_terminal
type_command 'git cherry-pick pick-source'
git cherry-pick pick-source
finish_terminal
