#!/usr/bin/env bash
set -euo pipefail
cd "$TERMINAL_RECORDING_WORKDIR"
git init -q -b main repo
printf 'export const mode = "idle";\n' > repo/app.js
git -C repo add app.js
GIT_AUTHOR_DATE='2026-02-21T09:00:00+08:00' GIT_COMMITTER_DATE='2026-02-21T09:00:00+08:00' git -C repo commit -q -m 'C0 base client'
printf 'export const mode = "idle";\nexport const timeout = 30;\n' > repo/app.js
git -C repo add app.js
GIT_AUTHOR_DATE='2026-02-21T09:01:00+08:00' GIT_COMMITTER_DATE='2026-02-21T09:01:00+08:00' git -C repo commit -q -m 'C1 add request limit'
printf 'timeout behavior is documented here\n' > repo/README.md
git -C repo add README.md
GIT_AUTHOR_DATE='2026-02-21T09:02:00+08:00' GIT_COMMITTER_DATE='2026-02-21T09:02:00+08:00' git -C repo commit -q -m 'C2 document timeout behavior'
sed -i 's/timeout = 30/timeout = 45/' repo/app.js
git -C repo add app.js
GIT_AUTHOR_DATE='2026-02-21T09:03:00+08:00' GIT_COMMITTER_DATE='2026-02-21T09:03:00+08:00' git -C repo commit -q -m 'C3 tune request window'
