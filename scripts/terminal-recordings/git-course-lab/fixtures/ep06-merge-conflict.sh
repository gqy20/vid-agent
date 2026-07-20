#!/usr/bin/env bash
set -euo pipefail

cd "$TERMINAL_RECORDING_WORKDIR"
git init -q -b main
printf 'function title() {\n  return "base title";\n}\n' > app.js
git add app.js
git commit -q -m 'add title'
git branch feature

printf 'function title() {\n  return "main title";\n}\n' > app.js
git add app.js
git commit -q -m 'update title on main'

git switch -q feature
printf 'function title() {\n  return "feature title";\n}\n' > app.js
git add app.js
git commit -q -m 'update title on feature'
git switch -q main
