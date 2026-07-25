#!/usr/bin/env bash
# EP06 director: inspect a cross-layer task in Plan Mode without changing files.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../_lib.sh"

SESSION=cc
PANE="${SESSION}:0.0"
PROJECT=/home/cc/project
LOG=/tmp/run.log
: > "$LOG"
log() { echo "[$(date +%H:%M:%S)] $*" >> "$LOG"; }
send() { tmux send-keys -t "$PANE" -l "$1"; }
key() { tmux send-keys -t "$PANE" "$@"; }
pane_text() { tmux capture-pane -t "$PANE" -p -S -180 2>/dev/null || true; }
pane_command() { tmux display-message -p -t "$PANE" '#{pane_current_command}' 2>/dev/null || true; }
clear_input() {
  key Escape
  for _ in $(seq 1 180); do key BSpace; done
  sleep 1
}
wait_until_idle() {
  local label=${1:?wait_until_idle label}
  local stable=0
  for _ in $(seq 1 150); do
    sleep 2
    footer="$(pane_text | tail -n 10)"
    if echo "$footer" | grep -Eqi "Esc to cancel"; then
      key Escape
      stable=0
      sleep 2
      continue
    fi
    if echo "$footer" | grep -Eqi "esc to interrupt|Press up to edit queued messages|Waiting for .*background agents|Kneading|Zigzagging|Combobulating|Generating"; then
      stable=0
    else
      stable=$((stable + 1))
      [[ "$stable" -ge 4 ]] && return 0
    fi
  done
  log "$label did not become idle"
  return 1
}
exit_claude() {
  clear_input
  send "/exit"
  key Enter
  for _ in $(seq 1 20); do
    sleep 1
    [[ "$(pane_command)" == "bash" ]] && return 0
  done
  key C-c
  sleep 2
  key C-c
  for _ in $(seq 1 10); do
    sleep 1
    [[ "$(pane_command)" == "bash" ]] && return 0
  done
  log "Claude process did not exit"
  return 1
}

ready=0
for _ in $(seq 1 60); do
  pane="$(pane_text)"
  echo "$pane" | grep -qi "Choose the text style\|Syntax theme:" && key Enter
  echo "$pane" | grep -qi "trust this folder\|Enter to confirm\|Press Enter to continue" && key Enter
  if echo "$pane" | grep -qi "for shortcuts\|Try .*help\|What can I help" \
    && ! echo "$pane" | grep -qi "trust this folder\|Enter to confirm\|Press Enter to continue"; then
    ready=1
    break
  fi
  sleep 2
done
[[ "$ready" == 1 ]] || { log "interactive session did not become ready"; exit 1; }
sleep 2

segment_start 01_plan_mode interface "从默认模式切换到 Plan Mode" normal
for _ in 1 2 3; do
  pane_text | grep -Eqi "plan mode" && break
  key BTab
  sleep 2
done
pane_text | grep -Eqi "plan mode" || { log "Plan Mode indicator was not visible"; exit 1; }
segment_end 01_plan_mode
sleep 0.15

segment_start 02_task_prompt prompt "提交跨层截止日期任务" normal
clear_input
send "为任务增加可选 dueDate。先调查，不要编辑。"
key C-j
send "现状：create route、domain、store 和 list 都没有日期。"
key C-j
send "边界：不改认证，不引入日期库，不改标题校验。"
key C-j
send "计划要说明兼容行为、非法日期、文件顺序，以及 test、typecheck、build 和运行验证。"
key C-j
send "产品选择已经明确：非法日历日期返回错误；列表显示 due YYYY-MM-DD。不要启动子代理。候选计划只输出到对话，不调用 AskUserQuestion、ExitPlanMode、Write、Edit 或 Task 工具。"
sleep 3
key Enter
segment_end 02_task_prompt
sleep 0.15

segment_start 03_readonly_investigation wait "真实 Read、Grep 与只读命令" speed 20 4
wait_until_idle "initial plan"
segment_end 03_readonly_investigation
sleep 1

segment_start 04_plan_review prompt "追问第一版计划的遗漏" normal
clear_input
send "先不要执行。检查刚才的候选计划：旧任务没有 dueDate 时怎样兼容？非法日期在哪一层返回什么？每一步用什么证据结束？修订计划仍只输出到对话，不调用 AskUserQuestion、ExitPlanMode、Write、Edit 或 Task 工具。"
sleep 3
key Enter
segment_end 04_plan_review
sleep 0.15

segment_start 05_revised_plan wait "生成修订后的可审查计划" speed 18 4
wait_until_idle "revised plan"
segment_end 05_revised_plan
sleep 1

log "verify Plan Mode left the workspace unchanged"
cd "$PROJECT"
git diff --quiet && git diff --cached --quiet || { log "Plan Mode changed tracked files"; exit 1; }

segment_start 06_workspace_check command "用 Git 证明计划阶段没有写入" normal
exit_claude
send "clear"
key Enter
sleep 2
send "git diff --exit-code -- . && echo WORKTREE_ZERO_DIFF"
key Enter
sleep 4
pane_text | grep -qx "WORKTREE_ZERO_DIFF" || { log "workspace evidence was not visible as shell output"; exit 1; }
segment_end 06_workspace_check
sleep 0.15

segment_start 07_closing transition "结束只读计划会话" cut 2
sleep 2
segment_end 07_closing
tmux kill-session -t "$SESSION"
