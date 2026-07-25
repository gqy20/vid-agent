#!/usr/bin/env bash
set -euo pipefail

cd "$TERMINAL_RECORDING_WORKDIR"
git init -q -b main
printf 'export const mode = "basic";\n' > app.js
git add app.js
GIT_AUTHOR_DATE='2026-01-09T09:00:00+08:00' GIT_COMMITTER_DATE='2026-01-09T09:00:00+08:00' git commit -q -m 'C0 initial app'

printf 'export const mode = "basic";\nexport const cache = false;\n' > app.js
git add app.js
GIT_AUTHOR_DATE='2026-01-09T09:01:00+08:00' GIT_COMMITTER_DATE='2026-01-09T09:01:00+08:00' git commit -q -m 'C1 add cache option'

printf 'export const mode = "advanced";\nexport const cache = true;\n' > app.js
git add app.js
GIT_AUTHOR_DATE='2026-01-09T09:02:00+08:00' GIT_COMMITTER_DATE='2026-01-09T09:02:00+08:00' git commit -q -m 'C2 enable advanced mode'
