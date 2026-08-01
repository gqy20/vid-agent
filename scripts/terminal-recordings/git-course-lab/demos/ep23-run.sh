#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/_lib.sh"; cd "$TERMINAL_RECORDING_WORKDIR/repo"; begin_terminal
git bisect start >/dev/null; git bisect bad >/dev/null; git bisect good known-good >/dev/null
type_command 'git bisect run ./test.sh'; git bisect run ./test.sh || true; finish_terminal
