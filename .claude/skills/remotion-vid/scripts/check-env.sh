#!/usr/bin/env bash
# check-env.sh — 一键环境健康检查（Remotion）
#
# 用法: scripts/check-env.sh
#
# 检查 node / pnpm / ffmpeg；定位系统 Chrome（避免 ~150MB Headless Shell 下载）
# 并打印建议的 setBrowserExecutable 配置行；枚举可用的本地中文/等宽字体。
set -uo pipefail
ok(){ printf "  \033[32m✓\033[0m %s\n" "$1"; }
no(){ printf "  \033[31m✗\033[0m %s\n" "$1"; }

echo "== 必需工具 =="
command -v node  >/dev/null && ok "node  $(node -v)"  || no "node 缺失"
command -v pnpm  >/dev/null && ok "pnpm  $(pnpm -v)"  || no "pnpm 缺失"
command -v ffmpeg>/dev/null && ok "ffmpeg $(ffmpeg -version 2>/dev/null | head -1 | awk '{print $3}')" || no "ffmpeg 缺失（ffprobe 校验/缩略图需要）"

echo "== Chrome（避免首次渲染下载 ~150MB Headless Shell）=="
CHROME=""
for c in /opt/google/chrome/chrome google-chrome google-chrome-stable chromium chromium-browser; do
  p=$(command -v "$c" 2>/dev/null); [ -z "$p" ] && [ -x "$c" ] && p="$c"
  [ -n "$p" ] && { CHROME="$p"; break; }
done
if [ -n "$CHROME" ]; then
  ok "找到 Chrome: $CHROME"
  "$CHROME" --version 2>/dev/null | sed 's/^/      /'
  echo "  → 在 remotion.config.ts 加:"
  echo "      Config.setBrowserExecutable('$CHROME');"
else
  no "未找到系统 Chrome；首次渲染会下载 ~150MB Headless Shell（慢网卡死）"
fi

echo "== 本地字体（优先于 @remotion/google-fonts）=="
if command -v fc-list >/dev/null; then
  echo "  中文字族:"
  fc-list :lang=zh family 2>/dev/null | sed 's/,.*//;s/:.*//' | sort -u \
    | grep -iE "noto sans cjk|noto sans sc|source han" | head -4 | sed 's/^/      /'
  echo "  等宽字族:"
  fc-list :spacing=mono family 2>/dev/null | sed 's/,.*//;s/:.*//' | sort -u \
    | grep -iE "jetbrains|fira|noto sans mono|cascadia" | head -4 | sed 's/^/      /'
else
  no "fc-list 缺失（fontconfig）；无法枚举本地字体"
fi
