#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/_ep14_diverged.sh"
git -C "$TERMINAL_RECORDING_WORKDIR/local" fetch -q origin
