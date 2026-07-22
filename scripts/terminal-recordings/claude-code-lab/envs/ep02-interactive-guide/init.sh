#!/usr/bin/env bash
set -euo pipefail

fixture=/workspace/lab/fixtures/task-board
project=/home/cc/project

mkdir -p "$project"
cp -R "$fixture/." "$project/"
cd "$project"
git init --initial-branch=main --quiet
git config user.name "Claude Code Course"
git config user.email "course@example.invalid"
git add .
git commit --quiet -m "fixture: initial task board"
