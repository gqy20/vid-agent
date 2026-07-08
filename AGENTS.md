# AGENTS.md

这个仓库用于视频生产。当前主线是 Git 课程，相关内容主要位于 `docs/git-course/`、`remotion/src/videos/git-course/` 和 `scripts/manim/git-course/`。

## Git 课程品味

处理 Git 课程时，遵守这些标准：

- 教学优先。每个镜头只解释一个 Git 状态变化或心智模型。动画、颜色、终端输出、字幕和布局都必须服务这个解释。
- 只使用语义色。`main`、`feature`、`HEAD`、`workingTree`、`index`、`conflict` 这些颜色必须保持 Git 含义，不能当作装饰色复用。
- 视觉气质保持安静、清晰、有工程感。优先使用浅色中性画布、克制对比和少量语义高亮。避免整片黑底终端、高饱和科技渐变和装饰性噪声。
- 状态变化必须可见。命令应该引出 refs、HEAD、commit、工作区或暂存区的可读变化。理解需要动作时，不要直接跳到最终状态。
- 遵守课程生产流程：`script.md` -> `scenes.json` -> Remotion 主视频 -> Manim 原理片段 -> Remotion 合成 -> 抽帧 / 渲染审查。
- 先写清楚教学意图，再写动画代码。不要把课程逻辑只埋在 React 时间线代码里。
- Remotion 负责课程结构、终端演示、字幕、代码、轻量 Git 图、状态面板和最终合成。
- Manim 负责精密原理动画：DAG、Git 对象、hash 传播、Merkle-like 结构、三路合并、rebase，以及几何关系复杂的图解释。
- 不要因为还没有现成 Manim 场景，就把几何复杂的概念降级成 episode 内随手写的 Remotion SVG。概念需要时，应新增或规划 Manim 资产。
- 创建 episode 局部 UI 前，优先复用 `remotion/src/videos/git-course/kit/` 组件。新增抽象要匹配现有组件系统。
- 字幕保持克制。使用既有字幕组件（`NarrationSubtitle`、`ActionCaption`、`QuestionCaption` 及相关 kit 组件），不要在 episode 文件里散写自定义字幕样式。
- 字幕应该补充结论或因果提示，不要重复画面已经表达的信息。
- 避免无意义的循环、脉冲、晃动或缩放效果。高亮应该进入一次，解释状态变化，然后回到语义样式。
- 控制信息密度。一个镜头里不要让 commit 图、终端、branch refs、HEAD、工作区、暂存区和字幕同时争夺注意力。
- 渲染后要审查：元素重叠、字幕遮挡、Git 状态歧义、语义色误用、过度运动、命令和状态变化不匹配。
- 分段预览默认覆盖到 `remotion/renders/git-course/<episode-id>/renders/current/scenes/`，文件名必须带顺序号和 scene id，统一使用下划线，例如 `01_hook.mp4`、`02_bad_model.mp4`。不要每次修改都新建带日期或描述词的 mp4 输出目录；只有用户明确要求版本对比时才另存候选版本。
- 抽帧检查可以临时放在 `renders/tmp/`，但检查完成后要清理，避免当前审查目录被临时文件污染。
- 单集完整成片默认覆盖固定路径。优先使用 `renders/current/<episode-id>.mp4`；如果该集已有 `renders/current/final/<episode-id>_with-audio.mp4` 约定，则沿用该固定文件。不要输出 `new`、`v2`、`final-final` 之类临时成片。
- 课程音频默认按分段流程制作：每个 scene 一个旁白 `.txt` 和 `.mp3`，生成同名 `.srt`，再按全片时间线拼成 `voiceover_aligned` / `voiceover-aligned`。
- TTS 文稿应使用短句和 MiniMax 停顿标记控制节奏，例如 `<#0.25#>`、`<#0.35#>`；生成后必须检查 `.srt`，确认停顿标记没有被读成文字。
- 分段人声不要只依赖 TTS 的 `--volume`。生成后用 FFmpeg 做响度规范化和轻压缩，目标约 `-20 LUFS`，峰值约 `-3 dBFS`；保留原始 `.mp3`，规范化文件使用 `_norm.mp3` 后缀。
- BGM 在 Git 课程中保持集与集一致。优先复用已确认的课程 BGM；混音时使用固定低音量，不做 sidechain ducking，避免背景音乐随人声忽高忽低。当前 EP01/EP02 使用 BGM `volume=0.05`。
- 每集音频目录需要保留对齐说明，例如 `audio/alignment.md` 或 `audio/voiceover_segments/alignment.md`，写明 scene 时间窗、旁白进入时间、使用的规范化文件、BGM 策略和句子级 SRT 对齐公式。
- 发布版在当前正片确认后再封装：公共片头、正片、公共片尾三段合成到 `renders/current/published/<episode-id>_published.mp4`。片头片尾也必须有 BGM，优先从课程统一 BGM 截取低音量片段，不单独换歌。发布版 mp4 和中间音频是本地产物，默认不新增入库。
- 发布版拼接优先用 FFmpeg concat filter 重新编码，重置每段音视频时间轴，避免 concat copy 在段落边界产生 DTS/PTS 警告。输出覆盖固定 `published/` 文件，不新增带时间戳或 `v2` 的发布目录。

## 结构与组件语法

不要把课程固定成单一的左右结构或上下结构。固定的是镜头语法：先判断当前主角是谁，再选择布局。

- 问问题：使用居中结构。标题、问题句和极简主视觉占据注意力，底部只保留 `QuestionCaption` 或一句短字幕。
- 打命令：使用终端聚焦结构。命令输入阶段终端独占或近似独占，其他解释层不要提前抢画面。
- 所有终端画面都应使用专门为 Git 课程制作的 `git-course-lab` 终端录制流程和素材，不要在 episode 中临时手写仿终端画面。
- 看状态变化：使用因果结构。命令完成后，让 Git 图、三层状态板、refs 或文件卡接管主视觉，终端降权为证据。
- 讲抽象原理：使用居中模型或 Manim 片段。DAG、对象模型、hash、快照流、merge / rebase 这类概念优先让主视觉居中。
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

- `QuestionScene`：标题 / 问题 / 极简主视觉。
- `TerminalFocusScene`：终端独占，负责输入命令。
- `StateTransitionScene`：命令导致状态变化，适合 Ep02 和后续涉及工作区、暂存区、仓库的内容。
- `CenterModelScene`：居中模型解释，适合 Ep01、commit graph、branch pointer、hash 和 Manim 合成段。
- `ManimBridge`：`ManimClip` 加 Remotion 课程壳、章节进度和字幕。

当前已有基础组件包括 `CourseLayout`、`SceneSequence`、`GitStatePanel`、`GitGraph`、`CenterGraph`、`TerminalPanel`、`TypedCommandTerminal`、`QuestionCaption`、`SceneCaption` 和 `ManimClip`。新增结构时应优先组合这些组件。

## 本地改动卫生

- 工作区可能包含用户改动。不要回滚无关修改。
- 编辑已有改动的文件前，先查看本地 diff，并在现有改动基础上继续。
- 修改范围保持收敛，只改用户请求涉及的课程分集、组件、脚本或文档。
