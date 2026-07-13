# Claude Code Course

实操技能为主的 Claude Code 视频课程。对标 `git-course/` 的生产体系：心智模型驱动 + 唯一内容源 + 三层资产 + SHA 门禁。这一季先跑通 ep01，验证终端录制方案后再铺量。

## 课程定位

讲清楚 Claude Code 的核心心智模型与实操用法。每集 2.5–5 分钟，只解决一个误解或一个技能。

## 第一季大纲

| 集 | 标题 | 核心心智模型 |
|---|---|---|
| ep01 | Claude Code 不是聊天框 | agentic loop |
| ep02 | 上下文窗口里有什么 | 系统提示 / CLAUDE.md / 历史 / 工具结果 |
| ep03 | 一次工具调用 | tool_use → tool_result + 权限 |
| ep04 | CLAUDE.md 是第一生产力 | 项目指令如何进入每一轮上下文 |
| ep05 | 记忆系统 | 全局 / 项目 memory vs 会话 |
| ep06 | Skills 可复用能力包 | 触发机制 + SKILL.md 结构 |
| ep07 | Subagents 委派与并行 | Agent tool 的隔离上下文 |
| ep08 | Hooks 与自动化 | settings.json 触发器，harness 执行 |

## 术语

- **agentic loop**：`think → tool_use → tool_result → think` 的循环，Claude Code 的核心运行模型
- **上下文窗口**：每一轮模型实际看到的 token 拼装
- **工具 (tool)**：模型动作的唯一出口，含 Read / Edit / Bash / Write / ...
- **skill**：可复用能力包，`SKILL.md` + 脚本
- **memory**：持久化记忆，全局 vs 项目
- **hook**：`settings.json` 配置的自动触发器
- **MCP**：外部工具接入协议

## 终端录制约定（与 git-course 的关键差异）

git-course 用 asciinema 录真实 git 命令。Claude Code 是非确定性 LLM，录真实会话不可复现，因此：

- **全脚本演绎**：prompt 和 assistant 回复用 `tmux send-keys` 逐字打出，不跑真 LLM。对话内容写死，可任意重录。
- **文件操作真实**：剧本里 Claude "Edit 了 foo.ts"，foo.ts 真被改，yazi 实时反映文件后果。对话是演的，文件变化是真的。
- **Docker 隔离**：tmux + yazi 关进 base 镜像（宿主无 yazi），每集 `init.sh` 搭初始项目状态。
- **双 pane 常驻**：左 pane 演 Claude Code 终端，右 pane yazi 作"文件后果镜"，被动反映、不炫技。

## 当前状态

ep01 录屏验证中。生产入口（CLI 门禁、Remotion 编排）待录屏方案确认后接入。
