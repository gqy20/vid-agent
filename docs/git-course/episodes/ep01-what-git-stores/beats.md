# EP01 Git 到底记录什么 - Beats

## 全局约束

- 时长：180 秒。
- 画面主线：从错误模型进入正确模型。
- 同屏叙事层：每个节拍只允许一个主视觉，字幕只保留一句短句。
- 字幕位置：底部安全区，避免遮挡文件卡片、时间线节点和终端。
- 技术边界：Remotion 负责主编排；Manim 输出快照流抽象动画。`snapshot-model` 适合新增 Manim 场景，不应降级成静态卡片。

## 时间线

### 0-12s / hook

目的：让观众立刻进入问题。

画面：

- 0-2s：全屏石白背景，大标题 `Git 到底记录什么？` 居中偏上。
- 2-6s：标题中的 `Git` 微弱高亮，底部出现副句 `不是命令，是历史模型`。
- 6-12s：右下角出现三张极简文件卡：`today`、`yesterday`、`last week`，随后收束成一个问号。

技术：

- `EpisodeTitleCard`
- `QuestionCaption`
- `PositionedMotion`
- `VideoProgress`

审查点：

- 标题独占前 2 秒。
- 文件卡片不进入字幕安全区。
- 不出现 branch、HEAD、refs 等后续概念。

### 12-34s / bad-model

目的：否定“复制文件夹就是版本控制”。

画面：

- 12-18s：文件夹卡片依次出现：`project`、`project-final`、`project-final-final`。
- 18-24s：卡片开始错位堆叠，标签变得难以区分。
- 24-30s：一条细线尝试连接版本，但断开，表示没有明确历史关系。
- 30-34s：错误模型淡出，只保留一句 `保存结果，不等于保存历史`。

技术：

- Remotion `FileStack`
- `StrikeThrough`
- `Callout`

审查点：

- 错位是一次性动作，不循环晃动。
- 文字卡片不能互相遮盖核心标签。
- 红色只用于否定动作，不长期占据主色。

### 34-64s / version-control

目的：建立版本控制的三项价值。

画面：

- 34-42s：水平时间线生成三个节点：`v1`、`v2`、`v3`。
- 42-50s：镜头聚焦 `v1`，显示 `回到过去`。
- 50-58s：`v2` 与 `v3` 之间出现 diff 高亮，显示 `比较变化`。
- 58-64s：节点下方出现作者和时间点，显示 `追踪原因`。

技术：

- `FlowDiagram`
- `TimelineNode`
- `DataPacket`
- `ZoomFocus`

审查点：

- 三个概念不要同时解释，按顺序出现。
- 节点间距 >= 180px。
- 字幕只写关键词，不写长定义。

### 64-96s / snapshot-model

目的：把 Git 的核心模型从“差异列表”转成“快照流”。

画面：

- 64-70s：左侧出现 delta 列表，右侧出现 snapshot 卡片。
- 70-78s：delta 列表淡出，snapshot 卡片成为主视觉。
- 78-88s：C0、C1、C2 三个快照节点依次生成，每个节点短暂展开成项目文件矩阵。
- 88-96s：未变化文件用细线复用到前一个快照，形成 `快照流` 标签。

技术：

- 新增 Manim `SnapshotStreamScene`。
- Remotion 使用 `ManimClip` 合成输出，并负责字幕和进度条。

审查点：

- 不要展示真实文件太多，最多 4 个文件格。
- C0-C1-C2 节点需要向上居中，底部留字幕。
- 复用线颜色使用中性灰，不要抢过 commit 节点。

### 96-126s / local-history

目的：解释本地完整历史。

画面：

- 96-104s：终端全屏输入 `git log --oneline`。
- 104-112s：终端输出三条 commit 记录。
- 112-120s：终端缩小到左侧，本地数据库盒子在右侧打开。
- 120-126s：commit 记录与数据库中的快照节点连线。

技术：

- `TerminalPanel`
- `TerminalTyping`
- `CommandOutput`
- `RepositoryBox`
- `ArrowLine`

审查点：

- 终端输入阶段全屏，右侧内容不要提前出现。
- 输出行最多三条。
- 终端缩小时不使用强阴影。

### 126-156s / integrity

目的：用最小成本说明 hash。

画面：

- 126-134s：一张文件内容卡片生成 hash。
- 134-142s：修改一个字符，hash 字符串整体刷新。
- 142-150s：两个 hash 对比，只有 `内容变化 -> hash 变化`。
- 150-156s：hash 收束到 commit 节点角标。

技术：

- `CodeBlock`
- `HashBadge`
- `LineHighlight`
- `MorphText`

审查点：

- hash 不展示 40 位完整字符串，使用短 hash。
- 不解释 SHA-1 安全性争议，本集只讲内容寻址心智模型。
- 颜色只在变化字符和 hash badge 上使用。

### 156-180s / takeaway

目的：收束并指向 EP02。

画面：

- 156-166s：C0-C1-C2 快照流居中放大。
- 166-174s：三句结论依次出现：`记录历史`、`形成快照`、`本地可查`。
- 174-180s：下一集问题淡入：`文件进入 commit 前，经过哪三层？`

技术：

- `CenterGraph`
- `DefinitionCard`
- `Outro` 的极简变体，不使用下集预告板。

审查点：

- 不要做“下集预告”模块，只保留问题句。
- 片尾文字少于 30 个中文字。
- 进度条走满但不抢主视觉。
