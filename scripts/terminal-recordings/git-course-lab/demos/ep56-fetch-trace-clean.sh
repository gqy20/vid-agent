#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_lib.sh"

cd "$TERMINAL_RECORDING_WORKDIR/client"
begin_terminal
type_command 'GIT_TRACE_PACKET=1 git fetch origin 2>fetch.trace'
GIT_TRACE_PACKET=1 git fetch -q origin 2>fetch.trace
type_command 'grep key-packets fetch.trace'
sed -E 's/^.*packet: +//' fetch.trace \
  | grep -E 'version 2|command=ls-refs|command=fetch|want |packfile' \
  | head -7
finish_terminal
