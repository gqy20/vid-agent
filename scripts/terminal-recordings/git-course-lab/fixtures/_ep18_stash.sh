#!/usr/bin/env bash
set -euo pipefail
cd "$TERMINAL_RECORDING_WORKDIR"
git init -q -b main repo
printf 'export const mode = "stable";\n' > repo/config.js
printf 'console.log("base");\n' > repo/app.js
git -C repo add config.js app.js
GIT_AUTHOR_DATE='2026-02-18T09:00:00+08:00' GIT_COMMITTER_DATE='2026-02-18T09:00:00+08:00' git -C repo commit -q -m 'base app'
printf 'export const mode = "preview";\n' > repo/config.js
git -C repo add config.js
printf 'console.log("work in progress");\n' > repo/app.js
printf 'private note\n' > repo/notes.tmp

prepare_stash() {
  git -C "$TERMINAL_RECORDING_WORKDIR/repo" stash push -q -m 'switch task'
}
