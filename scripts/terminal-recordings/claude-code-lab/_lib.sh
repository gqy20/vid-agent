#!/usr/bin/env bash
# claude-code-lab 录制原语。
# 由 <EP>/run.sh source。这些函数向课程录制终端输出导演内容。
set -euo pipefail

# Claude Code 主题色 (truecolor)
C_USER=$'\033[1;38;2;139;212;156m'    # 绿：用户输入
C_MODEL=$'\033[38;2;217;119;87m'      # 橙：Claude 回复
C_TOOL=$'\033[1;38;2;111;147;184m'    # 蓝：tool_use
C_RESULT=$'\033[38;2;150;156;148m'    # 灰：tool_result
C_THINK=$'\033[3;38;2;120;130;140m'   # 灰斜：think
C_DIM=$'\033[38;2;110;120;130m'
C_RST=$'\033[0m'

CC_RECORDING_EVENT_SEQ=${CC_RECORDING_EVENT_SEQ:-0}
CC_RECORDING_ACTIVE_SEGMENT=${CC_RECORDING_ACTIVE_SEGMENT:-}

# 录屏事件写入安全 sidecar。时间使用宿主在 asciinema 启动前传入的
# CLOCK_MONOTONIC 原点，后续由 build-timeline.py 映射到 agg 压缩后的媒体时间。
recording_event() {
  local phase=${1:?recording_event phase}
  local segment_id=${2:?recording_event segment-id}
  local kind=${3:-}
  local label=${4:-}
  local pacing=${5:-normal}
  local target_duration=${6:-}
  local playback_rate=${7:-}

  [[ -n "${CC_RECORDING_EVENTS:-}" ]] || return 0
  [[ -n "${CC_RECORDING_ORIGIN_NS:-}" ]] || {
    echo "CC_RECORDING_ORIGIN_NS is required when recording events" >&2
    return 1
  }

  CC_RECORDING_EVENT_SEQ=$((CC_RECORDING_EVENT_SEQ + 1))
  python3 - "$CC_RECORDING_EVENTS" "$CC_RECORDING_EVENT_SEQ" "$phase" \
    "$segment_id" "$kind" "$label" "$pacing" "$target_duration" "$playback_rate" <<'PY'
import json
import os
import sys
import time
from pathlib import Path

(
    path,
    sequence,
    phase,
    segment_id,
    kind,
    label,
    pacing,
    target_duration,
    playback_rate,
) = sys.argv[1:]

origin_ns = int(os.environ["CC_RECORDING_ORIGIN_NS"])
raw_elapsed = max(0.0, (time.monotonic_ns() - origin_ns) / 1_000_000_000)
edit = {"mode": pacing}
if target_duration:
    edit["targetDurationSeconds"] = float(target_duration)
if playback_rate:
    edit["playbackRate"] = float(playback_rate)

event = {
    "eventId": f"{int(sequence):06d}",
    "phase": phase,
    "segmentId": segment_id,
    "kind": kind or None,
    "label": label or None,
    "rawElapsedSeconds": round(raw_elapsed, 6),
    "edit": edit,
}
with Path(path).open("a", encoding="utf-8") as stream:
    stream.write(json.dumps(event, ensure_ascii=False, separators=(",", ":")) + "\n")
PY
}

segment_start() {
  local segment_id=${1:?segment_start segment-id}
  [[ -z "$CC_RECORDING_ACTIVE_SEGMENT" ]] || {
    echo "segment '$CC_RECORDING_ACTIVE_SEGMENT' is still active" >&2
    return 1
  }
  recording_event start "$@"
  CC_RECORDING_ACTIVE_SEGMENT=$segment_id
}

segment_end() {
  local segment_id=${1:?segment_end segment-id}
  [[ "$CC_RECORDING_ACTIVE_SEGMENT" == "$segment_id" ]] || {
    echo "cannot end '$segment_id'; active segment is '${CC_RECORDING_ACTIVE_SEGMENT:-none}'" >&2
    return 1
  }
  recording_event end "$segment_id"
  CC_RECORDING_ACTIVE_SEGMENT=
}

recording_point() {
  recording_event point "$@"
}

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
