#!/usr/bin/env bash
set -euo pipefail

fixture=/workspace/lab/fixtures/task-board
override=/workspace/lab/envs/ep03-agentic-loop/validate-token.test.js
project=/home/cc/project

mkdir -p "$project"
cp -R "$fixture/." "$project/"
cp "$override" "$project/test/validate-token.test.js"

# EP02 的项目级 deny 设置用于权限教学。EP03 需要让真实 Agent Loop
# 在容器内执行 Edit/Bash，因此移除该 episode-specific restriction，继续
# 使用 entrypoint 写入的隔离环境 allowlist。
rm -f "$project/.claude/settings.json"

cd "$project"
git init --initial-branch=main --quiet
git config user.name "Claude Code Course"
git config user.email "course@example.invalid"
git add .
git commit --quiet -m "fixture: agentic loop starting state"
