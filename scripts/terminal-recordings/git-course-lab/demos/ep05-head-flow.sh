#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/_lib.sh"
cd "$TERMINAL_RECORDING_WORKDIR"
begin_terminal

type_command 'git symbolic-ref --short HEAD'
git symbolic-ref --short HEAD
sleep 0.8

type_command 'cat .git/HEAD'
cat .git/HEAD
sleep 0.8

type_command 'git rev-parse --short HEAD'
git rev-parse --short HEAD
sleep 0.8

type_command 'git switch feature'
git switch feature
sleep 0.8

type_command 'git symbolic-ref --short HEAD'
git symbolic-ref --short HEAD
finish_terminal
