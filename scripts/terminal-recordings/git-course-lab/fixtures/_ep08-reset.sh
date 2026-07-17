#!/usr/bin/env bash
set -euo pipefail

cd "$TERMINAL_RECORDING_WORKDIR"
git init -q -b main
printf 'export const version = "v1";\n' > app.js
git add app.js
git commit -q -m 'v1'
printf 'export const version = "v2";\n' > app.js
git add app.js
git commit -q -m 'v2'
printf 'export const version = "v3";\n' > app.js
git add app.js
git commit -q -m 'v3'
printf 'export const version = "working edit";\n' > app.js
