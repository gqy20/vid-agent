#!/usr/bin/env bash
# EP01 导演：沿用已验证的安装、Token 配置与首次请求流程。
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../_lib.sh"
SESSION=cc
PANE="${SESSION}:0.0"
LOG=/tmp/run.log
: > "$LOG"
log() { echo "[$(date +%H:%M:%S)] $*" >> "$LOG"; }
send() { tmux send-keys -t "$PANE" -l "$1"; }
run() { tmux send-keys -t "$PANE" -l "$1"; tmux send-keys -t "$PANE" Enter; }

log "start"
segment_start 01_lead_in transition "开场停留" cut 1
sleep 3
segment_end 01_lead_in

log "scene1 install"
segment_start 02_install_command command "输入安装命令" normal
run "curl -fsSL https://claude.ai/install.sh | bash"
sleep 1
segment_end 02_install_command
segment_start 03_install_wait wait "下载安装 Claude Code" speed 3 5
for i in $(seq 1 180); do
  tmux capture-pane -t "$PANE" -p 2>/dev/null | grep -qi "Installation complete" && { log "install done @iter $i"; break; }
  sleep 2
done
segment_end 03_install_wait
segment_start 04_install_result result "确认安装完成" normal
sleep 2
run 'export PATH="$HOME/.local/bin:$PATH"'
sleep 1
segment_end 04_install_result

log "scene2 verify"
segment_start 05_verify_install command "验证安装版本" normal
run "claude --version"
sleep 3
segment_end 05_verify_install

log "scene3 config with shell env"
segment_start 06_shell_env_base_model command "配置服务地址与模型" normal
run "export ANTHROPIC_BASE_URL=https://open.bigmodel.cn/api/anthropic"
sleep 1
run "export ANTHROPIC_MODEL=glm-5.2[1m]"
sleep 1
segment_end 06_shell_env_base_model
segment_start 07_shell_env_token sensitive-result "配置认证令牌" normal
run "export ANTHROPIC_AUTH_TOKEN=$ANTHROPIC_AUTH_TOKEN"
sleep 2
segment_end 07_shell_env_token
segment_start 08_shell_env_summary result "核对当前 Shell 配置" normal
run "clear"
sleep 1
run "echo \"BASE_URL=\$ANTHROPIC_BASE_URL  MODEL=\$ANTHROPIC_MODEL\""
sleep 3
segment_end 08_shell_env_summary

log "scene4 config with user settings"
segment_start 09_settings_open command "打开用户级配置" normal
run "mkdir -p ~/.claude"
sleep 1
run "vim ~/.claude/settings.json"
sleep 2
segment_end 09_settings_open
segment_start 10_settings_edit edit "写入 settings.json" speed "" 1.6
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
segment_end 10_settings_edit
segment_start 11_settings_permissions command "收紧配置文件权限" normal
run "chmod 600 ~/.claude/settings.json"
sleep 2
segment_end 11_settings_permissions

log "scene5 first run"
segment_start 12_first_run_onboarding onboarding "首次启动与引导" jump 6
run "claude"
for i in $(seq 1 30); do
  txt="$(tmux capture-pane -t "$PANE" -p 2>/dev/null)"
  echo "$txt" | grep -qi "Welcome back\|Tips for shortcuts\|getting started" && { log "main TUI @iter $i"; break; }
  echo "$txt" | grep -qi "Enter to confirm\|Press Enter to continue\|trust this folder\|theme\|Syntax" && tmux send-keys -t "$PANE" Enter
  sleep 2
done
sleep 3
segment_end 12_first_run_onboarding
segment_start 13_first_run_prompt wait "发送第一次提示并等待回答" speed 6 4
send "用一句中文说 hi"
tmux send-keys -t "$PANE" Enter
sleep 25
segment_end 13_first_run_prompt

log "scene6 exit"
segment_start 14_closing transition "退出 Claude Code" cut 1
tmux send-keys -t "$PANE" C-c; sleep 2
tmux send-keys -t "$PANE" C-c; sleep 2
segment_end 14_closing
tmux kill-session -t "$SESSION"
