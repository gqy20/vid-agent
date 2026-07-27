#!/usr/bin/env bash
set -euo pipefail
cd "$TERMINAL_RECORDING_WORKDIR"
git init -q --bare remote.git
git init -q -b main seed
printf 'base\n' > seed/history.txt
git -C seed add history.txt
GIT_AUTHOR_DATE='2026-02-14T09:00:00+08:00' GIT_COMMITTER_DATE='2026-02-14T09:00:00+08:00' git -C seed commit -q -m 'C0 shared base'
git -C seed remote add origin ../remote.git
git -C seed push -q -u origin main
git --git-dir=remote.git symbolic-ref HEAD refs/heads/main
git clone -q remote.git local
git -C local remote set-url origin ../remote.git
printf 'base\nserver\n' > seed/history.txt
git -C seed add history.txt
GIT_AUTHOR_DATE='2026-02-14T09:01:00+08:00' GIT_COMMITTER_DATE='2026-02-14T09:01:00+08:00' git -C seed commit -q -m 'R1 server work'
git -C seed push -q origin main
printf 'local\n' > local/local.txt
git -C local add local.txt
GIT_AUTHOR_DATE='2026-02-14T09:02:00+08:00' GIT_COMMITTER_DATE='2026-02-14T09:02:00+08:00' git -C local commit -q -m 'L1 local work'
