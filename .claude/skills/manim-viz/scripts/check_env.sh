#!/usr/bin/env bash
# check_env.sh — 一键环境健康检查
#
# 用法: scripts/check_env.sh
#
# 检查项:
#   uv              # 必需（manim 安装在这里）
#   ffmpeg          # 必需（manim 转码）
#   pdflatex        # 可选（缺则禁 MathTex 系列）
#   manim           # 必需（通过 uv run manim --version）
#   python          # 通过 uv run python 验证 venv
#
# 输出:
#   - 每行 ✅ / ❌ + 实际版本/路径
#   - 末尾汇总"环境是健康/哪些缺失"
#   - 缺 pdflatex 时单独提示用 Text 不用 MathTex
#   - 颜色（如果 stdout 是 tty）

set -euo pipefail

# ---- 颜色 (no-op if no tty) ----
if [[ -t 1 ]]; then
    GREEN=$'\033[0;32m'; RED=$'\033[0;31m'; YELLOW=$'\033[0;33m'; NC=$'\033[0m'
else
    GREEN=""; RED=""; YELLOW=""; NC=""
fi

ok()    { printf "${GREEN}✓ %-12s${NC} %s\n" "$1" "$2"; }
fail()  { printf "${RED}✗ %-12s${NC} %s\n" "$1" "$2"; }
warn()  { printf "${YELLOW}! %-12s${NC} %s\n" "$1" "$2"; }

count_ok=0
count_fail=0
count_warn=0

# ---- uv ----
if command -v uv >/dev/null 2>&1; then
    uv_ver=$(uv --version 2>/dev/null || echo "?")
    ok "uv" "$uv_ver"
    count_ok=$((count_ok + 1))
else
    fail "uv" "未安装"
    count_fail=$((count_fail + 1))
fi

# ---- ffmpeg ----
if command -v ffmpeg >/dev/null 2>&1; then
    ff_ver=$(ffmpeg -version 2>/dev/null | head -1 | awk '{print $1, $3}')
    ok "ffmpeg" "$ff_ver"
    count_ok=$((count_ok + 1))
else
    fail "ffmpeg" "未安装"
    count_fail=$((count_fail + 1))
fi

# ---- pdflatex (optional) ----
if command -v pdflatex >/dev/null 2>&1; then
    pdf_ver=$(pdflatex --version 2>/dev/null | head -1)
    ok "pdflatex" "$pdf_ver"
    count_ok=$((count_ok + 1))
    latex_ok=1
else
    warn "pdflatex" "未安装 → 只用 Text 不用 MathTex"
    count_warn=$((count_warn + 1))
    latex_ok=0
fi

# ---- manim (via uv) ----
if command -v uv >/dev/null 2>&1; then
    if manim_ver=$(uv run manim --version 2>/dev/null | head -1); then
        ok "manim" "$manim_ver"
        count_ok=$((count_ok + 1))
    else
        fail "manim" "uv run manim 失败（确认 uv add manim 已装）"
        count_fail=$((count_fail + 1))
    fi
else
    fail "manim" "uv 没装跳过"
    count_fail=$((count_fail + 1))
fi

# ---- Python venv ----
if command -v uv >/dev/null 2>&1; then
    py_path=$(uv run python -c "import manim, sys; print(sys.executable)" 2>/dev/null || echo "?")
    case "$py_path" in
        *.venv*)  ok "python (venv)" "$py_path" ;;
        *)        warn "python" "$py_path (不在 .venv/，manim 装在错环境？)" ;;
    esac
fi

# ---- 汇总 ----
echo
total=$((count_ok + count_fail + count_warn))
if [[ $count_fail -eq 0 ]]; then
    echo "${GREEN}环境健康${NC}：$count_ok/$total 项通过" \
         $([[ $latex_ok -eq 0 ]] && echo "(${YELLOW}LaTeX 缺失，纯 Text 模式${NC})")
    exit 0
else
    echo "${RED}环境不健康${NC}：$count_fail/$total 项失败"
    echo "看 .claude/skills/manim/references/environment.md 排查。"
    exit 1
fi
