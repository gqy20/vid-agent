# EP05 HEAD 是什么 - 脚本

## 制作目标

本集解决第五个误解：HEAD 不是“最新版本”的别名，也不是一个独立分支。HEAD 表示当前位置；通常它是一个 symbolic reference，指向当前 branch，当前 branch 再指向 commit。

观众看完后应该能说出三句话：

- HEAD 通常指向当前 branch。
- `git switch` 改变 HEAD 指向哪个 branch。
- `git commit` 会让 HEAD 所在的 branch 前进。

## 官方依据

本集知识依据来自 Pro Git：

- `nutshell.asc:77-79`：HEAD 是特殊指针，指向当前所在的本地分支。
- `nutshell.asc:111-114`：切换分支后 HEAD 指向新的分支。
- `nutshell.asc:125-140`：HEAD 所在分支会随提交前进，检出分支也会恢复工作目录快照。
- `refs.asc:73-83`：HEAD 文件通常是 symbolic reference；detached HEAD 时可能直接包含对象 SHA-1。
- `refs.asc:85-101`：`.git/HEAD` 内容会随 checkout / switch 更新。
- `refs.asc:101-118`：commit 使用 HEAD 指向的引用来设置 parent，也可用 `git symbolic-ref` 查看和设置。

## 技术原则

- 主视频使用 Remotion。HEAD 的讲解需要和 refs、branch pointer、终端命令精确同步。
- 不使用 Manim 做主线。HEAD 是引用关系，不是复杂几何或对象推导。
- 图形必须保持两级指向：`HEAD -> branch -> commit`。只有 detached HEAD 边界段允许 `HEAD -> commit`。
- 复用 `CenterGraph`、`GitGraph`、`MiniRefLine`、`TerminalFocusScene`、`CommandPill`。

## Remotion / Manim / 素材分工

| 片段 | 使用技术 | 原因 | 本地资产状态 | 输出物 |
|---|---|---|---|---|
| 0-12s hook | Remotion | 标题和最小指针链 | 已有 Git 图组件 | Remotion scene |
| 12-34s symbolic-ref | Remotion | `.git/HEAD` 文件内容和指针链同步 | 需组合文件卡/RefLine | Remotion scene |
| 34-56s terminal | Remotion | 命令输入聚焦 | 已有 `TerminalFocusScene` | Remotion scene |
| 56-88s switch | Remotion | HEAD 从 main 移到 feature | 已有 `GitGraph` headMotion | Remotion scene |
| 88-120s commit-current | Remotion | 当前分支前进 | 已有 branch motion 模式 | Remotion scene |
| 120-156s detached | Remotion | 展示边界状态 | 需新增 detached 状态配置 | Remotion scene |
| 156-180s takeaway | Remotion | 极简总结 | 已有课程布局 | Remotion scene |

## 外部图片需求

本集不需要外部图片。`.git/HEAD`、branch ref、commit graph 都应使用课程组件绘制。

## 片段总览

| 全局时间 | Scene | 时长 | 目的 | 主技术 | 主视觉 |
|---:|---|---:|---|---|---|
| 0-12s | hook | 12s | 抛出 HEAD 是当前位置 | Remotion SVG + title | `HEAD -> main -> C2` |
| 12-34s | symbolic-ref | 22s | 建立 `.git/HEAD` symbolic ref 模型 | File card + GitGraph | `.git/HEAD` 和图同步 |
| 34-56s | terminal | 22s | 展示 switch / commit 命令 | TerminalFocusScene | 全屏终端 |
| 56-88s | switch | 32s | `git switch feature` 改变 HEAD | GitGraph headMotion | HEAD 从 main 到 feature |
| 88-120s | commit-current | 32s | commit 让当前分支前进 | GitGraph branchMotion | feature 前进，main 不动 |
| 120-156s | detached | 36s | 展示 HEAD 直接指向 commit 的边界 | GitGraph + warning panel | detached HEAD |
| 156-180s | takeaway | 24s | 收束三条规则 | CenterGraph + summary | 三条短结论 |

## 旁白草案

### 0-12s / hook

> 第五集，我们只讲 HEAD。你经常在 log 里看到它，但 HEAD 不是一个新分支。它回答的是：我现在站在哪里？

字幕短句：

- `HEAD 表示当前位置`
- `它不是另一个 branch`

### 12-34s / symbolic-ref

> 通常情况下，HEAD 指向当前分支。`.git/HEAD` 里写的不是某个文件版本，而是一条引用：`ref: refs/heads/main`。这意味着 HEAD 指向 main，main 再指向当前 commit。

字幕短句：

- `.git/HEAD -> refs/heads/main`
- `HEAD -> main -> C2`

### 34-56s / terminal

> 现在看两条命令。先从 main 切到 feature，再提交一次。整个过程里，请只盯住 HEAD 和当前分支。

字幕短句：

- `盯住 HEAD`
- `切换改变当前位置`

### 56-88s / switch

> 执行 `git switch feature`。commit 图没有新增节点，main 也没有移动。改变的是 HEAD：它从 main 指向 feature。你现在站在 feature 上。

字幕短句：

- `commit 没变`
- `HEAD 从 main 到 feature`

### 88-120s / commit-current

> 接着提交一次。新的 C3 出现。因为 HEAD 正在 feature 上，所以前进的是 feature。main 仍然停在 C2。

字幕短句：

- `HEAD 在 feature 上`
- `feature 前进到 C3`
- `main 停在 C2`

### 120-156s / detached

> 还有一种特殊情况：你可以直接检出某个 commit。此时 HEAD 不再指向 branch，而是直接指向 commit，这叫 detached HEAD。它适合临时查看历史，但不适合作为长期工作位置。

字幕短句：

- `detached HEAD：HEAD 直接指向 commit`
- `适合查看，不适合作为长期工作位置`

### 156-180s / takeaway

> 记住这条链：HEAD 指向当前分支，当前分支指向 commit。switch 改 HEAD，commit 推进 HEAD 所在的分支。

字幕短句：

- `HEAD -> branch -> commit`
- `switch：改 HEAD`
- `commit：推进当前 branch`
