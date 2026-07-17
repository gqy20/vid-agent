#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/_lib.sh"
cd "$TERMINAL_RECORDING_WORKDIR"
begin_terminal

type_command 'git status --short'
semantic_status
sleep 0.6

type_command 'git restore app.js'
git restore app.js
type_command 'git status --short'
semantic_status
sleep 0.6

type_command 'git restore --source=HEAD app.js'
git restore --source=HEAD app.js
type_command 'git status --short'
semantic_status
sleep 0.6

type_command 'git restore --staged app.js'
git restore --staged app.js
type_command 'git status --short'
semantic_status
finish_terminal
