#!/usr/bin/env bash
set -euo pipefail

project=/home/cc/project
fixture=/workspace/lab/fixtures/task-board-engineering

rm -rf "$project"
mkdir -p "$project"
cp -R "$fixture/base/." "$project/"

for state in "$@"; do
  overlay="$fixture/states/$state"
  [[ -d "$overlay" ]] || { echo "unknown task-board fixture state: $state" >&2; exit 1; }
  cp -R "$overlay/." "$project/"
done

cd "$project"
git init --initial-branch=main --quiet
git config user.name "Claude Code Course"
git config user.email "course.invalid"
git add .
git commit --quiet -m "fixture: task board engineering state"
