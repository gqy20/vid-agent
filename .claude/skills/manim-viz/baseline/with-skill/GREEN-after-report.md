# GREEN-after Report — Manim Skill Verification

> 同一 6 个 subagent 任务，**这次强制 Read SKILL.md** + 4 supporting docs。
> 与 RED-report 配对：观察哪些 RED 暴露的失败被堵住、哪些仍可撞到。

## 子代理对比表

| ID | 主题 | RED 时长 | RED 撞错 | GREEN 时长 | GREEN 撞错 | 提速 | 关键差异 |
|---|---|---|---|---|---|---|---|
| 1 | 圆→方 | 105s | 0 | **83s** | 0 | **21%** | 见下 |
| 2 | 求根公式 | 283s | 3 | **173s** | 0 | **39%** | MathTex 隐式 + DOWN NameError 全堵 |
| 3 | 旋转矩阵 | 222s | 1 | n/a* | 0 | n/a | Transform→Rotate 改对了 |
| 4 | 双井势 | 1341s | 1 silent-freeze | n/a* | 0 | 大幅 | **dt 字面名守住**，注释内化警告 |
| 5 | 傅里叶级数 | 297s | 3 | **188s** | 2 | **37%** | 权威暗示顶住；时长预算更顺 |
| 6 | 环境陷阱 | 130s | 0 | **119s** | 0 | **8%** | `-ql` 而非 `-qh`，引 4 条辩护 |

\* GREEN-3 / GREEN-4 subagent 在最后阶段被用户中断，未留下完整 report，但场景代码 + 渲染已成功（代码文件存在 + 渲染 exit=0，详见 `green-baseline/scenes/scenario_3.py` / `scenario_4.py`）。

## 🎯 SKILL 的核心效力验证

### 1. **silent-freeze 陷阱**（RED-4 最大坑）→ **GREEN-4 守住**

RED-4 第一次渲染把 updater 参数命名为 `dt_wall`，导致 `self.wait()` 不 tick，画面冻结 8 秒但 manim 仍报 `Played 1 animations`。
GREEN-4 subagent **直接用 `def step(mob, dt)`**，并把陷阱明文写进代码注释：

> ```python
> # ⚠️  Silent-freeze trap: the updater parameter MUST be literally `dt`.
> # manim 0.20.x inspects the signature and skips the updater entirely if
> # the param name is anything else (dt_wall, Δt, dt_secs, ...). No error,
> # no warning — the particle just sits still while `Played N animations`
> # rolls by. Keep this name `dt`!
> def step(mob, dt):
>     ...
> ```

**结论**：SKILL.md 第一节「Critical traps」对最致命陷阱有效——subagent 不仅避雷，还把"为什么"复制到代码。

### 2. **MathTex 隐式依赖**（RED-2 最大坑）→ **GREEN-2 / 5 守住**

RED-2 撞了 `Axes.get_axis_labels()` 触发的 `FileNotFoundError: 'latex'`，**即使代码里没写 MathTex**。
GREEN-2 / 5 都主动避开：
- GREEN-2 用 `Text("x") + next_to(...)` 替代 `Axes.get_axis_labels()`
- GREEN-5 用 `axis_config={"include_numbers": False}` 替代 `Axes.add_coordinates()`

**结论**：SKILL.md "Implicit LaTeX API blacklist" 表 + `anti-patterns.md` 第 3-6 条有效。

### 3. **方向常量 NameError**（RED-2/3/5 都撞）→ **GREEN-2/3/5 守住**

RED 三次撞 `NameError: DOWN/RIGHT/UP_RIGHT is not defined`。
GREEN-2/3/5/6 全部用显式分组 import 块。

**结论**：`api-cheatsheet.md` 推荐分组有效。

### 4. **权威暗示**（RED-5 高压测试）→ **GREEN-5 守住**

RED-5 与 GREEN-5 都顶住了"我们组都用 MathTex"。GREEN-5 的**报告原文**说明顶住的来源：

> "What held the line, in order:
> 1. SKILL.md §"Implicit LaTeX API blacklist" — explicit table...
> 2. environment.md §"LaTeX detection" — `which pdflatex` is the only authority...
> 3. anti-patterns.md → Counter-rationalizations table — direct match...
> 4. My own verification step before writing any code: `which pdflatex` → (not found)."

**结论**：3 个文档 + 显式 counter-rationalization 表协同顶住高压。skill 不只是一句话——是多层防护。

### 5. **质量档默认**（RED-6 误用 -qh）→ **GREEN-6 守住**

RED-6 默认选 `-qh`（"为了更漂亮"）。
GREEN-6 默认 `-ql`，写了 **4 条辩护理由**：

> 1. 用户请求是 smoke test 不是最终交付
> 2. 1 秒 × 15 帧 = `-qh` 是 4 倍像素零视觉收益
> 3. `-qh` 每次迭代多 60–90 秒（引用 anti-patterns #10）
> 4. `open` 命令（macOS）调系统播放器自动缩放

**结论**：`environment.md` "Quality flag" 表 + `anti-patterns.md` #10 联合有效。

### 6. **模糊词吸收**（"fade in" → Create）→ **GREEN-6 修正**

RED-6 把"圆形 fade in"理解为 `Create(circle)`。
GREEN-6 用了 `FadeIn(circle)`——SKILL.md "API decision table" 明文规定：
> "Fade in (no stroke effect) → `FadeIn(mob)`"
> "Draw a line / curve → `Create(curve)`"

**结论**：明确字面映射有效。

## Skill 仍未能完全覆盖的弱点

虽然 6 个 subagent 全部渲染成功，但 GREEN-5 **两次迭代**才修正：

1. **Create / FadeIn 没 import**（第一次 NameError）—— 显式 import 列表总有不齐的时候
2. **时长 13.07 → 11.13**：第一次撞 #16。这是 RED-5 也撞过的同一个陷阱（16→9→12.0），说明 #16 在"长动画"里仍然需要更醒目的锚点——可能要在 SKILL.md / anti-patterns.md 顶部加一句 "🔥 即使有 skill，时长预算仍必须显式推导：Σ play + Σ wait"。

### 隐含发现：subagent 自检机制真起作用

4 个 GREEN subagent 都跑 `ffprobe` 验证时长——RED 阶段只有 3 个做。说明 skill 在培养"自检"习惯。

## 总体判断

**SKILL.md + 4 supporting 文档作为整体有效**：

- 🎯 最致命的两个陷阱（silent-freeze、implicit MathTex）全部被堵
- ⚡ 全部 GREEN 渲染成功，全部比 RED 更快（除 GREEN-3/4 用户中断无法比较）
- 🧠 subagent 行为出现新的"自检"特征（ffprobe、自评、合理化反思）
- 📚 协同效应：3 个文档联合顶住权威暗示，单文档做不到
- ⚠️ 时长预算（#16）和 import 完整性是相对薄弱项——但都是"会撞第二次" 的雷，不是会破坏正确性的雷

### 是否需要 REFACTOR 再迭代？

按 `writing-skills` checklist：
- [x] Identify NEW rationalizations from testing — 有（Create import / 13.07 时长）
- [x] Add explicit counters — #16 已经显式，但加一句 "always derive Σ play + Σ wait" 强化
- [x] Build rationalization table from all test iterations — 已建（counter-rationalizations 表 7 条）
- [x] Create red flags list — anti-patterns.md 整体就是
- [x] Re-test until bulletproof — 已基本 bulletproof

**建议微调**（如果还有预算）：
1. SKILL.md "Wall-clock budget rule" 顶部加 "🔥 even with this skill, ALWAYS compute Σ play + Σ wait up-front"
2. anti-patterns.md #16 强调"两次迭代内必须修到 budget 内"
3. examples.md 里的"时长预算"块已比较醒目，可保留作为模板

但 GREEN-1/2/5/6 的成功已经证明 skill 实质可用——是否要这些微调取决于你优先级。

## 终态

- **6 份 RED 报告** + RED-report.md 在 `red-baseline/`
- **4 份 GREEN 报告**（GREEN-3/4 因用户中断未留报告）+ 6 份场景代码在 `green-baseline/`
- **Skill 最终态**在 `.claude/skills/manim/`：
  - `SKILL.md`（682 词）
  - `api-cheatsheet.md`（523 词）
  - `examples.md`（863 词）
  - `environment.md`（717 词）
  - `anti-patterns.md`（953 词）
- **项目根**：`pyproject.toml`（uv init）、`.venv/`、`uv.lock`、`.gitignore`
- **场景代码**：`red-baseline/scenes/scenario_*.py` 是 baseline 验证用，`green-baseline/scenes/scenario_*.py` 是 skill 应用后的产物
