#!/usr/bin/env bash
# 下载 Claude Code 官方产品文档到 docs/references/claude-code/（本地参考，不入库）。
#
# 重要：docs.claude.com 是 mintlify SPA，curl 拿到的是 "Asset not found" 骨架，
# 拿不到正文。llms-full.txt 是 Anthropic Developer API 文档，不含 Claude Code 产品文档。
# 所以正文 markdown 必须用 mcp__crawl-mcp__crawl_batch（prefer_fast=true）抓取，
# 它能解析 mintlify 的 SSR HTML 提取正文。
#
# 重跑：让 Claude 用 mcp__crawl-mcp__crawl_batch 对下面 URL 抓取，每页结果存成 <page>.md。
set -euo pipefail

BASE=https://docs.claude.com/en/docs/claude-code
PAGES="
  overview quickstart setup how-claude-code-works memory context-window
  permission-modes common-workflows best-practices settings
  third-party-integrations troubleshoot-install authentication cli-reference sessions
"
OUT="$(cd "$(dirname "$0")/.." && pwd)/docs/references/claude-code"
mkdir -p "$OUT"

echo "Claude Code 文档页（共 $(echo $PAGES | wc -w) 个），存到 $OUT/"
for p in $PAGES; do
  echo "  $BASE/$p -> $OUT/$p.md"
done
echo ""
echo "注意：用 mcp__crawl-mcp__crawl_batch 抓取（curl 拿不到 mintlify 正文）。"
