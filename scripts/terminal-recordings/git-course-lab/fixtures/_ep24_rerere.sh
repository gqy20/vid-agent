#!/usr/bin/env bash
set -euo pipefail
cd "$TERMINAL_RECORDING_WORKDIR"
git init -q -b main repo
git -C repo config rerere.enabled true
printf 'export const mode = "base";\n' > repo/app.js
git -C repo add app.js
GIT_AUTHOR_DATE='2026-02-24T09:00:00+08:00' GIT_COMMITTER_DATE='2026-02-24T09:00:00+08:00' git -C repo commit -q -m 'C0 base'
git -C repo branch topic
printf 'export const mode = "main";\n' > repo/app.js
git -C repo add app.js
GIT_AUTHOR_DATE='2026-02-24T09:01:00+08:00' GIT_COMMITTER_DATE='2026-02-24T09:01:00+08:00' git -C repo commit -q -m 'M1 main mode'
git -C repo tag main-before
git -C repo switch -q topic
printf 'export const mode = "topic";\n' > repo/app.js
git -C repo add app.js
GIT_AUTHOR_DATE='2026-02-24T09:02:00+08:00' GIT_COMMITTER_DATE='2026-02-24T09:02:00+08:00' git -C repo commit -q -m 'F1 topic mode'
git -C repo switch -q main
first_conflict() { git -C "$TERMINAL_RECORDING_WORKDIR/repo" merge topic >/dev/null 2>&1 || true; }
record_resolution() { first_conflict; printf 'export const mode = "resolved";\n' > "$TERMINAL_RECORDING_WORKDIR/repo/app.js"; git -C "$TERMINAL_RECORDING_WORKDIR/repo" add app.js; GIT_AUTHOR_DATE='2026-02-24T09:03:00+08:00' GIT_COMMITTER_DATE='2026-02-24T09:03:00+08:00' git -C "$TERMINAL_RECORDING_WORKDIR/repo" commit -q -m 'merge topic'; }
repeat_conflict() { record_resolution; git -C "$TERMINAL_RECORDING_WORKDIR/repo" reset -q --hard main-before; git -C "$TERMINAL_RECORDING_WORKDIR/repo" merge topic >/dev/null 2>&1 || true; }
