#!/usr/bin/env bash
# 新建一条视频：源码目录 + 带日期的产物目录（见 render-project-layout.md）。
# 在 Remotion 工程根目录运行。
# 用法: ./scripts/new-video.sh <slug> [CompName]
set -euo pipefail

[ $# -ge 1 ] || { echo "用法: $0 <slug> [CompName]" >&2; exit 1; }
SLUG="$1"
COMP="${2:-$(echo "$SLUG" | sed -E 's/(^|-)([a-z])/\U\2/g')}"
ID="$(date +%Y-%m-%d)-$SLUG"

mkdir -p "src/videos/$SLUG/scenes" \
         "renders/$ID/renders/debug" \
         "renders/$ID/renders/tmp" \
         "renders/$ID/renders/candidates" \
         "renders/$ID/renders/current" \
         "renders/$ID/renders/archive"

echo "源码  : src/videos/$SLUG/   (主组件: $COMP.tsx)"
echo "产物  : renders/$ID/        (meta.json, README.md, thumbnail.png, renders/{debug,tmp,candidates,current,archive}/)"
echo
echo "下一步:"
echo "  1) 写 src/videos/$SLUG/$COMP.tsx + scenes/，通过 src/Root.tsx 自动聚合 registration"
echo "  2) scripts/check-frames.sh $COMP <帧号...>"
echo "  3) 渲到 renders/$ID/renders/tmp/，评审后 promote 到 current/"
