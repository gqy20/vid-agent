#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/_ep13_remote_ahead.sh"
git -C local fetch -q origin
git -C local merge -q --ff-only origin/main
printf 'C0\nC1\nC2\nC3\n' > "$TERMINAL_RECORDING_WORKDIR/local/history.txt"
git -C local add history.txt
GIT_AUTHOR_DATE='2026-02-13T09:03:00+08:00' GIT_COMMITTER_DATE='2026-02-13T09:03:00+08:00' git -C local commit -q -m 'C3 local work'
