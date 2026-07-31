# AGENTS.md

这个仓库用于视频生产，当前包含 Git Course、GitHub Course、Claude Code Course 和独立视频项目。Git Course 仍是实现最完整的主线，但它不是其他课程可以直接照搬的唯一规范。

## Skill 使用边界

- 本仓库的视频任务只使用项目内 `.claude/skills/` 提供的 skills，以及仓库已有的生产脚本和 orchestrator。
- 禁止使用任何 HyperFrames 相关 skill，包括但不限于 `hyperframes-read-first`、`hyperframes-creative`、`hyperframes-media`、`hyperframes-registry`、`general-video` 和 `website-to-video`。
- Remotion 视频使用项目内 `remotion-vid`。`manim-viz`、既有 Manim 脚本和资产仅作为历史兼容内容保留，不再进入 Git Course 的设计、构建、指纹或合成路径；浏览器、终端、TTS、审查和发布必须从本仓库既有流程进入。
- 如果项目内 skill 暂时没有覆盖某个步骤，优先补充或复用仓库脚本，不得切换到 HyperFrames 工作流。

## 跨课程生产规范

- 所有课程共同遵守 `docs/course-production.md`。课程自己的 `workflow.md`、`checklist.md` 和视觉规范只增加 adapter 规则，不得削弱共享的 SHA、audit、approve、promote 和 publish 门禁。
- 每集的 `episodes/<episode-id>.json` 是教学、scene、旁白、来源和发布数据的唯一内容源。录屏 sidecar、TTS 文本、SRT、manifest、timeline 和发布文案文件均为派生产物。
- 共享生命周期固定为 `episode JSON -> inputs -> cache/tasks -> candidate -> audit -> approve -> current -> release candidate -> release audit/approve -> published`。
- build 只能写 `tmp/`。只有与候选 SHA 和全部输入指纹匹配的 `pass` verdict 才能晋升；只有 orchestrator 能写 `current/` 和 `current/release/`。
- 尚未实现的阶段必须保持 `blocked`。不得用手工复制、改名或前端兼容分支伪造 Current、Release 或 Published。
- 课程可以有不同证据：Git 使用终端和 Git 模型，GitHub 使用真实浏览器和平台状态，Claude Code 使用真实终端、工具调用与文件/测试/diff 结果。不同证据最终都必须进入同一套可追溯审查状态。
- episode id、composition id 映射、产物目录和命令参数必须唯一且可追踪。`segmentId` 与分段文件统一使用带顺序号的下划线形式，例如 `01_hook`。
- Dashboard 只能调用课程 adapter 已实现的 orchestrator 动作，不得直接操作底层脚本或根据目录猜测状态。

## 渲染交付回复规范

- 只要本轮生成或更新了视频、Scene、候选、Current、Release、封面或其他可查看产物，最终回复必须逐项给出可点击的绝对路径，不得只说“已经生成”或只描述产物目录。
- 视频路径旁必须标明对应 episode / scene、用途或规格（例如预览、1080p、4K）以及当前生命周期状态（例如 `candidate / needs_review`、`current`、`release`、`published`）。如果尚未通过审查、晋升或发布，必须明确说明。
- 如果本轮没有生成完整预览，只生成了分段、抽帧或审查 sheet，也要直接列出这些实际产物；不得用旧 Current 或 Release 路径冒充本轮预览。

### 当前课程适配状态

- **Git Course**：完整实现 build、main audit/approve、promote、release-build/audit/approve 和 publish，可作为共享机制的参考实现。
- **GitHub Course**：已完成 1080p 迭代、原生 4K 浏览器/Scene/TTS、4K candidate、visual/full audit 和 SHA-bound approve/promote；Release 与 Publish 继续硬阻断，直到对应 adapter 真正实现。
- **Claude Code Course**：目前是课程内容与旧 composition 的迁移阶段；没有统一 orchestrator、candidate/audit 或 release gate，不得把旧 `current` 当成新流程已经完成。

## 课程适配边界

- Git Course 的详细规则见 `git-course/workflow.md`、`git-course/checklist.md`、`git-course/release.md` 和下文 Git 课程品味。
- GitHub Course 的浏览器录制、双规格交付和平台审查见 `github-course/workflow.md` 与 `github-course/checklist.md`。
- Claude Code Course 的真实终端、版本核验和迁移规则见 `claude-code-course/workflow.md` 与 `claude-code-course/checklist.md`。

## Git 课程品味

处理 Git 课程时，遵守这些标准：

- 教学优先。每个镜头只解释一个 Git 状态变化或心智模型。动画、颜色、终端输出、字幕和布局都必须服务这个解释。
- 只使用语义色。`main`、`feature`、`HEAD`、`workingTree`、`index`、`conflict` 这些颜色必须保持 Git 含义，不能当作装饰色复用。
- 视觉气质保持安静、清晰、有工程感。优先使用浅色中性画布、克制对比和少量语义高亮。避免整片黑底终端、高饱和科技渐变和装饰性噪声。
- 状态变化必须可见。命令应该引出 refs、HEAD、commit、工作区或暂存区的可读变化。理解需要动作时，不要直接跳到最终状态。
- 遵守课程生产流程：`episodes/<episode-id>.json` -> Remotion scene / 主视频 -> 抽帧 / 渲染审查。episode JSON 是教学、scene、旁白和发布数据的唯一内容源。
- 先写清楚教学意图，再写动画代码。不要把课程逻辑只埋在 React 时间线代码里。
- Remotion 统一负责课程结构、终端演示、字幕、代码、Git 图、对象关系、hash 传播、三方合并、rebase、状态面板和最终合成。
- 几何复杂的概念应先沉淀为 `remotion/src/videos/git-course/kit/` 中可复用、可审查的 React/SVG/CSS 状态模型；不得在 episode 内堆一次性 SVG，也不得新增 Manim 集成作为捷径。
- 创建 episode 局部 UI 前，优先复用 `remotion/src/videos/git-course/kit/` 组件。新增抽象要匹配现有组件系统。
- 字幕保持克制。使用既有字幕组件（`CaptionLayer`、`NarrationSubtitle`、`SceneCaption`、`QuestionCaption`），不要在 episode 文件里散写自定义字幕样式。
- 字幕应该补充结论或因果提示，不要重复画面已经表达的信息。
- 字号按 1920×1080 逻辑像素验收：主要教学文字至少 24px，教学标签至少 22px，必要代码/输出至少 20px，解说字幕至少 31px；16–18px 只用于删除后不影响理解的课程 chrome。空间不足时精简文案或调整布局，不得用小字号硬塞。
- 顺序已经由空间、箭头或时间明确表达时，删除孤立的小号数字编号；编号确有教学意义时，必须使用教学标签层级并与对应步骤成组。
- 避免无意义的循环、脉冲、晃动或缩放效果。高亮应该进入一次，解释状态变化，然后回到语义样式。
- 控制信息密度。一个镜头里不要让 commit 图、终端、branch refs、HEAD、工作区、暂存区和字幕同时争夺注意力。
- 渲染后要审查：元素重叠、字幕遮挡、Git 状态歧义、语义色误用、过度运动、命令和状态变化不匹配。
- Git Course 默认使用 `pnpm --dir remotion git-course build <episode-id>`；所有 dirty scene、TTS、规范化和分段审查在依赖允许时最大并行。build 只写 `tmp/cache`、`tmp/build` 和可重建 preview，不得直接覆盖 current。旧 `git-course:render`、`tmp/scenes`、`tmp/chunks` 和 `tmp/audit-15f` 不再作为生产入口或权威证据。
- dirty Scene 必须复用一次 Remotion bundle；不要重新引入每个 Scene 单独 bundle 的 CLI 调度。总 render concurrency 默认使用全部逻辑 CPU，但每个 Scene 使用独立浏览器池，禁止让多个并行 `renderMedia` 共用同一个 Chrome 实例。
- Scene 成功后必须立即写入内容寻址 cache；其他 Scene 失败不能丢弃已完成结果。并发上限由本机稳定 profile 与自动降级重试维护，不得重新写死成保守小常数。
- 产物所有权固定为：cache 是唯一可复用存储，preview 是可重建视图，tasks 是运行时工作区，audit 是与候选 SHA 绑定的门禁证据，current 只保存已批准产物。preview 优先 hardlink、失败时才复制；成功任务进入 cache 且权威 audit 生成后应清理 task 大文件。
- `git-course clean` 和 `git-course gc` 默认只 dry-run；只有布尔值为真的 `--apply`（或 `--apply=true`）才删除，`--apply=false` 必须保持 dry-run。GC 必须保护 state、artifact/preview manifest、有效 verdict、活动 candidate 和 current 引用，禁止仅按目录年龄粗暴删除。
- 只有 main audit verdict 为 `pass` 且主 candidate、scene、candidate audio 的 SHA 以及 scene/TTS/BGM 指纹全部匹配时，`git-course promote` 才能覆盖 `current/`。分段文件名必须带顺序号和 scene id，统一使用下划线，例如 `01_hook.mp4`、`02_bad_model.mp4`。
- 抽帧检查可以临时放在 `tmp/`，但检查完成后要清理，避免当前审查目录被临时文件污染。
- 编码后审查统一使用连续 `2fps`（30fps 每 15 帧一张），每张审查条最多 5 帧并按 `5×1` 合并；16 帧 `4×4` 总览只用于导航。scene 和发布拼接边界使用中心点前后各 `0.5s`、`10fps` burst，并补充计划内精确关键帧。
- 审查 sheet 应由单次分页 montage 生成，最后一页不得补空白；原始连续帧默认在 sheet 校验后删除，只在 `AUDIT_KEEP_FRAMES=1` 调试时保留。
- overview、2fps review 和完整 metrics 应并行扫描；boundary 与 keyframe 也应并行，禁止重新退化成所有审计阶段串行执行。
- 单集完整成片统一覆盖 `current/<episode-id>.mp4`。历史成片只允许归档到 `tmp/legacy-final/`，不再作为新流程输入或输出。不要输出 `new`、`v2`、`final-final` 之类临时成片。
- 每个 scene 的旁白正文、`segmentId` 和进入时间直接维护在 episode JSON 的 `scenes[].narration`。orchestrator 在 `tmp/narration-source/` 派生 `.txt` 和 `manifest.tsv`，仅重新生成指纹变化的 `.mp3`、`.srt`、`_norm.mp3`。不要直接调用底层 TTS 或散跑 FFmpeg 长命令。
- TTS 文稿应使用短句和 MiniMax 停顿标记控制节奏，例如 `<#0.25#>`、`<#0.35#>`；生成后必须检查 `.srt`，确认停顿标记没有被读成文字。
- SRT 字幕不是讲稿原文。生成后默认清理句尾 `。`、`;`、`；` 和常见语气标签；保留 `，`、`、`、`？`、少量 `：` 来表达观看节奏。
- `.txt`、`manifest.tsv` 和 `.srt` 都是 episode JSON 的派生产物，默认不提交；人工同步判断保存在 episode JSON 的 `content.alignmentMarkdown`。
- TTS 必须显式固定 `model`、`voice`、`language` 和 `speed`。当前 Git course 默认固定为 `speech-2.8-hd`、`Chinese (Mandarin)_Gentleman`、`zh`、`1.25`；同一集不要混用不同 voice 或 speed。
- 分段人声不要只依赖 TTS 的 `--volume`。生成后用 FFmpeg 做响度规范化和轻压缩，目标约 `-20 LUFS`，峰值约 `-3 dBFS`；保留原始 `.mp3`，规范化文件使用 `_norm.mp3` 后缀。
- BGM 在 Git 课程中保持集与集一致。优先复用已确认的课程 BGM；混音时使用固定低音量，不做 sidechain ducking，避免背景音乐随人声忽高忽低。当前 EP01/EP02 使用 BGM `volume=0.05`。
- build 阶段音频位于 `tmp/build/candidate/audio/`；只有 main candidate 通过 approve/promote 后，才原子同步到 `current/audio/segments/` 和 `current/audio/mix.m4a`。scene 与旁白窗口直接由 episode JSON 校验。
- 发布版在当前正片确认后再封装到 `current/release/<episode-id>.mp4`；封面也输出到同一 `release/`。发布源数据维护在 episode JSON 的 `release` 字段。发布封装默认片头增益 `0dB`、片尾增益 `-5dB`。
- 发布版必须使用 `release-build -> release-audit -> release-approve -> publish`。底层 `git-course-publish-episode.sh` 只允许 orchestrator 调用；release verdict 不是 `pass` 或 SHA 不匹配时禁止 publish。不要再新增 `publishing/` 或 `published/` 目录。

## 结构与组件语法

不要把课程固定成单一的左右结构或上下结构。固定的是镜头语法：先判断当前主角是谁，再选择布局。

- 问问题：使用居中结构。标题、问题句和极简主视觉占据注意力，底部只保留 `QuestionCaption` 或一句短字幕。
- 打命令：使用终端聚焦结构。命令输入阶段终端独占或近似独占，其他解释层不要提前抢画面。
- 所有终端画面都应使用专门为 Git 课程制作的 `git-course-lab` 终端录制流程和素材，不要在 episode 中临时手写仿终端画面。
- 看状态变化：使用因果结构。命令完成后，让 Git 图、三层状态板、refs 或文件卡接管主视觉，终端降权为证据。
- 讲抽象原理：使用 Remotion 居中模型。DAG、对象模型、hash、快照流、merge / rebase 这类概念优先让主视觉居中，并把状态、关系和过渡显式建模。
- 做总结：使用极简居中结构。只保留核心图和一到三条短结论，不做重型下集预告板。

### Ep01 结构判断

`ep01-what-git-stores` 是概念片，主线是从错误模型进入正确模型。默认应使用居中主视觉，不长期使用左右分栏。

- `hook`：标题和 `状态 A / B / C` 卡片居中，收束成历史层，最后用问题句收住。
- `bad-model`：使用左右结构，左侧让复制出来的文件夹收束成混乱堆叠，右侧显示判断性问题，例如 `哪个才是最终版？`；不画复杂时间线，也不要让问题文字贴在卡片上。
- `version-control`、`snapshot-model`、`integrity`、`takeaway`：以时间线、快照流、hash、commit graph 等居中模型为主。
- `local-history` 可以短暂使用左右结构：左侧终端作为 `git log` 证据，右侧展示本地历史或 repository 模型。
- Ep01 的终端是证据，不是主叙事。不要让终端长期占据课程中心。

### Ep02 结构判断

`ep02-working-tree-index-repo` 是状态流转片，默认主视觉是 `Working Tree | Index | Repository` 三栏状态板。

- 本集最重要的资产是三栏状态流，不是普通左右分栏。
- 命令输入时先使用终端聚焦结构，例如 `git add app.js`、`git commit -m ...`。
- 命令完成后，终端缩小或消失，三栏状态板接管主视觉。
- `git add` 必须表现为把当前内容放入 Index；如果工作区后续继续编辑，Index 中的 `staged v1` 和 Working Tree 中的 `working v2` 必须同时清楚。
- `git commit` 必须表现为读取 Index 写入 Repository，而不是读取 Working Tree 当前内容。
- `git status -s` 之类输出只作为证据，不成为主视觉。

### 可复用组合

优先把 episode 中反复出现的镜头结构沉淀为组合，而不是在单集里堆散装 JSX。

- `SceneStage(question)`：标题 / 问题 / 极简主视觉。
- `RecordedTerminalStage`：真实终端录屏，负责命令证据。
- `GitStateFlow`：命令导致状态变化，适合 Working Tree、Index、Repository。
- `SceneStage(center-model)` + `CenterInRect`：居中解释 commit graph、branch pointer、hash、merge 和 rebase。
- `CourseGraphPrimitives`：用统一节点、圆边连接和语义标签表达 DAG 关系。

当前公共基座包括 `createEpisodeRuntime`、`EpisodeTimeline`、`CourseLayout`、`SceneStage`、`COURSE_RECTS`、`GitGraph`、`CourseGraphPrimitives`、`GitStateFlow`、`RecordedTerminalStage`、`CaptionLayer`、`CodeBlock` 和 `CodeDiff`。共享组件变更先通过 `GitCourseComponentLab` 和严格布局审查，再 preview 真实 scene。

## 本地改动卫生

- 工作区可能包含用户改动。不要回滚无关修改。
- 编辑已有改动的文件前，先查看本地 diff，并在现有改动基础上继续。
- 修改范围保持收敛，只改用户请求涉及的课程分集、组件、脚本或文档。
