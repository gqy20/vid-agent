#!/usr/bin/env bash
set -euo pipefail

cd "$TERMINAL_RECORDING_WORKDIR"
git init -q -b main

export GIT_AUTHOR_DATE='2026-01-07T09:00:00+08:00'
export GIT_COMMITTER_DATE="$GIT_AUTHOR_DATE"
printf 'export const title = "Git Course";\n' > app.js
git add app.js
git commit -q -m 'start course'

git branch feature

export GIT_AUTHOR_DATE='2026-01-07T09:01:00+08:00'
export GIT_COMMITTER_DATE="$GIT_AUTHOR_DATE"
printf 'export const version = 2;\n' >> app.js
git add app.js
git commit -q -m 'update main'

git switch -q feature
export GIT_AUTHOR_DATE='2026-01-07T09:02:00+08:00'
export GIT_COMMITTER_DATE="$GIT_AUTHOR_DATE"
printf '# Rebase notes\n' > notes.md
git add notes.md
git commit -q -m 'add notes'

export GIT_AUTHOR_DATE='2026-01-07T09:03:00+08:00'
export GIT_COMMITTER_DATE="$GIT_AUTHOR_DATE"
printf 'rebase keeps history linear\n' >> notes.md
git add notes.md
git commit -q -m 'explain rebase'
