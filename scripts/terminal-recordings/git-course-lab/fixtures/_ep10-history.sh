#!/usr/bin/env bash
set -euo pipefail

cd "$TERMINAL_RECORDING_WORKDIR"
git init -q -b main
printf 'C0\n' > history.txt
git add history.txt
GIT_AUTHOR_DATE='2026-01-10T09:00:00+08:00' GIT_COMMITTER_DATE='2026-01-10T09:00:00+08:00' git commit -q -m 'C0 initial'

printf 'C0\nC1\n' > history.txt
git add history.txt
GIT_AUTHOR_DATE='2026-01-10T09:01:00+08:00' GIT_COMMITTER_DATE='2026-01-10T09:01:00+08:00' git commit -q -m 'C1 shared base'
git branch feature

printf 'C0\nC1\nC2\n' > history.txt
git add history.txt
GIT_AUTHOR_DATE='2026-01-10T09:02:00+08:00' GIT_COMMITTER_DATE='2026-01-10T09:02:00+08:00' git commit -q -m 'C2 main work'

git switch -q feature
printf 'feature one\n' > feature.txt
git add feature.txt
GIT_AUTHOR_DATE='2026-01-10T09:03:00+08:00' GIT_COMMITTER_DATE='2026-01-10T09:03:00+08:00' git commit -q -m 'F1 feature start'
printf 'feature one\nfeature two\n' > feature.txt
git add feature.txt
GIT_AUTHOR_DATE='2026-01-10T09:04:00+08:00' GIT_COMMITTER_DATE='2026-01-10T09:04:00+08:00' git commit -q -m 'F2 feature ready'
git switch -q main
