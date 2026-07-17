#!/usr/bin/env bash
set -euo pipefail

cd "$TERMINAL_RECORDING_WORKDIR"
git init -q -b main
printf 'export const payment = false;\n' > app.js
git add app.js
git commit -q -m 'stable payment'
printf 'export const payment = true;\n' > app.js
git add app.js
git commit -q -m 'enable experimental payment'
