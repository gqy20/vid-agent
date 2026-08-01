#!/usr/bin/env bash
set -euo pipefail
cd "$TERMINAL_RECORDING_WORKDIR"
git init -q -b main repo
printf 'export function request() {\n  const retries = 2;\n  const timeout = 20;\n  return {retries, timeout};\n}\n' > repo/app.js
git -C repo add app.js
GIT_AUTHOR_DATE='2026-02-22T09:00:00+08:00' GIT_COMMITTER_DATE='2026-02-22T09:00:00+08:00' git -C repo commit -q -m 'C0 base request'
sed -i 's/timeout = 20/timeout = 45/' repo/app.js
git -C repo add app.js
GIT_AUTHOR_DATE='2026-02-22T09:01:00+08:00' GIT_COMMITTER_DATE='2026-02-22T09:01:00+08:00' git -C repo commit -q -m 'C1 prevent early timeout'
git -C repo tag semantic-change
sed -i 's/const timeout = 45/const timeout  =  45/' repo/app.js
git -C repo add app.js
GIT_AUTHOR_DATE='2026-02-22T09:02:00+08:00' GIT_COMMITTER_DATE='2026-02-22T09:02:00+08:00' git -C repo commit -q -m 'C2 format assignments'
