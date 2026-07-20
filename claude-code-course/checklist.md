# Claude Code Course 生产检查清单

本清单建立在 [`课程视频统一生产规范`](../docs/course-production.md) 和 [`workflow.md`](workflow.md) 之上。当前统一 orchestrator 尚未实现，所有 Candidate、Current 和 Release 项均是接入门槛。

## 内容与版本

- [ ] episode JSON 通过 `episode.schema.json`。
- [ ] episode id、Composition、源码目录和产物根使用同一身份。
- [ ] 每集只建立一个心智模型或可验证工作流。
- [ ] 每个 scene 只有一个主角和一个明确状态变化。
- [ ] 官方来源、核验日期和 Claude Code 版本完整。
- [ ] 启动参数、内置命令、skill、plugin 和第三方能力没有混淆。
- [ ] preview、套餐或平台限制已明确标注。
- [ ] `[1m]` 被表述为 Claude Code 通用上下文后缀，并明确说明发送给服务商前会移除。
- [ ] 只有官方资料确认模型与当前渠道支持 1M 时才展示 `[1m]`，套餐或账户限制没有被省略。
- [ ] 国内模型示例包含原始模型 ID、Claude Code 配置值、认证变量、官方来源与核验日期。

## 终端与验证证据

- [ ] 终端素材从 `claude-code-lab` 可重复录制。
- [ ] fixture、依赖、Git 初始状态、终端 profile 和产品版本进入指纹。
- [ ] 文件修改、diff、测试、权限和错误结果真实发生。
- [ ] prompt、工具调用、结果和结论按因果顺序出现。
- [ ] sidecar 包含输入、输出、等待区间、关键帧和剪辑边界。
- [ ] 没有账号、token、主目录、私有路径或真实业务数据泄漏。

## Candidate 与主审查（尚未实现）

- [ ] dirty terminal、Scene、TTS 和 BGM 只通过 orchestrator 生成。
- [ ] 成功任务立即写入内容寻址 cache。
- [ ] Candidate 只写 `tmp/build/candidate/`，不覆盖 Current。
- [ ] 连续 2fps、overview、边界 burst、关键帧和 metrics 已生成。
- [ ] 终端、字幕、画面、音频、版本适用性和状态因果检查通过。
- [ ] 人工 verdict 为 `pass` 且绑定当前 Candidate 实际 SHA。
- [ ] promote 核对全部输入指纹后原子写入 Current。

## Release 与 Publish（尚未实现）

- [ ] release-build 绑定当前 Current SHA。
- [ ] 片头、片尾、封面和平台文案来自 episode JSON 与固定课程资产。
- [ ] release audit 重新检查包装边界、媒体参数、字幕和音频。
- [ ] release approval 绑定当前 release candidate SHA。
- [ ] publish 重新核对磁盘 SHA，再写 `current/release/`。
- [ ] Current 更新后旧 release verdict 与 Published 自动失效。

## EP01 迁移完成条件

- [ ] `ep01-agentic-loop` 与 `ep01-install` 已收敛为一个最终 episode id。
- [ ] narration 数组已拆为标准 scene narration 对象。
- [ ] `tts` 已迁移为标准 `audio` 配置。
- [ ] 国内 Anthropic 兼容渠道只作为可核验的模型选择与真实请求路径讲解，没有被误写成 Claude Code 官方服务。
- [ ] 旧成片已归档到 `tmp/legacy-final/`，不参与新 Current 判断。
- [ ] 通过新 orchestrator 从 JSON 完整重建 Candidate、Audit、Current 和 Release。
