#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/_lib.sh"; cd "$TERMINAL_RECORDING_WORKDIR/repo"; begin_terminal
type_command 'git add app.js; git ls-files -u -- app.js'; git add app.js; git ls-files -u -- app.js; finish_terminal
