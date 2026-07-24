#!/usr/bin/env bash
# EP04 导演：只读探索真实项目，并用文件证据建立调用链。
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
clear_input() {
  key Escape
  for _ in $(seq 1 160); do key BSpace; done
  sleep 1
}
wait_until_idle() {
  local label=${1:?wait_until_idle label}
  for _ in $(seq 1 150); do
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

segment_start 01_lead_in transition "项目探索会话就绪" cut 2
sleep 3
segment_end 01_lead_in
sleep 0.15

segment_start 02_investigation_prompt prompt "提交只读调查问题" normal
clear_input
send "不要修改文件。调查新增任务从 HTTP 请求进入到保存的完整调用链。"
key C-j
send "先宽后窄：确认项目结构和相关测试，再追踪 route、service、store。"
key C-j
send "每个结论引用文件路径与行号，并区分确认事实和未决问题。"
sleep 3
key Enter
segment_end 02_investigation_prompt
sleep 0.15

segment_start 03_broad_to_narrow wait "真实搜索与读取项目" speed 24 4
wait_until_idle "broad-to-narrow exploration"
segment_end 03_broad_to_narrow
sleep 1

segment_start 04_evidence_question prompt "验证调用链与校验归属" normal
clear_input
send "基于刚才读到的代码，压缩成四行证据图：入口、业务规则、状态写入、行为测试。"
key C-j
send "然后回答：空标题校验在哪一层，全空白标题当前会发生什么？不要修改代码。"
sleep 3
key Enter
segment_end 04_evidence_question
sleep 0.15

segment_start 05_evidence_answer wait "形成带路径证据的项目理解" speed 18 3
wait_until_idle "evidence summary"
segment_end 05_evidence_answer
sleep 1

log "verify read-only workspace"
cd "$PROJECT"
git diff --quiet && git diff --cached --quiet || { log "investigation changed tracked files"; exit 1; }

segment_start 06_transcript_view interface "展开真实工具序列" normal
key C-o
sleep 5
key C-e
sleep 5
segment_end 06_transcript_view
key Escape
sleep 2

# 通过产品命令退出 Claude，再在普通 Shell 中显示零改动证据，避免
# 自动提示与后续 Plan Mode 课程内容混在同一张截图里。
clear_input
send "/exit"
key Enter
sleep 5
send "clear"
key Enter
sleep 2
segment_start 07_workspace_check command "证明探索没有修改工作区" normal
send "git diff --exit-code -- . && echo 'workspace unchanged'"
key Enter
sleep 4
pane_text | grep -qi "workspace unchanged" || { log "workspace check was not visible"; exit 1; }
segment_end 07_workspace_check
sleep 0.15

segment_start 08_closing transition "退出并归档只读会话" cut 2
sleep 2
segment_end 08_closing
tmux kill-session -t "$SESSION"
