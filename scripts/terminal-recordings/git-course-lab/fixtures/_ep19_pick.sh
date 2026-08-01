#!/usr/bin/env bash
set -euo pipefail
cd "$TERMINAL_RECORDING_WORKDIR"
git init -q -b main repo
printf 'export const total = 0;\n' > repo/app.js
git -C repo add app.js
GIT_AUTHOR_DATE='2026-02-19T09:00:00+08:00' GIT_COMMITTER_DATE='2026-02-19T09:00:00+08:00' git -C repo commit -q -m 'C0 base'
git -C repo switch -q -c feature
printf 'feature notes\n' > repo/feature.md
git -C repo add feature.md
GIT_AUTHOR_DATE='2026-02-19T09:01:00+08:00' GIT_COMMITTER_DATE='2026-02-19T09:01:00+08:00' git -C repo commit -q -m 'F1 add cart label'
sed -i 's/total = 0/total = 1/' repo/app.js
git -C repo add app.js
GIT_AUTHOR_DATE='2026-02-19T09:02:00+08:00' GIT_COMMITTER_DATE='2026-02-19T09:02:00+08:00' git -C repo commit -q -m 'F2 fix minimum total'
git -C repo tag pick-source
printf 'export const helper = true;\n' >> repo/app.js
git -C repo add app.js
GIT_AUTHOR_DATE='2026-02-19T09:03:00+08:00' GIT_COMMITTER_DATE='2026-02-19T09:03:00+08:00' git -C repo commit -q -m 'F3 refactor helper'
git -C repo switch -q main
printf 'main notes\n' > repo/README.md
git -C repo add README.md
GIT_AUTHOR_DATE='2026-02-19T09:04:00+08:00' GIT_COMMITTER_DATE='2026-02-19T09:04:00+08:00' git -C repo commit -q -m 'M1 document main'

prepare_pick() {
  GIT_COMMITTER_DATE='2026-02-19T09:05:00+08:00' git -C "$TERMINAL_RECORDING_WORKDIR/repo" cherry-pick pick-source >/dev/null
}
