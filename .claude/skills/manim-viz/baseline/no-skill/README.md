# no-skill — 无 skill 的失败基线

## 何时读

`manim-viz` skill 还没有被写出来之前，6 个 subagent 给同样的 NL 请求时**实际做了什么**、**哪里崩了**。这奠定了 skill 里 22 条反模式的来源：

- `Axes.get_axis_labels()` 隐式 `MathTex` → 反模式 #3
- updater 形参改名 `dt_wall` → silent freeze → 反模式 #7
- `from manim import *` 缺方向常量 → 反模式 #1 / #2
- `Polyline` 不存在 → manim 0.20.x 实际用 `VMobject.set_points_as_corners([...])`
- 默认选 `-qh` 慢迭代 → 反模式 #10
- 时长预算被 eyeball 而不是 Σ play + Σ wait → 反模式 #16

读 `RED-report.md` 看完整综合。

## 怎么产生

```
2026-06-30，ai-manim 项目空目录，无 skill。
↓
6 个 subagent 同时跑同一组 6 个 NL prompt（圆→方、求根、双井势、傅里叶、旋转、env）
↓
每个 subagent 拿到一份完整 transcript：写代码、跑 uv manim、撞错、纠正、再跑。
↓
全部 transcript 写到 no-skill/scenarios/scenario_<n>_report.md。
↓
最后我读全部 6 份，提炼共性写 no-skill/RED-report.md（22 反模式种子）。
```

## 怎么用

1. **回归基线**：未来改 `manim-viz` skill（加规则 / 调措辞）后，重跑同 6 prompt + skill，看 `with-skill/GREEN-after-report.md` 的覆盖率。如果新版本覆盖变少，就有规则被改坏。
2. **论据库**：写新反模式 / 新规则时，回查 `RED-report.md` 看历史上具体 subagent 怎么做的，错在哪行。

## 不在版本库里

整个 `.claude/skills/manim-viz/baseline/` 不进 git（见上级 `README.md`，`.gitignore` 用 `**/baseline/` 模式）。开发过程产物是私人的。
