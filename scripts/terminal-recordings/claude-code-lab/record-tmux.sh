#!/usr/bin/env bash
# 宿主编排。用法：record-tmux.sh <episode-id> [install|run]   默认 run
#   install：干净容器 + 代理，run.sh 现场跑 install.sh（ep01 安装入门）
#   run：挂 claude /opt/claude 直接跑（ep02+）
#   REBUILD=1 强制重建镜像
#   CC_INSTALL_PROXY=http://127.0.0.1:7890 为 install 模式显式配置宿主代理
set -euo pipefail
umask 077

EP=${1:?usage: record-tmux.sh <episode-id> [install|run]}
MODE=${2:-run}
LAB="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$LAB/../../.." && pwd)"
IMG=

CLAUDE_HOME="$HOME/.local/share/claude"

# 后台 shell 不一定 source 了 profile/.env，显式加载
set -a; [[ -f "$ROOT/.env" ]] && source "$ROOT/.env"; set +a

OUT_DIR="$ROOT/remotion/public/claude-code-course/terminal"
OUT="$OUT_DIR/$EP.mp4"
HOLD="$OUT_DIR/$EP-hold.png"
METADATA="$OUT_DIR/$EP.json"
TIMELINE="$OUT_DIR/$EP.timeline.json"
TMP_ROOT="${TMPDIR:-/tmp}/vid-agent-cc-record/$EP"
RUN_ID="${CC_RECORDING_RUN_ID:-$(date -u +%Y%m%dT%H%M%SZ)-$$}"
RECORDING_LOG_ROOT="$ROOT/remotion/renders/claude-code-course/$EP/tmp/recordings"
RUN_LOG_DIR="$RECORDING_LOG_ROOT/$RUN_ID"
CAST="$TMP_ROOT/$EP.cast"
EVENTS="$TMP_ROOT/events.jsonl"
CLAUDE_CAPTURE_HOME="$TMP_ROOT/claude-home"
CLAUDE_VERSION_FILE="$TMP_ROOT/claude-version.txt"
GIF="$TMP_ROOT/$EP.gif"
BASE_VIDEO="$TMP_ROOT/$EP-sensitive.mp4"
MASKED_VIDEO="$TMP_ROOT/$EP-masked.mp4"
CANDIDATE_HOLD="$TMP_ROOT/$EP-hold.png"
CANDIDATE_METADATA="$TMP_ROOT/$EP.json"
CANDIDATE_TIMELINE="$TMP_ROOT/$EP.timeline.json"
CANDIDATE_SCENE_CLIP_DIR="$TMP_ROOT/scene-clips"
IDLE_TIME_LIMIT="${CC_IDLE_TIME_LIMIT:-5}"
TERMINAL_COLS="${CC_TERMINAL_COLS:-120}"
TERMINAL_ROWS="${CC_TERMINAL_ROWS:-28}"
TERMINAL_FONT_SIZE="${CC_TERMINAL_FONT_SIZE:-24}"

[[ "$MODE" == "install" || "$MODE" == "run" ]] || { echo "recording mode must be install or run" >&2; exit 1; }
[[ "$RUN_ID" =~ ^[A-Za-z0-9][A-Za-z0-9._-]*$ ]] || { echo "invalid CC_RECORDING_RUN_ID: $RUN_ID" >&2; exit 1; }
for value in "$TERMINAL_COLS" "$TERMINAL_ROWS" "$TERMINAL_FONT_SIZE"; do
  [[ "$value" =~ ^[1-9][0-9]*$ ]] || { echo "terminal capture dimensions must be positive integers" >&2; exit 1; }
done

[[ -f "$LAB/$EP/run.sh" ]] || { echo "Missing $LAB/$EP/run.sh" >&2; exit 1; }
for c in docker asciinema agg ffmpeg ffprobe python3; do
  command -v "$c" >/dev/null || { echo "Missing command: $c" >&2; exit 1; }
done
[[ -n "${ANTHROPIC_AUTH_TOKEN:-}" ]] || { echo "ANTHROPIC_AUTH_TOKEN not set" >&2; exit 1; }

if [[ "$MODE" != "install" ]]; then
  [[ -d "$CLAUDE_HOME" ]] || { echo "claude install dir not found at $CLAUDE_HOME" >&2; exit 1; }
fi

if [[ "${REBUILD:-0}" == 1 ]]; then
  IMG=$("$LAB/build-image.sh" --rebuild)
else
  IMG=$("$LAB/build-image.sh")
fi
IMAGE_ID=$(docker image inspect "$IMG" --format '{{.Id}}')
IMAGE_FINGERPRINT=$(docker image inspect "$IMG" --format '{{index .Config.Labels "org.vid-agent.build-fingerprint"}}')
[[ -n "$IMAGE_ID" && -n "$IMAGE_FINGERPRINT" ]] || {
  echo "image identity is incomplete: $IMG" >&2
  exit 1
}

rm -rf "$TMP_ROOT"; mkdir -p "$TMP_ROOT" "$OUT_DIR" "$CLAUDE_CAPTURE_HOME" "$RECORDING_LOG_ROOT"
chmod 700 "$TMP_ROOT" "$CLAUDE_CAPTURE_HOME" "$RECORDING_LOG_ROOT"
# cast / GIF / 中间 MP4 含真实 token；成功、失败或中断都必须清理。
cleanup_sensitive() {
  local status=$?
  local archive_status=0
  trap - EXIT
  set +e
  CC_RECORDING_SECRET="$ANTHROPIC_AUTH_TOKEN" python3 "$LAB/archive-recording-logs.py" \
    --episode-id "$EP" \
    --run-id "$RUN_ID" \
    --exit-code "$status" \
    --mode "$MODE" \
    --claude-home "$CLAUDE_CAPTURE_HOME" \
    --director-log "$TMP_ROOT/run.log" \
    --events "$EVENTS" \
    --version-file "$CLAUDE_VERSION_FILE" \
    --output-dir "$RUN_LOG_DIR" \
    --image-tag "$IMG" \
    --image-id "$IMAGE_ID" \
    --image-fingerprint "$IMAGE_FINGERPRINT"
  archive_status=$?
  set -e
  if [[ "$archive_status" != 0 ]]; then
    echo "failed to archive recording logs for run $RUN_ID" >&2
  fi
  rm -rf "$TMP_ROOT"
  if [[ "$status" == 0 && "$archive_status" != 0 ]]; then
    status=$archive_status
  fi
  exit "$status"
}
trap cleanup_sensitive EXIT
trap 'exit 130' INT TERM
touch "$TMP_ROOT/run.log" "$EVENTS" "$CLAUDE_VERSION_FILE"   # docker -v 文件挂载：宿主必须先有文件，否则建成目录

docker_args=(
  docker run --rm -it
  -v "$LAB:/workspace/lab:ro"
  -v "$TMP_ROOT/run.log:/tmp/run.log"
  -v "$EVENTS:/tmp/recording-events.jsonl"
  -v "$CLAUDE_CAPTURE_HOME:/home/cc/.claude"
  -v "$CLAUDE_VERSION_FILE:/tmp/claude-version.txt"
  -e HOME=/home/cc -e TERM=xterm-256color -e LANG=C.UTF-8
  -e DISABLE_AUTOUPDATER=1 -e IS_DEMO=1
  -e CC_RECORDING_EVENTS=/tmp/recording-events.jsonl -e CC_RECORDING_ORIGIN_NS
  -e CC_RECORDING_VERSION_FILE=/tmp/claude-version.txt
  -e ANTHROPIC_AUTH_TOKEN -e ANTHROPIC_BASE_URL -e ANTHROPIC_MODEL
)

if [[ "$MODE" == "install" ]]; then
  docker_args+=( -e CC_MODE=install )
  if [[ -n "${CC_INSTALL_PROXY:-}" ]]; then
    export HTTP_PROXY=$CC_INSTALL_PROXY
    export HTTPS_PROXY=$CC_INSTALL_PROXY
    docker_args+=( --network host -e HTTP_PROXY -e HTTPS_PROXY )
  fi
else
  docker_args+=( -v "$CLAUDE_HOME:/opt/claude:ro" )
fi

docker_args+=( "$IMG" bash /workspace/lab/entrypoint.sh "$EP" )
printf -v DOCKER_RUN '%q ' "${docker_args[@]}"

echo "==> env: AUTH_TOKEN=${#ANTHROPIC_AUTH_TOKEN} BASE_URL=${ANTHROPIC_BASE_URL:-empty} MODEL=${ANTHROPIC_MODEL:-empty}" >&2
echo "==> recording $EP [$MODE mode] with $IMG at ${TERMINAL_COLS}x${TERMINAL_ROWS}, font ${TERMINAL_FONT_SIZE}px"
CC_RECORDING_ORIGIN_NS="$(python3 -c 'import time; print(time.monotonic_ns())')"
export CC_RECORDING_ORIGIN_NS
asciinema rec --quiet --headless --overwrite --return --window-size "${TERMINAL_COLS}x${TERMINAL_ROWS}" \
  --command "$DOCKER_RUN" "$CAST"

# install 模式会在画面中输入真实 token，必须在 postprocess 前证明 cast 确实包含它；
# run 模式只把 token 注入 Claude Code 进程，任何画面泄漏都必须阻断发布。
AUTH_CAST="$CAST" AUTH_LOG="$TMP_ROOT/run.log" AUTH_EVENTS="$EVENTS" AUTH_EXPECT_IN_CAST="$([[ "$MODE" == "install" ]] && echo 1 || echo 0)" python3 - <<'PY'
import os
from pathlib import Path

secret = os.environ["ANTHROPIC_AUTH_TOKEN"].encode()
cast_contains_secret = secret in Path(os.environ["AUTH_CAST"]).read_bytes()
expect_in_cast = os.environ["AUTH_EXPECT_IN_CAST"] == "1"
if expect_in_cast and not cast_contains_secret:
    raise SystemExit("install recording did not contain the real ANTHROPIC_AUTH_TOKEN")
if not expect_in_cast and cast_contains_secret:
    raise SystemExit("refusing to render: ANTHROPIC_AUTH_TOKEN leaked into run-mode cast")
if secret in Path(os.environ["AUTH_LOG"]).read_bytes():
    raise SystemExit("refusing to render: full ANTHROPIC_AUTH_TOKEN found in director log")
if secret in Path(os.environ["AUTH_EVENTS"]).read_bytes():
    raise SystemExit("refusing to render: full ANTHROPIC_AUTH_TOKEN found in recording events")
PY

echo "==> agg -> gif"
theme='141729,d8dee9,0d101c,d66d67,69a79b,d6a84a,6f93b8,a98bc2,72afa6,d8dee9,7f8a9a,e9827c,82b7aa,e2ba69,86a8c7,b99dce,8dc0b8,f1f4f8'
agg --quiet --cols "$TERMINAL_COLS" --rows "$TERMINAL_ROWS" \
  --font-dir "$ROOT/remotion/public/fonts" --font-family 'JetBrainsMono Nerd Font Mono' \
  --font-size "$TERMINAL_FONT_SIZE" --line-height 1.45 \
  --fps-cap 30 --idle-time-limit "$IDLE_TIME_LIMIT" --last-frame-duration 2 \
  --no-loop --theme "$theme" "$CAST" "$GIF"

echo "==> gif -> mp4"
ffmpeg -loglevel error -y -i "$GIF" \
  -vf 'fps=30,pad=ceil(iw/2)*2:ceil(ih/2)*2' \
  -c:v libx264 -crf 18 -pix_fmt yuv420p -movflags +faststart "$BASE_VIDEO"

POSTPROCESS="$LAB/$EP/postprocess.py"
if [[ -f "$POSTPROCESS" ]]; then
  echo "==> applying sensitive-value mosaic"
  python3 "$POSTPROCESS" --cast "$CAST" --input "$BASE_VIDEO" --output "$MASKED_VIDEO" \
    --secret-length "${#ANTHROPIC_AUTH_TOKEN}" --idle-time-limit "$IDLE_TIME_LIMIT"
else
  echo "Missing sensitive-value postprocessor: $POSTPROCESS" >&2
  exit 1
fi

ffmpeg -loglevel error -y -sseof -0.2 -i "$MASKED_VIDEO" -frames:v 1 "$CANDIDATE_HOLD"

echo "==> building frame-addressable edit timeline"
python3 "$LAB/build-timeline.py" \
  --recording-id "$EP" --cast "$CAST" --events "$EVENTS" --media "$MASKED_VIDEO" \
  --output "$CANDIDATE_TIMELINE" --idle-time-limit "$IDLE_TIME_LIMIT"

SCENE_CLIP_BUILDER="$LAB/$EP/build-scene-clips.sh"
if [[ -x "$SCENE_CLIP_BUILDER" ]]; then
  echo "==> building frame-addressable scene clips"
  "$SCENE_CLIP_BUILDER" "$MASKED_VIDEO" "$CANDIDATE_SCENE_CLIP_DIR" "$EP"
fi

FRAMES="$(ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames -of default=nw=1:nk=1 "$MASKED_VIDEO")"
W="$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of default=nw=1:nk=1 "$MASKED_VIDEO")"
H="$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of default=nw=1:nk=1 "$MASKED_VIDEO")"
HOLD_FROM=$((FRAMES - 60)); [[ $HOLD_FROM -lt 0 ]] && HOLD_FROM=0
printf '{\n  "schemaVersion": 1,\n  "id": "%s",\n  "durationInFrames": %s,\n  "holdFromFrame": %s,\n  "width": %s,\n  "height": %s,\n  "fps": 30,\n  "terminal": {"cols": %s, "rows": %s},\n  "font": "JetBrainsMono Nerd Font Mono",\n  "fontSize": %s,\n  "mode": "%s",\n  "containerImage": {\n    "tag": "%s",\n    "id": "%s",\n    "buildFingerprint": "%s"\n  },\n  "theme": "claude-code-termius-dark",\n  "timeline": "%s.timeline.json",\n  "idleTimeLimitSeconds": %s\n}\n' \
  "$EP" "$FRAMES" "$HOLD_FROM" "$W" "$H" "$TERMINAL_COLS" "$TERMINAL_ROWS" "$TERMINAL_FONT_SIZE" "$MODE" \
  "$IMG" "$IMAGE_ID" "$IMAGE_FINGERPRINT" "$EP" "$IDLE_TIME_LIMIT" > "$CANDIDATE_METADATA"

# 所有派生产物校验成功后再一起替换公开素材，避免失败录制留下新 MP4 + 旧 timeline。
mv "$MASKED_VIDEO" "$OUT"
mv "$CANDIDATE_HOLD" "$HOLD"
mv "$CANDIDATE_METADATA" "$METADATA"
mv "$CANDIDATE_TIMELINE" "$TIMELINE"
if [[ -d "$CANDIDATE_SCENE_CLIP_DIR" ]]; then
  for scene_clip in "$CANDIDATE_SCENE_CLIP_DIR"/*.mp4; do
    mv "$scene_clip" "$OUT_DIR/$(basename "$scene_clip")"
  done
  for frame_dir in "$CANDIDATE_SCENE_CLIP_DIR"/*-frames; do
    target_frame_dir="$OUT_DIR/$(basename "$frame_dir")"
    previous_frame_dir="$target_frame_dir.previous"
    rm -rf "$previous_frame_dir"
    if [[ -d "$target_frame_dir" ]]; then
      mv "$target_frame_dir" "$previous_frame_dir"
    fi
    mv "$frame_dir" "$target_frame_dir"
    rm -rf "$previous_frame_dir"
  done
fi

echo "==> done"
echo "==> recording logs: $RUN_LOG_DIR"
printf '%s\n%s\n%s\n%s\n' "$OUT" "$HOLD" "$METADATA" "$TIMELINE"
