# EP04 Branch 只是一个指针 - 脚本

## 制作目标

本集解决一个具体误解：`git branch feature` 不是复制一份项目目录，也不是复制一份提交历史。它只是创建一个新的 ref 名字，让这个名字指向当前 commit。

观众看完后应该能说出三句话：

- branch 是 ref，不是目录副本。
- `git branch feature` 会让 `feature` 和 `main` 暂时指向同一个 commit。
- 切到 `feature` 后继续提交，移动的是 `feature` 指针，`main` 停在原来的 commit。

## 技术原则

- 主视频使用 Remotion。原因：这一集重点是命令、状态变化、字幕和 Git 图之间的因果关系，需要精确控制时间线和组件状态。
- 不使用 Manim 做主线。原因：这里不是数学推导或复杂原理，而是 Git 状态关系演示。Manim 可以用于后续 Git DAG / object model / three-way merge。
- Git 图形使用 SVG / React 组件。commit、branch、HEAD、ref 写入都必须可审计，组件需要输出稳定的 `data-audit-id`。
- 所有时间以秒写入脚本，以帧执行。Remotion 中统一使用 `seconds(...)` 转换。

## 片段总览

| 全局时间 | Scene | 时长 | 目的 | 主技术 | 主视觉 |
|---:|---|---:|---|---|---|
| 0-12s | hook | 12s | 抛出问题：分支到底改变什么 | Remotion SVG + 标题动画 | 大标题、极简 commit 链 |
| 12-30s | mental-model | 18s | 纠正“复制目录”误解，建立 ref 模型 | Remotion SVG + Git motion components | 工作区误解、commit 链、ref 写入 |
| 30-48s | terminal | 18s | 让观众看到真实命令序列 | TerminalFocusScene | 全屏终端 |
| 48-70s | branch-write | 22s | 解释 `git branch feature` 写入 ref | CommandPill + GitGraph + RefWriteBar | 命令、当前图、ref 行 |
| 70-98s | branch-result | 28s | 显示 feature 也落到 C2 | GitGraph + MiniRefLine | main/feature 同指 C2 |
| 98-122s | switch | 24s | 解释 HEAD 从 main 移到 feature | GitGraph headMotion | HEAD 运动 |
| 122-154s | commit | 32s | 新 commit 后 feature 前进，main 不动 | GitGraph branchMotion | C3 生成、feature 前进 |
| 154-168s | compare | 14s | 对比创建后与提交后的差异 | 双 GitGraph | 左右对比 |
| 168-180s | takeaway | 12s | 收束概念 | GitGraph + 结论文字 | branch 是会移动的名字 |

## 旁白草案

### 0-12s / hook

> 第四集，我们只讲一个问题：branch 到底是什么？如果 branch 只是一条命令，为什么创建它几乎是瞬间完成的？看起来像是开了一份新项目，但 Git 真正改变的东西，比这小得多。

字幕短句：

- `Branch 只是一个指针`
- `如果只是一个名字，切换分支到底改变了什么？`

### 12-30s / mental-model

> 先排除一个常见误解：创建分支不是复制一份目录。Git 不会把 main 工作区完整克隆成 feature 工作区。真正发生的是，Git 在 refs 里多写一个名字。当前历史是 C0、C1、C2，main 指向 C2。当你创建 feature，Git 只是写下：feature 也指向 C2。

字幕短句：

- `不是复制一份目录`
- `真正发生的是：多写一个名字`
- `branch 是一个 ref。它可以和 main 指向同一个 commit。`

### 30-48s / terminal

> 现在看真实命令。我们从 main 开始，创建 feature，切换过去，再提交一次。你需要盯住的不是文件夹，而是三个名字：main、feature、HEAD。

字幕短句：

- `盯住 main、feature、HEAD`
- `命令只是触发状态变化`

### 48-70s / branch-write

> 执行 `git branch feature`。Git 做的核心动作，是写入一条 ref：`refs/heads/feature -> C2`。这条记录的意思是，feature 这个名字指向 C2。

字幕短句：

- `git branch 写入一条 ref`
- `feature -> C2`

### 70-98s / branch-result

> 写入以后，画面上多了一个 feature 标签。注意，它没有生成新的 commit，也没有复制 C0 到 C2。main 和 feature 只是两个名字，同时指向同一个 C2。

字幕短句：

- `feature 落到 C2`
- `main 仍然也在 C2`
- `两个名字，同一个 commit`

### 98-122s / switch

> 接着执行 `git switch feature`。这一步也没有改变提交历史。改变的是 HEAD：HEAD 从 main 移到 feature。也就是说，你现在站在 feature 这个名字上继续工作。

字幕短句：

- `HEAD 从 main 滑到 feature`
- `commit 没变，当前分支变了`

### 122-154s / commit

> 现在在 feature 上提交一次。新的 commit C3 出现。因为 HEAD 在 feature 上，所以前进的是 feature 指针。main 不动，仍然停在 C2。到这里，两个分支才真正分开。

字幕短句：

- `C3 生成`
- `feature 前进到 C3`
- `main 停在 C2`

### 154-168s / compare

> 对比一下：刚创建分支时，main 和 feature 指向同一个 commit。提交以后，feature 前进，main 停留。分支不是复制出来的一条线，而是指向 commit 的名字。

字幕短句：

- `刚创建：两个名字，同一个 commit`
- `提交后：feature 前进，main 停留`

### 168-180s / takeaway

> 所以记住这一句：branch 是名字，名字会移动。创建分支是新增名字，切换分支是移动 HEAD，提交是让当前 branch 前进。

字幕短句：

- `Branch 是名字，名字会移动。`
- `创建：新增名字`
- `切换：HEAD 改指向`
- `提交：当前 branch 前进`
