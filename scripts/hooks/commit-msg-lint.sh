#!/usr/bin/env bash
# commit-msg：Conventional Commits 宽松校验（允许中文描述；放行 merge/revert/注释行）。
set -euo pipefail
msg_file="${1:?用法: commit-msg-lint.sh <msg-file>}"

# 取第一条非空、非注释行作为 subject
first=$(grep -m1 -vE '^[[:space:]]*(#|$)' "$msg_file" || true)
[[ -n "$first" ]] || { echo "❌ commit-msg：提交信息为空" >&2; exit 1; }

# 放行 git 自动提交
case "$first" in
  'Merge '*|'Revert '*) exit 0 ;;
esac

# 宽松 Conventional Commits：type(scope)?!: 描述（描述允许任意语言）
pat='^(feat|fix|chore|init|docs|refactor|style|test|perf|build|ci|revert|wip|release)(\([^)]+\))?!?: .+'
if [[ ! "$first" =~ $pat ]]; then
  cat >&2 <<EOF
❌ commit-msg：首行不符合 Conventional Commits：
    $first
  期望： <type>(<scope>)?: <描述>   （描述允许任意语言）
  type ∈ feat | fix | chore | init | docs | refactor | style | test | perf | build | ci | revert | wip | release
  示例：
    feat: 新增品牌片头场景
    fix(remotion): 修复 CTA 动画时序
    chore: 收紧 gitignore
EOF
  exit 1
fi
