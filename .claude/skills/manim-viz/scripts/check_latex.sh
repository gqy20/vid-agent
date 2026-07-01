#!/usr/bin/env bash
# check_latex.sh — 检测 manim 可用的 LaTeX 工具链，输出"该走哪条路"。
#
# 设计理由：manim 的 Tex/MathTex 走  latex(或 pdflatex) 编译 → dvisvgm 转 SVG。
# 所以三件套（pdflatex / latex / dvisvgm）齐全才算"可用"；缺任何一个，
# MathTex / Tex / DecimalNumber / Axes.get_axis_labels / Axes.add_coordinates
# 都会在渲染期崩 FileNotFoundError。本脚本把"检测"标准化，让 skill 不写死
# "有/无 LaTeX"，而是按运行环境自适应。
#
# 用法:
#   scripts/check_latex.sh             # 快检：which 三件套（秒级）
#   scripts/check_latex.sh --probe     # 慢检：额外试渲染一行 MathTex（~10s，权威）
#
# 退出码:
#   0  LaTeX 可用  → MathTex / Tex / Axes.get_axis_labels 等可正常用
#   1  LaTeX 不可用 → 改用 Text + Unicode 上标（见 references/environment.md）

set -uo pipefail   # 故意不开 -e：我们要自己收集 missing，不让首个 command -v 失败就退出

NEEDED=(pdflatex latex dvisvgm)
missing=0

echo "检测 LaTeX 工具链（manim 走 latex → dvisvgm → SVG）..."
for b in "${NEEDED[@]}"; do
    if command -v "$b" >/dev/null 2>&1; then
        printf "  ✓ %-10s → %s\n" "$b" "$(command -v "$b")"
    else
        printf "  ✗ %-10s 未找到\n" "$b"
        missing=1
    fi
done

if [[ "$missing" -ne 0 ]]; then
    cat <<EOF

结论: LaTeX 不可用（缺工具）
  → 公式用 Text + Unicode 上标: Text("x²")，可用字符 ² ³ √ ± − π ∑ ∫ ≈ ≠
  → 禁用 MathTex / Tex / DecimalNumber / Integer / Axes.get_axis_labels /
    Axes.add_coordinates（内部 spawn pdflatex，会崩 FileNotFoundError）
  → 详见 references/environment.md「无 LaTeX 模式」、anti-patterns.md #3-6 #13
  → 装法: sudo apt install texlive-latex-extra texlive-fonts-recommended \\
           texlive-science dvisvgm   （或轻量 tectonic）
EOF
    exit 1
fi

# 可选：试渲染权威确认（二进制齐全不等于链路通——可能缺字体/宏包）
if [[ "${1:-}" == "--probe" ]]; then
    echo ""
    echo "试渲染 MathTex(r'\\int_0^1 x^2\\,dx') 权威验证..."
    probe_dir=$(mktemp -d)
    probe_py="$probe_dir/_probe.py"
    cat > "$probe_py" <<'PY'
from manim import MathTex, Scene, UP
class _Probe(Scene):
    def construct(self):
        self.play(MathTex(r"\int_0^1 x^2\,dx").animate.shift(UP))
PY
    if uv run manim -ql --media_dir "$probe_dir/media" "$probe_py" _Probe >/dev/null 2>&1; then
        echo "  ✓ 试渲染成功，链路完全打通"
        rm -rf "$probe_dir"
    else
        echo "  ✗ 试渲染失败（二进制齐全但链路不通，常见原因：缺字体/宏包）"
        echo "    Build 留在 $probe_dir 排查；本次仍按「LaTeX 不可用」处理。"
        exit 1
    fi
fi

cat <<EOF

结论: LaTeX 可用
  → MathTex / Tex / Axes.get_axis_labels / DecimalNumber 等均可正常使用
  → 仍建议: CJK 中文用 Text(Pango)——Tex/MathTex 无中文字体支持
EOF
exit 0
