# Claude Code Course

一套以真实开发任务为主线的 Claude Code 视频课程。课程不照着官方文档目录逐项念功能，而是沿着学习者能力增长组织内容：**先会用，再稳定交付，然后扩展 Claude Code，最后用 Agent SDK 构建自己的智能体产品。**

本课程遵守仓库级 [`课程视频统一生产规范`](../docs/course-production.md)。课程专属的真实终端、版本核验、证据审查和旧 EP01 迁移规则见 [`workflow.md`](workflow.md)，视觉与字体 token 见 [`visual-language.md`](visual-language.md)，阶段验收见 [`checklist.md`](checklist.md)。当前尚未实现统一 orchestrator，因此 Candidate、Current 和 Release 阶段保持阻断，不能通过手工复制旧成片宣称完成。

## 课程定位

- 面向已经会使用终端和 Git、希望把 Claude Code 用进真实项目的开发者。
- 每集只建立一个核心心智模型，或完成一个可以验证的工作流。
- 每集建议 4–8 分钟；复杂主题允许拆成上下集，不为追求短而牺牲因果链。
- 使用同一个小型示例项目贯穿第一季，避免每集重新介绍业务背景。
- 命令只是完成任务的操作入口，不单独堆成“命令背诵课”。

## 总体课程地图

| 阶段 | 目标 | 学完后的能力 |
|---|---|---|
| 前十章：核心工作流 | 从第一次启动到完成一个可审查的 PR | 能正确委派任务、控制风险、验证结果并沉淀项目能力 |
| 第二季：扩展与自动化 | 把个人用法沉淀成项目能力 | 能配置 Skills、MCP、Hooks、Subagents、Plugins 和 CI 流程 |
| 第三季：Agent SDK | 把 Claude Code 的能力嵌入应用 | 能实现带工具、权限、会话和可观测性的编码智能体 |

## 前十章：两个长视频

前十章使用同一个 task-board 示例仓库。章节独立制作、渲染和缓存，最终只包装成两个长视频；每卷使用一次片头、一次章节进度和一次片尾，不重复拼接十套单集包装。

| 卷 | 章 | 标题 | 核心问题 | 可验证产出 |
|---|---|---|---|---|
| 01 | ep01 | 从安装到第一次启动 | 安装成功为什么还不算可用？ | 真实模型返回真实回答 |
| 01 | ep02 | 先完成一次真实修复 | Claude Code 最小可用工作流是什么？ | 一个真实问题被复现、修改并验证 |
| 01 | ep03 | 它为什么这样行动 | 一次修复背后的 agentic loop 怎样工作？ | 工具调用、结果回传和日志结构可以解释 |
| 01 | ep04 | 先让它理解项目 | 它怎样从文件访问形成项目理解？ | 一张可复查的路径与行为证据图 |
| 01 | ep05 | 怎样把需求变成可验证任务 | 哪些输入会真正改变实现？ | 一页有证据、边界和验收方式的任务说明 |
| 02 | ep06 | 哪些任务值得先做计划 | 什么时候应该先审查修改路径？ | 一份跨层且可审查的执行计划 |
| 02 | ep07 | 怎样让它行动又不失去控制 | 权限、沙箱和恢复分别解决什么问题？ | 受控工作区改动与一次可解释恢复 |
| 02 | ep08 | 测试通过为什么还不够 | 哪些证据共同支持“完成”？ | 测试、构建、运行时行为和 diff 证据包 |
| 02 | ep09 | 项目怎样持续约束和帮助 Claude | CLAUDE.md、Rules、Memory、Hooks 和 Agent 怎样分工？ | 项目级指令、路径规则、记忆、门禁和 reviewer agent |
| 02 | ep10 | 从 Issue 到可审查 PR | 前面的能力能否在干净会话中闭环？ | 有证据、可审查且可回退的 PR |

### 前十章的教学顺序

```text
进入项目
  → 完成一次真实修复
  → 回看 agentic loop
  → 探索代码
  → 明确任务
  → 制订计划
  → 在权限边界内修改与恢复
  → 用多层证据验证
  → 固化规则、记忆、Hooks 与 Agent
  → 完成交付
```

## 后续：扩展、复用与自动化

前十章完成以后，再把其中已经出现的上下文、Hooks 和 Subagents 展开为专题，并补齐 Skills、MCP、Plugins、并行开发与 CI。

| 集 | 标题 | 核心心智模型 | 主要能力 |
|---|---|---|---|
| ep11 | 上下文工程进阶 | 上下文是稀缺预算，不是无限记忆 | 上下文来源、工具结果膨胀、压缩策略、长任务拆分 |
| ep12 | Skills：按需加载的工作流 | 把领域知识与步骤封装成可发现能力 | `SKILL.md`、触发条件、脚本与资源、`/skills` |
| ep13 | MCP：连接外部系统 | Claude Code 通过受控接口获得外部能力 | MCP server、资源与工具、认证、`/mcp` |
| ep14 | Hooks 深入 | 确定性自动化怎样可靠运行？ | hook 事件、输入输出、失败策略、`/hooks` |
| ep15 | Subagents 深入 | 委派怎样隔离上下文与专业分工？ | agent 定义、工具边界、结果回传、任务拆分 |
| ep16 | 并行开发与 Worktrees | 并行任务必须隔离文件状态与责任边界 | 后台任务、worktree、分支策略 |
| ep17 | Plugins：分发整套扩展 | 把 Skills、Hooks、MCP 与配置打包交付 | 插件结构、安装、更新与分发 |
| ep18 | Headless 与 CI | 交互式助手如何变成自动化步骤？ | 非交互 CLI、结构化输出、CI 权限与密钥 |

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

旧 `legacy/ep01-agentic-loop.json` 与已有录屏资产的生产身份不统一。它们不删除，但不再作为新的内容入口：

- 新 `episodes/ep01-install-first-start.json` 保留已验证的原流程：官方安装、当前 Shell 配置、用户级 settings 与首次真实请求。
- 新 JSON 只重写教学结构和摘要字幕，不改写认证、代理、onboarding 或首次请求的导演流程。
- 已完成的录屏和后处理资产继续保留，后续迁移时通过 episode JSON 重新编排，不直接覆盖。

## 终端录制约定

Claude Code 是非确定性 LLM，课程需要兼顾真实性与可复现性：

- **脚本化演绎**：需要稳定讲解节奏的 prompt 与回复可以按剧本录制，不依赖在线模型随机输出。
- **真实状态变化**：文件编辑、测试、diff、Git 状态和权限结果必须真实发生，画面必须能验证结果。
- **录制 sidecar**：每段录屏同步记录段落 ID、教学意图、输入、输出、等待区间、关键帧、可加速区间和剪辑边界，供后续拆分与重剪。
- **Docker 隔离**：录制环境与宿主项目隔离，每集由初始化脚本建立确定的初始状态。
- **本地凭据**：EP01 从仓库根目录中被 Git 忽略的 `.env` 读取 `ANTHROPIC_AUTH_TOKEN`；文件权限必须为 `600`。原始 cast 可含真实 Token，但只能存在临时目录；公开 MP4、sidecar 和已跟踪文件不得暴露 Token。
- **终端按叙事降权**：输入命令时终端是主角；展示文件、diff、测试或模型时，终端退为证据。

## 官方文档截图

EP01 的模型与 1M 上下文证据由仓库脚本从公开官方页面派生：

```bash
python3 scripts/browser-recordings/claude-code-course-lab/capture_official_docs.py
```

截图固定为 1600×900，只包含公开文档，不访问账户、控制台、密钥、价格或用量额度页面；上下文资格条件只用于说明能力边界。脚本同时写入无敏感状态的 manifest；episode JSON 保存来源、核验日期、截图资产和关注区域。

## 旁白预览

EP01 的分段旁白、SRT、规范化音频和全局字幕 manifest 统一从受限课程入口生成：

```bash
pnpm --dir remotion claude-code-course tts ep05-verifiable-task
pnpm --dir remotion claude-code-course audio-preview ep01-install-first-start
pnpm --dir remotion claude-code-course audio-audit ep01-install-first-start
```

`tts` 允许 outline 先生成本章内容寻址 TTS cache 和 `tmp/narration-source/timing-proposal.json`，但不改 episode JSON、不混音。人工应用真实时长并将内容改为 `draft` 后，`audio-preview` 和 `audio-audit` 才生成完整音频视图。所有命令只写 `tmp/cache`、`tmp/preview` 和可重建的 Remotion public 预览视图，不生成或晋升 Candidate。画面字幕以 MMX SRT 时间戳为锚点，并用 episode JSON 的旁白正文重新切成完整语义句；模型名、版本号和环境变量不会从中间拆开。字幕和音频从同一个 manifest 读取，缺失时渲染会明确失败。

## 当前状态

- 前十章已经固定为两个长视频：Volume 01 为 EP01–EP05，Volume 02 为 EP06–EP10；`program.json` 是卷与章节顺序的唯一装配清单。
- 每章独立渲染、缓存和核对，合集只装配 SHA 绑定的 clean chapter segment，并在整卷层连续铺设 BGM。
- EP01 已在新 id 下复用原导演与后处理流程，终端素材、metadata 和 timeline 已重新生成。
- 正式 EP01 内容身份已确定为 `ep01-install-first-start`；旧 `ep01-agentic-loop` JSON 和 Composition 已移入或标记为 legacy，`ep01-install/current` 仍是不可晋升的旧产物。
- 新 EP01 已扩展为 300 秒：客户端 / 渠道 / 模型关系、国内模型选择、变量与请求流、`[1m]` 通用上下文动画和官方文档截图已接入新的 `ClaudeCodeCourseEp01InstallFirstStart` Composition。
- 安装与配置使用新 id 录屏；该录屏最后一次请求遇到 429，首次成功回答因此复用同版本、同导演流程的旧录屏片段，并在 episode JSON 记录来源。
- 11 段 TTS、33 条完整语义句字幕 cue、响度规范化、全局字幕 manifest 和受限课程 adapter 已接入并通过 preview audio audit；内容仍是 `draft`，该审计不是可晋升 verdict。
- EP01–EP10 都已经具备独立 episode JSON、Remotion Composition、真实 TTS 时长、语义完整字幕、规范化音频与可单章复用的 1080p Draft Preview；章节渲染器只重建内容指纹变化的章节，并在缓存前核验实际时长、分辨率和帧率。
- EP06 已接入 Claude Code 2.1.218 的真实 Plan Mode 终端证据：只调用 `Read` / `Bash`，保存只读探索、计划复核与修改后计划三个 4K 短片及帧序列，并通过敏感信息扫描和零工作区修改核验。EP07–EP10 当前仍是教学结构、旁白和语义动画 Draft，真实权限交互、验证输出、指令加载和 GitHub PR 浏览器证据尚待逐章录制替换。
- 两条长视频 Draft 已生成：Volume 01 为 EP01–EP05，共 1073.9 秒；Volume 02 为 EP06–EP10，共 518.5 秒。两者都由独立章节 Preview 装配，章节人声按 manifest 对齐，整卷只铺设一条连续 BGM；章节边界保留不超过 0.5 秒的视觉换气。
- 两卷均已有固定 Draft 审片页：每章连续 `2fps`、每页最多 5 帧并独立缓存，整卷另有 `4×4` 总览和章间双侧 burst；最后一页按真实帧数裁短，不再补空白格。重复运行在输入未变化时直接复用报告。
- chapter Draft adapter 已有基础能力；Volume 已实现 `validate/plan/status/draft/review`。`draft` 只接受带 `pass` 音频审查且 SHA 匹配的章节 Preview，`review` 只接受 SHA 匹配的 Volume Draft 与章节视图。Volume Candidate/Audit、Current 晋升与 Release/Publish adapter 仍待实现，因此这些成片只能作为可重建审片稿，不能晋升或发布。
