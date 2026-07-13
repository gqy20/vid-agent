#!/usr/bin/env bash
# 容器入口：搭初始项目 → 预置 settings → 建 claude 入口 symlink → tmux 双 pane → 后台导演 → attach。
set -euo pipefail
EP=${1:?usage: entrypoint.sh <episode-id>}
export TERM=${TERM:-xterm-256color}
export LANG=${LANG:-C.UTF-8}

bash "/workspace/lab/envs/$EP/init.sh"

# 预置 cc 的 claude settings：permissions allow 替代 --dangerously-skip-permissions
mkdir -p /home/cc/.claude
cat > /home/cc/.claude/settings.json <<'EOF'
{
  "permissions": {
    "allow": ["Read", "Write", "Edit", "MultiEdit", "Bash", "Glob", "Grep"]
  }
}
EOF

# 建 claude 入口 symlink：~/.local/bin/claude -> /opt/claude/versions/<latest>（/opt 挂载，HOME 不污染）
mkdir -p /home/cc/.local/bin
LATEST="$(ls /opt/claude/versions/ | sort -V | tail -1)"
ln -sf "/opt/claude/versions/$LATEST" /home/cc/.local/bin/claude
export PATH="/home/cc/.local/bin:$PATH"

# yazi 配置：两栏（current + preview，隐藏 parent 的 .. 折叠）
mkdir -p /home/cc/.config/yazi
cat > /home/cc/.config/yazi/yazi.toml <<'EOF'
[mgr]
ratio = [0, 1, 0]
EOF

# 锁死 yazi 进程的配置路径（HOME + XDG），确保读到上面的 yazi.toml
export HOME=/home/cc
export XDG_CONFIG_HOME=/home/cc/.config

# tmux 双 pane：左 claude，右 yazi
tmux new-session -d -s cc -x 120 -y 28 -c /workspace/project
tmux split-window -h -t cc -l 48 "cd /workspace/project && yazi"
tmux send-keys -t "cc:0.0" "claude" Enter

bash "/workspace/lab/$EP/run.sh" &
tmux attach -t cc
