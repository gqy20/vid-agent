# EP08 Reset、Revert、Restore - 脚本

## 制作目标

本集解决第八个误解：Git 里的“撤销”不是一个按钮。reset、revert、restore 看起来都能撤销，但它们改变的是不同对象：引用、提交历史、Index 或 Working Tree。

观众看完后应该能说出三句话：

- reset 会移动 HEAD 所在的 branch，并按模式更新 Index / Working Tree。
- revert 不改旧历史，而是新增一个反向提交。
- restore 面向文件内容，不负责移动 branch。

## 官方依据

本集知识依据来自 Pro Git：

- `reset.asc:9-20`：理解 reset / checkout 的方式是三棵树：HEAD、Index、Working Directory。
- `reset.asc:25-29`：HEAD 是当前分支引用的指针，通常表示该分支最后一次提交的快照。
- `reset.asc:53-78`：Index 是预期的下一次提交，Working Directory 是可编辑的工作区。
- `reset.asc:154-168`：reset 第一步移动 HEAD 指向的分支；`--soft` 停在这里。
- `reset.asc:171-182`：mixed 更新 Index，并有取消暂存效果。
- `reset.asc:185-196`：`--hard` 更新 Working Directory，可能销毁数据。
- `reset.asc:202-206`：reset 按顺序重写三棵树并在不同选项处停止。
- `advanced-merging.asc:587-595`：revert merge 会创建新提交来撤消某个 parent 引入的修改。
- `undoing.asc:45-70`：取消暂存文件的基本场景。
- `undoing.asc:99-130`：恢复文件到上次提交状态的基本场景。

## 技术原则

- 主视频使用 Remotion。三棵树状态板是本集主视觉。
- 复用 EP02 的 Working Tree / Index / Repository 三栏语义，新增 HEAD/branch 作为上层指针。
- `reset --hard` 必须使用明确危险提示，且不做轻快装饰动画。
- revert 必须表现为新增提交，不能删除或擦掉旧提交。
- restore 只展示文件层恢复，不混入 branch 移动。

## Remotion / Manim / 素材分工

| 片段 | 使用技术 | 原因 | 本地资产状态 | 输出物 |
|---|---|---|---|---|
| 0-12s hook | Remotion | 抛出撤销不是一个动作 | 已有标题/图组件 | Remotion scene |
| 12-40s three-trees | Remotion | 复用 EP02 状态板 | 已有 `GitStatePanel` | Remotion scene |
| 40-86s reset-modes | Remotion | soft/mixed/hard 是三层停止点 | 需组合三棵树状态 | Remotion scene |
| 86-116s revert | Remotion | 新增反向 commit | 已有 Git graph | Remotion scene |
| 116-146s restore | Remotion | 文件从 source 恢复到目标层 | 需组合文件卡/状态板 | Remotion scene |
| 146-168s choose | Remotion | 选择表 | table + semantic highlights | Remotion scene |
| 168-180s takeaway | Remotion | 极简总结 | minimal state board | Remotion scene |

## 外部图片需求

本集不需要外部图片。reset 三棵树参考 Pro Git，但画面应使用课程状态板重绘。

## 片段总览

| 全局时间 | Scene | 时长 | 目的 | 主技术 | 主视觉 |
|---:|---|---:|---|---|---|
| 0-12s | hook | 12s | 提出撤销到底改什么 | Remotion title | 一个错误提交 |
| 12-40s | three-trees | 28s | 建立 HEAD / Index / Working Tree | GitStatePanel | 三棵树 |
| 40-86s | reset-modes | 46s | 讲 soft / mixed / hard | StateTransitionScene | 三个停止点 |
| 86-116s | revert | 30s | revert 新增反向提交 | GitGraph | C3 后新增 R1 |
| 116-146s | restore | 30s | restore 恢复文件内容 | File cards + state panel | 文件从源复制到目标 |
| 146-168s | choose | 22s | 选择安全命令 | Decision table | reset / revert / restore |
| 168-180s | takeaway | 12s | 收束边界 | Minimal board | 改引用 / 新提交 / 改文件 |

## 旁白草案

### 0-12s / hook

> 第八集，我们讲撤销。但 Git 里的撤销不是一个按钮。你想撤销的，可能是提交历史，也可能是暂存区，也可能只是一个文件。

字幕短句：

- `撤销不是一个动作`
- `先问：要改哪一层？`

### 12-40s / three-trees

> 先把地图摆出来：HEAD 是上一次提交的快照，Index 是下一次提交的准备区，Working Tree 是你正在编辑的文件。不同命令会改不同层。

字幕短句：

- `HEAD：当前提交快照`
- `Index：下一次提交`
- `Working Tree：正在编辑`

### 40-86s / reset-modes

> reset 的第一步，是移动 HEAD 所在的分支。`--soft` 到这里停下。默认 mixed 会继续让 Index 像新的 HEAD，所以它有取消暂存效果。`--hard` 再继续覆盖 Working Tree，这一步会丢掉未保存的工作。

字幕短句：

- `soft：只移动 branch`
- `mixed：再更新 Index`
- `hard：再覆盖 Working Tree`

### 86-116s / revert

> revert 的思路完全不同。它不把旧提交删掉，也不移动历史。它会新增一个提交，用相反的修改抵消前面的提交。所以共享历史里，revert 通常更安全。

字幕短句：

- `revert 新增反向提交`
- `旧历史仍然可见`

### 116-146s / restore

> restore 面向文件。你可以把文件从 HEAD 恢复到 Working Tree，也可以从 Index 取消某些文件状态。它处理文件内容，不负责移动 branch。

字幕短句：

- `restore 改文件层`
- `不移动 branch`

### 146-168s / choose

> 所以选择命令前先问目标：想重写本地提交，用 reset；想撤销已经共享的提交，用 revert；想恢复文件内容，用 restore。

字幕短句：

- `本地历史：reset`
- `共享历史：revert`
- `文件内容：restore`

### 168-180s / takeaway

> 第一季到这里收束：Git 的命令看起来很多，但核心都是在移动指针、写入提交，或者同步三棵树。

字幕短句：

- `reset：改引用和三棵树`
- `revert：写新提交`
- `restore：改文件状态`
