#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_lib.sh"

cd "$TERMINAL_RECORDING_WORKDIR/local"
begin_terminal
type_command 'git fetch origin refs/heads/topic:refs/remotes/origin/topic'
git fetch -q origin refs/heads/topic:refs/remotes/origin/topic
type_command 'git rev-parse origin/topic'
git rev-parse origin/topic
type_command 'git fetch origin refs/heads/topic'
git fetch -q origin refs/heads/topic
type_command 'git rev-parse FETCH_HEAD'
git rev-parse FETCH_HEAD
finish_terminal
