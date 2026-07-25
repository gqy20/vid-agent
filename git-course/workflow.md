# Git Course 生产流程

本课程遵守仓库级 [`课程视频统一生产规范`](../docs/course-production.md)，并完整实现其中的 main candidate、audit/approve、Current、Release 和 Publish 生命周期。本文件只补充 Git Course 的 episode schema、Git 证据、音频、审查参数和具体 CLI；不得把这里的 Git 语义色或状态模型当作其他课程的共享视觉规范。

## 与通用 Remotion skill 的边界

`.claude/skills/remotion-vid/` 只定义可复用机制：指纹、CAS、共享 bundle、最大稳定并行、
candidate、audit verdict 和 promote/publish 门禁。本文件和 Git Course orchestrator 才拥有
具体实现：episode JSON schema、目录、CLI 命令、scene/TTS/BGM 指纹、教学与语义色规则、
抽帧参数、响度目标、发布封装和 current/release 路径。

因此调整 Git Course 规则时优先改 `AGENTS.md`、本文件和 orchestrator；只有发现对所有
Remotion 项目都成立的机制时，才回写通用 skill。生产时始终从 Git Course CLI 进入，不能因
通用 skill 提供了 fallback 脚本而绕过课程门禁。

## 唯一内容源

每集只维护一个文件：

```text
git-course/episodes/<episode-id>.json
```

它同时保存：

- 教学目标、参考依据和制作策略；
- scene 顺序、标题、时长、视觉动作和审查点；
- `scenes[].narration` 中的分段旁白、segment id 和进入时间；
- 人工质量与对齐记录；
- `release` 中的发布文案、封面 brief 和人工检查项。

不得再为单集新增同名目录、`script.md`、`scenes.json`、`beats.md`、旁白 `.txt` 源或独立 publishing 源目录。

## 旁白语气

Git Course 的解说采用共同探讨问题的语气，而不是居高临下地说教。每个概念优先从一个可验证的问题、一个容易误判的现象或一次真实状态变化进入，再和观众一起比较证据、解释原因并收束结论。

- 可以明确判断 Git 事实和风险，但不要连续使用“你要记住”“你必须”“正确做法就是”一类命令式句型。
- 优先使用“我们先看”“如果把两端写出来”“这里真正变化的是谁”“这样是否更容易判断”等共同推演表达。
- 提问必须推动教学，不使用空泛反问制造悬念；提出问题后应在同一 scene 或紧邻 scene 给出可见证据。
- 旁白负责提出问题、连接因果和解释判断，画面负责展示命令、对象与状态变化；不要让旁白只是逐字朗读画面标签。
- 结尾可以给出简洁模型，但应收束为以后可重复使用的判断问题，而不是要求观众背诵命令清单。

## 派生关系

```text
episode JSON
  ├── Remotion typed timeline
  ├── tmp/narration-source/*.txt + manifest.tsv
  ├── tmp/cache/{scenes,tts}/
  ├── tmp/preview/scenes/*.mp4       # 可重建视图
  ├── tmp/build/candidate/audio/
  ├── tmp/build/candidate/<episode-id>.mp4
  ├── tmp/build/audit/<main|release>/
  ├── current/audio/                 # promote 后才写入
  ├── current/<episode-id>.mp4
  └── current/release/{cover.png,<episode-id>.mp4}
```

所有派生物都可以删除重建，不作为内容事实源。

## 常用命令

```bash
pnpm --dir remotion git-course plan <episode-id>
pnpm --dir remotion git-course fingerprints <episode-id>
pnpm --dir remotion git-course status <episode-id>
pnpm --dir remotion git-course preview <episode-id> --scenes=<scene-id>
pnpm --dir remotion git-course build <episode-id>
```

音频预览如果已经完成 TTS 与规范化，只因 scene 时间窗校验失败，可在修正 episode JSON 后使用 `preview-audio <episode-id> --scenes=<scene-id> --reuse-existing` 重新执行校验、对齐和混音。该选项只接受当前 `tmp/preview/audio/segments/` 中四类产物齐全的 segment；缺少任一 raw、SRT、文本或规范化音频都会阻断，不能借此跳过首次生成。

`plan` 只计算 scene/TTS 指纹并显示 `HIT` 或 `BUILD`；`fingerprints` 输出完整 hash，用于验证 Scene 级失效边界。`build` 执行统一 DAG：

```text
validate（timeline 必须已显式 generate）
  ├── 所有 dirty scene 并行 render -> segment audit
  └── 所有 dirty TTS 并行 synthesize -> normalize
        ↓
按 audio fingerprint 对齐 / 混音（命中则复用）
        ↓
直接 mux main candidate（输入指纹命中则复用）
        ↓
按 artifact + sampling fingerprint 审计（命中则复用）
```

`build` 只执行 `validate`，不会代替开发者改写受版本控制的 timeline。修改 episode JSON 后先运行 `pnpm --dir remotion git-course:generate`；生成文件过期时 build 会拒绝继续。

默认并发为 `all`：所有依赖已满足的任务立即启动。Remotion 单进程 concurrency 默认按逻辑 CPU 数除以 dirty scene 数计算，尽量使用全部算力；可用 `--render-concurrency=<n>` 覆盖。TTS 和规范化默认对所有 dirty segment 同时执行。

dirty Scene 共用一次 Remotion bundle，但各自使用独立浏览器池并行渲染，避免重复 Webpack 初始化，也避免多个 `renderMedia` 共享同一个 Chrome 实例导致崩溃。bundle 按源码、配置、依赖锁和 public 资产生成指纹，复用到 `renders/git-course/tmp/bundles/`。默认总渲染 concurrency 不超过逻辑 CPU 数；本机稳定上限按 profile 分别保存在 `renders/git-course/tmp/render-profile-hd30.json` 与 `render-profile-uhd30.json`，浏览器崩溃或本地 server 无响应时自动降低 concurrency 重试。`tmp/build/telemetry/render-scenes.json` 记录 bundle 命中、总耗时、各 Scene 耗时、实际 concurrency 和失败项。需要强制验证单个缓存时可用 `--force-scenes=<scene-id[,scene-id]>`。

Scene 指纹只覆盖课程共享组件、当前 episode 源码、当前 scene 数据、字体和该集终端录制等有效输入；历史 Manim 资产不进入指纹。其他 episode 的源码、旁白或发布文案变化不得使本集 Scene 缓存失效。音频、candidate 和 audit 也分别按内容指纹缓存。完全没有输入变化时，`build` 应显示 `HIT audio mix`、`HIT assemble` 和 `HIT audit main`，不得重新编码或抽帧。

Scene 级源码指纹默认由 TypeScript AST 识别 `<PascalSceneId>Scene`，EP01 同时支持 `Ep01<PascalSceneId>Scene`。也可以用成对的 `// @git-course-scene <id>:start` 与 `:end` 显式标记。Scene 声明外的 helper、import 和 episode wrapper 属于共享依赖；共享代码变化会使该集全部 Scene 失效，Scene 函数内部变化只使对应 Scene 失效。EP01–EP08 均必须能解析出全部 Scene，否则 plan 直接失败。

每个 Scene 渲染成功后必须立即原子写入内容寻址 cache 并写 `render-completion.json`，不能等其他 Scene 全部成功。渲染器使用 `allSettled` 汇总；部分失败时保留成功 Scene，下次 build 只重试失败项。分段审查完成后删除 task 中与 cache 重复的 MP4；main/release 权威 audit 生成且机器未失败后，自动清理对应成功 task 工作目录。

候选、缓存、日志、manifest 和 verdict 位于 `tmp/`：

```text
tmp/cache/scenes/
tmp/cache/tts/{speech,normalized}/
tmp/build/candidate/<episode-id>.mp4
tmp/build/candidate/audio/{segments,voiceover-aligned.m4a,mix.m4a}
tmp/build/candidate/scenes/             # 带最终音频的人工分段审查视图
tmp/build/artifact-manifest.json
tmp/build/release-artifact-manifest.json
tmp/build/telemetry/render-scenes.json
tmp/build/audit/main/{manifest.json,report.html,verdict.json}
tmp/build/audit/release/{manifest.json,report.html,verdict.json}
tmp/build/logs/
```

## 存储所有权与清理

目录角色固定如下，不能把 preview 或 tasks 发展成第二套缓存：

```text
episode JSON  唯一内容源
tmp/cache/    唯一可复用二进制存储（CAS）
tmp/preview/  cache 的稳定命名视图，可删除重建
tmp/build/tasks/  单次任务工作区
tmp/build/candidate/  待审批产物
tmp/build/audit/      与 candidate SHA 绑定的门禁证据
current/      approve/promote 后的正式产物
```

- scene preview 优先用 hardlink 指向 CAS；文件系统不支持时才回退为复制。preview manifest 同时记录 cache path、SHA 和物化方式。
- build 音频先写 `tmp/build/candidate/audio/`，不得在候选审查前改变 `current/audio/`；promote 先复核主 candidate、scene 和 candidate audio 清单中的全部 SHA，再将正片、scene、音频和 verdict 分别通过临时路径原子替换。
- task 输出成功进入 CAS 后删除重复 MP4；权威 audit 机器检查通过后删除对应 task 目录。失败任务和失败审查证据保留用于排查。
- `clean` 只处理已存在且机器 verdict 不为 `fail` 的权威 audit 工作区；失败证据必须保留。`--preview` 和 `--legacy` 必须显式指定。默认 dry-run，布尔值为真的 `--apply` 才执行。
- `gc` 基于 state、artifact/preview manifest、当前 episode 指纹和 verdict 收集引用；默认保留 7 天宽限期，默认 dry-run。bundle 只在显式 `--bundles` 时参与回收，并至少保留最新 3 个及当前源码指纹对应 bundle。
- 所有会写产物的 orchestrator 命令通过原子创建 `tmp/build/activity.json` 互斥。bundle 构建使用指纹级原子锁；bundle GC 发现任意其他 Git Course 命令活动时必须拒绝执行。进程不存在的 stale marker 会在下一次命令开始时清理。
- `current/`、活动 candidate、有效 verdict 和它们引用的 CAS 永不由 clean/GC 删除。原始审查帧仍按 `AUDIT_KEEP_FRAMES` 规则由审查器自身清理。
- 旧 `tmp/scenes/`、`tmp/chunks/`、`tmp/audit/`、`tmp/audit-15f/` 不是现行流程输入；确认不再需要历史诊断后，可用 `clean --legacy --apply` 删除。

维护命令：

```bash
pnpm --dir remotion git-course clean <episode-id>
pnpm --dir remotion git-course clean <episode-id> --preview --legacy --apply
pnpm --dir remotion git-course gc <episode-id> --grace-days=7
pnpm --dir remotion git-course gc <episode-id> --grace-days=7 --bundles --keep-bundles=3 --apply
```

## 统一采样审查

所有审查都针对编码后的 MP4，而不是 Remotion still。统一采样协议如下：

- 连续审查以 `2fps` 抽取，即 30fps 视频每 15 帧取一张。
- 每张审查条最多合并 5 帧，固定为 `5×1`；最后一张可以少于 5 帧。
- 总览固定取 16 帧并合并为 `4×4`，只用于定位区间，不能代替连续审查。
- scene、片头/正片、正片/片尾边界在中心点前后各取 `0.5s`，以 `10fps` 生成 burst。
- scene 默认检查开头、中点、结尾精确关键帧；发布版额外检查片头结束、正片首尾、片尾开始/中点/结尾。

main 与 release 使用同构证据目录：

```text
tmp/build/audit/<main|release>/
├── manifest.json
├── report.html
├── verdict.json
├── overview/contact-16.jpg
├── review/{frames,sheets}/       # frames 默认在 sheet 生成后清空
├── boundaries/<boundary>/{frames,sheets}/
├── keyframes/
└── metrics/
```

`manifest.json` 记录预期和实际抽帧/拼图数量。数量不一致、边界或关键帧缺失都会使机器检查失败；机器通过后仍是 `needs_review`，人工必须完整查看 `report.html` 后才能 approve。

连续帧通过一次 ImageMagick montage 调用分页为多张 `5×1` sheet，最后一页按实际帧数裁切，不补空白。默认 `AUDIT_KEEP_FRAMES=0`，sheet 验证完成后删除 review/boundary 原始 JPEG；只有排查单帧问题时设置 `AUDIT_KEEP_FRAMES=1`。

分段审查仍执行统一 2fps、5×1、总览和关键帧协议，但不重复运行 scene-change、blackdetect 和 freezedetect；这些完整视频指标只在 main/release 审计执行，并在一次 FFmpeg 解码中并行检测。审计缓存由候选 SHA、采样计划和审计脚本版本共同决定；任一变化都会自动失效。

overview、连续 2fps 抽帧和完整视频 metrics 是相互独立的扫描，默认并行运行；review sheet 在连续帧完成后生成，boundary burst 与精确 keyframe 随后并行提取。`manifest.json.timingsMilliseconds` 记录各阶段耗时和总墙钟，用于判断下一轮瓶颈。

## 审查、晋升与发布

```bash
pnpm --dir remotion git-course approve <episode-id> --note="已检查字幕、Git 语义和状态变化"
pnpm --dir remotion git-course promote <episode-id>
pnpm --dir remotion git-course release-build <episode-id>
pnpm --dir remotion git-course release-audit <episode-id>
pnpm --dir remotion git-course release-approve <episode-id> --note="已检查片头片尾和音量边界"
pnpm --dir remotion git-course publish <episode-id>
```

统一 verdict 只有 `pass`、`fail`、`needs_review`。机器检查覆盖音视频流、分辨率、FPS、时长、SRT 停顿标记、采样覆盖率和证据数量；机器通过后仍需人工 approve。approve、promote、publish 都校验候选 SHA；main 还会重新计算 scene、TTS 和 BGM 指纹，输入变化后必须重新 build/audit。

开发、分段预览、main candidate 和 `current/<episode-id>.mp4` 固定使用 1920×1080、30fps。只有 `release-build` 从已批准 main 对应的 scene 源码重新以 `scale=2` 渲染 3840×2160、30fps，并使用独立的 `uhd30` 内容寻址缓存；旁白、BGM 和字幕时间轴直接复用已批准正片，不重新生成音频。封面不参与这次视频升档。

发布封装先把 4K 片头、4K 正片和 4K 片尾统一为 H.264、30fps、`1/15360` timebase 与 48 kHz 双声道 AAC。视频全程 stream-copy；符合新音频规范的正片也直接 copy，只有旧版正片音频需要兼容性转码。统一后通过 concat demuxer stream-copy，不再对整条发布视频执行 x264 重编码。

release candidate 由 4K 渲染 profile、scene 指纹、4K 片头片尾、已批准音频、增益参数和发布脚本版本共同生成内容指纹。输入未变化时 `release-build` 必须显示 `HIT release-build`，不得重复渲染或封装。

## 时间与音频约束

- 每集通常 3–5 分钟，不为整数时长重复解释。
- scene 必须首尾连续，总和等于 `durationSeconds`。
- narration 的 `voiceStart` 必须位于对应 scene 窗口；历史过渡最多允许提前 `0.5s`。
- TTS 固定使用 `speech-2.8-hd`、`Chinese (Mandarin)_Gentleman`、`zh`、`1.25`。
- TTS CAS 将文本合成与人声规范化拆成两级指纹。只修改 `segmentId`、`voiceStart` 或 scene 时间窗时复用原始语音；规范化参数未变时同时复用 `_norm.mp3`。历史 current 只有在 state 中的 TTS 指纹和 norm SHA 都匹配时才能迁入 CAS；无机器证明的旧音频不得冒充当前 voice/model 产物。build 从 CAS 物化到 `tmp/build/candidate/audio/segments/`，不得直接修补 current。
- 单段规范化目标约 `-20 LUFS`、峰值约 `-3 dBFS`。
- 对齐旁白和 BGM premaster 在同一个 FFmpeg filter graph 内完成，一次处理同时输出 `voiceover-aligned.m4a` 与 premaster；不得重新拆成先编码旁白、再解码混 BGM 的两轮流程。
- BGM 使用固定低音量，当前基准为 `0.05`，不做 sidechain ducking。
- SRT 不得泄漏 `<#...#>` 停顿标记。
- 解说字幕直接使用 `scenes[].narration.text` 的短句正文。orchestrator 在规范化音频上检测停顿标记形成的真实静音边界，再据此生成逐句 SRT；句子数与内部静音边界无法匹配时必须阻断，不得按供应商 cue 数量平均分配文字。
- `scenes[].captions` 与实际 SRT 保持逐 cue 同文同时间，并由 timeline generator 派生给 Remotion。相邻 scene 从上一段人声结束到下一段人声开始的间隔保持在 `1–2s`；最后一段到正片结束同样保持 `1–2s`，明确教学例外除外。

## Remotion 统一实现

- Git Course 的所有教学画面统一由 Remotion 实现，包括课程壳、终端、字幕、代码、Git 图、DAG、对象模型、hash、三路合并、rebase、状态面板和最终合成。
- 抽象原理必须使用可复用的 React/SVG/CSS 状态模型表达；先定义教学状态与因果过渡，再实现时间线，不在 episode 内散写难维护的一次性图形。
- episode 统一通过 `createEpisodeRuntime` 和 `EpisodeTimeline` 消费生成的 scene 数据；不得在各集重新维护 scene start、duration 或 captions 查找函数。
- 静态位置优先使用 `COURSE_RECTS`、`SceneStage`、`CenterInRect` 和 `FitToRect`；动画 transform 只表达状态变化，不用于掩盖未居中或尺寸失控。
- 完整终端操作统一使用 `RecordedTerminalStage` 和 `git-course-lab` 真实录屏；`CommandPill` / `CommandStrip` 只作为状态画面的命令上下文。
- 一个终端录屏只承载一个可解释的命令结果。一个 scene 需要连续展示多条命令时，必须拆成多个真实录屏，并通过 `RecordedTerminalCueSequence` 按旁白 cue 调度；不得让前一条结果在解释完成前被后续输出向下滚走。
- 终端 cue 默认硬切换固定视口：先播放真实输入和输出，再使用对应 hold frame 保持到相关字幕结束后 `0.5–1s`。整体调整 `playbackRate` 只能微调打字节奏，不能代替中间结果冻结和语义对齐。
- 独立录屏开头存在无信息的空提示符时，cue 可以用 `startFromFrame` 裁掉 preroll；裁切后仍需看到完整命令和真实输出，禁止把裁切用成直接跳结果的仿终端捷径。
- 终端结果的出现时间、保持窗口和模型接管时间必须记录在 episode JSON 的 beat / alignment 说明中。审查时按这些时间点补关键帧，确认命令、结果、旁白和字幕属于同一教学动作。
- Git 图优先使用 `GitGraph` 或 `CourseGraphPrimitives`，Working Tree / Index / Repository 优先使用 `GitStateFlow`，字幕统一经过 `CaptionLayer`。
- `manim-viz`、`scripts/manim/git-course*`、`public/git-course/manim/` 和 `ManimClip` 仅作历史兼容保留，不参与新 scene、构建指纹、candidate 或 release。

共享 kit 的视觉或几何改动先在 `GitCourseComponentLab` 覆盖正常输入和长内容输入，并执行 `pnpm --dir remotion git-course:lab:audit`。Lab 只写 `renders/git-course/tmp/component-lab/`，不进入 episode 生命周期；自动检查通过后仍需 preview 受影响的真实 scene。

## 审查与晋升

```text
tmp/       CAS、candidate、审查证据、可重建 preview、任务工作区和历史归档
current/   当前通过审查的单集、scene、音频和 release
```

机器检查负责时间轴、文件结构、旁白窗口、音视频流与生成文件新鲜度；人工检查负责 Git 语义、注意力、字幕遮挡、信息密度和动作因果。只有带匹配 `pass` verdict 的 candidate 才能原子晋升到 current。历史内容只进入 `tmp/legacy-*`，不得重新成为 current 输入。
