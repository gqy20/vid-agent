#!/usr/bin/env bash
# claude-code-lab 录制原语。
# 由 <EP>/run.sh source。run.sh 是左 pane 进程，这些函数 printf 到该 pane。
# 右 pane 由 run.sh 起的常驻 yazi 负责，文件改动后 yazi 自动刷新。
set -euo pipefail

# Claude Code 主题色 (truecolor)
C_USER=$'\033[1;38;2;139;212;156m'    # 绿：用户输入
C_MODEL=$'\033[38;2;217;119;87m'      # 橙：Claude 回复
C_TOOL=$'\033[1;38;2;111;147;184m'    # 蓝：tool_use
C_RESULT=$'\033[38;2;150;156;148m'    # 灰：tool_result
C_THINK=$'\033[3;38;2;120;130;140m'   # 灰斜：think
C_DIM=$'\033[38;2;110;120;130m'
C_RST=$'\033[0m'

begin_terminal() { printf '\033[?25l'; }    # 隐藏光标

# 逐字打字。$1=text $2=delay
_type() {
  local i
  for ((i = 0; i < ${#1}; i++)); do
    printf '%s' "${1:i:1}"
    sleep "${2:-0.035}"
  done
}

# 用户 prompt：绿 > + 逐字
type_prompt() {
  printf '%s> %s' "$C_USER" "$C_RST"
  _type "$1" 0.05
  printf '\n'
  sleep 0.3
}

# Claude 回复：橙色逐字
type_assistant() {
  printf '%s' "$C_MODEL"
  _type "$1" 0.03
  printf '%s\n\n' "$C_RST"
  sleep 0.5
}

# 模型思考标注
think() {
  printf '%s(think) %s%s\n' "$C_THINK" "$1" "$C_RST"
  sleep 0.4
}

# tool_use 行。$1=tool $2=arg
tool_call() {
  printf '%s> %s%s%s(%s)%s\n' "$C_TOOL" "$1" "$C_RST" "$C_DIM" "$2" "$C_RST"
  sleep 0.2
}

# tool_result 行
tool_result() {
  printf '%s  -> %s%s\n' "$C_RESULT" "$1" "$C_RST"
  sleep 0.3
}

# 真改文件：$1=相对 PROJECT 的路径，新内容从 stdin
edit_file() {
  cat > "$PROJECT/$1"
}

finish_terminal() {
  printf '%s> %s' "$C_USER" "$C_RST"
  sleep 2
}
