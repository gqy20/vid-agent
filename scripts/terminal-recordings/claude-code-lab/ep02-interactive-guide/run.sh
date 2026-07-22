#!/usr/bin/env bash
# EP02 导演：真实展示交互入口、详细过程、中断与模式切换。
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../_lib.sh"

SESSION=cc
PANE="${SESSION}:0.0"
LOG=/tmp/run.log
: > "$LOG"
log() { echo "[$(date +%H:%M:%S)] $*" >> "$LOG"; }
send() { tmux send-keys -t "$PANE" -l "$1"; }
key() { tmux send-keys -t "$PANE" "$@"; }
pane_text() { tmux capture-pane -t "$PANE" -p -S -120 2>/dev/null || true; }
require_pane() {
  local pattern=${1:?require_pane pattern}
  local message=${2:?require_pane message}
  pane_text | grep -Eqi "$pattern" || { log "$message"; return 1; }
}
clear_input() {
  key Escape
  # Claude Code's multiline editor does not consistently honor shell-style
  # Ctrl+U under tmux. Backspace is deterministic after closing any picker.
  for _ in $(seq 1 96); do key BSpace; done
  sleep 1
}
wait_until_idle() {
  local label=${1:?wait_until_idle label}
  for _ in $(seq 1 60); do
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
  for _ in $(seq 1 24); do
    sleep 0.5
    if pane_text | grep -Eqi "esc to interrupt"; then
      wait_until_idle "automatic shell response"
      return
    fi
  done
}

log "wait for interactive session"
ready=0
for i in $(seq 1 60); do
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

segment_start 01_lead_in transition "交互界面就绪" cut 2
sleep 3
segment_end 01_lead_in
sleep 0.15

segment_start 02_slash_menu interface "打开 Slash 统一能力入口" normal
key "/"
sleep 3
require_pane "/help|/clear|/compact|slash" "slash menu did not appear"
sleep 2
segment_end 02_slash_menu
clear_input

segment_start 03_file_mention interface "触发 @ 文件补全" normal
key "@"
sleep 1
send "src/auth/val"
sleep 3
require_pane "validate-token\.js" "file mention did not resolve the fixture path"
sleep 1
segment_end 03_file_mention
clear_input

segment_start 04_shell_test command "在 Shell 模式运行真实测试" normal
clear_input
key "!"
sleep 1
require_pane "bash mode|shell mode" "bang prefix did not enter shell mode"
send "pnpm test"
key Enter
sleep 10
require_pane "not ok|fail 1|empty token" "real failing test output was not visible"
wait_for_automatic_response
segment_end 04_shell_test
sleep 0.15

segment_start 05_multiline_prompt prompt "输入多行目标、约束与证据" normal
clear_input
key "@"
sleep 1
send "src/auth/validate-token.js"
sleep 2
send " 解释空 Token 为什么没有被拒绝。"
key C-j
send "先不要修改代码。"
key C-j
send "请指出具体判断分支和对应测试位置。"
sleep 3
key Enter
segment_end 05_multiline_prompt
sleep 0.15

segment_start 06_model_response wait "等待真实分析结果" speed 10 3
wait_until_idle "model response"
segment_end 06_model_response
sleep 0.15

segment_start 07_transcript_view interface "打开 transcript viewer" normal
key C-o
sleep 6
segment_end 07_transcript_view
key Escape
sleep 2

segment_start 08_interrupt prompt "中断过宽的项目扫描" normal
send "继续扫描整个项目，寻找所有可能相关的问题"
key Enter
sleep 4
key Escape
sleep 3
clear_input
send "只检查 src/auth 和对应测试"
sleep 3
segment_end 08_interrupt
clear_input
sleep 0.15

segment_start 09_permission_mode interface "切换当前权限模式" normal
key BTab
sleep 4
key BTab
sleep 4
segment_end 09_permission_mode
sleep 0.15

segment_start 10_closing transition "退出会话" cut 2
key C-c
sleep 2
key C-c
sleep 2
segment_end 10_closing
tmux kill-session -t "$SESSION"
