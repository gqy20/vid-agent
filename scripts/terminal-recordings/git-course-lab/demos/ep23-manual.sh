#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/_lib.sh"; cd "$TERMINAL_RECORDING_WORKDIR/repo"; begin_terminal
type_command './test.sh; git bisect bad'; ./test.sh || true; git bisect bad
type_command './test.sh; git bisect good'; ./test.sh; git bisect good
finish_terminal
