#!/usr/bin/env bash
set -euo pipefail

cd "$TERMINAL_RECORDING_WORKDIR"
git init -q -b main
printf 'export const theme = "light";\nexport const retries = 2;\n' > app.js
git add app.js
GIT_AUTHOR_DATE='2026-01-09T09:00:00+08:00' GIT_COMMITTER_DATE='2026-01-09T09:00:00+08:00' git commit -q -m 'add app config'

printf 'export const theme = "dark";\nexport const retries = 2;\n' > app.js
git add app.js
printf 'export const theme = "dark";\nexport const retries = 3;\n' > app.js
