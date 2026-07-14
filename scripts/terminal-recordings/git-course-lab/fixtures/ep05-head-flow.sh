#!/usr/bin/env bash
set -euo pipefail

cd "$TERMINAL_RECORDING_WORKDIR"
git init -q -b main
printf '# HEAD demo\n' > README.md
git add README.md
git commit -q -m 'initial commit'
printf 'export const app = "git";\n' > app.js
git add app.js
git commit -q -m 'add app'
git branch feature
