#!/usr/bin/env bash
# cleanup.sh — 扫 `_build/` 与 `partial_movie_files/` 删
#
# 用法:
#   scripts/cleanup.sh [PROJECT_ROOT] [--dry-run] [--force]
#
# 参数:
#   PROJECT_ROOT    默认 cwd。可指定一个具体项目根。
#   --dry-run       只列要删的不真删
#   --force         不询问直接删
#
# 例:
#   scripts/cleanup.sh                       # 在 renders/<project>/ 跑
#   scripts/cleanup.sh /path/to/project --dry-run
#   scripts/cleanup.sh . --force             # 一键扫当前 cwd
#
# 找:
#   **/_build/                  # 我们 `-media_dir /tmp/build_<X>` 后留的临时
#   **/partial_movie_files/     # manim 留的 partial（防 disk 涨）
#   **/*.pyc                    # __pycache__/ 下生成的 bytecode

set -euo pipefail

# ---- 解析参数 ----
ROOT="."
DRY_RUN=0
FORCE=0
while [[ $# -gt 0 ]]; do
    case "$1" in
        --dry-run) DRY_RUN=1; shift ;;
        --force)   FORCE=1;   shift ;;
        -h|--help)
            echo "用法: $0 [PROJECT_ROOT] [--dry-run] [--force]"
            exit 0 ;;
        *)         ROOT="$1"; shift ;;
    esac
done

if [[ ! -d "$ROOT" ]]; then
    echo "错误: 不是目录: $ROOT" >&2
    exit 1
fi

cd "$ROOT"

# ---- 找目标 ----
echo "扫 $ROOT 找 _build/、partial_movie_files/、*.pyc ..."

# 在 GNU 与 BSD find 之间兼容
targets=$(find . \( -type d \( -name '_build' -o -name 'partial_movie_files' -o -name '__pycache__' \) -o -name '*.pyc' \) 2>/dev/null)

if [[ -z "$targets" ]]; then
    echo "没找到要清的。干净。"
    exit 0
fi

# ---- 报告 ----
echo "以下条目将被删除："
total=0
while IFS= read -r path; do
    [[ -z "$path" ]] && continue
    size=$(du -sh "$path" 2>/dev/null | cut -f1)
    printf "  %-12s  %s\n" "$size" "$path"
    total=$((total + 1))
done <<< "$targets"

echo "共 $total 条。"

# ---- 询问 ----
if [[ $FORCE -eq 0 && $DRY_RUN -eq 0 ]]; then
    read -r -p "确认删除？ [y/N] " ans
    [[ "$ans" == "y" || "$ans" == "Y" ]] || { echo "取消。"; exit 0; }
fi

# ---- 执行 ----
if [[ $DRY_RUN -eq 1 ]]; then
    echo "(dry-run 不真删)"
else
    echo "$targets" | xargs rm -rf
    echo "✓ 已删 $total 条。"
fi
