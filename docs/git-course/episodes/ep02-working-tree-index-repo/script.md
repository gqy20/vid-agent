# EP02 工作区、暂存区、仓库 - 脚本

## 制作目标

本集解决第二个误解：`git add` 不是“把文件加入项目”这么简单，`git commit` 也不是直接保存当前编辑器里的全部内容。Git 的基本流程是：在工作区修改，选择性放入暂存区，再把暂存区快照提交到仓库。

观众看完后应该能说出三句话：

- Working Tree 是你正在编辑的文件。
- Index / Staging Area 是下一次 commit 的候选清单。
- Repository 保存已经提交的历史。

## 官方依据

本集知识依据来自 Pro Git：

- `what-is-git.asc:79-88`：文件有已修改、已暂存、已提交三种状态。
- `what-is-git.asc:88-100`：Git 项目拥有工作区、暂存区、Git 目录三个阶段。
- `what-is-git.asc:102-106`：基本工作流是修改、暂存、提交。
- `recording-changes.asc:6-15`：工作目录中的文件分为已跟踪和未跟踪，修改后可选择性暂存并提交。
- `recording-changes.asc:87-119`：`git add` 会让文件进入已暂存状态，更准确的理解是把当前内容加入下一次提交。
- `recording-changes.asc:161-166`：暂存的是运行 `git add` 那一刻的版本，之后再修改需要重新 add。

## 技术原则

- 主视频使用 Remotion。原因：三层状态、终端输入、文件移动和字幕需要严格按节拍同步。
- 不使用 Manim 主导。本集是 UI 状态流转，Remotion 组件更利于后续复用。只有在需要解释 Index 内部如何写成 tree 时，才切到 EP03 的 Manim 对象模型。
- 终端只在命令触发时全屏；命令执行后退到左侧或淡出，让三层状态图成为主视觉。
- 需要沉淀 `GitStatePanel`、`WorkingTree`、`StagingArea`、`RepositoryBox`、`FileMove`。

## Remotion / Manim / 素材分工

| 片段 | 使用技术 | 原因 | 本地资产状态 | 输出物 |
|---|---|---|---|---|
| 0-12s hook | Remotion | 标题、文件卡和问题句需要课程包装一致 | 已有 `EpisodeTitleCard`、`QuestionCaption`、motion primitives | Remotion scene |
| 12-38s three-areas | Remotion | 三层面板是后续多集复用 UI 组件 | 已有 `GitStatePanel` | Remotion scene |
| 38-68s modify | Remotion | 代码变化、文件状态和字幕需要逐帧同步 | 已有 `CodeBlock`、`LineHighlight`、`GitStatePanel` | Remotion scene |
| 68-104s add | Remotion | 命令输入触发文件进入 Index，是典型终端到状态面板动作链 | 已有 `TerminalPanel`、`TerminalFocusScene`、`FileMove` 需补齐或组合 | Remotion scene |
| 104-134s edit-after-add | Remotion | `Index v1 / Working Tree v2` 是 UI 对比，不是抽象数学结构 | 已有 `CodeDiff`，需组合状态对比 | Remotion scene |
| 134-164s commit | Remotion | 本集只讲 commit 读取 Index，不拆对象模型 | 已有 `GitStatePanel`、`CommitNode` | Remotion scene |
| 164-180s takeaway | Remotion | 流程总结和下一集问题属于课程包装 | 已有进度条和字幕系统 | Remotion scene |

## 外部图片需求

本集不需要网络图片。Working Tree、Index、Repository 应该是我们自己的课程图形系统，不能用网上随意找的流程图。

可选素材：

- 真实 `git status` 终端截图不建议使用，应该用 `TerminalPanel` 重建，便于字体、配色和动画统一。
- 如果后续要展示 IDE 文件修改界面，也应先用 Remotion `CodeBlock`/`CodeDiff` 自制。

## 片段总览

| 全局时间 | Scene | 时长 | 目的 | 主技术 | 主视觉 |
|---:|---|---:|---|---|---|
| 0-12s | hook | 12s | 提出 `git add` 到底做什么 | Remotion title + file tile | 大标题、文件悬停在三层之间 |
| 12-38s | three-areas | 26s | 建立三层结构 | GitStatePanel | Working Tree / Index / Repository |
| 38-68s | modify | 30s | 展示修改只发生在工作区 | CodeBlock + FileMove | 文件变成 modified |
| 68-104s | add | 36s | 展示 `git add` 暂存的是当前内容 | Remotion terminal + FileMove | 文件进入 Index |
| 104-134s | edit-after-add | 30s | 解释同一文件可同时有暂存和未暂存版本 | Split file state | Index v1 / Working Tree v2 |
| 134-164s | commit | 30s | 展示 commit 读取 Index | RepositoryBox + commit node | Index 形成 C1 |
| 164-180s | takeaway | 16s | 收束三层模型 | FlowDiagram | 修改、暂存、提交 |

## 旁白草案

### 0-12s / hook

> 第二集，我们只盯住一个动作：文件从编辑器到 commit，中间到底经过了哪里？如果你觉得 `git add` 只是“添加文件”，后面很多 Git 问题都会变得很奇怪。

字幕短句：

- `文件不是直接进入 commit`
- `git add 到底做什么？`

### 12-38s / three-areas

> Git 项目可以先看成三层：工作区、暂存区、仓库。工作区是你正在编辑的文件。暂存区保存下一次准备提交的内容。仓库保存已经提交的历史。

字幕短句：

- `Working Tree：正在编辑`
- `Index：下一次提交的候选`
- `Repository：已经提交的历史`

### 38-68s / modify

> 当你修改一个文件，变化首先只在工作区。Git 知道它变了，但它还不会自动进入下一次提交。

字幕短句：

- `修改先发生在工作区`
- `modified 还不是 staged`

### 68-104s / add

> 执行 `git add app.js`，Git 把这个文件当前这一刻的内容放进暂存区。更准确地说，add 不是把文件加入项目，而是把这份内容加入下一次提交。

字幕短句：

- `git add 暂存当前内容`
- `add this content to the next commit`

### 104-134s / edit-after-add

> 这里有一个关键细节：如果 add 之后你又继续修改文件，暂存区里还是旧版本，工作区里是新版本。所以同一个文件，可能同时有已暂存和未暂存的变化。

字幕短句：

- `Index 是 add 那一刻`
- `继续修改后，需要重新 add`

### 134-164s / commit

> 执行 `git commit` 时，Git 读取的是暂存区。它把暂存区里的内容形成一个新的快照，并写入仓库历史。

字幕短句：

- `commit 读取 Index`
- `Repository 得到新快照`

### 164-180s / takeaway

> 所以这一集只记住一条线：Working Tree 修改，Index 选择，Repository 记录。下一集我们再拆开一个 commit，看它里面到底包含什么。

字幕短句：

- `修改 -> 暂存 -> 提交`
- `下一步：commit 里面有什么？`
