# baseline — TDD-for-documentation 历史产物

> 写到 `.claude/skills/manim-viz/` 的过程被 TDD-for-documentation 流程驱动（RED → GREEN → REFACTOR）。这里保存那两个阶段的所有产物。

## 何时读

- **未来要改 `manim-viz` skill** 时，先看 `no-skill/RED-report.md` —— 了解哪些 bug 被识别、为何某些规则被写下。
- **对比阶段差异**：`no-skill/` 是没 skill 时 subagent 的失败；`with-skill/` 是带 skill 后同 6 个 subagent 的产物。`with-skill/GREEN-after-report.md` 详细记下哪些漏洞堵上了、哪些仍存在（**wall-clock 预算**漂移是已知残留）。
- **回放实验**：每个 `scenarios/scenario_*_report.md` 都对应一个完整 NL 请求（圆→方、求根、双井势等），可作为基准 prompt 验证后续 skill 改动有没有回归。

## 不在版本库里

整个本目录 `.claude/skills/manim-viz/baseline/` 写进 `.gitignore`（用 `**/baseline/` 模式），不进 git。

它在本地供你来回翻阅，不污染远端。开发过程产物应当是私人的——skill 公开、过程私有。

## 命名约定

> 为什么是 `baseline/{no-skill,with-skill}/` 而不是项目根的 `baseline/`？baseline 是 `manim-viz` skill 的开发过程产物，应**住在 skill 自己目录里**（`.claude/skills/manim-viz/baseline/`），目录本身就是 namespace。子目录 `no-skill/with-skill/` 替代 `red/green/`——同样自描述、更少 TDD 术语包袱。

## 目录

```
.claude/skills/manim-viz/baseline/
├── no-skill/                      # RED 阶段：6 个 subagent 无 skill
│   ├── README.md                   # 本目录用途
│   ├── RED-report.md               # 综合发现（22 反模式的种子）
│   ├── scenarios/                  # 6 份 subagent 报告
│   └── scenes/                     # 6 份 subagent 写的脚本（带反模式）
└── with-skill/                    # GREEN 阶段：同 6 subagent 带 skill
    ├── README.md
    ├── GREEN-after-report.md        # RED→GREEN diff
    ├── scenarios/                  # 4 份有效报告（场景 3、4 subagent 中途被杀）
    └── scenes/                     # 6 份守 skill 的脚本
```
