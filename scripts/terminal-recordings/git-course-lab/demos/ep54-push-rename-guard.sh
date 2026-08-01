#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_lib.sh"

cd "$TERMINAL_RECORDING_WORKDIR/local"
git fetch -q origin topic
git switch -q -c topic FETCH_HEAD

begin_terminal
type_command 'git push origin refs/heads/topic:refs/heads/review'
git push -q origin refs/heads/topic:refs/heads/review
type_command 'git -C ../remote.git show-ref refs/heads/review'
git -C ../remote.git show-ref refs/heads/review
type_command 'git push origin refs/heads/main:refs/heads/review'
if git push -q origin refs/heads/main:refs/heads/review 2>/dev/null; then
  printf 'unexpected: update accepted\n'
  exit 1
else
  printf 'rejected: non-fast-forward\n'
fi
type_command 'git -C ../remote.git show-ref refs/heads/review'
git -C ../remote.git show-ref refs/heads/review
finish_terminal
