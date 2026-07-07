# EP03 Commit 不是保存按钮 - Beats

## 全局约束

- 时长：180 秒。
- 主视觉：commit 对象模型。
- 同屏叙事层：对象模型阶段不显示终端；终端只作为触发入口。
- 字幕：每条最多 16 个中文字，避免遮挡对象连线。
- Manim：只负责对象关系动画，不负责课程标题、字幕和进度条。

## 时间线

### 0-12s / hook

目的：否定保存按钮误解。

画面：

- 0-2s：大标题 `Commit 不是保存按钮`。
- 2-6s：保存图标出现，被替换成 commit 节点。
- 6-12s：commit 节点下方出现短句：`它是历史里的对象`。

技术：

- `EpisodeTitleCard`
- `QuestionCaption`
- `CommitNode`
- `VideoProgress`

审查点：

- 不使用大型软盘拟物图，保持简约。
- 标题前 2 秒独占画面。

### 12-38s / from-index

目的：承接 EP02，说明 commit 来源于 Index。

画面：

- 12-20s：三层面板出现，Working Tree 弱化，Index 高亮。
- 20-30s：Index 中的文件卡收束成一个 snapshot tile。
- 30-38s：snapshot tile 进入 commit 节点。

技术：

- `GitStatePanel`
- `StagingArea`
- `FileMove`
- `CommitNode`

审查点：

- 必须弱化 Working Tree，避免误解 commit 读取当前工作区。
- snapshot tile 不应遮挡 Index 标题。

### 38-74s / object-model

目的：展示 blob/tree/commit。

画面：

- 38-48s：三个文件内容块变成三个 blob。
- 48-58s：tree 对象出现，连接文件名到 blob。
- 58-68s：commit 对象出现，箭头指向 tree。
- 68-74s：整体缩放成一个稳定对象模型。

技术：

- 升级 Manim `GitObjectModelScene`，方向固定为 `commit -> tree -> blob`。
- Remotion 使用 `ManimClip` 合成，并负责字幕、进度条和章节包装。

审查点：

- 箭头必须清楚表达方向：commit -> tree -> blob。
- blob/tree/commit 标签字号统一。
- Manim 底色必须匹配 `canvas.base`。

### 74-104s / commit-fields

目的：解释 commit 字段。

画面：

- 74-82s：commit object card 放大。
- 82-90s：`tree` 字段高亮，箭头指向 snapshot。
- 90-96s：`parent` 字段高亮，箭头指向 C0。
- 96-104s：`author`、`time`、`message` 以小字段出现。

技术：

- `DefinitionCard`
- `LineHighlight`
- `ArrowLine`
- `CommitObjectCard`

审查点：

- 字段卡片最多显示 5 行。
- author/time/message 不展开长文本。
- parent 箭头不穿过字段文字。

### 104-132s / parent-chain

目的：展示 commit 历史。

画面：

- 104-112s：C0 出现。
- 112-120s：C1 出现，parent 箭头指向 C0。
- 120-128s：C2 出现，parent 箭头指向 C1。
- 128-132s：镜头停顿，显示 `parent chain`。

技术：

- 新增 Manim `CommitParentChainScene`，优先用于 parent 指针方向和几何检查。
- Remotion `GitGraph` 只作为简单 fallback，不承担对象关系解释。
- Remotion 使用 `ManimClip` 合成字幕。

审查点：

- 箭头方向要一致，不能让观众误以为历史向回生成。
- commit 间距 >= 220px。
- 只生成一次，不来回晃动。

### 132-158s / hash-identity

目的：说明 hash 是身份。

画面：

- 132-140s：C1 展开，显示短 hash `a13f9c2`。
- 140-148s：message 轻微修改，hash 变化为 `b82d41e`。
- 148-158s：两个 commit identity 对比，显示 `不是重命名，是新身份`。

技术：

- Manim `HashScene` 表达内容或 message 改变导致身份改变。
- Remotion 使用 `ManimClip`、`HashBadge` 和字幕做结论合成。

审查点：

- 不展示完整 40 位 hash。
- 不讲 SHA-1 碰撞问题。
- hash 变化只动一次。

### 158-180s / takeaway

目的：收束并连接 EP04。

画面：

- 158-168s：commit object 收束为 C2 节点。
- 168-174s：一句结论：`commit 指向快照，也指向过去`。
- 174-180s：main 标签轻轻落到 C2，提示下一集 branch。

技术：

- `CenterGraph`
- `CommitNode`
- `BranchLabel`
- `ArrowLine`

审查点：

- main 标签只是铺垫，不解释 branch。
- 不能出现 HEAD。
- 片尾不使用下集预告板。
