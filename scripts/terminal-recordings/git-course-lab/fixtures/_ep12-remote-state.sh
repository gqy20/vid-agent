#!/usr/bin/env bash
set -euo pipefail

cd "$TERMINAL_RECORDING_WORKDIR"
git init -q --bare remote.git
git init -q -b main seed
cd seed
printf 'C0\n' > history.txt
git add history.txt
GIT_AUTHOR_DATE='2026-01-12T09:00:00+08:00' GIT_COMMITTER_DATE='2026-01-12T09:00:00+08:00' git commit -q -m 'C0 initial'
printf 'C0\nC1\n' > history.txt
git add history.txt
GIT_AUTHOR_DATE='2026-01-12T09:01:00+08:00' GIT_COMMITTER_DATE='2026-01-12T09:01:00+08:00' git commit -q -m 'C1 shared state'
git remote add origin ../remote.git
git push -q -u origin main
cd ..
git --git-dir=remote.git symbolic-ref HEAD refs/heads/main
git clone -q remote.git local
git -C local remote set-url origin ../remote.git
cd seed
printf 'C0\nC1\nC2\n' > history.txt
git add history.txt
GIT_AUTHOR_DATE='2026-01-12T09:02:00+08:00' GIT_COMMITTER_DATE='2026-01-12T09:02:00+08:00' git commit -q -m 'C2 teammate update'
git push -q origin main
