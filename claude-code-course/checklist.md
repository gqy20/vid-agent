# Claude Code Course 生产检查清单

本清单建立在 [`课程视频统一生产规范`](../docs/course-production.md) 和 [`workflow.md`](workflow.md) 之上。当前统一 orchestrator 尚未实现，所有 Candidate、Current 和 Release 项均是接入门槛。

## 内容与版本

- [ ] episode JSON 通过 `episode.schema.json`。
- [ ] episode id、Composition、源码目录和产物根使用同一身份。
- [ ] 每集只建立一个心智模型或可验证工作流。
- [ ] 每个 scene 只有一个主角和一个明确状态变化。
- [ ] episode JSON 含完整 `continuity`；章节输入/输出状态与前后 episode 双向匹配。
- [ ] `program.json` 只维护两卷身份、章节顺序和装配策略，没有复制 episode 教学内容。
- [ ] 前十章按 `chapterIndex=1..10` 连续且无重复归属；Volume 01 输出状态逐字等于 Volume 02 输入状态。
- [ ] `continuity.scenes[]` 与 `scenes[]` 数量、顺序和 ID 一致；相邻 scene 的 `exitState` 与 `entryState` 逐字相同。
- [ ] 每个 handoff 指向实际下一 scene 或 episode，并保留一个可见的 `visualAnchor`，没有用泛化淡入淡出代替叙事接力。
- [ ] 独立集的 hook 能承接上一章状态，takeaway 把未解决问题交给下一章；合集不会重复播放总结、预告和重新开场。
- [ ] EP01–EP10 的章间接缝使用真实对象或状态作为视觉接力，不依赖跨章持续动画。
- [ ] 旁白以问题、观察和验证推进，不连续宣布“必须、不要、记住”的正确方法。
- [ ] 抽象模型在具体演示之后归纳，结尾回到开头的问题，而不是输出训诫清单。
- [ ] 真实命令、安全警告和产品边界保持明确，但没有借安全说明评价或责备观众。
- [ ] 字幕、终端、图示、标题和顶部横栏各自承担不同信息，没有两层完整复述同一结论。
- [ ] 一帧最多一个短问题、一个主证据、三个短标签和一个状态强调；终端场景没有解释性副标题加多段文字 rail。
- [ ] 可视关系优先由图像、语义图标、连线和状态变化表达，图标没有附带与字幕同义的解释句。
- [ ] 问题、终端证据、语义节点和因果连接复用课程 kit；装饰性顶栏横线没有重新成为默认分组方式。
- [ ] 颜色主要用于图标、关键词和当前状态；没有用大面积语义色块代替对象关系。
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
- [ ] 正式终端源、逻辑列行数和录制字体进入 metadata；1080p 逻辑画布中的有效正文不低于 20px。
- [ ] 长 4K 录屏只按 timeline 派生所需短剪辑；需要逐帧素材时从短剪辑生成，章节指纹覆盖实际引用的帧目录。
- [ ] 终端窗口比例在镜头内保持固定，没有分别动画化宽高或四条边；录屏内容始终等比缩放。
- [ ] 小尺寸终端使用语义裁切保留命令、结果和必要上下文，没有把完整 120 列录屏缩成小字墙。
- [ ] `RecordedTerminal` 统一裁掉源素材底部 107px 的 tmux 状态栏，同时保留 Claude Code 输入区和自身状态信息。
- [ ] 每个终端镜头最多一个语义高亮区域，高亮同时覆盖对象名、命令和相关结果，没有圈住孤立数字或空白。
- [ ] 没有账号、token、主目录、私有路径或真实业务数据泄漏。
- [ ] 本次 run 的 `manifest.json` 绑定 Claude Code 版本、镜像身份、退出状态和日志 SHA。
- [ ] 原始 session/debug 日志只位于权限受限且 Git 忽略的 `tmp/recordings/<run-id>/raw/`，没有归档 `settings.json`。
- [ ] `sensitive-scan.json` 已核对；公开素材只使用白名单 `session-trace.jsonl`，不直接读取 raw session。

## Candidate 与主审查（尚未实现）

- [ ] dirty terminal、Scene、TTS 和 BGM 只通过 orchestrator 生成。
- [ ] 成功任务立即写入内容寻址 cache。
- [ ] Candidate 只写 `tmp/build/candidate/`，不覆盖 Current。
- [ ] 连续 2fps、overview、边界 burst、关键帧和 metrics 已生成。
- [ ] 终端、字幕、画面、音频、版本适用性和状态因果检查通过。
- [ ] 人工 verdict 为 `pass` 且绑定当前 Candidate 实际 SHA。
- [ ] promote 核对全部输入指纹后原子写入 Current。

## Draft Preview（已实现）

- [ ] outline 先通过 `tts` 生成 cache 与 timing proposal；人工核对并写回 episode JSON 后才进入 `draft`，没有让派生产物反向成为内容源。
- [ ] episode JSON 显式固定 TTS model、voice、language、speed，以及 BGM source 与 `volume=0.05`。
- [ ] 每个 scene 的旁白头部和尾部留白均不超过 2 秒，且由 `validate` 根据真实 TTS 时长硬校验。
- [ ] `audio-preview` 的全部 narration 段均命中或写入内容寻址 cache。
- [ ] schema v3 manifest 同时绑定分段音频、完整字幕 cue、BGM SHA 和 `mix.m4a` 指纹。
- [ ] `audio-audit` 通过分段 `-20 LUFS`、字幕 1–2 行、完整节目约 `-16 LUFS` 和 AAC 真峰值门限。
- [ ] `preview --video` 只在音频 verdict 与 active mix SHA 匹配时运行，整片先写内容寻址 cache，再物化到固定的 `tmp/preview/episode.mp4`。
- [ ] 换轨前后视频流哈希一致，分辨率、帧率、帧数与时长没有变化。
- [ ] 分镜预览只使用 `tmp/preview/scenes/01_scene_id.mp4` 形式，并由根 manifest 记录 cache path、fingerprint、SHA 和物化方式。
- [ ] Draft 核对入口固定为 `tmp/preview/episode.mp4` 与 `tmp/preview/review/report.html`，没有 `v2`、`v3`、`4k-preview` 或临时审查目录。
- [ ] 十章 Draft Preview 的实际输出规格一致；4K 输出仍在 1080p 逻辑尺寸下通过终端与字幕可读性检查。
- [ ] 每章先独立渲染并进入内容寻址 cache；单章失败不会丢弃其他已完成章节。
- [ ] 同一批章节只生成一次 Remotion bundle；章节各用独立浏览器，章节 worker 与帧并发由逻辑 CPU 或稳定 profile 分配。
- [ ] `tmp/preview/visual/chapter.mp4` 只作为静音视觉核对，不被描述为完整 episode 或 Volume。
- [ ] `clean` 默认 dry-run，只有显式 `--apply=true` 才清理旧 Preview 视图，且不触碰 CAS、Candidate 或 Current。
- [ ] Preview 没有被命名、复制或描述为 Candidate、Current、Release 或 Published。

## Release 与 Publish（尚未实现）

- [ ] release-build 绑定当前 Current SHA。
- [ ] 片头、片尾、封面和平台文案来自 episode JSON 与固定课程资产。
- [ ] release audit 重新检查包装边界、媒体参数、字幕和音频。
- [ ] release approval 绑定当前 release candidate SHA。
- [ ] publish 重新核对磁盘 SHA，再写 `current/release/`。
- [ ] Current 更新后旧 release verdict 与 Published 自动失效。
- [ ] 两个 Volume 只装配 manifest 绑定 SHA 的 clean chapter segment，不拼接带重复片头片尾的单集 MP4。
- [ ] 每个 Volume 只有一次品牌包装；章节人声可复用，BGM 在整卷层连续重建，接缝处没有重启。
- [x] Volume Draft 只使用 SHA 匹配、音频审查为 `pass` 的章节 Preview，并为整卷重建连续 BGM。
- [ ] Volume Candidate/Audit adapter 未实现前，Current、Release 和 Published 全部保持 blocked。

## EP01 迁移完成条件

- [ ] `ep01-agentic-loop` 与 `ep01-install` 已收敛为一个最终 episode id。
- [ ] narration 数组已拆为标准 scene narration 对象。
- [ ] `tts` 已迁移为标准 `audio` 配置。
- [ ] 国内 Anthropic 兼容渠道只作为可核验的模型选择与真实请求路径讲解，没有被误写成 Claude Code 官方服务。
- [ ] 旧成片已归档到 `tmp/legacy-final/`，不参与新 Current 判断。
- [ ] 通过新 orchestrator 从 JSON 完整重建 Candidate、Audit、Current 和 Release。
