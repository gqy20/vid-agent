# EP03 Commit 不是保存按钮 - 脚本

## 制作目标

本集解决第三个误解：commit 不是编辑器里的“保存按钮”，也不是只保存一段 diff。commit 是 Git 历史里的一个对象，它指向某一刻的项目快照，并记录 parent、作者、时间和 message。多个 commit 通过 parent 指针串成历史。

观众看完后应该能说出三句话：

- commit 指向一个项目快照。
- 普通 commit 会记录 parent，所以历史能连起来。
- hash 是 commit 身份的一部分，内容或元数据改变都会产生不同身份。

## 官方依据

本集知识依据来自 Pro Git：

- `nutshell.asc:9-13`：提交对象包含指向暂存内容快照的指针、作者信息、提交信息和父对象指针。
- `nutshell.asc:26-32`：`git commit` 会创建树对象和提交对象，提交对象指向项目根目录树。
- `nutshell.asc:37-45`：再次提交会包含父对象指针，分支指向最后一个提交。
- `objects.asc:250-255`：提交对象保存谁、何时、为什么保存快照等基本信息。
- `objects.asc:280-283`：提交对象格式包含顶层树对象、父提交、作者/提交者、时间戳和提交注释。
- `objects.asc:330-334`：`git add` / `git commit` 的实质是保存 blob、更新暂存区、记录 tree、创建 commit。

## 技术原则

- 主视频使用 Remotion 编排，Manim 负责对象模型片段。
- Manim 推荐用于 `blob -> tree -> commit -> parent chain` 的精密动画。
- Remotion 负责终端、代码、字幕、章节进度和片段合成。
- 不深入 packfile、delta compression、reflog，这些属于后续高级章节。

## Remotion / Manim / 素材分工

| 片段 | 使用技术 | 原因 | 本地资产状态 | 输出物 |
|---|---|---|---|---|
| 0-12s hook | Remotion | 标题、保存按钮误解和 commit 节点替换需要课程包装统一 | 已有 `EpisodeTitleCard`、`CommitNode` | Remotion scene |
| 12-38s from-index | Remotion | 承接 EP02 的三层状态面板，强调 commit 读取 Index | 已有 `GitStatePanel` | Remotion scene |
| 38-74s object-model | Manim + Remotion | `commit -> tree -> blob` 是对象指针关系，Manim 更适合精密布局和不重叠检查 | 已有 `GitObjectModelScene`，需升级方向为 commit 指向 tree 指向 blob | Manim mp4 + Remotion captions |
| 74-104s commit-fields | Remotion | 字段卡片与旁白逐行高亮，Remotion 更好控字幕和节奏 | 需新增或组合 `CommitObjectCard` | Remotion scene |
| 104-132s parent-chain | Manim + Remotion | parent 指针方向和 DAG 拓扑是本段核心，应该新增 parent chain 专用 Manim 场景；`GitGraph` 只用于片尾轻量铺垫 | 需新增 `CommitParentChainScene`，可复用 `GitDAGScene` 的基础图元 | Manim mp4 + Remotion captions |
| 132-158s hash-identity | Manim + Remotion | hash 身份变化是抽象关系，已有 Manim 场景可用；字幕和对比结论由 Remotion 合成 | 已有 `HashScene`，需统一中文和配色 | Manim mp4 + Remotion captions |
| 158-180s takeaway | Remotion | branch 铺垫只需要轻量 commit graph，不应展开复杂对象模型 | 已有 `CenterGraph`、`BranchLabel`、`ArrowLine` | Remotion scene |

## 外部图片需求

本集默认不需要网络图片。blob、tree、commit、parent、hash 都应该使用 Manim/Remotion 自制图形。

禁止使用网上找来的“Git object model”图片作为主视觉。原因：

- 风格无法和课程统一。
- 箭头方向、术语和讲解顺序不可控。
- 后续无法做重叠检查和逐帧动画。

如果需要展示官方依据，只能短暂使用 Pro Git 文本引用或自制重绘，不直接把原书截图作为动画主体。

## 片段总览

| 全局时间 | Scene | 时长 | 目的 | 主技术 | 主视觉 |
|---:|---|---:|---|---|---|
| 0-12s | hook | 12s | 否定“保存按钮” | Remotion title + save icon strike | 大标题、保存按钮被替换成 commit node |
| 12-38s | from-index | 26s | 连接 EP02：commit 读取 Index | GitStatePanel | Index 收束成快照 |
| 38-74s | object-model | 36s | 展示 blob/tree/commit | Manim | 文件内容、tree、commit 对象 |
| 74-104s | commit-fields | 30s | 展示 commit 内部字段 | Remotion object card | tree、parent、author、message |
| 104-132s | parent-chain | 28s | 展示历史如何串起来 | Manim parent-chain scene 或 Remotion GitGraph | C0 -> C1 -> C2 |
| 132-158s | hash-identity | 26s | 说明 hash 身份 | Manim `HashScene` + Remotion captions | message 改变导致新 hash |
| 158-180s | takeaway | 22s | 为 EP04 branch 铺垫 | Commit graph | branch 将指向 commit |

## 旁白草案

### 0-12s / hook

> 第三集，我们拆开一个 commit。它不是保存按钮。保存只是把文件写到磁盘，而 commit 是把一次项目状态写进 Git 历史。

字幕短句：

- `commit 不是保存按钮`
- `它是历史里的一个对象`

### 12-38s / from-index

> 上一集我们看到，commit 读取的是暂存区。也就是说，Git 不会把你工作区里所有当前内容都提交进去，它会把 Index 里的内容形成一个快照。

字幕短句：

- `commit 读取 Index`
- `Index 形成快照`

### 38-74s / object-model

> Git 内部会把文件内容保存成 blob，把目录结构保存成 tree，再创建一个 commit 对象指向这棵 tree。tree 代表项目结构，blob 代表文件内容，commit 代表这次历史记录。

字幕短句：

- `blob：文件内容`
- `tree：目录结构`
- `commit：历史记录`

### 74-104s / commit-fields

> 一个 commit 不只是快照。它还记录 parent、作者、时间和 message。parent 说明它是从哪个 commit 走来的，message 说明这次为什么要保存。

字幕短句：

- `tree：这次快照`
- `parent：上一次提交`
- `message：为什么提交`

### 104-132s / parent-chain

> 当你连续提交，新的 commit 会指向上一个 commit。C2 知道自己的 parent 是 C1，C1 知道自己的 parent 是 C0。Git 历史就是这样连起来的。

字幕短句：

- `commit 通过 parent 连成历史`
- `历史不是文件夹列表`

### 132-158s / hash-identity

> commit 会有自己的 hash。它不只是一个随机编号，而是由内容和元数据计算出来的身份。快照、parent 或 message 变了，commit 的身份也会变。

字幕短句：

- `hash 是 commit 的身份`
- `内容变，身份变`

### 158-180s / takeaway

> 所以，commit 是一个带身份的历史节点：它指向快照，也指向过去。下一集我们就可以解释，branch 为什么只需要指向某个 commit。

字幕短句：

- `commit 指向快照，也指向过去`
- `下一步：branch 指向 commit`
