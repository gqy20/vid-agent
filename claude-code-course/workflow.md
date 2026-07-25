# Claude Code Course 生产流程

本课程遵守仓库级 [`课程视频统一生产规范`](../docs/course-production.md)。本文定义 Claude Code adapter 的内容、终端证据、版本核验和迁移边界。

## 当前实现边界

当前已实现 draft 阶段 adapter：episode 校验、TTS 计划、内容寻址语音缓存、课程 BGM 混音、音频审查、内容寻址整片/分镜导入，以及稳定命名的 Preview 核对入口。尚不存在统一 Candidate、SHA-bound 主视频 audit verdict、approve/promote 或 Release/Publish。

已实现且只产生 preview 的命令：

```text
pnpm --dir remotion claude-code-course validate <episode-id>
pnpm --dir remotion claude-code-course plan <episode-id>
pnpm --dir remotion claude-code-course audio-preview <episode-id> [--scenes=<scene-id>]
pnpm --dir remotion claude-code-course audio-audit <episode-id>
pnpm --dir remotion claude-code-course preview <episode-id> --video=<episode-local-source.mp4>
pnpm --dir remotion claude-code-course preview <episode-id> --scene=<scene-id> --video=<episode-local-scene.mp4>
pnpm --dir remotion claude-code-course preview <episode-id>
pnpm --dir remotion claude-code-course clean <episode-id> [--apply=true]
pnpm --dir remotion claude-code-course status <episode-id>
pnpm --dir remotion claude-code-course:volume validate [volume-id]
pnpm --dir remotion claude-code-course:volume plan [volume-id]
pnpm --dir remotion claude-code-course:volume status [volume-id]
pnpm --dir remotion claude-code-course:volume draft <volume-id>
pnpm --dir remotion claude-code-course:review-stills <episode-id>:<second>[,<second>...]
pnpm --dir remotion claude-code-course:render-chapters <episode-id>... [--scale=1|2] [--jobs=N] [--force]
```

因此目前只能编辑和迁移内容，不能宣称完成正式生产。以下目标命令在真正实现前必须保持不可用：

```text
pnpm --dir remotion claude-code-course build <episode-id>
pnpm --dir remotion claude-code-course approve <episode-id>
pnpm --dir remotion claude-code-course promote <episode-id>
pnpm --dir remotion claude-code-course release-build <episode-id>
pnpm --dir remotion claude-code-course release-audit <episode-id>
pnpm --dir remotion claude-code-course release-approve <episode-id>
pnpm --dir remotion claude-code-course publish <episode-id>
```

文档列出这些目标命令是为了固定统一语义，不代表它们已接入正式生命周期。

## Draft Preview 资产所有权

Draft Preview 也必须遵守共享资产所有权，不能因为尚未实现 Candidate 就在 preview 中堆历史版本：

```text
tmp/cache/episodes/<fingerprint>/episode.mp4    # 整片 CAS
tmp/cache/scenes/<fingerprint>/                 # 分镜 CAS
tmp/cache/tts/                                  # TTS CAS
tmp/cache/audio-mix/                            # 混音 CAS
tmp/cache/chapter-visual/<fingerprint>/          # 章节静音视觉 CAS
tmp/preview/episode.mp4                         # 唯一整片核对入口
tmp/preview/visual/chapter.mp4                  # 未配音章节视觉核对入口
tmp/preview/scenes/01_scene_id.mp4              # 稳定分镜入口
tmp/preview/review/report.html                  # Draft 核对首页
tmp/preview/review/audio-audit.json             # Draft 音频证据
tmp/preview/manifest.json                       # 当前视图的 SHA / 指纹 / profile
```

- Preview 文件优先从 CAS hardlink 物化，失败时才复制；更新使用临时路径原子替换。
- `render-chapters` 对所有选中章节只 bundle 一次；每章使用独立浏览器和独立 CAS，成功章节立即提交 cache，其他章节失败不回滚已完成结果。
- 多章任务默认根据逻辑 CPU 自动分配章节 worker 与每章渲染并发，也可用 `--jobs` 调整；失败章节会在更低 Remotion concurrency 下重试。
- `--scale=1` 生成 1920×1080 视觉预览，`--scale=2` 生成 3840×2160 视觉预览；两者指纹不同，不通过文件名制造 `4k-v2` 一类入口。
- `tmp/preview/visual/chapter.mp4` 是无音频、未完成字幕同步的视觉核对文件，不能当作完整 episode、Volume、Candidate 或 Current。
- 分辨率、版本和 SHA 写入 manifest，不进入文件名。禁止新建 `v2`、`v3`、`4k-preview`、`final-check` 等平行入口。
- `preview --video` 的输入必须位于本集产物根内，输出固定为 `tmp/preview/episode.mp4`；不接受 `--output`。
- `preview --scene` 根据 episode JSON 顺序生成 `01_scene_id.mp4`，并验证分镜时长。
- `clean` 只清理旧 Preview 入口，默认 dry-run；只有 `--apply=true` 才执行。CAS、Candidate、Current 不在其删除范围内。
- 每轮交付只报告阶段、`episode.mp4`、本轮变更分镜和 `review/report.html`，不把 cache、task 或临时抽帧作为用户核对入口。

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

每集保持“问题 → 观察 → 连接 → 验证 → 回看”的探讨节奏，但镜头布局由当前主角决定：

1. 问题：真实失败、疑问或风险，画面只保留问题和必要上下文。
2. 观察：真实终端独占或近似独占，先让输入、工具和结果出现，不提前宣布正确方法。
3. 连接：从已经出现的证据中连接 agentic loop、权限、上下文或扩展关系；抽象名称晚于具体体验出现。
4. 验证：用文件、diff、测试、Git 状态、权限或会话状态检验暂定解释，终端退为证据。
5. 回看：回到开头的问题，说明这次证据回答了什么、还有什么未知；不把结尾写成训诫清单。

### 十章连续性与双卷边界

前十章按一条连续工程主线设计，并最终组成两个长视频。章节是最小生产、缓存和审查单元；长视频只在章节稳定后装配：

```text
Volume 01 · EP01–EP05
接通环境 -> 完成第一次真实修复 -> 理解 agentic loop
  -> 形成项目证据图 -> 把需求整理成可验证任务

Volume 02 · EP06–EP10
审查计划 -> 受控执行与恢复 -> 建立验证证据
  -> 分配规则、记忆、Hooks 与 Agent -> 从 Issue 交付到 PR
```

教学内容与 scene 连续性只维护在各集 episode JSON 的 `continuity` 中；`program.json` 只声明章节顺序、合集身份与装配策略，不复制旁白或 scene 内容：

- episode 级记录 `chapterIndex`、章节标签、前后 episode、输入状态、输出状态、承接问题和统一视觉接力物；
- `continuity.scenes[]` 必须与 `scenes[]` 数量、顺序和 `sceneId` 完全一致；
- 每个 scene 记录 `entryState -> change -> exitState`，并通过 `handoff` 声明下一个 scene 或 episode；
- 相邻 scene 的前一项 `exitState` 必须逐字等于后一项 `entryState`；相邻 episode 也遵守同一约束；
- 结尾 scene 的 handoff 只能指向下一 episode，EP10 使用 `closure` 和 `target: null`；
- `visualAnchor` 是跨镜头保持的真实对象或关系，例如终端输入行、失败测试、diff、`tool_use` 或 gather context 节点，不能写成泛化的淡入淡出。

卷内接缝采用硬切和视觉接力物，不使用跨章节持续动画。这样每章可以独立渲染、失败重试和命中内容寻址 cache。EP05 的输出状态同时作为 Volume 01 结尾与 Volume 02 输入；Volume 02 不重新讲前五章，只用一句状态确认进入计划阶段。

章节渲染输出的是无重复品牌片头、片尾和下集预告的 clean segment。合集按 manifest 中记录的顺序和 SHA 装配这些 clean segment，不得直接拼接已经完成单集包装的 MP4。每卷只使用一次课程开场、一次全局章节进度和一次结尾 lockup；人声按章复用，BGM 在整卷层重新铺设为一条连续音轨，不能在每章边界重新起音。

`pnpm --dir remotion claude-code-course:volume draft <volume-id>` 只接受章节完整 Preview、匹配的 `pass` 音频审查、aligned voiceover 与统一 BGM SHA。产物进入 `renders/claude-code-course/volumes/<volume-id>/tmp/cache/volume-draft/<fingerprint>/`，固定审查视图位于相邻 `tmp/preview/`。它仍是可重建 Draft；Volume Candidate/Audit/Current adapter 尚未实现，继续保持 blocked。

### 探讨式旁白

旁白的叙事位置是“和观众共同调查”，不是“站在答案一侧纠正观众”。提出问题、描述观察、保留不确定性，再由文件、工具结果和测试形成判断。方法论应从演示中自然归纳，不能先给定义，再寻找例子证明定义。

写作规则：

- 从真实疑问或现场现象进入，例如“它实际读到了什么？”“这次修改在什么时候发生？”；问题必须推动下一条证据，不把每句话都改成装饰性的反问。
- 描述过程时使用“我们看到”“接着出现”“这条结果说明”“还有一个疑问”等共同观察语言，不用“你应该”“正确做法是”“好的理解必须”等裁判语言。
- 证据早于结论。先展示输入、文件、工具调用、错误、diff 或测试，再解释它们之间的关系；抽象术语只为已经出现的体验命名。
- 结论带上适用范围。区分本次录制观察、当前版本行为、代码直接证明的事实、关系支持的推断和仍然未知的问题，不把一次样本说成普遍规律。
- 每个 scene 只推进一个疑问。结尾回到开头的问题，说明这次确认了什么、还留下什么未知，不输出“记住以下顺序”式训诫清单。
- 画面标题、旁白和字幕使用同一叙事姿态。旁白已经在探讨问题时，画面不能继续出现“必须这样做”“不要接受这种结果”“没有偷偷修改”等带责备意味的标题。

避免的句式：

- 连续使用“必须”“不要”“记住”“只能”“真正正确”等命令或价值判断；
- 先宣布“三个原则”“标准流程”“唯一正确模型”，再让终端充当装饰性证明；
- 用“你只会……”“模型背不下来……”“别犯这个错误”等方式假设观众无知；
- 把正常的只读核对描述成防范模型“偷偷修改”，或用安全边界制造对立情绪；
- 每段都强行提炼口号，让四分钟内容同时承载过多方法论名词。

真实命令、安全警告和不可省略的产品边界可以直接表达，例如 Token 不进入公开画面、`bypassPermissions` 会跳过检查、危险命令需要确认影响范围。直接不等于训诫：说明行为、后果和适用条件即可，不评价观众是否谨慎或专业。

内容审查时，如果一段旁白脱离画面后更像规范宣读、培训口号或检查清单，应退回重写；如果判断无法回到当前画面的文件、工具结果或测试，也不能仅靠权威语气保留。

字幕只补充结论与因果，不重复终端输出。输入、工具调用和结果必须按时间顺序可见，不能直接从 prompt 跳到成功结论。

### 画面信息分工与去重

完整字幕存在时，画面不再承担旁白逐句转写。每种媒介只保留自己的信息职责：

- 字幕承载完整旁白、因果、限定条件和无法从画面直接看出的判断；
- 终端承载命令、工具调用、错误、diff、测试和退出状态等原始证据；
- 图像、图标和动画承载对象、方向、层级、配对和状态变化；
- 场景标题只提出当前调查的问题，不提前重复结论；
- 顶部横栏只显示课程、集数和进度，不重复当前场景的大标题。

一帧默认最多保留一个短问题、一个主证据、三个短标签和一个状态强调。字幕出现时，终端场景不再同时放解释性副标题与多段文字 rail；需要指出证据时，优先使用裁切、细线、单个状态图标或不超过一个短 badge。图标必须对应稳定语义，例如文件、Shell、观察、中断、权限、测试和关系图，不能作为装饰重复同一段文字。

内容审查按“拿掉其中一层是否仍然完全同义”判断重复。标题、图示、终端和字幕若有两层都在陈述同一结论，应保留更接近原始证据的一层；takeaway 应通过关系归位或状态收束回看本集，不重新列出旁白摘要。

### 共享镜头语法

Claude Code Course 的共享 kit 固定四种表达职责，episode 只组合它们，不再用装饰横线或大色块临时发明层级：

- `SceneQuestion`：提出当前调查问题；证据接管后退为低权重导航，不能始终与主证据争夺注意力。
- `TerminalFocus` / `RecordedTerminal`：呈现真实命令、工具和结果；一个镜头最多使用一个 `EvidenceSpotlight` 指向完整语义区域。
- `SemanticNode`：表达对象、角色和状态；颜色落在图标、关键词和当前状态，不默认铺满整个栏目。
- 因果连接：线、箭头和移动对象只用于说明请求、工具结果、文件状态或权限变化；不能作为标题装饰。

3–4px 的 `focusRail` 只允许表示当前焦点或真实状态变化，不作为每个栏目顶部的默认语法。普通分组首先使用对齐、留白和字体层级；表格分隔线、真实流程连接线、终端边界与课程进度线可以保留。

### 终端可读性与几何约束

录屏源分辨率高不等于成片可读。当前正式终端源为 `3514×2018 / 120×28 / 48px`；进入 1080p 逻辑画布后必须核算有效字号。终端正文有效字号不得低于 `20px`，目标为 `20–24px`。达不到时按以下顺序处理：扩大终端主视觉、裁切到相关语义区域、改用更少列的录制 profile；不得只提高导出分辨率，也不得继续缩小完整终端。

- 正式 episode 使用课程 kit 的 `RecordedTerminal`，保持图像等比缩放和稳定裁切；不得在 episode 内重复实现 `Img + objectFit` 变体。
- 终端窗口宽高比在一个镜头内固定。只允许整体位移、透明度和等比缩放，不得分别动画化 `left/right/top/bottom` 或在固定高度下改变宽度。
- `focus` 终端用于命令、工具结果和 transcript 主证据；`split` 终端只在旁边确有另一种不可由字幕承担的证据时使用。
- 语义裁切必须保留命令或工具名、相关结果、必要上下文和 Claude Code 自身状态；tmux session 名称与状态栏属于录制基础设施，公开画面统一从源素材底部裁掉 107px。不能只放大孤立数字，也不能把命令与结果拆到无法建立因果的两个画面。
- 4K 输出用于提高栅格清晰度，不能替代 1080p 逻辑尺寸下的可读性审查。十章的 Draft Preview 输出规格必须一致，manifest 继续记录实际分辨率。

## 终端与 Agent 证据

正式终端素材从 `scripts/terminal-recordings/claude-code-lab/` 进入，并满足：

- 录制环境、示例仓库、初始 Git 状态和依赖版本可重建；
- prompt 与非确定性回复可以脚本化演绎，但文件修改、diff、测试、权限和错误状态必须真实发生；
- sidecar 记录 scene/segment id、教学意图、输入、输出、等待区间、关键帧、可加速区间和剪辑边界；
- 终端输入、源码变化、测试结果和 Git 状态在时间上相互对应；
- 账号、token、主目录、私有仓库、环境变量和历史命令中的敏感内容不进入公开素材；
- 录制脚本、fixture、终端尺寸、字体、主题和 Claude Code 版本进入输入指纹。
- 长 4K H.264 录屏接入 Remotion 前，应按 timeline 派生本章实际使用的短剪辑；如果并发随机寻帧仍成为瓶颈，再从短剪辑预抽 4K PNG 帧序列。episode 只读取确定帧，不在每次渲染中重复随机解码完整录屏。
- 原始录屏仍是权威证据；短剪辑和帧序列只是可重建素材视图。章节视觉指纹必须覆盖引用的公开素材文件或帧目录，不能因为派生素材变化误命中旧 cache。

每次正式录制还必须在 `tmp/recordings/<run-id>/` 留下本地日志证据。容器 `~/.claude/projects`、`~/.claude/debug`、导演日志和事件进入权限受限的 `raw/`；认证配置、原始 cast 和中间视频不得归档。公开素材或课程代码只能读取白名单派生的 `sanitized/session-trace.jsonl` 与 `sanitized/session-architecture.json`，不得直接读取 raw session。派生层可以保留事件序号、父序号、消息序号、内容块类型、工具调用/结果配对、错误标记和 checkpoint 计数，但必须移除原始 ID、路径、提示词、回复正文、工具参数值和工具结果正文。JSONL 字段只作为与已核验 Claude Code 版本绑定的观察证据，不得宣称为稳定公共 API。`manifest.json` 必须绑定 run 状态、Claude Code 版本、镜像身份和文件 SHA，`audit/sensitive-scan.json` 必须明确给出 `pass`、`warn` 或 `fail`。日志清理默认 dry-run，只有显式 `--apply=true` 才能删除旧 run。

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
- EP01 复用 Git / GitHub Course 已批准的课程 BGM，由 episode JSON 显式记录来源并固定 `volume=0.05`；不使用 sidechain ducking。
- `audio-preview` 只重建指纹变化的 TTS，并通过共享混音脚本生成内容寻址 `mix.m4a`；完整节目目标约 `-16 LUFS`，AAC 真峰值不得超过 `-1.4 dBTP`。
- `audio-audit` 必须核对分段音频、字幕、BGM SHA、混音指纹、节目响度和公开 preview view。只有匹配 active mix 的 `pass` 才允许物化完整视频 Preview。
- `preview --video` 把视频流与已审计混音组合成内容寻址整片，再物化到固定的 `tmp/preview/episode.mp4`；视频流必须直接复制且帧数、分辨率和时长与输入一致。它不是 Candidate、Current 或 Release。

## 字幕策略

- episode JSON 中 `scenes[].narration.text` 是旁白正文，`subtitle` 保留为内容审查摘要；成片字幕以 TTS 生成的 SRT 为准，不再用摘要替代实际旁白。
- TTS adapter 必须以 episode JSON 正文为唯一文本源：先按旁白中的停顿分组对齐 MMX 返回的语音时间锚点，再在每个时间锚点内按完整语义句分配 cue。不得直接沿用会截断模型名、版本号或半句话的自动分词结果。全局字幕 cue 等于 `voiceStart + SRT 相对时间`，画面字幕与对应规范化音频使用同一 manifest。
- 每个 scene 的旁白开始前和结束后留白均不得超过 2 秒；`durationSeconds` 必须来自规范化 TTS 实际时长，`validate` 对头尾留白执行硬校验，不能用静音、裁切或变速伪造紧凑节奏。
- Remotion 必须同时从 schema v3 manifest 读取已审计 `mix.m4a` 和字幕 cue；manifest 缺失、mix 缺失或 schema 不匹配时渲染失败，不允许静默回退到分段音轨、估算窗口或摘要字幕。
- SRT 必须移除停顿标记以及句尾 `。`、`;`、`；` 等不利于观看节奏的标点，并保持与 narration 正文语义一致。
- 单条字幕必须从语义边界开始和结束；`glm-5.2[1m]`、环境变量名、命令和路径等技术 token 不得从中间拆开后分次出现。
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
