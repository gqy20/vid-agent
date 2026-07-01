# with-skill — skill 应用后的产物

## 何时读

`with-skill/` 是写完 `manim-viz` skill 之后，**同 6 个 subagent** 给同样 NL prompt 时的产物。这是 verification：

- 读 `GREEN-after-report.md` 看哪些漏洞堵上了、哪些仍存在
- 看 `scenarios/` 里 subagent 自己的反思 —— "still falling for authority pressure" 这类**人话合理化**在 skill 反而被压住的证据
- 看 `scenes/` 的代码 vs `no-skill/scenes/` —— **diff 告诉你 skill 实际让代码变好了多少**

## 怎么产生

```
no-skill/RED-report.md 完成后，按 RED 阶段的失败反推 22 反模式 + SKILL.md + 4 supporting docs。
↓
同 6 个 subagent 重跑同 NL prompt，但这次 `manim-viz` skill 已加载。
↓
每个 subagent 仍撞错但更少（典型撞 "import 缺 RIGHT" 而不是 "不知道 import 怎么写"）。
↓
全部 transcript 写到 with-skill/scenarios/。
↓
最后我读，写 with-skill/GREEN-after-report.md：side-by-side 对比。
```

## 残留漏洞

`GREEN-after-report.md` 末尾标注的"**still falling for**"项：

- 🔥 **#16 时长预算** —— 即使 skill 列出，仍有 subagent 跳过 Σ play + Σ wait 推导。已观察到 13.07s vs 12s 目标。
- `updater` 形参改名——GREEN 期间没 subagent 真撞（RED 期间撞过），所以这条**仅在 skill 的"警告"段防御**，但未经验证。

下次改 skill 时重点 fix #16。

## 不在版本库里

整个 `.claude/skills/manim-viz/baseline/` 不进 git（见上级 `README.md`，`.gitignore` 用 `**/baseline/` 模式）。
