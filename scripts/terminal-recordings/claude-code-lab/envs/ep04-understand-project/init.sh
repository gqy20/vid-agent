#!/usr/bin/env bash
set -euo pipefail

fixture=/workspace/lab/fixtures/task-board
overlay=/workspace/lab/envs/ep04-understand-project/project
project=/home/cc/project

mkdir -p "$project"
cp -R "$fixture/." "$project/"
cp -R "$overlay/." "$project/"
rm -f "$project/test/validate-token.test.js"

cd "$project"
git init --initial-branch=main --quiet
git config user.name "Claude Code Course"
git config user.email "course.invalid"
git add .
git commit --quiet -m "fixture: task creation flow"
