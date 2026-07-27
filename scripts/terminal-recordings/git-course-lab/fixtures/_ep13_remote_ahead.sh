#!/usr/bin/env bash
set -euo pipefail

cd "$TERMINAL_RECORDING_WORKDIR"
git init -q --bare remote.git
git init -q -b main seed
printf 'C0\n' > seed/history.txt
git -C seed add history.txt
GIT_AUTHOR_DATE='2026-02-13T09:00:00+08:00' GIT_COMMITTER_DATE='2026-02-13T09:00:00+08:00' git -C seed commit -q -m 'C0 initial'
printf 'C0\nC1\n' > seed/history.txt
git -C seed add history.txt
GIT_AUTHOR_DATE='2026-02-13T09:01:00+08:00' GIT_COMMITTER_DATE='2026-02-13T09:01:00+08:00' git -C seed commit -q -m 'C1 shared state'
git -C seed remote add origin ../remote.git
git -C seed push -q -u origin main
git --git-dir=remote.git symbolic-ref HEAD refs/heads/main
git clone -q remote.git local
git -C local remote set-url origin ../remote.git
printf 'C0\nC1\nC2\n' > seed/history.txt
git -C seed add history.txt
GIT_AUTHOR_DATE='2026-02-13T09:02:00+08:00' GIT_COMMITTER_DATE='2026-02-13T09:02:00+08:00' git -C seed commit -q -m 'C2 server update'
git -C seed push -q origin main
