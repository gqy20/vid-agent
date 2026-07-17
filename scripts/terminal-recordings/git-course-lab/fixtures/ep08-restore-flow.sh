#!/usr/bin/env bash
set -euo pipefail

cd "$TERMINAL_RECORDING_WORKDIR"
git init -q -b main
printf 'export const checkout = "v1";\n' > app.js
git add app.js
git commit -q -m 'stable checkout'
printf 'export const checkout = "v2 staged";\n' > app.js
git add app.js
printf 'export const checkout = "v3 working";\n' > app.js
