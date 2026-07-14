#!/usr/bin/env bash
# ep01「从零装 Claude Code」导演：install.sh 真装 → 验证 → 配 .env(智谱) → 第一次跑 → 收尾。
# CC_MODE=install：干净容器，claude 由 install.sh 现场装到 ~/.local/bin。
set -euo pipefail
SESSION=cc
PANE="${SESSION}:0.0"
LOG=/tmp/run.log
: > "$LOG"
log() { echo "[$(date +%H:%M:%S)] $*" >> "$LOG"; }
send() { tmux send-keys -t "$PANE" -l "$1"; }        # 打字（不带换行）
run()  { tmux send-keys -t "$PANE" -l "$1"; tmux send-keys -t "$PANE" Enter; }  # 命令 + 回车

log "start"; sleep 3

# ── scene 1：安装 ─────────────────────────────────
log "scene1 install"
run "curl -fsSL https://claude.ai/install.sh | bash"
# 等 install.sh 跑完（最多 ~6 分钟，下 244MB）
for i in $(seq 1 180); do
  tmux capture-pane -t "$PANE" -p 2>/dev/null | grep -qi "Installation complete" && { log "install done @iter $i"; break; }
  sleep 2
done
sleep 2
run 'export PATH="$HOME/.local/bin:$PATH"'   # install.sh 装到 ~/.local/bin

# ── scene 2：验证 ─────────────────────────────────
log "scene2 verify"
run "claude --version"
sleep 3

# ── scene 3：方式一，当前 shell 临时配置 ───────────
log "scene3 config with shell env"
run "export ANTHROPIC_BASE_URL=https://open.bigmodel.cn/api/anthropic"
sleep 1
run "export ANTHROPIC_MODEL=glm-5.2[1m]"
sleep 1
# 录制源输入真实 token；最终视频由 postprocess.py 对前三位之后做像素马赛克。
run "export ANTHROPIC_AUTH_TOKEN=$ANTHROPIC_AUTH_TOKEN"
sleep 2
run "clear"
sleep 1
run "echo \"BASE_URL=\$ANTHROPIC_BASE_URL  MODEL=\$ANTHROPIC_MODEL\""
sleep 3

# ── scene 4：方式二，用户级 settings 持久配置 ──────
log "scene4 config with user settings"
run "mkdir -p ~/.claude"
sleep 1
run "vim ~/.claude/settings.json"
sleep 2
# 关闭 Vim 自动缩进对导演输入的二次叠加，保留 JSON 中预设的两空格层级。
send ':set paste'; tmux send-keys -t "$PANE" Enter
tmux send-keys -t "$PANE" i
send '{'; tmux send-keys -t "$PANE" Enter
send '  "env": {'; tmux send-keys -t "$PANE" Enter
send '    "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/anthropic",'; tmux send-keys -t "$PANE" Enter
AUTH_TOKEN_JSON=$(python3 -c 'import json, os; print(json.dumps(os.environ["ANTHROPIC_AUTH_TOKEN"]))')
send "    \"ANTHROPIC_AUTH_TOKEN\": $AUTH_TOKEN_JSON"; tmux send-keys -t "$PANE" Enter
send '  },'; tmux send-keys -t "$PANE" Enter
send '  "model": "glm-5.2[1m]"'; tmux send-keys -t "$PANE" Enter
send '}'; sleep 3
tmux send-keys -t "$PANE" Escape
send ':wq'; tmux send-keys -t "$PANE" Enter
sleep 2
run "chmod 600 ~/.claude/settings.json"
sleep 2

# ── scene 5：第一次跑 ─────────────────────────────
log "scene5 first run"
run "claude"
# 过 onboarding（循环 Enter 到主 TUI）
for i in $(seq 1 30); do
  txt="$(tmux capture-pane -t "$PANE" -p 2>/dev/null)"
  echo "$txt" | grep -qi "Welcome back\|Tips for shortcuts\|getting started" && { log "main TUI @iter $i"; break; }
  echo "$txt" | grep -qi "Enter to confirm\|Press Enter to continue\|trust this folder\|theme\|Syntax" && tmux send-keys -t "$PANE" Enter
  sleep 2
done
sleep 3
send "用一句中文说 hi"
tmux send-keys -t "$PANE" Enter
sleep 25

# ── scene 6：收尾 ─────────────────────────────────
log "scene6 exit"
tmux send-keys -t "$PANE" C-c; sleep 2
tmux send-keys -t "$PANE" C-c; sleep 2
tmux kill-session -t "$SESSION"
