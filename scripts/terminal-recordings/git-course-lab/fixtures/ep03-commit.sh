#!/usr/bin/env bash
set -euo pipefail

cd "$TERMINAL_RECORDING_WORKDIR"
git init -q -b main
printf '# Search demo\n' > README.md
git add README.md
git commit -q -m init
printf 'export const app = "git";\n' > app.js
git add app.js
git commit -q -m 'add app'
printf 'export const app = "git course";\n' > app.js
printf 'export const search = (query) => query.trim();\n' > search.js
git add app.js search.js
