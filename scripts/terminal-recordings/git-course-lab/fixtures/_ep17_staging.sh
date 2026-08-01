#!/usr/bin/env bash
set -euo pipefail
cd "$TERMINAL_RECORDING_WORKDIR"
git init -q -b main repo
{
  printf 'export function normalize(total) {\n'
  printf '  return Math.max(total, 0);\n'
  for index in {1..9}; do printf '  // pricing rule %s\n' "$index"; done
  printf '}\n\nconsole.log("ready");\n'
} > repo/app.js
git -C repo add app.js
GIT_AUTHOR_DATE='2026-02-17T09:00:00+08:00' GIT_COMMITTER_DATE='2026-02-17T09:00:00+08:00' git -C repo commit -q -m 'base checkout'
sed -i 's/Math.max(total, 0)/Math.max(total, 1)/' repo/app.js
sed -i 's/console.log("ready")/console.log("checkout ready")/' repo/app.js

stage_first_hunk() {
  printf 'y\nn\n' | git -C "$TERMINAL_RECORDING_WORKDIR/repo" add -p app.js >/dev/null
}
