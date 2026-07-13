#!/usr/bin/env bash
# ep01 导演：等 claude → 循环 Enter 过所有 onboarding（Security/主题/Syntax/trust）→ 主 TUI → 发 prompt → 等完成 → 退出。
set -euo pipefail
SESSION=cc
PANE="${SESSION}:0.0"
PROMPT="在 foo.ts 里给 utils 对象加一个 search 方法：按关键词过滤字符串数组。改完告诉我。"
LOG=/tmp/run.log
: > "$LOG"
log() { echo "[$(date +%H:%M:%S)] $*" >> "$LOG"; }

log "start"; sleep 10

# 循环过 onboarding：检测到弹窗（Enter to confirm / Press Enter / trust / theme）就 Enter，看到主 TUI 才停
for i in $(seq 1 30); do
  txt="$(tmux capture-pane -t "$PANE" -p 2>/dev/null)"
  if echo "$txt" | grep -qi "Welcome back\|Tips for shortcuts\|getting started"; then
    log "main TUI detected (iter $i)"; break
  fi
  if echo "$txt" | grep -qi "Enter to confirm\|Press Enter to continue\|trust this folder\|theme\|Syntax"; then
    log "onboarding (iter $i), send Enter"
    tmux send-keys -t "$PANE" Enter
    sleep 2.5
  else
    sleep 1
  fi
done
sleep 3
log "pane before prompt: $(tmux capture-pane -t "$PANE" -p 2>/dev/null | tail -3 | tr '\n' '|')"

log "send prompt"
tmux send-keys -t "$PANE" -l "$PROMPT"; sleep 0.8
tmux send-keys -t "$PANE" Enter
log "prompt sent"

sleep 55
log "after work: $(tmux capture-pane -t "$PANE" -p 2>/dev/null | tail -3 | tr '\n' '|')"
tmux send-keys -t "$PANE" C-c; sleep 2
tmux send-keys -t "$PANE" C-c; sleep 2
tmux kill-session -t "$SESSION"
