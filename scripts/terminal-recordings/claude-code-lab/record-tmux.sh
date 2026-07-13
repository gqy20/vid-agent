#!/usr/bin/env bash
# 宿主编排：挂宿主 claude binary + 传 key → docker 起 base → 真 claude 在 tmux 双 pane 里干活 → asciinema 录 → agg → ffmpeg → MP4。
# 用法：record-tmux.sh <episode-id>   例如 record-tmux.sh ep01-agentic-loop
#   REBUILD=1 record-tmux.sh <ep>     Dockerfile 改了，强制重建镜像
set -euo pipefail

EP=${1:?usage: record-tmux.sh <episode-id>}
LAB="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$LAB/../../.." && pwd)"
IMG=cc-base:latest

# 显式加载项目 .env（后台 shell 不一定 source 了 profile/.env，不加载 docker -e 会传空）
set -a
[[ -f "$ROOT/.env" ]] && source "$ROOT/.env"
set +a

# 宿主 claude 官方安装目录（完整，含 versions/ + 资源，挂进容器 + 建 symlink，自检过）
CLAUDE_HOME="$HOME/.local/share/claude"
YAZI_BIN="$LAB/envs/base/yazi.bin"

OUT_DIR="$ROOT/remotion/public/claude-code-course/terminal"
OUT="$OUT_DIR/$EP.mp4"
HOLD="$OUT_DIR/$EP-hold.png"
METADATA="$OUT_DIR/$EP.json"
TMP_ROOT="${TMPDIR:-/tmp}/vid-agent-cc-record/$EP"
CAST="$TMP_ROOT/$EP.cast"
GIF="$TMP_ROOT/$EP.gif"

[[ -f "$LAB/$EP/run.sh" ]] || { echo "Missing $LAB/$EP/run.sh" >&2; exit 1; }
[[ -d "$CLAUDE_HOME" ]] || { echo "claude install dir not found at $CLAUDE_HOME" >&2; exit 1; }
[[ -n "${ANTHROPIC_AUTH_TOKEN:-}" ]] || { echo "ANTHROPIC_AUTH_TOKEN not set" >&2; exit 1; }
for c in docker asciinema agg ffmpeg ffprobe; do
  command -v "$c" >/dev/null || { echo "Missing command: $c" >&2; exit 1; }
done

# 一次性下载 yazi 静态二进制（musl）
if [[ ! -x "$YAZI_BIN" ]]; then
  echo "==> preparing yazi binary (one-time)"
  YAZI_URL=https://github.com/sxyazi/yazi/releases/download/v26.5.6/yazi-x86_64-unknown-linux-musl.zip
  TMPD=$(mktemp -d)
  curl -fsSL --retry 5 --retry-delay 2 -o "$TMPD/yazi.zip" "$YAZI_URL"
  python3 -m zipfile -e "$TMPD/yazi.zip" "$TMPD/x"
  cp "$(find "$TMPD/x" -type f -name yazi | head -1)" "$YAZI_BIN"
  chmod +x "$YAZI_BIN"; rm -rf "$TMPD"
fi

# 镜像已存在则跳过 build；REBUILD=1 强制
if ! docker image inspect "$IMG" >/dev/null 2>&1 || [[ "${REBUILD:-0}" == "1" ]]; then
  echo "==> building $IMG"
  docker build --progress=plain -t "$IMG" "$LAB/envs/base"
else
  echo "==> $IMG exists, skip build"
fi

rm -rf "$TMP_ROOT"; mkdir -p "$TMP_ROOT" "$OUT_DIR"
touch "$TMP_ROOT/run.log"   # docker -v 文件挂载：宿主必须先有文件，否则 docker 建成目录，run.sh 写失败

echo "==> env check: AUTH_TOKEN=${#ANTHROPIC_AUTH_TOKEN} API_KEY=${#ANTHROPIC_API_KEY} BASE_URL=${ANTHROPIC_BASE_URL:-empty} MODEL=${ANTHROPIC_MODEL:-empty}" >&2
echo "==> recording $EP (real claude in docker+tmux+yazi, 120x28)"
asciinema rec --quiet --headless --overwrite --return --window-size 120x28 \
  --command "docker run --rm -it \
    -v '$LAB':/workspace/lab:ro \
    -v '$CLAUDE_HOME':/opt/claude:ro \
    -v '$YAZI_BIN':/usr/local/bin/yazi:ro \
    -v '$TMP_ROOT/run.log':/tmp/run.log \
    -e HOME=/home/cc -e TERM=xterm-256color -e LANG=C.UTF-8 \
    -e ANTHROPIC_AUTH_TOKEN -e ANTHROPIC_BASE_URL -e ANTHROPIC_MODEL \
    $IMG bash /workspace/lab/entrypoint.sh '$EP'" \
  "$CAST"

echo "==> agg -> gif"
theme='141729,d8dee9,0d101c,d66d67,69a79b,d6a84a,6f93b8,a98bc2,72afa6,d8dee9,7f8a9a,e9827c,82b7aa,e2ba69,86a8c7,b99dce,8dc0b8,f1f4f8'
agg --quiet --cols 120 --rows 28 \
  --font-dir "$ROOT/remotion/public/fonts" --font-family 'JetBrainsMono Nerd Font Mono' \
  --font-size 24 --line-height 1.45 \
  --fps-cap 30 --last-frame-duration 2 --no-loop --theme "$theme" "$CAST" "$GIF"

echo "==> gif -> mp4"
ffmpeg -loglevel error -y -i "$GIF" \
  -vf 'fps=30,pad=ceil(iw/2)*2:ceil(ih/2)*2' \
  -c:v libx264 -crf 18 -pix_fmt yuv420p -movflags +faststart "$OUT"

ffmpeg -loglevel error -y -sseof -0.2 -i "$OUT" -frames:v 1 "$HOLD"

FRAMES="$(ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames -of default=nw=1:nk=1 "$OUT")"
W="$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of default=nw=1:nk=1 "$OUT")"
H="$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of default=nw=1:nk=1 "$OUT")"
HOLD_FROM=$((FRAMES - 60)); [[ $HOLD_FROM -lt 0 ]] && HOLD_FROM=0

printf '{\n  "id": "%s",\n  "durationInFrames": %s,\n  "holdFromFrame": %s,\n  "width": %s,\n  "height": %s,\n  "fps": 30,\n  "font": "JetBrainsMono Nerd Font Mono",\n  "fontSize": 24,\n  "theme": "claude-code-termius-dark"\n}\n' \
  "$EP" "$FRAMES" "$HOLD_FROM" "$W" "$H" > "$METADATA"

echo "==> done"
printf '%s\n%s\n%s\n' "$OUT" "$HOLD" "$METADATA"
