#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/_lib.sh"
cd "$TERMINAL_RECORDING_WORKDIR"
begin_terminal

type_command 'git log --graph --oneline --all --decorate -4'
git log --graph --oneline --all --decorate -4
sleep 0.8

type_command 'git rebase main'
git rebase main
sleep 0.8

type_command 'git log --graph --oneline --all --decorate -4'
git log --graph --oneline --all --decorate -4
finish_terminal
