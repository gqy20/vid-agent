#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/_lib.sh"
cd "$TERMINAL_RECORDING_WORKDIR"
begin_terminal

type_command 'git branch feature'
git branch feature
sleep 0.7

type_command 'git switch feature'
git switch feature
sleep 0.8

printf 'export const header = "new";\n' >> app.js
git add app.js
type_command 'git commit -m "try new header"'
git commit -m 'try new header'
sleep 0.8

type_command 'git log --oneline --decorate -3'
git log --oneline --decorate -3
finish_terminal
