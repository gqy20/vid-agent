#!/usr/bin/env bash
# ep01「从零装 Claude Code」导演：install.sh 真装 → 验证 → 配 .env(智谱) → 第一次跑 → 收尾。
# CC_MODE=install：干净容器，claude 由 install.sh 现场装到 ~/.local/bin。
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../_lib.sh"
SESSION=cc
PANE="${SESSION}:0.0"
LOG=/tmp/run.log
: > "$LOG"
log() { echo "[$(date +%H:%M:%S)] $*" >> "$LOG"; }
send() { tmux send-keys -t "$PANE" -l "$1"; }        # 打字（不带换行）
run()  { tmux send-keys -t "$PANE" -l "$1"; tmux send-keys -t "$PANE" Enter; }  # 命令 + 回车

log "start"
segment_start lead-in transition "开场停留" cut 1
sleep 3
segment_end lead-in

# ── scene 1：安装 ─────────────────────────────────
log "scene1 install"
segment_start install-command command "输入安装命令" normal
run "curl -fsSL https://claude.ai/install.sh | bash"
sleep 1
segment_end install-command
segment_start install-wait wait "下载安装 Claude Code" speed 3 5
# 等 install.sh 跑完（最多 ~6 分钟，下 244MB）
for i in $(seq 1 180); do
  tmux capture-pane -t "$PANE" -p 2>/dev/null | grep -qi "Installation complete" && { log "install done @iter $i"; break; }
  sleep 2
done
segment_end install-wait
segment_start install-result result "确认安装完成" normal
sleep 2
run 'export PATH="$HOME/.local/bin:$PATH"'   # install.sh 装到 ~/.local/bin
sleep 1
segment_end install-result

# ── scene 2：验证 ─────────────────────────────────
log "scene2 verify"
segment_start verify-install command "验证安装版本" normal
run "claude --version"
sleep 3
segment_end verify-install

# ── scene 3：方式一，当前 shell 临时配置 ───────────
log "scene3 config with shell env"
segment_start shell-env-base-model command "配置服务地址与模型" normal
run "export ANTHROPIC_BASE_URL=https://open.bigmodel.cn/api/anthropic"
sleep 1
run "export ANTHROPIC_MODEL=glm-5.2[1m]"
sleep 1
segment_end shell-env-base-model
# 录制源输入真实 token；最终视频由 postprocess.py 对前三位之后做像素马赛克。
segment_start shell-env-token sensitive-result "配置认证令牌" normal
run "export ANTHROPIC_AUTH_TOKEN=$ANTHROPIC_AUTH_TOKEN"
sleep 2
segment_end shell-env-token
segment_start shell-env-summary result "核对当前 Shell 配置" normal
run "clear"
sleep 1
run "echo \"BASE_URL=\$ANTHROPIC_BASE_URL  MODEL=\$ANTHROPIC_MODEL\""
sleep 3
segment_end shell-env-summary

# ── scene 4：方式二，用户级 settings 持久配置 ──────
log "scene4 config with user settings"
segment_start settings-open command "打开用户级配置" normal
run "mkdir -p ~/.claude"
sleep 1
run "vim ~/.claude/settings.json"
sleep 2
segment_end settings-open
segment_start settings-edit edit "写入 settings.json" speed "" 1.6
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
segment_end settings-edit
segment_start settings-permissions command "收紧配置文件权限" normal
run "chmod 600 ~/.claude/settings.json"
sleep 2
segment_end settings-permissions

# ── scene 5：第一次跑 ─────────────────────────────
log "scene5 first run"
segment_start first-run-onboarding onboarding "首次启动与引导" jump 6
run "claude"
# 过 onboarding（循环 Enter 到主 TUI）
for i in $(seq 1 30); do
  txt="$(tmux capture-pane -t "$PANE" -p 2>/dev/null)"
  echo "$txt" | grep -qi "Welcome back\|Tips for shortcuts\|getting started" && { log "main TUI @iter $i"; break; }
  echo "$txt" | grep -qi "Enter to confirm\|Press Enter to continue\|trust this folder\|theme\|Syntax" && tmux send-keys -t "$PANE" Enter
  sleep 2
done
sleep 3
segment_end first-run-onboarding
segment_start first-run-prompt wait "发送第一次提示并等待回答" speed 6 4
send "用一句中文说 hi"
tmux send-keys -t "$PANE" Enter
sleep 25
segment_end first-run-prompt

# ── scene 6：收尾 ─────────────────────────────────
log "scene6 exit"
segment_start closing transition "退出 Claude Code" cut 1
tmux send-keys -t "$PANE" C-c; sleep 2
tmux send-keys -t "$PANE" C-c; sleep 2
segment_end closing
tmux kill-session -t "$SESSION"
