#!/usr/bin/env bash
set -euo pipefail

original_recording_id="${TERMINAL_RECORDING_ID:-}"
export TERMINAL_RECORDING_ID='ep55-verify-delta'
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_ep49_56_workflows.sh"
export TERMINAL_RECORDING_ID="$original_recording_id"
