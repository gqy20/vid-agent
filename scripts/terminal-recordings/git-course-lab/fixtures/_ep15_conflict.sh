#!/usr/bin/env bash
set -euo pipefail
cd "$TERMINAL_RECORDING_WORKDIR"
git init -q -b main repo
printf 'const title = "base";\n' > repo/app.js
git -C repo add app.js
GIT_AUTHOR_DATE='2026-02-15T09:00:00+08:00' GIT_COMMITTER_DATE='2026-02-15T09:00:00+08:00' git -C repo commit -q -m 'C0 base'
git -C repo branch feature
printf 'const title = "main";\n' > repo/app.js
git -C repo add app.js
GIT_AUTHOR_DATE='2026-02-15T09:01:00+08:00' GIT_COMMITTER_DATE='2026-02-15T09:01:00+08:00' git -C repo commit -q -m 'M1 main edit'
git -C repo switch -q feature
printf 'const title = "feature";\n' > repo/app.js
git -C repo add app.js
GIT_AUTHOR_DATE='2026-02-15T09:02:00+08:00' GIT_COMMITTER_DATE='2026-02-15T09:02:00+08:00' git -C repo commit -q -m 'F1 feature edit'
git -C repo switch -q main

prepare_conflict() {
  git -C "$TERMINAL_RECORDING_WORKDIR/repo" merge feature >/dev/null 2>&1 || true
}

prepare_resolved() {
  prepare_conflict
  printf 'const title = "resolved";\n' > "$TERMINAL_RECORDING_WORKDIR/repo/app.js"
}
