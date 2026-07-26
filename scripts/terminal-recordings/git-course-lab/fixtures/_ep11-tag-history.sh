#!/usr/bin/env bash
set -euo pipefail

cd "$TERMINAL_RECORDING_WORKDIR"
git init -q -b main
printf '0.9.0\n' > VERSION
git add VERSION
GIT_AUTHOR_DATE='2026-01-11T09:00:00+08:00' GIT_COMMITTER_DATE='2026-01-11T09:00:00+08:00' git commit -q -m 'C0 start project'
printf '1.0.0\n' > VERSION
git add VERSION
GIT_AUTHOR_DATE='2026-01-11T09:01:00+08:00' GIT_COMMITTER_DATE='2026-01-11T09:01:00+08:00' git commit -q -m 'C1 release 1.0'
