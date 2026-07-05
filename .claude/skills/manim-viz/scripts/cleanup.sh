#!/usr/bin/env bash
# cleanup.sh —— 视频项目产物生命周期清理（配合 promote.sh 的 current/candidates/archive/tmp 布局）。
# 在 renders/<date>-<slug>/ 项目目录内运行（pwd = 项目目录，含 renders/ + meta.json）。
#
# 用法:
#   scripts/cleanup.sh [--dry-run] [--force] [--archive-older-than N]
#
# 默认 --dry-run（只列要删的，不真删）。确认后加 --force 真删。
# --archive-older-than N: 同时清 archive/ 里 N 天前的历史发布版。
#
# 清理对象:
#   renders/tmp/     全删（_build/partial_movie_files/抽帧临时，全是可重建的中间产物）
#   renders/debug/   只保留最新 1 个 mp4，删其余（迭代草稿历史）
#   renders/archive/ 仅当 --archive-older-than 给定时才动

set -euo pipefail

DRY_RUN=1
ARCHIVE_DAYS=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --force) DRY_RUN=0 ;;
    --dry-run) DRY_RUN=1 ;;
    --archive-older-than) ARCHIVE_DAYS="${2:?missing days}"; shift ;;
    -h|--help) sed -n '2,14p' "$0"; exit 0 ;;
    *) echo "未知参数: $1" >&2; exit 1 ;;
  esac
  shift
done

PROJ_DIR="$(pwd)"
RENDERS_DIR="$PROJ_DIR/renders"
[[ -d "$RENDERS_DIR" ]] || { echo "renders/ 不存在（应在项目目录内运行）" >&2; exit 1; }

rm_path() {
  if [[ "$DRY_RUN" = "1" ]]; then
    echo "  [dry-run] 会删 $1"
  else
    rm -rf "$1"
    echo "  ✓ removed $1"
  fi
}

echo "=== renders/tmp/（中间产物，可重建）==="
if [[ -d "$RENDERS_DIR/tmp" ]]; then
  sz=$(du -sh "$RENDERS_DIR/tmp" 2>/dev/null | cut -f1)
  echo "  tmp/ 共 $sz"
  rm_path "$RENDERS_DIR/tmp"
else
  echo "  (无 tmp/)"
fi

echo "=== renders/debug/（保留最新 1 个草稿，删其余）==="
if compgen -G "$RENDERS_DIR/debug/*.mp4" > /dev/null; then
  mapfile -t OLD < <(ls -t "$RENDERS_DIR/debug"/*.mp4 2>/dev/null | tail -n +2)
  if [[ ${#OLD[@]} -gt 0 ]]; then
    for f in "${OLD[@]}"; do rm_path "$f"; done
  else
    echo "  (仅 1 个或更少，全保留)"
  fi
else
  echo "  (无 debug/*.mp4)"
fi

if [[ "$ARCHIVE_DAYS" -gt 0 ]]; then
  echo "=== renders/archive/（${ARCHIVE_DAYS} 天前的历史发布版）==="
  if [[ -d "$RENDERS_DIR/archive" ]]; then
    found=0
    while IFS= read -r f; do
      rm_path "$f"; found=1
    done < <(find "$RENDERS_DIR/archive" -name '*.mp4' -mtime +"$ARCHIVE_DAYS" 2>/dev/null)
    [[ "$found" = "0" ]] && echo "  (无符合条件的)"
  else
    echo "  (无 archive/)"
  fi
fi

if [[ "$DRY_RUN" = "1" ]]; then
  echo ""
  echo "(dry-run 模式，未真删。确认后加 --force)"
fi
