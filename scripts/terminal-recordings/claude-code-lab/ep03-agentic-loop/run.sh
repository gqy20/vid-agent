#!/usr/bin/env bash
# EP03 导演：用真实文件、修改、测试与 session 日志记录一次完整 Agent Loop。
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
pane_text() { tmux capture-pane -t "$PANE" -p -S -160 2>/dev/null || true; }
require_pane() {
  local pattern=${1:?require_pane pattern}
  local message=${2:?require_pane message}
  pane_text | grep -Eqi "$pattern" || { log "$message"; return 1; }
}
clear_input() {
  key Escape
  for _ in $(seq 1 128); do key BSpace; done
  sleep 1
}
wait_until_idle() {
  local label=${1:?wait_until_idle label}
  for _ in $(seq 1 120); do
    sleep 2
    pane="$(pane_text)"
    if ! echo "$pane" | grep -Eqi "esc to interrupt|Press up to edit queued messages"; then
      return 0
    fi
  done
  log "$label did not become idle"
  return 1
}
wait_for_automatic_response() {
  for _ in $(seq 1 30); do
    sleep 0.5
    if pane_text | grep -Eqi "esc to interrupt"; then
      wait_until_idle "automatic shell response"
      return
    fi
  done
}

log "wait for interactive session"
ready=0
for _ in $(seq 1 60); do
  pane="$(tmux capture-pane -t "$PANE" -p 2>/dev/null || true)"
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
sleep 3

segment_start 01_lead_in transition "Agent Loop 会话就绪" cut 2
sleep 3
segment_end 01_lead_in
sleep 0.15

segment_start 02_task_prompt prompt "提交可验证的真实修复任务" normal
clear_input
send "修复 validateToken：空字符串或只含空白的字符串必须返回 false，非空 Token 返回 true。"
key C-j
send "先运行测试复现，只修改必要文件。"
key C-j
send "完成后运行 pnpm test 和 git diff --check，并用结果说明为什么可以结束。"
sleep 3
key Enter
segment_end 02_task_prompt
sleep 0.15

segment_start 03_agentic_loop wait "真实 Read Edit Bash 循环" speed 18 4
wait_until_idle "agentic loop"
segment_end 03_agentic_loop
sleep 1

# 录屏导演在 TUI 之外核验真实文件状态。该检查不替代 Claude 的工具调用，
# 只阻止非确定性回复或未落盘修改进入课程素材。
log "verify resulting workspace"
cd "$PROJECT"
grep -q "trim" src/auth/validate-token.js || { log "implementation did not reject whitespace"; exit 1; }
pnpm test >> "$LOG" 2>&1 || { log "tests did not pass after agentic loop"; exit 1; }
git diff --check >> "$LOG" 2>&1 || { log "git diff --check failed"; exit 1; }

segment_start 04_test_evidence command "再次显示通过测试" normal
clear_input
key "!"
sleep 1
send "pnpm test"
key Enter
sleep 8
require_pane "pass 3|# pass 3|tests 3" "passing test evidence was not visible"
wait_for_automatic_response
segment_end 04_test_evidence
sleep 0.15

segment_start 05_diff_check command "显示 diff 检查结果" normal
clear_input
key "!"
sleep 1
send "git diff --check && echo 'diff check: clean'"
key Enter
sleep 4
require_pane "diff check: clean" "diff check evidence was not visible"
wait_for_automatic_response
segment_end 05_diff_check
sleep 0.15

segment_start 06_diff_evidence command "显示真实源码变更" normal
clear_input
key "!"
sleep 1
send "git --no-pager diff -- src/auth/validate-token.js"
key Enter
sleep 5
require_pane "trim|token.length" "source diff was not visible"
wait_for_automatic_response
segment_end 06_diff_evidence
sleep 0.15

segment_start 07_transcript_view interface "展开当前会话 transcript" normal
key C-o
sleep 4
key C-e
sleep 5
segment_end 07_transcript_view
key Escape
sleep 2

segment_start 08_closing transition "退出并归档 session" cut 2
key C-c
sleep 2
key C-c
sleep 2
segment_end 08_closing
tmux kill-session -t "$SESSION"
