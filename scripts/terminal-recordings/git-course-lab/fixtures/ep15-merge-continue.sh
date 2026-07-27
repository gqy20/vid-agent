#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/_ep15_conflict.sh"
prepare_resolved
git -C "$TERMINAL_RECORDING_WORKDIR/repo" add app.js
