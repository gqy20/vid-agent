#!/usr/bin/env bash
# promote.sh —— 视频产物发布管理：tmp/ → candidates/ → current/，旧版自动归档。
# 在 renders/<date>-<slug>/ 项目目录内运行（pwd = 项目目录，含 meta.json + renders/）。
#
# 用法:
#   scripts/promote.sh <slug> <label> --candidate <input.mp4>
#       把 <input.mp4> 提名为候选，复制到 renders/candidates/<slug>_<label>.mp4
#
#   scripts/promote.sh <slug> <label> --publish
#       把 renders/candidates/<slug>_<label>.mp4 发布到 renders/current/<slug>.mp4;
#       旧 current/ 自动移到 renders/archive/<slug>_<old-label>_<date>.mp4;
#       更新 meta.json 的 current + history，重抽 thumbnail。
#
# 命名规范（强制）:
#   label 必须是语义短词（cutfix / ccopt / hero-fix / v7-polish），小写字母数字连字符。
#   禁止: 纯时间戳、V<n>、分辨率前缀（1080p/720p）—— 看不出改了啥。
#   详见 references/render-project-layout.md。

set -euo pipefail

# ---- 参数 ----
SLUG="${1:?missing slug (用法: promote.sh <slug> <label> --candidate <mp4> | --publish)}"
LABEL="${2:?missing label}"
MODE="${3:?missing mode (--candidate <mp4> | --publish)}"
INPUT="${4:-}"

# ---- 校验 label（语义短词，禁止 ts/Vn/分辨率前缀）----
label_invalid() {
  echo "ERROR: label '$LABEL' 不规范。" >&2
  echo "  必须是语义短词（小写字母/数字/连字符），如 cutfix / ccopt / hero-fix" >&2
  echo "  禁止: 纯时间戳(20260704-203613) / V<n>(V8) / 分辨率前缀(1080p30)" >&2
  exit 1
}
[[ "$LABEL" =~ ^[0-9] ]] && label_invalid                      # 数字开头（含 ts）
[[ "$LABEL" =~ ^V[0-9]+$ ]] && label_invalid                   # V8 / V2
[[ "$LABEL" =~ (1080p|720p|480p|2160p|1440p) ]] && label_invalid
[[ "$LABEL" =~ ^[a-z][a-z0-9-]*$ ]] || label_invalid           # 必须小写字母开头

# ---- 依赖 ----
for c in jq sha256sum ffprobe ffmpeg; do
  command -v "$c" >/dev/null 2>&1 || { echo "Missing required command: $c" >&2; exit 1; }
done

# ---- 路径 ----
PROJ_DIR="$(pwd)"
RENDERS_DIR="$PROJ_DIR/renders"
META="$PROJ_DIR/meta.json"
[[ -f "$META" ]] || { echo "meta.json 不存在: $META（请在项目目录内运行）" >&2; exit 1; }
DATE="$(date +%Y%m%d)"
NOW="$(date +%FT%T%z)"

mkdir -p "$RENDERS_DIR/candidates" "$RENDERS_DIR/current" "$RENDERS_DIR/archive"

sha_of() { sha256sum "$1" | awk '{print $1}'; }

# 原子更新 meta.json：参数 = jq filter
update_meta() {
  local tmp; tmp="$(mktemp)"
  jq "$1" "$META" > "$tmp" && mv "$tmp" "$META"
}

# 探测 mp4 的 W/H/fps/dur/bit/size（用 ffprobe json + jq 解析，稳健）
probe_fields() {  # <mp4>  输出 6 行: W H FPS DUR BIT SIZE
  local f="$1" p; p="$(mktemp)"
  ffprobe -v error -select_streams v:0 \
    -show_entries stream=width,height,r_frame_rate \
    -show_entries format=duration,bit_rate,size \
    -of json "$f" > "$p"
  jq -r '[.streams[0].width, .streams[0].height,
          (.streams[0].r_frame_rate | split("/") | map(tonumber) | .[0] / .[1]),
          .format.duration, .format.bit_rate, .format.size] | .[]' "$p"
  rm -f "$p"
}

case "$MODE" in
  --candidate)
    [[ -n "$INPUT" ]] || { echo "--candidate 需要 <input.mp4>" >&2; exit 1; }
    [[ -f "$INPUT" ]] || { echo "input 不存在: $INPUT" >&2; exit 1; }
    DEST="$RENDERS_DIR/candidates/${SLUG}_${LABEL}.mp4"
    cp "$INPUT" "$DEST"
    echo "✓ candidate: renders/candidates/${SLUG}_${LABEL}.mp4"
    echo "  评审通过后运行: scripts/promote.sh $SLUG $LABEL --publish"
    ;;

  --publish)
    SRC="$RENDERS_DIR/candidates/${SLUG}_${LABEL}.mp4"
    [[ -f "$SRC" ]] || { echo "candidate 不存在: $SRC" >&2; exit 1; }
    CUR="$RENDERS_DIR/current/${SLUG}.mp4"

    # 1. 旧 current 归档（如有）
    if [[ -f "$CUR" ]]; then
      OLD_LABEL="$(jq -r '.current.label // "unknown"' "$META")"
      OLD_DATE="$(jq -r '.current.promoted_at // ""' "$META" | grep -oE '^[0-9]{8}' || true)"
      OLD_DATE="${OLD_DATE:-$DATE}"
      ARCHIVE_NAME="${SLUG}_${OLD_LABEL}_${OLD_DATE}.mp4"
      mv "$CUR" "$RENDERS_DIR/archive/$ARCHIVE_NAME"
      # 旧 current 信息移入 history
      update_meta ".history = ((.history // []) + [.current + {archived: true, archived_at: \"$NOW\"}])"
      echo "✓ archived: renders/archive/$ARCHIVE_NAME"
    fi

    # 2. 新 current
    cp "$SRC" "$CUR"

    # 3. 探测 + 更新 meta.json
    mapfile -t F < <(probe_fields "$CUR")
    W="${F[0]}" H="${F[1]}" FPS="${F[2]}" DUR="${F[3]}" BIT="${F[4]}" SIZE="${F[5]}"
    SH="$(sha_of "$CUR")"

    update_meta ".current = {
      label: \"$LABEL\",
      path: \"renders/current/${SLUG}.mp4\",
      sha256: \"$SH\",
      resolution: \"${W}x${H}\",
      fps: $FPS,
      duration_s: $DUR,
      bit_rate_bps: $BIT,
      size_bytes: $SIZE,
      promoted_at: \"$NOW\",
      promoted_from: \"candidates/${SLUG}_${LABEL}.mp4\"
    }"

    # 4. thumbnail 中点帧
    MID="$(awk -v d="$DUR" 'BEGIN { printf "%.2f", d/2 }')"
    ffmpeg -nostdin -y -ss "$MID" -i "$CUR" -frames:v 1 "$PROJ_DIR/thumbnail.png" 2>/dev/null || true

    echo "✓ published: renders/current/${SLUG}.mp4"
    echo "  label=$LABEL  sha=${SH:0:12}…  ${W}x${H}@${FPS}fps ${DUR}s"
    echo "  thumbnail.png updated"
    ;;

  *)
    echo "未知 mode: $MODE（用 --candidate <mp4> 或 --publish）" >&2
    exit 1
    ;;
esac
