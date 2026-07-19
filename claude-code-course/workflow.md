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

现有 EP01 有三套身份：

- 内容：`ep01-agentic-loop`；
- Composition：`Ep01Install`；
- 旧产物：`ep01-install/current/ep01-install.mp4`。

迁移时先根据新版课程大纲确定最终 episode id，再一次性同步 episode JSON、Composition registration、源码目录和产物根。旧 MP4 进入 `tmp/legacy-final/`，只能作为对照和素材输入，不能作为新流程 Current。

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

## 版本与来源核验

Claude Code 的命令、模式和功能会变化。每集制作前必须记录：

- 官方参考链接；
- 核验日期；
- Claude Code 版本；
- 功能属于稳定能力、preview、套餐/平台限制还是项目 skill；
- 启动参数、内置命令、skill 命令和插件命令的来源分类。

主课程优先讲跨版本稳定的决策模型。低频命令和易变化入口进入命令图鉴；产品更新时先更新图鉴，只有核心工作流变化才重录主课程。

## 音频与派生产物

- TTS 配置统一从 episode JSON 的 `audio` 读取，不再新增顶层 `tts` 变体。
- narration `.txt`、manifest、MP3、SRT 和规范化音频全部由 orchestrator 派生。
- 分段人声默认沿用课程共享基线：`speech-2.8-hd`、`Chinese (Mandarin)_Gentleman`、`zh`、`1.25`，约 `-20 LUFS / -3 dBFS`。
- BGM、完整节目响度和发布包装参数必须在 adapter 实现时显式固定，不能依赖旧成片的未知设置。

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
