#!/usr/bin/env bash
# 容器入口。CC_MODE=install：干净容器，run.sh 现场跑 install.sh 装 claude（ep01 安装入门）。
# 默认(run)：claude 已挂 /opt/claude，直接跑（ep02+）。
set -euo pipefail
EP=${1:?usage: entrypoint.sh <episode-id>}
export TERM=${TERM:-xterm-256color}
export LANG=${LANG:-C.UTF-8}
export HOME=/home/cc

bash "/workspace/lab/envs/$EP/init.sh"

# PS1 不显示 user@host（--network host 会继承宿主 hostname，避免录屏泄漏）
cat > /home/cc/.bashrc <<'EOF'
export PS1='\[\033[01;36m\]cc\[\033[00m\] \[\033[01;34m\]\w\[\033[00m\]\n\[\033[01;32m\]❯\[\033[00m\] '
EOF

# tmux 默认 status-right 包含 hostname；录屏必须使用确定性课程标识。
cat > /home/cc/.tmux.conf <<'EOF'
set -g status-right 'Claude Code Lab'
EOF

run_director() {
  set +e
  bash "/workspace/lab/$EP/run.sh"
  director_status=$?
  claude_binary=/home/cc/.local/bin/claude
  if [[ -x "$claude_binary" && -n "${CC_RECORDING_VERSION_FILE:-}" ]]; then
    "$claude_binary" --version > "$CC_RECORDING_VERSION_FILE" 2>/dev/null || true
    chmod 600 "$CC_RECORDING_VERSION_FILE" 2>/dev/null || true
  fi
  tmux has-session -t cc 2>/dev/null && tmux kill-session -t cc
  exit "$director_status"
}

if [[ "${CC_MODE:-run}" == "install" ]]; then
  # install 模式：claude 由 run.sh 的 install.sh 现场装。
  tmux new-session -d -s cc -x 120 -y 28 -c /home/cc/project
  run_director &
  director_pid=$!
  tmux attach -t cc || true
  wait "$director_pid"
  exit $?
fi

# run 模式：claude 已挂 /opt/claude，建入口 + settings（permissions allow 免 --dangerously-skip-permissions）
mkdir -p /home/cc/.claude /home/cc/.local/bin
cat > /home/cc/.claude/settings.json <<'EOF'
{ "permissions": { "allow": ["Read","Write","Edit","MultiEdit","Bash","Glob","Grep"] } }
EOF
LATEST="$(ls /opt/claude/versions/ | sort -V | tail -1)"
ln -sf "/opt/claude/versions/$LATEST" /home/cc/.local/bin/claude
export PATH="/home/cc/.local/bin:$PATH"

tmux new-session -d -s cc -x 120 -y 28 -c /home/cc/project
tmux send-keys -t "cc:0.0" "claude" Enter
run_director &
director_pid=$!
tmux attach -t cc || true
wait "$director_pid"
