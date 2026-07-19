# Claude Code Course

一套以真实开发任务为主线的 Claude Code 视频课程。课程不照着官方文档目录逐项念功能，而是沿着学习者能力增长组织内容：**先会用，再稳定交付，然后扩展 Claude Code，最后用 Agent SDK 构建自己的智能体产品。**

本课程遵守仓库级 [`课程视频统一生产规范`](../docs/course-production.md)。课程专属的真实终端、版本核验、证据审查和旧 EP01 迁移规则见 [`workflow.md`](workflow.md)，阶段验收见 [`checklist.md`](checklist.md)。当前尚未实现统一 orchestrator，因此 Candidate、Current 和 Release 阶段保持阻断，不能通过手工复制旧成片宣称完成。

## 课程定位

- 面向已经会使用终端和 Git、希望把 Claude Code 用进真实项目的开发者。
- 每集只建立一个核心心智模型，或完成一个可以验证的工作流。
- 每集建议 4–8 分钟；复杂主题允许拆成上下集，不为追求短而牺牲因果链。
- 使用同一个小型示例项目贯穿第一季，避免每集重新介绍业务背景。
- 命令只是完成任务的操作入口，不单独堆成“命令背诵课”。

## 总体课程地图

| 阶段 | 目标 | 学完后的能力 |
|---|---|---|
| 第一季：核心工作流 | 从第一次启动到完成一个可审查的 PR | 能正确委派任务、控制风险、验证结果和管理会话 |
| 第二季：扩展与自动化 | 把个人用法沉淀成项目能力 | 能配置 Skills、MCP、Hooks、Subagents、Plugins 和 CI 流程 |
| 第三季：Agent SDK | 把 Claude Code 的能力嵌入应用 | 能实现带工具、权限、会话和可观测性的编码智能体 |

## 第一季：把 Claude Code 用进真实项目

第一季采用一个持续演进的示例仓库，例如带登录与任务列表的 Web 应用。观众从一次小修复开始，逐步完成探索、计划、修改、验证、审查和提交 PR 的完整闭环。

| 集 | 标题 | 核心问题 | 主要演示与命令 | 可验证产出 |
|---|---|---|---|---|
| ep01 | 从安装到第一次启动 | Claude Code 如何进入一个真实项目？ | 官方安装、登录、启动；`/help`、`/status`、`/doctor` | 环境可用，能正确识别项目与账户状态 |
| ep02 | 交互界面生存指南 | 除了输入自然语言，还能怎样高效操作？ | `/`、`@`、`!`、Esc、Shift+Tab、Ctrl+O、多行输入 | 能引用文件、执行命令、切换模式和中断操作 |
| ep03 | Claude Code 不是聊天框 | 它为什么能读代码、改文件并运行测试？ | `gather context → take action → verify`；工具调用与结果回传 | 能读懂一次完整 agentic loop |
| ep04 | 先让它理解项目 | 怎样减少“没看代码就开始改”的错误？ | 代码库探索、文件引用、搜索、依赖与调用链 | 形成一份基于证据的项目理解 |
| ep05 | 怎样交代一个好任务 | Prompt 中哪些信息真正影响结果？ | 目标、上下文、约束、边界、验收标准 | 得到可执行且歧义较少的任务说明 |
| ep06 | 先计划，再编辑 | 哪些任务不应该直接开改？ | Plan Mode、`/plan`、探索与实现分离 | 得到可审查的修改计划和影响范围 |
| ep07 | 修改不是完成，验证才是 | 如何让 Claude 证明改动有效？ | 测试、lint、构建；`/diff`、`/run`、`/verify` | 产出 diff 与验证证据，而不只是“已经修好” |
| ep08 | 权限、沙箱与撤销 | 怎样既让智能体行动，又不失去控制？ | 权限决策、`/permissions`、`/sandbox`、checkpoint、`/rewind` | 能识别高风险操作并恢复错误改动 |
| ep09 | 管理上下文和长会话 | 会话变长后为什么会变慢、变笨？ | `/context`、`/compact`、`/clear`、`/resume`、`/rename`、`/branch`、`/btw` | 能判断该压缩、清空、恢复还是分支会话 |
| ep10 | 把项目规则写进 CLAUDE.md | 哪些信息不该每次重复告诉 Claude？ | `/init`、`/memory`；用户、项目、目录级指令 | 建立简短、可维护、可验证的项目指令 |
| ep11 | 从 Bug 到 PR | 如何把前面的能力串成稳定交付流程？ | 复现 → 探索 → 计划 → 修改 → 验证 → `/simplify` → `/code-review` → `/security-review` → PR | 完成一个有证据、可审查、可回退的 PR |

### 第一季的教学顺序

```text
进入项目
  → 掌握交互
  → 理解 agentic loop
  → 探索代码
  → 明确任务
  → 制订计划
  → 修改并验证
  → 控制权限与恢复
  → 管理上下文
  → 固化项目规则
  → 完成交付
```

## 第二季：扩展、复用与自动化

第二季不再介绍基础操作，重点是把一次成功的个人会话变成团队可复用、可自动执行的工程能力。

| 集 | 标题 | 核心心智模型 | 主要能力 |
|---|---|---|---|
| ep12 | 上下文工程进阶 | 上下文是稀缺预算，不是无限记忆 | 上下文来源、工具结果膨胀、压缩策略、长任务拆分 |
| ep13 | Skills：按需加载的工作流 | 把领域知识与步骤封装成可发现能力 | `SKILL.md`、触发条件、脚本与资源、`/skills`、`/reload-skills` |
| ep14 | MCP：连接外部系统 | Claude Code 通过受控接口获得外部能力 | MCP server、资源与工具、认证、`/mcp` |
| ep15 | Hooks：确定性的生命周期自动化 | 需要保证发生的事，不交给模型临场决定 | hook 事件、输入输出、失败策略、`/hooks` |
| ep16 | Subagents：隔离上下文与专业分工 | 委派的价值首先是隔离，其次才是并行 | agent 定义、工具边界、结果回传、任务拆分 |
| ep17 | 并行开发与 Worktrees | 并行任务必须隔离文件状态与责任边界 | 后台任务、`/background`、`/tasks`、worktree、分支策略 |
| ep18 | Plugins：分发整套扩展 | 把 Skills、Hooks、MCP 与配置打包交付 | 插件结构、安装、更新、`/plugin`、`/reload-plugins` |
| ep19 | Headless 与 CI | 交互式助手如何变成自动化步骤？ | 非交互 CLI、结构化输出、GitHub Actions、权限与密钥 |
| ep20 | 从 Issue 到 PR 的自动化流水线 | 扩展能力最终要形成可审计闭环 | Issue 获取、子任务、实现、验证、审查、PR 汇总 |

## 第三季：用 Claude Agent SDK 构建智能体

Agent SDK 面向要把 Claude 的 agentic loop 嵌入产品、服务或自动化系统的开发者。它不是第一季 CLI 操作的附录，而是一条独立的工程进阶线。

| 集 | 标题 | 核心问题 | 实作目标 |
|---|---|---|---|
| ep21 | CLI、Client SDK 与 Agent SDK | 三者分别解决什么问题？ | 选定适合产品需求的集成层级 |
| ep22 | 第一个 SDK Agent | 如何发起查询并消费流式事件？ | 运行最小 agent，展示消息与结果流 |
| ep23 | 看懂 Agent Loop | 一次任务中发生了哪些事件？ | 可视化请求、思考、工具调用、工具结果与终止条件 |
| ep24 | 工具、权限与人工批准 | 应用如何控制智能体可以做什么？ | 配置内置工具、权限规则和 approval flow |
| ep25 | 自定义工具 | 如何把业务 API 变成智能体可用动作？ | 实现带 schema、校验和错误处理的工具 |
| ep26 | Sessions、Resume 与 Fork | 多轮任务如何持续、恢复和分叉？ | 保存并恢复会话，处理 checkpoint 与分支 |
| ep27 | 复用 Claude Code 扩展 | CLI 项目能力能否进入 SDK Agent？ | 复用 CLAUDE.md、Skills、Hooks、MCP 与 Subagents |
| ep28 | 结构化输出、成本与可观测性 | 如何让 Agent 进入生产系统？ | 输出 schema、用量统计、日志、追踪、超时与重试 |
| ep29 | 安全部署一个 Coding Agent | 本地能跑和生产可用差在哪里？ | 隔离运行环境、密钥、网络、并发、托管与故障恢复 |
| ep30 | 综合项目：代码审查与修复 Agent | 如何把能力组合成真实产品？ | 输入仓库与任务，输出审查报告、修复 diff 和验证证据 |

## 内置命令的教学策略

内置命令需要讲，但不应平均分配篇幅。命令会随 Claude Code 版本演进，课程稳定层应当教授“什么时候需要做这个决策”，命令索引则持续维护。

### A. 核心命令：在第一季工作流中实操

| 场景 | 命令 |
|---|---|
| 求助与诊断 | `/help`、`/status`、`/doctor` |
| 项目与记忆 | `/init`、`/memory` |
| 计划与验证 | `/plan`、`/diff`、`/run`、`/verify` |
| 权限与恢复 | `/permissions`、`/sandbox`、`/rewind` |
| 上下文与会话 | `/context`、`/compact`、`/clear`、`/resume`、`/rename`、`/branch`、`/btw` |
| 模型与消耗 | `/model`、`/effort`、`/usage` |
| 交付前检查 | `/simplify`、`/code-review`、`/security-review` |

### B. 扩展命令：在第二季对应能力中出现

`/skills`、`/reload-skills`、`/mcp`、`/hooks`、`/plugin`、`/reload-plugins`、`/background`、`/tasks`、`/fork`、`/batch`、`/goal`、`/loop`、`/review`、`/install-github-app`、`/autofix-pr`、`/remote-control`、`/teleport`。

这些命令不做孤立演示。例如：先用 `/context` 看见上下文膨胀，再用 `/compact focus on...`；完成修改后依次查看 `/diff`、运行验证、简化代码并进行审查。

### C. 参考命令：收录到动态命令图鉴

主题、颜色、复制、导出、语音、移动端、终端设置和快捷键等低频功能，不占用主课程集数。它们进入独立的“Claude Code 命令图鉴”，以短视频或文档形式维护。

每条命令记录以下信息：

```json
{
  "name": "/compact",
  "type": "builtin-command",
  "availability": "core",
  "introducedIn": "ep09",
  "officialReference": "https://code.claude.com/docs/en/commands",
  "lastVerifiedVersion": ""
}
```

### 不要混淆三类入口

- 启动参数：例如 `claude --continue`，在进入交互会话之前生效。
- 内置命令：例如 `/resume`，由当前 Claude Code 版本提供。
- Skill 或捆绑工作流：外观也可能是 `/name`，但来源、可用范围和版本策略不同。

## 单集统一结构

每集采用稳定的五段式教学节奏，具体画面结构根据当前主角选择，不固定成左右分栏：

1. **问题**：用一个真实失败或疑问建立观看动机。
2. **模型**：只解释本集需要的一个心智模型。
3. **操作**：在真实终端或真实代码中完成任务。
4. **验证**：让文件、测试、diff、权限或会话状态证明结果。
5. **迁移**：说明这个能力在什么场景使用，以及最常见的误用。

统一品牌片头、单集标题卡、本集 takeaway 与统一品牌片尾是四个不同层级，制作时不得合并成同一张信息板。

## 内容与版本维护

- 主课程只承载跨版本稳定的心智模型和高频工作流。
- 命令图鉴记录具体命令的可用性、官方链接和最后核验版本。
- Claude Code 更新后，优先更新命令图鉴；只有心智模型或关键工作流变化时才重录主课程。
- 每集制作前核对官方文档与本机版本，避免把已移除的别名或实验功能讲成长期稳定能力。
- 每个 episode JSON 是该集教学意图、scene、旁白、命令、官方来源和发布数据的唯一内容源。

建议在 episode JSON 中为每个关键能力保留来源和版本信息：

```json
{
  "officialReferences": [
    "https://code.claude.com/docs/en/how-claude-code-works"
  ],
  "verifiedWith": {
    "date": "2026-07-17",
    "claudeCodeVersion": ""
  }
}
```

## 官方文档基线

- [Quickstart](https://code.claude.com/docs/en/quickstart)
- [How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works)
- [Best practices](https://code.claude.com/docs/en/best-practices)
- [Common workflows](https://code.claude.com/docs/en/common-workflows)
- [Interactive mode](https://code.claude.com/docs/en/interactive-mode)
- [Built-in commands](https://code.claude.com/docs/en/commands)
- [Context window](https://code.claude.com/docs/en/context-window)
- [Memory](https://code.claude.com/docs/en/memory)
- [Permissions](https://code.claude.com/docs/en/permissions)
- [Checkpointing](https://code.claude.com/docs/en/checkpointing)
- [Features overview](https://code.claude.com/docs/en/features-overview)
- [CLI reference](https://code.claude.com/docs/en/cli-reference)
- [Agent SDK overview](https://code.claude.com/docs/en/agent-sdk/overview)
- [Agent SDK agent loop](https://code.claude.com/docs/en/agent-sdk/agent-loop)
- [Agent SDK hosting](https://code.claude.com/docs/en/agent-sdk/hosting)

## 现有 EP01 迁移说明

当前 `episodes/ep01-agentic-loop.json` 与已有录屏资产包含第三方兼容网关、环境变量和 `settings.json` 配置。它们不删除，但不再作为官方入门主线：

- 新 ep01 以官方安装、官方登录和环境诊断为主。
- 第三方网关内容迁移为明确标注的附录：**自定义网关与模型服务配置**。
- 已完成的录屏和后处理资产继续保留，后续迁移时通过 episode JSON 重新编排，不直接覆盖。

## 终端录制约定

Claude Code 是非确定性 LLM，课程需要兼顾真实性与可复现性：

- **脚本化演绎**：需要稳定讲解节奏的 prompt 与回复可以按剧本录制，不依赖在线模型随机输出。
- **真实状态变化**：文件编辑、测试、diff、Git 状态和权限结果必须真实发生，画面必须能验证结果。
- **录制 sidecar**：每段录屏同步记录段落 ID、教学意图、输入、输出、等待区间、关键帧、可加速区间和剪辑边界，供后续拆分与重剪。
- **Docker 隔离**：录制环境与宿主项目隔离，每集由初始化脚本建立确定的初始状态。
- **终端按叙事降权**：输入命令时终端是主角；展示文件、diff、测试或模型时，终端退为证据。

## 当前状态

- 课程大纲已升级为三季结构，第一季 11 集、第二季 9 集、第三季 10 集。
- EP01 现有录屏与后处理流程保留，等待按新定位迁移内容。
- `episodes/ep01-agentic-loop.json`、`Ep01Install` composition 与 `ep01-install/current` 是迁移前的三套身份，不再继续扩散；新流程先统一为一个 episode id。
- episode schema、workflow 和 checklist 已建立；orchestrator、Candidate/Audit、Current 晋升与 Release/Publish 仍待实现。
- 下一步先迁移 EP01 并验证完整生产链，再把第一季其余集数逐集落成 episode JSON。
