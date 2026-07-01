#!/usr/bin/env bash
# cleanup.sh — 删工程根的临时渲染输出 out/（含 out/check 抽帧）。归档进 renders/ 后用。
#
# 用法: scripts/cleanup.sh [--dry-run] [--force]
#   --dry-run  只列要删的不真删
#   --force    不询问直接删
set -euo pipefail
DRY=0; FORCE=0
for a in "$@"; do case "$a" in --dry-run) DRY=1;; --force) FORCE=1;; esac; done
[ -d out ] || { echo "无 out/，无需清理"; exit 0; }
echo "将删除: out/ ($(du -sh out 2>/dev/null | cut -f1))"
[ $DRY -eq 1 ] && { echo "(dry-run，未删)"; exit 0; }
if [ $FORCE -ne 1 ]; then
  read -r -p "确认删除 out/? [y/N] " ans; [ "$ans" = y ] || { echo "取消"; exit 0; }
fi
rm -rf out && echo "已删 out/"
