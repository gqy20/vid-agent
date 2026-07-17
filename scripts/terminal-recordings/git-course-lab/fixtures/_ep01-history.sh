#!/usr/bin/env bash
set -euo pipefail

cd "$TERMINAL_RECORDING_WORKDIR"
git init -q -b main

commit_at() {
  local date="$1"
  shift
  GIT_AUTHOR_DATE="$date" GIT_COMMITTER_DATE="$date" git commit -q "$@"
}

printf '# Checkout demo\n' > README.md
printf 'export const checkout = () => "ready";\n' > app.ts
git add README.md app.ts
commit_at '2026-01-01T09:00:00+08:00' -m 'initial commit'

printf '\nLanding copy ready.\n' >> README.md
git add README.md
commit_at '2026-01-02T09:00:00+08:00' -m 'add landing copy'

printf '\nCheckout flow documented.\n' >> README.md
printf 'export const checkout = () => "tracked";\n' > app.ts
git add README.md app.ts
commit_at '2026-01-03T09:00:00+08:00' -m 'update checkout flow'
