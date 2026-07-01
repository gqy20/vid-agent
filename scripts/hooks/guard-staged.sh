#!/usr/bin/env bash
# pre-commit 守卫：拦截绝不该入库的暂存文件（.gitignore 的兜底，防 git add -f / 漏网）。
set -euo pipefail

# 黑名单模式（bash ERE，匹配暂存区路径）
patterns=(
  '(^|/)\.env(\.[^/]*)?$'                     # .env / .env.local
  '\.(secret|pem|key)$'                       # 密钥文件
  '(^|/)node_modules/'                        # 依赖目录
  '(^|/)\.venv/'                              # uv 虚拟环境
  '(^|/)__pycache__/'                         # Python 字节码
  '(^|/)media/'                               # manim 默认输出
  'renders/.*/renders/(debug|segments|tmp|archive)/'  # 调试/临时渲染产物
  '(^|/)(frames|frames_v2)/'                  # 抽帧调试临时
  '_480p15_'                                  # 调试渲染档文件名
)

BIG_BYTES=$((100 * 1024 * 1024))  # 100MB
# 成片白名单：renders/**/renders/final/ 下的视频/图（这些大文件就是要入库的）
final_re='renders/.*/renders/final/.*\.(mp4|mov|webm|png|jpg|jpeg)'

mapfile -t staged < <(git diff --cached --name-only --diff-filter=d)

bad=(); big=()
for f in "${staged[@]}"; do
  [[ -n "$f" ]] || continue
  # 黑名单
  for p in "${patterns[@]}"; do
    if [[ "$f" =~ $p ]]; then bad+=("$f"); continue 2; fi
  done
  # 非成片大文件
  if [[ -f "$f" ]]; then
    size=$(stat -c '%s' "$f" 2>/dev/null || echo 0)
    if (( size > BIG_BYTES )); then
      [[ "$f" =~ $final_re ]] && continue
      big+=("$f  ($size bytes)")
    fi
  fi
done

rc=0
if (( ${#bad[@]} )); then
  echo "❌ pre-commit 守卫：以下文件不应入库（git commit --no-verify 可跳过，谨慎）：" >&2
  printf '   - %s\n' "${bad[@]}" >&2
  rc=1
fi
if (( ${#big[@]} )); then
  echo "⚠️  pre-commit 守卫：以下文件 >100MB 且非成片路径（final/）：" >&2
  printf '   - %s\n' "${big[@]}" >&2
  rc=1
fi
exit $rc
