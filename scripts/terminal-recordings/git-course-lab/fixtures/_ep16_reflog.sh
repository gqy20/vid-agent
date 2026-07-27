#!/usr/bin/env bash
set -euo pipefail
cd "$TERMINAL_RECORDING_WORKDIR"
git init -q -b main repo
for index in 1 2 3; do
  printf 'C%s\n' "$index" >> repo/history.txt
  git -C repo add history.txt
  GIT_AUTHOR_DATE="2026-02-16T09:0${index}:00+08:00" GIT_COMMITTER_DATE="2026-02-16T09:0${index}:00+08:00" git -C repo commit -q -m "C${index} checkpoint"
done

prepare_reset() {
  git -C "$TERMINAL_RECORDING_WORKDIR/repo" reset -q --hard HEAD~2
}
