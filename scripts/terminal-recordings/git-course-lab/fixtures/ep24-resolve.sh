#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/_ep24_rerere.sh"; first_conflict; printf 'export const mode = "resolved";\n' > "$TERMINAL_RECORDING_WORKDIR/repo/app.js"
