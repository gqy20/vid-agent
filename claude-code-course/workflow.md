# Claude Code Course 生产流程

本课程遵守仓库级 [`课程视频统一生产规范`](../docs/course-production.md)。本文定义 Claude Code adapter 的内容、终端证据、版本核验和迁移边界。

## 当前实现边界

当前只有课程大纲、一个旧 episode JSON、一个旧 Remotion composition、脚本化终端素材和一个直接保存的旧 Current。尚不存在 Claude Code Course orchestrator、统一 Candidate、SHA-bound audit verdict、approve/promote 或 Release/Publish。

因此目前只能编辑和迁移内容，不能宣称完成正式生产。以下目标命令在真正实现前必须保持不可用：

```text
pnpm --dir remotion claude-code-course plan <episode-id>
pnpm --dir remotion claude-code-course preview <episode-id>
pnpm --dir remotion claude-code-course build <episode-id>
pnpm --dir remotion claude-code-course approve <episode-id>
pnpm --dir remotion claude-code-course promote <episode-id>
pnpm --dir remotion claude-code-course release-build <episode-id>
pnpm --dir remotion claude-code-course release-audit <episode-id>
pnpm --dir remotion claude-code-course release-approve <episode-id>
pnpm --dir remotion claude-code-course publish <episode-id>
```

文档列出这些命令是为了固定统一语义，不代表 `remotion/package.json` 已注册它们。

## 唯一内容源与 EP01 迁移

正式单集只维护：

```text
claude-code-course/episodes/<episode-id>.json
```

迁移前 EP01 有三套身份：

- 内容：`ep01-agentic-loop`；
- Composition：`Ep01Install`；
- 旧产物：`ep01-install/current/ep01-install.mp4`。

正式内容身份现已确定为 `ep01-install-first-start`。旧 JSON 已移到 `legacy/`，旧 Composition 明确注册为 legacy；新 id 的终端录屏、metadata 和 timeline 已生成，新 Composition、TTS 和产物根仍待 adapter 统一接入。旧 MP4 进入 `tmp/legacy-final/`，只能作为对照和素材输入，不能作为新流程 Current。

旧 JSON 的 `scenes[].narration` 是数组，`segmentId` 使用连字符。迁移目标遵守共享契约：一个 scene 一个 narration 对象，ID 使用 `01_hook` 形式。需要多段旁白时优先拆 scene，而不是让 orchestrator 猜测数组中多段旁白的时间关系。

新 episode 必须通过 `episode.schema.json`；旧 EP01 在完成迁移前明确视为 legacy，不因 schema 文件存在而自动合规。

## 教学与镜头语法

每集保持“问题 → 模型 → 操作 → 验证 → 迁移”的教学节奏，但镜头布局由当前主角决定：

1. 问题：真实失败、疑问或风险，画面只保留问题和必要上下文。
2. 模型：居中解释一个 agentic loop、权限、上下文或扩展模型。
3. 操作：真实终端独占或近似独占，输入阶段不叠加重型解释层。
4. 验证：文件、diff、测试、Git 状态、权限或会话状态接管主视觉，终端退为证据。
5. 迁移：总结适用条件、版本边界和常见误用。

字幕只补充结论与因果，不重复终端输出。输入、工具调用和结果必须按时间顺序可见，不能直接从 prompt 跳到成功结论。

## 终端与 Agent 证据

正式终端素材从 `scripts/terminal-recordings/claude-code-lab/` 进入，并满足：

- 录制环境、示例仓库、初始 Git 状态和依赖版本可重建；
- prompt 与非确定性回复可以脚本化演绎，但文件修改、diff、测试、权限和错误状态必须真实发生；
- sidecar 记录 scene/segment id、教学意图、输入、输出、等待区间、关键帧、可加速区间和剪辑边界；
- 终端输入、源码变化、测试结果和 Git 状态在时间上相互对应；
- 账号、token、主目录、私有仓库、环境变量和历史命令中的敏感内容不进入公开素材；
- 录制脚本、fixture、终端尺寸、字体、主题和 Claude Code 版本进入输入指纹。

官方文档截图属于来源证据，不属于产品实操录屏。当前 EP01 使用 `scripts/browser-recordings/claude-code-course-lab/capture_official_docs.py` 固定视口派生公开页面截图与 manifest；不得访问或截取账户、控制台、套餐详情和密钥页面。截图资产、关注区域、来源 URL 与核验日期必须回写 episode JSON。

## 版本与来源核验

Claude Code 的命令、模式和功能会变化。每集制作前必须记录：

- 官方参考链接；
- 核验日期；
- Claude Code 版本；
- 功能属于稳定能力、preview、套餐/平台限制还是项目 skill；
- 启动参数、内置命令、skill 命令和插件命令的来源分类。

主课程优先讲跨版本稳定的决策模型。低频命令和易变化入口进入命令图鉴；产品更新时先更新图鉴，只有核心工作流变化才重录主课程。

### 模型与 1M 上下文

- `模型 ID[1m]` 是 Claude Code 的通用扩展上下文语法，不属于某个国内服务商的私有模型命名。
- Claude Code 用该后缀选择 1M 上下文模式，并在向服务商发送请求前移除 `[1m]`；服务商收到的仍是原始模型 ID。
- 只有底层模型以及当前渠道、账户或套餐实际支持 1M 时才能添加该后缀，不能只凭模型名称推断可用权限。
- 国内模型示例必须同时记录服务商原始模型 ID、Claude Code 配置值、认证变量、官方来源和核验日期。当前 EP01 以 GLM 5.2 为真实终端证据，并用官方文档说明 MiniMax M3、Kimi K3 与 Qwen 3.7 Max 等可选模型。
- `ANTHROPIC_MODEL` 定义主模型；需要统一子任务和角色模型时，再显式说明 `ANTHROPIC_DEFAULT_HAIKU_MODEL`、`ANTHROPIC_DEFAULT_SONNET_MODEL`、`ANTHROPIC_DEFAULT_OPUS_MODEL` 与 `CLAUDE_CODE_SUBAGENT_MODEL`，不得把它们误写成新的服务地址或认证方式。

## 音频与派生产物

- TTS 配置统一从 episode JSON 的 `audio` 读取，不再新增顶层 `tts` 变体。
- narration `.txt`、manifest、MP3、SRT 和规范化音频全部由 orchestrator 派生。
- 分段人声默认沿用课程共享基线：`speech-2.8-hd`、`Chinese (Mandarin)_Gentleman`、`zh`、`1.25`，约 `-20 LUFS / -3 dBFS`。
- BGM、完整节目响度和发布包装参数必须在 adapter 实现时显式固定，不能依赖旧成片的未知设置。

## 字幕策略

- episode JSON 中 `scenes[].narration.text` 是旁白正文，`subtitle` 保留为内容审查摘要；成片字幕以 TTS 生成的 SRT 为准，不再用摘要替代实际旁白。
- TTS adapter 必须用 episode JSON 正文 canonicalize SRT 文本，同时保留 MMX 返回的语音时间戳。全局字幕 cue 等于 `voiceStart + SRT 相对时间`，画面字幕与对应规范化音频使用同一 manifest。
- Remotion 必须同时从该 manifest 读取音频路径和字幕 cue；manifest 缺失或 schema 不匹配时渲染失败，不允许静默回退到估算窗口或摘要字幕。
- SRT 必须移除停顿标记以及句尾 `。`、`;`、`；` 等不利于观看节奏的标点，并保持与 narration 正文语义一致。
- 账户标识、token、服务端点和宿主路径不得进入摘要字幕或 SRT。

## 审查扩展

在共享的 2fps、overview、boundary、keyframe 和 metrics 之外，Claude Code Course 还必须检查：

- prompt、工具调用、文件变化、测试/diff 和结论是否构成完整因果链；
- 脚本化回复是否被误写成真实在线模型的确定行为；
- 命令、快捷键和 UI 是否适用于 episode 记录的版本；
- 权限、沙箱、checkpoint 和恢复能力是否被准确表达；
- 终端裁切是否保留命令、工作目录和结果上下文；
- 是否把项目 skill、插件或第三方网关误写成 Claude Code 内置能力；
- 是否暴露账号、密钥、主目录、私有路径或真实业务数据。

## 实现顺序

1. 统一 EP01 身份并迁移到新 schema。
2. 实现 validate、plan、fingerprints 和 status。
3. 接入终端、Scene、TTS、cache、tasks、Candidate 和主 audit。
4. 接入 SHA-bound approve/promote 与 Current 原子更新。
5. 接入 release-build/audit/approve/publish、clean/gc 和活动锁。
6. 最后注册多课程 Dashboard adapter。

不得先复制旧 MP4 到新目录，也不得先给 Dashboard 增加可点击但没有真实门禁的动作。
