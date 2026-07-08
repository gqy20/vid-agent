# EP01 Git 到底记录什么 - 脚本

## 制作目标

本集解决第一个误解：Git 不是把项目复制成很多文件夹，也不是简单保存一组文件差异。Git 更应该被理解为一个可追溯的快照流，每次 commit 都把项目在某一刻的状态记录下来。

观众看完后应该能说出三句话：

- 版本控制记录的是变化历史，不是随手复制的备份目录。
- Git 的核心模型是快照流。
- commit 是这个快照流里的一个时间点。

## 官方依据

本集知识依据来自 Pro Git，不是自由发挥：

- `about-version-control.asc:4-10`：版本控制用于记录文件内容变化，方便回到特定版本、比较变化和恢复项目。
- `about-version-control.asc:16-18`：复制整个项目目录保存版本简单但容易出错。
- `what-is-git.asc:9-22`：Git 直接记录快照，而非差异比较；每次提交会保存当时全部文件的快照索引。
- `what-is-git.asc:32-44`：Git 多数操作在本地执行，因为本地有完整历史。
- `what-is-git.asc:50-68`：Git 使用哈希保证完整性，并以内容校验和引用数据。

## 技术原则

- 主视频使用 Remotion。原因：这一集需要标题、类比、快照流、终端片段和字幕之间精确同步。
- Manim 优先用于“快照流压缩为时间线”的抽象片段。这个镜头比普通 UI 更接近模型构造，如果本地没有场景，应新增 `SnapshotStreamScene`，而不是临时用静态卡片糊过去。
- 不展示复杂 `.git/objects` 细节。对象模型留给 EP03。
- 不展示 branch/HEAD。只在结尾用一个很轻的预告式问题引出后续。

## Remotion / Manim / 素材分工

| 片段 | 使用技术 | 原因 | 本地资产状态 | 输出物 |
|---|---|---|---|---|
| 0-12s hook | Remotion | 标题、问题句和进度条需要统一课程包装 | 已有 `EpisodeTitleCard`、`QuestionCaption`、`VideoProgress` | Remotion scene |
| 12-34s bad-model | Remotion | 文件夹误解是 UI 隐喻，适合用可控卡片和一次性位移动画 | 需用现有 motion primitives 组合 | Remotion scene |
| 34-64s version-control | Remotion | 三个价值点按旁白节奏逐个出现，字幕同步更重要 | 需组合 `FlowDiagram` 类本地组件，若缺失则先做轻量组件 | Remotion scene |
| 64-96s snapshot-model | Manim + Remotion | 快照流、复用线、节点生成是抽象模型构造，Manim 更适合几何和关系检查 | 需新增 `SnapshotStreamScene` | Manim mp4 + Remotion captions |
| 96-126s local-history | Remotion | 终端输入和本地数据库示意需要和旁白逐帧对齐 | 已有 `TerminalPanel`、`TerminalTyping`、`RepositoryBox` 可组合 | Remotion scene |
| 126-156s integrity | Manim 或 Remotion | 若只讲短 hash 变化，用 Remotion 足够；若要展示内容寻址传播，用 Manim `HashScene` 更好 | 已有 `HashScene`，也可用 Remotion `HashBadge` | 优先 Remotion，必要时 Manim clip |
| 156-180s takeaway | Remotion | 结论和下一集问题属于课程包装 | 已有 `CenterGraph`、字幕、进度条 | Remotion scene |

## 外部图片需求

本集默认不需要网络图片。复制文件夹、快照流、本地历史都可以用自制图形表达。

可选素材：

- Git 官网截图：只在开头需要建立“这是 Git 官方课程”语境时使用。
- Pro Git 原书示意图：不建议直接使用，优先按课程视觉语言重绘，避免风格不统一。

如果使用外部截图，必须放入：

```text
remotion/public/git-course/assets/ep01-what-git-stores/
```

并在 `audit.md` 记录来源和许可。

## 片段总览

| 全局时间 | Scene | 时长 | 目的 | 主技术 | 主视觉 |
|---:|---|---:|---|---|---|
| 0-12s | hook | 12s | 抛出“Git 到底存什么” | Remotion title + minimal file stack | 大标题、混乱备份目录 |
| 12-34s | bad-model | 22s | 否定手动复制目录模型 | Remotion file cards | `project-final-final` 混乱堆叠 |
| 34-64s | version-control | 30s | 建立版本控制的作用 | Remotion timeline | 回退、比较、找责任点 |
| 64-96s | snapshot-model | 32s | 建立 Git 快照流 | Manim `SnapshotStreamScene` + Remotion captions | C0-C1-C2 快照节点 |
| 96-126s | local-history | 30s | 解释为什么 Git 操作快 | Remotion terminal + local database | 本地历史数据库 |
| 126-156s | integrity | 30s | 介绍 hash 的必要性 | Remotion hash pulse | 内容变化导致 hash 变化 |
| 156-180s | takeaway | 24s | 收束到后续课程 | Remotion graph + captions | 快照流变成 commit 链 |

## 旁白草案

### 0-12s / hook

> 第一集，我们先问一个最基础的问题：Git 到底记录了什么？它不是一个神秘命令集合。你每次 commit，Git 都在把项目变成一段可以回看的历史。

字幕短句：

- `Git 到底记录什么？`
- `保存文件，还是保存历史？`

### 12-34s / bad-model

> 很多人第一次做版本管理，是复制文件夹：project、project-final、project-final-2。这个方法看起来简单，但很快就会混乱。你不知道哪个是真的最终版，也很难比较两个版本之间到底差了什么。

字幕短句：

- `复制文件夹不是版本控制`
- `它保存了结果，却丢掉了结构`

### 34-64s / version-control

> 版本控制真正要解决的是三件事：回到过去某个状态，看清两个版本之间的变化，以及知道变化是谁在什么时候做的。Git 做的不是帮你命名备份，而是保存一条可以追踪的项目历史。

字幕短句：

- `回到过去`
- `比较变化`
- `追踪原因`

### 64-96s / snapshot-model

> Git 和很多老式系统最大的不同，是它更像在记录快照。每次 commit，Git 都把当时项目的状态记成一个快照。如果文件没变，它不会重新存一遍，而是指向之前已经保存过的内容。

字幕短句：

- `Git 记录快照流`
- `commit = 某一刻的项目状态`
- `没变的内容可以复用`

### 96-126s / local-history

> 这也是为什么很多 Git 操作很快。查看历史、比较版本、创建提交，大部分时候都只需要读取本地仓库。你的机器上不是只有当前文件，还有完整历史。

字幕短句：

- `完整历史在本地`
- `很多操作不需要网络`

### 126-156s / integrity

> Git 还会给内容计算哈希。内容变了，哈希就变。这样 Git 不是靠文件名猜测版本，而是用内容本身来确认它保存的东西没有被悄悄改坏。

字幕短句：

- `内容决定 hash`
- `hash 让历史可验证`

### 156-180s / takeaway

> 所以，先记住这一层：Git 保存的是一条快照历史。下一集我们再看，一次提交之前，文件为什么要经过工作区、暂存区和仓库这三层。

字幕短句：

- `Git 保存快照历史`
- `下一步：文件进入 commit 前经过哪三层？`
