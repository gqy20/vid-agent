# EP02 工作区、暂存区、仓库 - Audit

## 当前状态

- 文档状态：已完成首版制作文档。
- Remotion 实现：已完成 7 个 scene 的首版实现。
- Manim 实现：不需要主线 Manim。
- 渲染产物：7 个分段已全部按规范输出到 `remotion/renders/git-course/ep02-working-tree-index-repo/renders/current/scenes/`。
- 完整成片：已生成 `remotion/renders/git-course/ep02-working-tree-index-repo/renders/current/final/ep02-working-tree-index-repo_with-audio.mp4`，包含 BGM 与分场景中文旁白。

## 当前分段输出

| 文件 | 时间段 | 时长 | 状态 |
|---|---:|---:|---|
| `01_hook.mp4` | 0-12s | 12.000s | 已生成 |
| `02_three-areas.mp4` | 12-38s | 26.000s | 已生成 |
| `03_modify.mp4` | 38-68s | 30.000s | 已生成 |
| `04_add.mp4` | 68-104s | 36.000s | 已生成 |
| `05_edit-after-add.mp4` | 104-134s | 30.000s | 已生成 |
| `06_commit.mp4` | 134-164s | 30.000s | 已生成 |
| `07_takeaway.mp4` | 164-180s | 16.000s | 已生成 |

## 待继续

- 如需发布版，进行全片精听和字幕节奏微调。

## 完整成片与音频

输出文件：

- 静音合成：`remotion/renders/git-course/ep02-working-tree-index-repo/renders/current/final/ep02-working-tree-index-repo_silent.mp4`
- 带音频成片：`remotion/renders/git-course/ep02-working-tree-index-repo/renders/current/final/ep02-working-tree-index-repo_with-audio.mp4`
- 分场景旁白：`remotion/renders/git-course/ep02-working-tree-index-repo/renders/current/audio/segments/`
- 对齐旁白：`remotion/renders/git-course/ep02-working-tree-index-repo/renders/current/audio/voiceover-aligned.mp3`
- BGM：`remotion/renders/git-course/ep02-working-tree-index-repo/renders/current/audio/bgm.mp3`
- 混音：`remotion/renders/git-course/ep02-working-tree-index-repo/renders/current/audio/mix.m4a`

校验结果：

- 成片时长：180.000s。
- 视频流：H.264，1920x1080，30fps。
- 音频流：AAC，48kHz mono。
- 音量检查：`max_volume -14.6 dB`，未爆音。
- 抽帧检查点：6s、20s、48s、86s、116s、148s、172s，未发现拼接后画面异常。

备注：

- 直接渲染完整 Remotion composition 时，在最后一帧 `5399/5400` 长时间卡住且未写出目标 mp4；已停止该进程。
- 最终成片采用已审查过的 7 个 current scene 通过 ffmpeg concat 拼接，再 mux 对齐后的配音和 BGM。

## 终端组件一致性

修正状态：已将 Ep02 终端相关 UI 收敛到课程 kit。

- `CommandStrip` 已从 episode 内部局部组件迁移为 `kit/terminal/CommandStrip`。
- `git status -s` 证据面板已改为 `kit/terminal/StatusTerminalPanel`。
- Ep02 episode 文件不再直接引用 `COLOR.terminal` 或 `TerminalPanel`。
- 已重新渲染 `04_add.mp4`、`05_edit-after-add.mp4`、`06_commit.mp4`，并抽帧复查终端证据层、状态板接管和字幕遮挡。

## 03_modify 抽帧分析

抽帧文件：`remotion/renders/git-course/ep02-working-tree-index-repo/renders/current/scenes/03_modify.mp4`

检查点：0s、4s、8s、12s、16s、20s、24s、28s。

修正状态：已优化并重新渲染 `03_modify.mp4`，时长校验 30.000s。

问题：

- 4s-16s：`CodeBlock` 压在 `Working Tree` 面板内部，和文件列表区域发生视觉重叠。观众会分不清代码卡是面板里的内容，还是外部证据层。已修正：代码卡移到三栏下方独立证据区。
- 8s-16s：新增代码行右侧被裁切，`return <Header title="Git" />;` 只能看到前半段，修改内容不可完整读取。已修正：代码卡加宽，复查帧中新增行完整可读。
- 8s-16s：代码卡面积和 Working Tree 面板争夺同一个主视觉区域，导致“文件状态变为 modified”不够明确。已修正：状态面板和代码证据层分离。
- 16s 后：代码卡淡出后，画面基本只剩三栏静态面板、`Index 没变 / Repository 没变` 和字幕，状态变化已经完成但仍停留较久，节奏偏空。已缓解：`Index 没变 / Repository 没变` 改为更轻的短提示并后段降权。
- 16s-28s：字幕 `modified 说明文件变了，但还不是 staged。` 与中部 `Index 没变 / Repository 没变` 信息重复，建议保留一个主结论，另一个弱化或提前退场。已缓解：中部提示弱化，字幕后段承担主结论。
- 语义色问题：修改行高亮使用偏黄强调色，容易和 Index 的语义色接近。第三段应优先使用 Working Tree 色强调“修改发生在工作区”，避免把观众注意力带向 Index。已修正：`CodeBlock` 支持自定义高亮色，第三段使用 Working Tree 色。

修正建议：

- 将代码卡移到三栏状态板下方或左下方独立证据区，至少避开 Working Tree 文件列表和面板边框。
- 缩短代码行或加宽代码卡，保证新增行完整可读；可以把示例改成更短的 `return <Header title="Git" />;` 或 `title="Git"` 局部高亮。
- 状态切换时让 `app.js` 从普通文件明确变成 `app.js:modified`，并在同一时刻短暂强调 Working Tree 边框。
- 中后段减少静态停留：让 Index/Repository 的“没变”提示进入一次后退到弱样式，字幕只保留因果结论。
- 高亮色改为 Working Tree 语义色或中性背景加 Working Tree 左边线，不使用接近 Index 的黄色。

## 04_add 抽帧分析

抽帧文件：`remotion/renders/git-course/ep02-working-tree-index-repo/renders/current/scenes/04_add.mp4`

检查点：0s、4s、8s、10s、12s、16s、20s、24s、30s、35s。

修正状态：已优化并重新渲染 `04_add.mp4`，时长校验 36.000s。

问题：

- 8s：终端全屏退场后，命令条和三栏状态板入场偏晚，出现接近空白的过渡帧。已修正：命令条提前在 7.75s 接住画面，三栏状态板从 8.35s 开始入场。
- 8s-10s：原版终端全屏和命令条短暂重叠，形成半透明残影，命令证据层不够干净。已修正：终端全屏在 7.95s 前完成退场，命令条独立承接。
- 12s-16s：移动文件卡到达 Index 后仍停留在面板外，像一个浮动副本，削弱“Index 已经持有 staged v1”的状态变化。已修正：移动卡在 Index 接收文件后淡出，只保留 Index 面板内的 `app.js:v1`。
- 20s-24s：尾段同时保留移动路径、移动卡和结论卡，信息密度偏高。已修正：路径后段降权，移动卡消失，结论卡承担最终解释。
- 教学语义：`git add` 容易被理解成“把文件加入项目”。尾段结论卡保留 `add = 选择这份内容`，强调它把当前内容放入 Index。

## 05_edit-after-add 抽帧分析

抽帧文件：`remotion/renders/git-course/ep02-working-tree-index-repo/renders/current/scenes/05_edit-after-add.mp4`

检查点：0s、4s、8s、12s、16s、20s、24s、28s。

修正状态：已优化并重新渲染 `05_edit-after-add.mp4`，时长校验 30.000s。

问题：

- 0s：首帧代码卡淡入过弱，画面接近空白，进入状态变化偏慢。已修正：代码卡初始不透明度提高，对比板更早进入。
- 8s-12s：`git status -s`、`MM` 中文解释和两栏对比同时出现，信息层偏多。已修正：`MM` 中文解释在主字幕出现前退场，终端只保留为证据层。
- 16s-20s：底部字幕和右侧 `MM` 解释重复表达 `Index v1 / Working Tree v2`，削弱“需要重新 add”的主结论。已修正：底部字幕延后承担结论，右侧解释提前淡出。
- 20s-28s：终端证据占用中下区域太久，和字幕争夺注意力。已缓解：终端后段降权，尾段以两栏对比和字幕为主。
- 教学语义：最终状态必须清楚显示 `Index` 仍是 `staged v1`，`Working Tree` 是 `working v2`。复查帧确认两者同时可读，语义色未混用。

## 06_commit 抽帧分析

抽帧文件：`remotion/renders/git-course/ep02-working-tree-index-repo/renders/current/scenes/06_commit.mp4`

检查点：0s、4s、8s、12s、16s、20s、24s、28s。

修正状态：已优化并重新渲染 `06_commit.mp4`，时长校验 30.000s。

问题：

- 8s：终端全屏退场时和命令条发生重叠残影，状态板还很淡，命令证据层不干净。已修正：终端全屏提前退场，命令条先接住画面，三栏板随后入场。
- 16s-24s：`snapshot from Index`、箭头和 C1 圆形覆盖 Repository 面板中的 `C1:v1` 文件行，导致“Repository 已得到新快照”的状态读起来拥挤。已修正：箭头、标签和 C1 圆形整体下移到三栏板下方，Repository 文件行保持清楚可读。
- 教学语义：commit 必须读 Index，不读 Working Tree。复查帧确认 Index 先包含 `app.js:v1`，commit 后 Repository 出现 `C1:v1`，Working Tree 仍保留 `app.js:v2`。

## 07_takeaway 抽帧分析

抽帧文件：`remotion/renders/git-course/ep02-working-tree-index-repo/renders/current/scenes/07_takeaway.mp4`

检查点：0s、3s、6s、9s、12s、15s。

修正状态：首版通过抽帧审查，时长校验 16.000s。

结论：

- 总结段信息密度低，标题、三节点流程和下集问题句没有互相遮挡。
- 语义色保持稳定：Working Tree、Index、Repository 只用于对应节点。
- 尾帧问题句 `下一步：commit 里面到底有什么？` 可读，没有压住流程图或进度条。

## 预渲染检查清单

- 三层状态面板必须是本集主视觉。
- `git add` 必须表达为“暂存当前内容”，不能只说“添加文件”。
- add 后继续编辑的段落必须清楚展示 `Index v1` 与 `Working Tree v2`。
- commit 必须读取 Index，不应错误地读取 Working Tree 当前内容。
- 不讲 blob/tree/commit object 结构，留给 EP03。

## 抽帧检查点

| 时间 | 检查内容 |
|---:|---|
| 2s | 标题独占画面 |
| 18s | 三层区域等宽、标签可读 |
| 48s | modified 标签不遮挡文件名 |
| 76s | 终端全屏输入命令 |
| 88s | 文件进入 Index 的动作清晰 |
| 116s | `v1` 与 `v2` 对比不重叠 |
| 146s | C1 从 Index 生成 |
| 172s | 流程箭头不压字幕 |

## 待实现风险

- 三层面板容易变成长期静态课件，需要用命令触发动作链提升节奏。
- 终端和状态面板同屏时容易拥挤，应在命令阶段全屏，状态阶段弱化终端。
- `MM app.js` 对新手可能陌生，只作为视觉证据，不展开解释。
