# 课程视频统一生产规范

本文定义 `git-course`、`github-course`、`claude-code-course` 共同遵守的生产契约。它规定共享状态、产物所有权和质量门禁；每门课程自己的 `workflow.md` 再补充内容 schema、证据来源、视觉语言、录制方式和交付规格。

规范的目标不是让三门课程使用完全相同的画面，而是让它们拥有同一套可解释、可恢复、不可绕过的生产生命周期。

## 规范层级

发生冲突时按以下顺序处理：

1. 根 `AGENTS.md`：仓库级安全边界、共享生产原则和本地改动卫生。
2. `docs/course-production.md`：所有课程共用的生命周期和门禁。
3. `<course>/workflow.md`、`checklist.md`、视觉规范：课程适配规则。
4. `<course>/episodes/<episode-id>.json`：单集教学、scene、旁白、来源与发布数据的唯一内容源。
5. 课程 orchestrator 与实际产物 manifest：当前已经实现的命令和状态事实。

文档不得宣称尚未实现的阶段可用。orchestrator 尚未覆盖时，该阶段必须显示为 `blocked`，不能用手工复制产物绕过。

## 课程适配器状态

| 课程 | 内容与迭代 | Candidate / Audit | Current | Release / Publish |
| --- | --- | --- | --- | --- |
| Git Course | 已实现 | 已实现 | 已实现 | 已实现 |
| GitHub Course | 已实现 1080p 迭代 | 已实现 1080p visual/full audit | 4K adapter 完成前阻断 | 尚未实现 |
| Claude Code Course | 内容与旧 composition 并存 | 尚未实现统一门禁 | 旧产物仅作迁移输入 | 尚未实现 |

“规范统一”不等于“能力已经实现”。新增入口、前端按钮或文档命令前，必须先让对应 orchestrator 提供真实状态和门禁。

## 统一状态模型

```text
episode JSON
  -> source inputs
  -> fingerprints
  -> cache / tasks
  -> main candidate
  -> main audit
  -> main approval
  -> current
  -> release candidate
  -> release audit
  -> release approval
  -> published artifact
```

各阶段含义固定：

- `source inputs`：课程专属的终端、浏览器、Manim、TTS、BGM、图片等输入。
- `cache`：内容寻址、可复用且不可原地改写的成功产物。
- `tasks`：一次运行的临时工作区；成功结果进入 cache 后即可回收。
- `candidate`：本轮待审完整产物，不是当前正式版。
- `audit`：与 candidate SHA、审查配置和输入指纹绑定的证据。
- `approval`：人工确认记录；必须绑定精确 candidate SHA，不能跨候选继承。
- `current`：通过主审查并由 orchestrator 晋升的当前正片。
- `release candidate`：基于当前正片重新封装的发布候选。
- `published artifact`：通过 release 审查和批准后由 orchestrator 写入的发布产物。

任何输入、渲染配置或候选 SHA 变化，都必须使依赖它的 verdict 失效。Current 更新后，旧 Release Candidate 和旧 Published 不得继续显示为与当前版本同步。

## Episode JSON 共享契约

每集只能维护一个内容源：

```text
<course>/episodes/<episode-id>.json
```

课程 adapter 可以增加字段，但向 orchestrator 和审查前端至少提供以下标准视图：

- `episodeId`、`title`、`durationSeconds`、`fps`、`resolution`；
- 教学目标、来源依据和最后核验信息；
- 有序 `scenes[]`，每个 scene 包含稳定的 `id`、`start`、`duration`、`goal`；
- 每个 scene 一个 `narration` 对象，包含 `segmentId`、`voiceStart`、`text`；
- 固定的 TTS `model`、`voice`、`language`、`speed` 和课程音频策略；
- `release` 发布文案、封面 brief、人工检查项及已发布 artifact 元数据。

统一约束：

- `episodeId` 必须与 composition、产物根目录和命令参数使用同一身份；迁移期间的旧别名必须显式记录，不能长期并存成多个“当前版本”。
- `segmentId` 和 scene 文件统一使用带顺序号的下划线形式，如 `01_hook`。
- narration `.txt`、`manifest.tsv`、SRT、录屏 metadata 和 timeline 都是 JSON 派生产物，不得成为第二内容源。
- 一个 scene 需要多段旁白时，应先拆成更小的可审查 scene；确有必要时由 adapter 显式提供标准化映射，不能让通用消费者猜测数组语义。

## 产物所有权

每集标准产物根为：

```text
remotion/renders/<course>/<episode-id>/
├── tmp/
│   ├── cache/                 # 唯一可复用存储
│   ├── preview/               # 可重建审查视图
│   ├── narration-source/      # episode JSON 派生文本
│   └── build/
│       ├── tasks/             # 一次运行的工作区
│       ├── candidate/         # 主候选
│       ├── release-candidate/ # 发布候选；课程可增加包装中间候选
│       └── audit/             # SHA-bound 审查证据
└── current/
    ├── <episode-id>.mp4       # 已批准正片
    ├── audio/                 # 与 Current 同批晋升的音频
    └── release/               # 已批准发布版与平台物料
```

- build 只能写 `tmp/`，不得直接覆盖 `current/`。
- preview 是 cache 的 hardlink 视图；不支持 hardlink 时才复制，且仍可随时重建。
- 审查原始帧校验后默认删除，只在显式调试开关下保留。
- 历史正片只进入 `tmp/legacy-final/`；不得产生 `new`、`v2`、`final-final` 等平行正式版。
- `clean`、`gc` 默认 dry-run；应用删除时必须保护活动任务、manifest、有效 verdict、candidate、Current 和 Published 的引用。

## 指纹、缓存与并发

- Scene 指纹至少覆盖 episode scene 数据、实现源码、依赖资产、composition 配置和渲染 profile。
- TTS 指纹至少覆盖正文、model、voice、language、speed 和后处理参数。
- 浏览器、终端和 Manim 输入必须把场景脚本、环境 profile、尺寸及其 metadata 纳入指纹。
- BGM、片头片尾、封面和发布包装也必须进入其下游候选指纹。
- dirty Scene 复用一次 Remotion bundle；并行 Scene 使用独立浏览器池，不能共享同一 Chrome 实例。
- 成功任务立即提交到 CAS；其他任务失败不能丢弃已经完成的结果。
- 并发上限由稳定 profile 和自动降级重试维护，不写死为保守小常数。

## 统一审查基线

主候选和发布候选均需检查：

- 连续 `2fps`，30fps 成片每 15 帧取一张；
- 每张 review sheet 最多 5 帧，按 `5×1` 排列，最后一页不补空白；
- 16 帧 `4×4` overview 只用于导航；
- scene 和发布拼接边界在中心点前后各 `0.5s` 做 `10fps` burst；
- episode 计划声明的精确关键帧；
- 完整媒体 metrics、音轨、响度、字幕和时长窗口；
- 遮挡、裁切、字幕重复、状态歧义、过度运动以及动作与结果不一致。

overview、2fps review、metrics 应并行；boundary 与 keyframe 也应并行。课程 adapter 必须增加自己的证据检查：

- Git：Git 状态、refs、HEAD、commit 图和语义色是否准确。
- GitHub：真实 UI、账户/套餐差异、敏感信息、平台状态与 Git 状态是否一致。
- Claude Code：终端状态、工具调用、文件修改、测试/diff、权限结果和版本适用性是否真实可验证。

机器检查通过后 verdict 仍为 `needs_review`。只有人工审查将与当前候选 SHA 绑定的 verdict 置为 `pass`，才允许后续晋升。

## Current 与发布门禁

统一命令语义为：

```text
plan -> preview -> build -> approve -> promote
     -> release-build -> release-audit -> release-approve -> publish
```

课程可以增加 `browser`、`terminal`、`manim`、`audit-full` 等适配命令，但不得改变以下语义：

- `build` 不写 Current；`approve` 不搬运文件；`promote` 才能原子更新 Current。
- `promote` 必须验证主 candidate、scene、音频、manifest、verdict 和全部输入指纹。
- `release-build` 必须绑定当前 Current 的实际 SHA；Current 改变后旧 release verdict 自动失效。
- `publish` 必须重新核对磁盘 artifact SHA，而不是只相信 manifest 中的记录。
- 底层 TTS、Remotion、FFmpeg、录制和发布脚本只允许 orchestrator 调用。
- 未实现的命令必须明确返回 `blocked` 或失败，禁止静默复制到目标目录。

## 课程适配器与审查前端

审查前端不应硬编码课程名称。每个课程 adapter 最终需要暴露：

- `courseId`、显示名称、episode ID 规则和 episode 根目录；
- artifact 根目录和可展示的 scene/candidate/current/release 资源；
- 标准化六阶段状态：内容源、输入、Candidate、Main Audit、Current、Release；
- 真实可执行动作及其阻断原因；
- candidate、Current、release candidate、Published 的实际 SHA 与来源关系。

前端只能展示 orchestrator 已实现的动作。GitHub 和 Claude Code adapter 未完成前，不通过兼容分支、假按钮或目录猜测接入。

## 新课程接入清单

1. 建立 episode schema、`workflow.md`、`checklist.md` 和课程视觉/证据规范。
2. 实现 validate、plan、fingerprints、status、build 和 audit。
3. 实现 SHA-bound approve/promote，并验证 Current 原子更新。
4. 实现 release-build/release-audit/release-approve/publish。
5. 实现 clean/gc、活动锁和引用保护。
6. 最后注册 Dashboard adapter，并用真实产物核对全部状态。

不能从第 6 步倒推前五步，也不能通过复制 Git Course CLI 并改目录名来宣称完成适配。
