# EP02 工作区、暂存区、仓库 - Beats

## 全局约束

- 时长：180 秒。
- 主视觉：三层状态面板。
- 同屏叙事层：命令输入时只看终端；状态变化时只看三层面板。
- 字幕：底部短句，优先解释当前动作，不复述屏幕标题。
- 组件沉淀：本集要产出后续 Git、Linux、Docker 课程可复用的状态流转组件。

## 时间线

当前规范分段输出：

| Scene | 时间段 | 输出文件 | 状态 |
|---|---:|---|---|
| hook | 0-12s | `remotion/renders/git-course/ep02-working-tree-index-repo/renders/current/scenes/01_hook.mp4` | 已生成 |
| three-areas | 12-38s | `remotion/renders/git-course/ep02-working-tree-index-repo/renders/current/scenes/02_three-areas.mp4` | 已生成 |
| modify | 38-68s | `remotion/renders/git-course/ep02-working-tree-index-repo/renders/current/scenes/03_modify.mp4` | 已生成 |
| add | 68-104s | `remotion/renders/git-course/ep02-working-tree-index-repo/renders/current/scenes/04_add.mp4` | 已生成 |
| edit-after-add | 104-134s | `remotion/renders/git-course/ep02-working-tree-index-repo/renders/current/scenes/05_edit-after-add.mp4` | 已生成 |
| commit | 134-164s | `remotion/renders/git-course/ep02-working-tree-index-repo/renders/current/scenes/06_commit.mp4` | 已生成 |
| takeaway | 164-180s | `remotion/renders/git-course/ep02-working-tree-index-repo/renders/current/scenes/07_takeaway.mp4` | 已生成 |

### 0-12s / hook

目的：建立问题。

画面：

- 0-2s：大标题 `文件不是直接进入 commit`。
- 2-6s：文件卡片从编辑器位置飞出，停在三个半透明区域之间。
- 6-12s：问题句出现：`git add 到底做了什么？`

技术：

- `EpisodeTitleCard`
- `QuestionCaption`
- `FileMove`
- `VideoProgress`

审查点：

- 标题前 2 秒独占画面。
- 文件卡不要挡住进度条。

### 12-38s / three-areas

目的：建立 Working Tree / Index / Repository 三层。

画面：

- 12-18s：三个区域从左到右生成，只有英文名。
- 18-26s：每层出现一句中文解释。
- 26-38s：文件卡 `app.js` 出现在 Working Tree，另外两层保持空。

技术：

- `GitStatePanel`
- `WorkingTree`
- `StagingArea`
- `RepositoryBox`

审查点：

- 三个区域宽度统一。
- 中文解释不超过 10 个字。
- 上方留白不超过画面高度 18%。

### 38-68s / modify

目的：展示 modified 状态。

画面：

- 38-46s：CodeBlock 局部出现，新增一行代码。
- 46-54s：文件卡变成 `modified` 状态，边框使用 workingTree 色。
- 54-68s：Index 和 Repository 轻微变暗，强调变化还没进去。

技术：

- `CodeBlock`
- `LineHighlight`
- `FileMove`
- `GitStatePanel`

审查点：

- 代码只展示 4-6 行。
- `modified` 标签不和文件名重叠。
- 面板变暗不能让文字不可读。

### 68-104s / add

目的：展示 `git add` 把当前内容放入 Index。

画面：

- 68-76s：终端全屏输入 `git add app.js`。
- 76-84s：终端缩小，文件卡从 Working Tree 复制一份进入 Index。
- 84-96s：Index 中的文件卡标记为 `staged v1`。
- 96-104s：旁边出现解释：`add = 选择这份内容`。

技术：

- `TerminalPanel`
- `TerminalTyping`
- `FileMove`
- `CommandStep`
- `Callout`

审查点：

- 终端输入阶段不要显示完整三层解释文字。
- 文件进入 Index 使用一次性移动，不循环。
- `staged v1` 与文件卡边界至少 12px。

### 104-134s / edit-after-add

目的：解释 add 后继续编辑的细节。

画面：

- 104-112s：工作区文件继续新增一行，变成 `working v2`。
- 112-122s：Index 保持 `staged v1`，二者分屏高亮。
- 122-134s：出现 `git status -s` 小输出：`MM app.js`。

技术：

- `CodeDiff`
- `CompareTable`
- `TerminalPanel` compact mode
- `LineHighlight`

审查点：

- `v1` 和 `v2` 标签要明显但不花。
- `MM app.js` 输出只作为证据，不成为主视觉。
- 不能让工作区和暂存区文件卡物理重叠。

### 134-164s / commit

目的：展示 commit 读取 Index 并写入 Repository。

画面：

- 134-142s：终端输入 `git commit -m "update app"`。
- 142-152s：Index 文件卡收束成快照节点 C1。
- 152-164s：C1 进入 Repository，Working Tree 仍显示未提交的 v2 差异。

技术：

- `TerminalTyping`
- `RepositoryBox`
- `CommitNode`
- `DataPacket`

审查点：

- commit 形成的是 Index 内容，不是 Working Tree 当前内容。
- 需要明确保留 v2 未提交这个细节。
- C1 节点不要和 Repository 标题重叠。

### 164-180s / takeaway

目的：收束三层流程。

画面：

- 164-172s：三层压缩成一条流程：`Working Tree -> Index -> Repository`。
- 172-180s：下一集问题：`commit 里面到底有什么？`

技术：

- `FlowDiagram`
- `ArrowLine`
- `DefinitionCard`

审查点：

- 不使用下集预告板。
- 只保留一个问题句。
- 进度条与箭头不重叠。
