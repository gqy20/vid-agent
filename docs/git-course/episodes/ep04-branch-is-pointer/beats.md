# EP04 Branch 只是一个指针 - Beat Sheet

本文件是制作级脚本。它不只是描述“讲什么”，还描述每个时间段的画面、动画、组件、状态变化和审查点。

时间使用全局秒。括号内为 scene 内局部秒。

## 全局约束

- 分辨率：1920x1080。
- FPS：30。
- 主背景：`COLOR.canvas.base`。
- 语义色：`main = COLOR.git.main`，`feature = COLOR.git.feature`，`HEAD = COLOR.git.head`。
- 每个节拍只保留一个主视觉。终端、Git 图、refs 表、字幕不能同时抢焦点。
- branch 指向 commit 必须使用箭头，不只用线。
- 字幕位于底部安全区，不能遮挡 commit、branch、HEAD、终端输入。
- 动画不能来回循环。所有动作应是“发生一次，然后停住”。

## 0-12s / hook

目标：把标题从课程包装快速切到问题，让观众进入“branch 是什么”的认知任务。

主技术：Remotion `AbsoluteFill`、SVG、`interpolate`。

关键组件：

- `CourseLayout`
- `BranchPointerHookGraph`
- SVG commit nodes
- SVG arrows for `main` / `HEAD`
- `VideoProgress`

| 时间 | 画面 | 动作 | 技术 | 状态 | 旁白/字幕 | 审查 |
|---:|---|---|---|---|---|---|
| 0.0-0.5 | 居中大标题 `4. Branch 只是一个指针` | 标题淡入，`Branch` 轻微上移 | CSS transform + opacity | 无 | 第四集，只讲 branch 是什么 | 标题独占首屏 |
| 0.5-1.0 | `Branch` 局部强调 | 下划线从左向右展开 | inline span scaleX | 无 | branch 不是一份项目副本 | 不使用大面积装饰色 |
| 1.0-2.0 | 标题保持 | 让观众读完标题 | hold | 无 | 创建分支为什么这么快？ | 画面不要提前塞图 |
| 2.0-2.5 | 标题消失，commit 图进入 | 标题淡出，图从上方进入 | opacity + translateY | commits preparing | 先看当前历史 | 标题必须完全退出 |
| 2.5-4.8 | C0、C1、C2 | commit 节点依次出现，连线依次绘制 | SVG circle + line interpolation | C0 -> C1 -> C2 | 当前有三个提交 | 节点居中，上方留白合理 |
| 5.7-6.6 | main 指向 C2 | main 标签从右侧落到 C2 | SVG group translate | main=C2 | main 指向当前 commit | 箭头/标签不压 C2 |
| 6.3-7.6 | C2 被强调 | C2 外圈短暂 pulse | SVG ring radius/opacity | main=C2 | 当前提交是 C2 | pulse 一次，不循环 |
| 8.0-8.8 | HEAD 出现 | HEAD 从下方指向 main | SVG path + label | HEAD -> main | HEAD 说明当前站在哪里 | HEAD 不遮挡 main |
| 9.5-12.0 | 底部问题句 | 问题淡入，图保持 | subtitle div | main=C2, HEAD=main | 如果只是一个名字，切换分支到底改变了什么？ | 字幕与图保持安全距离 |

## 12-30s / mental-model

目标：先否定“复制目录”，再建立“写入 ref”的正确模型。

主技术：Remotion SVG + React motion components。这里不使用 Manim，因为要和字幕、Git 状态、组件审计紧密同步。

关键组件：

- `MotionTitle`
- `WorkingTreeCard`
- `SvgArrowLine`
- `StrikeThrough`
- `CommitChain`
- `BranchTag`
- `ArrowLine`
- `BranchRefMentalModelGraph`
- `RefWrite`
- `TypewriterText`

| 时间 | 局部时间 | 画面 | 动作 | 技术 | 状态 | 旁白/字幕 | 审查 |
|---:|---:|---|---|---|---|---|---|
| 12.0-12.5 | 0.0-0.5 | 标题 `不是复制一份目录` | 标题淡入 | `MotionTitle` | 无 | 先排除一个误解 | 标题单独占画面 |
| 12.3-13.0 | 0.3-1.0 | 左侧 main 工作区卡片 | 卡片淡入并稳定 | `WorkingTreeCard` | fake main workspace | 创建分支不是复制一份目录 | 卡片位置不要太低 |
| 13.1-14.8 | 1.1-2.8 | 右侧 feature 工作区？ | 从右侧滑入，透明度较低 | `WorkingTreeCard` + translateX | fake feature workspace | 很多人以为会复制一份 feature | 两卡间距清楚 |
| 14.8-15.5 | 2.8-3.5 | 否定复制模型 | 红色斜线划过，文字 `不是这样` | `StrikeThrough` + SVG path draw | reject copy model | 但 Git 不是这样做的 | 斜线不能挡住两个卡标题 |
| 15.5-17.2 | 3.5-5.2 | 工作区模型退出 | 卡片缩小淡出，正确标题进入 | opacity + scale + `MotionTitle` | transition | 真正发生的是：多写一个名字 | 不留下半透明残影 |
| 17.2-19.2 | 5.2-7.2 | C0-C1-C2 提交链 | commit 和连线依次生成 | `CommitChain` + `DrawLine` | commits C0,C1,C2 | 当前历史是 C0 到 C2 | 节点不靠近标题 |
| 19.5-20.5 | 7.5-8.5 | main 指向 C2 | main 标签落到 C2，下方箭头指向 C2 | `BranchTag` + `ArrowLine` | main=C2 | main 指向 C2 | 箭头明确，标签与 C2 间距 >= 44px |
| 21.0-22.4 | 9.0-10.4 | ref 写入面板 | 面板到可读阶段才出现，逐字输入 | `RefWrite` + `TypewriterText` | feature=C2 pending | 写入 `refs/heads/feature -> C2` | 不允许 opacity 0.02-0.18 的 ghost 残影 |
| 22.2-23.6 | 10.2-11.6 | feature 标签落到 C2 | feature 从上方落下，箭头指向 C2 | `BranchTag` + `ArrowLine` | feature=C2 | feature 也指向 C2 | feature 与 main 箭头不混淆 |
| 24.7-25.4 | 12.7-13.4 | ref 面板退出 | 面板淡出，图保持 | opacity | main=C2, feature=C2 | 这不是复制历史 | 面板完全退出后再总结 |
| 25.4-30.0 | 13.4-18.0 | 总结画面 | 字幕进入，C2 pulse 一次 | subtitle + `FocusPulse` | main=C2, feature=C2 | branch 是 ref，可以和 main 指向同一个 commit | 字幕不遮挡图；箭头可见 |

## 30-48s / terminal

目标：给出真实命令序列，但不让终端长期压过 Git 图。

主技术：`TerminalFocusScene`。

关键组件：

- `AnimatedTerminal`
- `TerminalFocusScene`
- `EP04_TERMINAL`

| 时间 | 局部时间 | 画面 | 动作 | 技术 | 状态 | 旁白/字幕 | 审查 |
|---:|---:|---|---|---|---|---|---|
| 30.0-32.0 | 0.0-2.0 | 全屏终端 | 终端进入，prompt 在 main | `TerminalFocusScene` | main=C2, HEAD=main | 现在看真实命令 | 终端居中，不要阴影过重 |
| 32.0-36.0 | 2.0-6.0 | `git branch feature` | 命令逐字输入 | `AnimatedTerminal` typing | command typed | 创建 feature | 输入时不要显示 refs 表 |
| 36.0-39.0 | 6.0-9.0 | 命令执行后停顿 | 光标停留，输出极少 | terminal hold | feature=C2 | 这条命令几乎没有输出 | 不要塞解释文字 |
| 39.0-43.0 | 9.0-13.0 | `git switch feature` | 第二条命令输入 | typing | HEAD moving | 切换当前分支 | 输入阶段只看终端 |
| 43.0-48.0 | 13.0-18.0 | `git commit ...` 铺垫 | 第三条命令出现或准备 | typing/hold | ready for commit | 接下来提交会让当前分支前进 | 结尾不要突然切断 |

## 48-70s / branch-write

目标：把 `git branch feature` 翻译成“写入 ref”。

主技术：Remotion layout + `GitGraph` + `RefWriteBar`。

| 时间 | 局部时间 | 画面 | 动作 | 技术 | 状态 | 旁白/字幕 | 审查 |
|---:|---:|---|---|---|---|---|---|
| 48.0-50.0 | 0.0-2.0 | 命令胶囊 | `git branch feature` 出现 | `CommandPill` | main=C2 | 执行 git branch feature | 命令不要占据主图中心 |
| 50.0-52.8 | 2.0-4.8 | base Git 图 | C0-C2 + main 保持 | `CenterGraph` + `GitGraph` | main=C2 | 当前 main 指向 C2 | 图居中 |
| 52.8-55.0 | 4.8-7.0 | ref 写入条 | 高亮条从左向右填充 | `RefWriteBar` | feature ref writing | Git 写入一条 ref | ref 行文字必须可读 |
| 55.0-61.0 | 7.0-13.0 | ref 行稳定 | `refs/heads/feature -> C2` 保持 | `RefWriteBar` hold | feature=C2 | feature 这个名字指向 C2 | 不要同时高亮太多元素 |
| 61.0-70.0 | 13.0-22.0 | 解释标签 | 侧边说明出现 | `SideLabel` | feature=C2 | 这不是复制 commit | 侧边文字不压图 |

## 70-98s / branch-result

目标：feature 作为标签出现在图上，并与 main 同指 C2。

主技术：`GitGraph` 静态状态切换 + 轻量文字说明。

| 时间 | 局部时间 | 画面 | 动作 | 技术 | 状态 | 旁白/字幕 | 审查 |
|---:|---:|---|---|---|---|---|---|
| 70.0-71.3 | 0.0-1.3 | 命令胶囊 | 保持 `git branch feature` | `CommandPill` | main=C2 | 命令执行完成 | 不重复解释命令 |
| 71.3-73.9 | 1.3-3.9 | feature 出现 | GitGraph 从 base 切到 withFeature | `GitGraph` state change | main=C2, feature=C2 | feature 落到 C2 | 切换不能突兀，后续应改为 motion |
| 74.0-80.0 | 4.0-10.0 | ref 小窗 | `feature -> C2` 出现 | `MiniRefLine` | feature=C2 | ref 已经写好 | 小窗不遮挡主图 |
| 80.0-90.0 | 10.0-20.0 | 两个 SideLabel | feature/main 两处说明 | `SideLabel` | main=C2, feature=C2 | 两个名字，同一个 commit | 避免四层信息拥挤 |
| 90.0-98.0 | 20.0-28.0 | 底部总结 | 总结句出现 | body text | main=C2, feature=C2 | 创建分支不是复制历史 | 底部文字在安全区 |

## 98-122s / switch

目标：只让 HEAD 成为主角，解释切换分支不改 commit 历史。

主技术：`GitGraph` 的 `headMotion`。

| 时间 | 局部时间 | 画面 | 动作 | 技术 | 状态 | 旁白/字幕 | 审查 |
|---:|---:|---|---|---|---|---|---|
| 98.0-101.7 | 0.0-3.7 | 命令胶囊 + 图 | `git switch feature` 出现 | `CommandPill` + `CenterGraph` | main=C2, feature=C2, HEAD=main | 切换 feature | 命令出现后图形稍后动 |
| 101.7-105.9 | 3.7-7.9 | HEAD 移动 | HEAD 从 main 滑到 feature | `headMotion` | HEAD -> feature | 改变的是当前分支 | 只高亮 HEAD |
| 106.0-112.0 | 8.0-14.0 | `.git/HEAD` 小窗 | `HEAD -> feature` 出现 | `MiniRefLine` | HEAD=feature | HEAD 指向 feature | 小窗不要压 branch 标签 |
| 112.0-122.0 | 14.0-24.0 | 解释保持 | 侧边说明稳定 | `SideLabel` | commits unchanged | commit 没变，当前所在分支变了 | 不要让 main/feature 抢过 HEAD |

## 122-154s / commit

目标：新 commit 生成后，只有当前 branch `feature` 前进。

主技术：`GitGraph` 的 `branchMotion`。

| 时间 | 局部时间 | 画面 | 动作 | 技术 | 状态 | 旁白/字幕 | 审查 |
|---:|---:|---|---|---|---|---|---|
| 122.0-125.5 | 0.0-3.5 | 命令胶囊 | `git commit -m ...` 出现 | `CommandPill` | HEAD=feature | 在 feature 上提交 | 命令不要过长溢出 |
| 125.5-128.2 | 3.5-6.2 | C3 生成 | C3 从右侧出现 | `GitGraph` state change | C3 created | 新 commit C3 出现 | C3 出现要有生成感 |
| 128.3-131.5 | 6.3-9.5 | feature 前进 | feature 从 C2 滑到 C3 | `branchMotion` | feature=C3 | feature 前进 | main 必须留在 C2 并停顿 |
| 131.5-139.0 | 9.5-17.0 | ref 更新 | `feature -> C3` 出现 | `MiniRefLine` | feature=C3 | ref 更新到 C3 | 小窗不挡分支图 |
| 139.0-154.0 | 17.0-32.0 | 分叉解释 | feature/main 两侧说明 | `SideLabel` + body text | main=C2, feature=C3 | 这就是分叉 | 主视觉仍是图，不是文字 |

## 154-168s / compare

目标：用左右对比确认“创建后”和“提交后”的差异。

主技术：两个 `GitGraph`。

| 时间 | 局部时间 | 画面 | 动作 | 技术 | 状态 | 旁白/字幕 | 审查 |
|---:|---:|---|---|---|---|---|---|
| 154.0-156.0 | 0.0-2.0 | 标题 | `同一个历史，不同的名字` | hero text | compare | 对比一下 | 标题不要太大压图 |
| 156.0-162.0 | 2.0-8.0 | 左图 | 创建后状态 | `GitGraph` withFeature | main=C2, feature=C2 | 刚创建：两个名字同一 commit | 左右图尺寸一致 |
| 162.0-168.0 | 8.0-14.0 | 右图 | 提交后状态 | `GitGraph` committed | main=C2, feature=C3 | 提交后：feature 前进 | 两图说明不重叠 |

## 168-180s / takeaway

目标：用一句话收束，并复现三个状态变化。

主技术：`GitGraph` 状态按时间切换。

| 时间 | 局部时间 | 画面 | 动作 | 技术 | 状态 | 旁白/字幕 | 审查 |
|---:|---:|---|---|---|---|---|---|
| 168.0-171.9 | 0.0-3.9 | 结论文字 + 图 | withFeature 状态 | `GitGraph` | feature=C2 | 创建 feature：新增名字 | 结论文字不遮图 |
| 171.9-175.9 | 3.9-7.9 | 图状态切换 | HEAD 到 feature | `GitGraph` switched | HEAD=feature | 切换 feature：HEAD 改指向 | HEAD 可见 |
| 175.9-180.0 | 7.9-12.0 | 最终状态 | feature=C3 | `GitGraph` committed | main=C2, feature=C3 | 提交一次：feature 前进 | 结束画面保持清楚 |

## 已知制作风险

- `branch-result` 目前是状态切换，不是完整的“feature 从 ref 行落到 C2”的动作链，后续应补 motion。
- `commit` 中 C3 生成感还可以增强，应避免只是突然切图。
- `terminal` 片段需要继续降低同屏叙事层，输入阶段只保留终端。
- `compare` 片段容易变成课件式左右图，后续可以加进入顺序和局部放大。

## 执行规格卡

下面是用于实现、审查和返工的细粒度规格。表格负责总览，规格卡负责落地。

字段说明：

- 时间：同时写全局秒、scene 内局部秒、帧范围。
- 主视觉：该 beat 观众最应该看的东西。
- 组件/技术：必须使用的 Remotion 组件或底层技术。
- 实现参数：当前代码中的关键变量、props、坐标和时间曲线。
- 运动设计：动作如何开始、推进、停住。
- 审计：需要自动检查或人工抽帧确认的内容。
- 当前状态：`已实现`、`已实现但需增强`、`目标规格`。

### H-01 / 单集标题出现

时间：

- scene：`hook`
- global：0.00s-2.12s
- local：0.00s-2.12s
- frames：0-64

教学意图：

让观众在两秒内明确本集主题：branch 不是泛泛而谈，而是“指针”这个核心模型。

主视觉：

`4. Branch 只是一个指针` 居中大标题。`Branch` 使用 main 语义色，并有一次短下划线动画。

组件/技术：

- `EpisodeTitleCard`
- Remotion `interpolate`
- CSS `opacity` / `translateY` / `scaleX`

实现参数：

```ts
titleIn: 0.00s-0.55s -> opacity 0-1
titleOut: 1.72s-2.12s -> opacity 1-0
titleY: 0.00s-0.55s -> 18px to -46px
branchAccent: 0.28s-0.78s -> 0-1
branchUnderlineScale: 0.50s-0.96s -> 0-1
branchUnderlineOpacity: 0.50s-1.45s -> 1-0
```

运动设计：

- 0.0-0.55s：标题整体淡入并上移。
- 0.28-0.78s：`Branch` 变得更明确。
- 0.50-0.96s：下划线从左向右展开。
- 1.72-2.12s：标题退出，为图形让位。

审计：

- `hook-episode-title` 不得与后续 `hook-main-graph` 同时强可见。
- 标题必须占据第一视觉层，不出现终端、refs 表或 Git 图。
- `Branch` 色彩只用 main 语义色，不增加额外装饰色。

当前状态：

已实现。标题已从 `HookScene` 散写迁移到 `EpisodeTitleCard`，没有触碰全局 `Intro`。

### H-02 / 最小提交历史建立

时间：

- scene：`hook`
- global：2.05s-7.60s
- local：2.05s-7.60s
- frames：62-228

教学意图：

在讲 branch 之前，先让观众看到当前历史只有一条线：`C0 -> C1 -> C2`，并且 main 指向 C2。

主视觉：

居中的极简 commit 链，以及随后出现的 `main -> C2`。

组件/技术：

- `BranchPointerHookGraph`
- SVG line / circle / path
- Remotion `interpolate`

实现参数：

```ts
graphOpacity: 2.05s-2.45s -> 0-1
graphY: 2.05s-2.45s -> 24px to 0px
C0: 2.05s-2.65s
C1: 3.15s-3.75s
C2: 4.25s-4.85s
mainOpacity: 5.75s-6.10s
mainY: 5.75s-6.55s -> -168px to 0px
landingRing: 6.35s-7.60s
```

运动设计：

- commit 节点依次生成，连线随后绘制。
- main 标签从右侧进入并指向 C2。
- C2 外圈 pulse 一次后停住，不循环。

审计：

- C0/C1/C2 之间间距稳定。
- main 箭头不压 C2 文字和圆边。
- C2 pulse 不应形成重复闪烁。

当前状态：

已实现，但 `BranchPointerHookGraph` 内部仍是专用 SVG 组件。它已经不在 episode 内散写，但未来可以继续拆成 `CommitChain + BranchTag`。

### H-03 / 问题句出现

时间：

- scene：`hook`
- global：9.55s-12.00s
- local：9.55s-12.00s
- frames：287-360

教学意图：

把“branch 是名字”转成一个待解问题，为下一段 mental-model 承接。

主视觉：

底部问题句：`如果只是一个名字，切换分支到底改变了什么？`

组件/技术：

- `QuestionCaption`
- Remotion `interpolate`

实现参数：

```ts
questionOpacity: 9.55s-10.25s -> 0-1
questionY: 9.55s-10.25s -> 16px to 0px
bottom: 132px
width: 920px
```

运动设计：

- 问题句从下方轻微进入。
- 图形保持静止，不再新增元素。
- 留出 1.75s 让观众读完。

审计：

- `hook-question` 不得遮挡 `hook-main-graph`。
- 问题句最多一行，不写成解释段落。

当前状态：

已实现。问题句已从 `HookScene` 散写迁移到 `QuestionCaption`。

### M-01 / 否定“复制目录”

时间：

- scene：`mental-model`
- global：12.00s-17.25s
- local：0.00s-5.25s
- frames：360-518

教学意图：

先移除错误心智模型：创建分支不是把 main 工作区复制成 feature 工作区。

主视觉：

两个 `WorkingTreeCard` 和一条否定斜线。

组件/技术：

- `MotionTitle`
- `WorkingTreeCard`
- `SvgArrowLine`
- `StrikeThrough`
- inline SVG wrapper

实现参数：

```ts
titleIn: 0.00s-0.45s
mainTreeIn: 0.35s-0.95s
clone: 1.15s-2.75s
strike: 2.75s-3.45s
cloneFade: 3.45s-4.55s
wrongExit: 4.25s-5.25s
mainTreeX: 310 -> 250
cloneX: 840 -> 890
treeY: 318 -> 388
treeScale: 1 -> 0.55
```

运动设计：

- main 工作区先出现。
- feature 工作区作为“错误假设”滑入，透明度低于 main。
- 斜线只划一次。
- 两张卡片缩小淡出，把视觉焦点交给正确模型。

审计：

- `WorkingTreeCard` 两张卡不重叠。
- `StrikeThrough` 不遮挡卡片标题文字。
- 退出阶段不留下 0.02-0.18 opacity 的 ghost 残影。

当前状态：

已实现但需增强。卡片定位和退出 wrapper 仍在 `MentalModelScene` 内部散写，后续应抽成 `WorkingTreeMisconception`。

### M-02 / 提交链生成

时间：

- scene：`mental-model`
- global：17.20s-19.36s
- local：5.20s-7.36s
- frames：516-581

教学意图：

把正确模型建立在 commit history 上：Git 关心的是提交链，不是目录副本。

主视觉：

`C0 -> C1 -> C2` 居中生成。

组件/技术：

- `BranchRefMentalModelGraph`
- `CommitChain`
- `DrawLine`
- `CommitNode`

实现参数：

```ts
graphIn: 5.20s-6.05s -> 0-1
C0: 5.35s-5.80s
line C0-C1: 5.65s-6.30s
C1: 6.12s-6.58s
line C1-C2: 6.55s-7.20s
C2: 6.90s-7.36s
```

运动设计：

- 节点和连线交替出现，形成“历史被构建出来”的感觉。
- C2 稍强，暗示它是当前最新提交。

审计：

- `mental-commit-chain-commit-C0/C1/C2` 不与标题重叠。
- commit 链应为此时唯一主视觉，不出现 ref 面板。

当前状态：

已实现。核心图已迁移到 `BranchRefMentalModelGraph`。

### M-03 / main 指向 C2

时间：

- scene：`mental-model`
- global：19.55s-20.45s
- local：7.55s-8.45s
- frames：587-614

教学意图：

建立第一个 ref：`main` 只是一个指向 C2 的名字。

主视觉：

`main` 标签从下方落到 C2，下方箭头指向 C2。

组件/技术：

- `BranchRefMentalModelGraph`
- `BranchTag`
- `ArrowLine`

实现参数：

```ts
mainAttach: 7.55s-8.45s -> 0-1
mainX: 1138
mainY: 760 -> 656
targetX: 1104
targetY: 524
connectorStartY: 592
auditId: mental-main-ref
```

运动设计：

- main 标签从下方向上靠近 C2。
- 箭头在标签稳定时明确指向 C2。
- main 出现后停顿，给 ref 概念建立时间。

审计：

- `mental-main-ref` 与 `mental-commit-chain-commit-C2` 间距 >= 44px。
- `mental-main-ref-connector` 必须有箭头，不能只是一条线。

当前状态：

已实现。之前 main 与 C2 过近的问题已修复。

### M-04 / 写入 feature ref

时间：

- scene：`mental-model`
- global：20.95s-22.35s
- local：8.95s-10.35s
- frames：629-671

教学意图：

把 `git branch feature` 的本质翻译成一条具体记录：`refs/heads/feature -> C2`。

主视觉：

ref 写入面板逐字出现。

组件/技术：

- `RefWrite`
- `TypewriterText`
- `BranchRefMentalModelGraph`

实现参数：

```ts
refWrite: 8.95s-10.35s -> 0-1
refWriteOpacity: refWrite 0.26-0.52 -> 0-1
graphLift: refWrite 0.25-0.75 -> 0px to -38px
x: 574
y: 826
text: refs/heads/feature -> C2
accentUntil: refs/heads/feature.length
auditId: mental-ref-write
```

运动设计：

- ref 面板不要从 0% opacity 开始可见，避免白色残影。
- Git 图轻微上移，为 ref 面板留安全区。
- 逐字输入完成后保持，让观众读到 `feature -> C2`。

审计：

- `mental-ref-write` 不允许出现 ghost：opacity 0.02-0.18 且可见。
- 与 `mental-main-ref`、C2、底部字幕不重叠。
- 9s 附近需要重点抽帧。

当前状态：

已实现。9s ghost 残影已修复，审计 frames `600,615,630,645,660,690` 为 0 issue。

### M-05 / feature 落到 C2

时间：

- scene：`mental-model`
- global：22.20s-23.55s
- local：10.20s-11.55s
- frames：666-707

教学意图：

让观众看到 feature 是新增名字，并且它与 main 指向同一个 C2。

主视觉：

`feature` 标签从上方进入，箭头指向 C2。

组件/技术：

- `BranchRefMentalModelGraph`
- `BranchTag`
- `ArrowLine`

实现参数：

```ts
featureDrop: 10.20s-11.55s -> 0-1
x: 1138
y: 324
fromX: 1138
fromY: 182
targetX: 1104
targetY: 524
connectorStartY: 456
width: 216
fontSize: 27
auditId: mental-feature-ref
```

运动设计：

- feature 从上方下落，使用 `easeOutBack`，但不能弹得过头。
- 箭头落到 C2 圆边附近，保持克制。
- main 和 feature 两个箭头同时可见，表达“两个名字同指一个 commit”。

审计：

- `mental-feature-ref` 与 `mental-main-ref` 不重叠。
- `mental-feature-ref-connector` 必须带箭头。
- 17s 附近需要抽帧确认 feature/main 都有箭头。

当前状态：

已实现。17s 无箭头问题已修复，箭头头部已缩小。

### M-06 / 模型总结

时间：

- scene：`mental-model`
- global：25.35s-30.00s
- local：13.35s-18.00s
- frames：761-900

教学意图：

把模型压缩为一句可记忆结论：branch 是 ref，可以和 main 指向同一个 commit。

主视觉：

main、feature 同指 C2，底部一句总结。

组件/技术：

- `BranchRefMentalModelGraph`
- `FocusPulse`
- 当前仍为 inline summary div，目标替换为 `NarrationSubtitle`

实现参数：

```ts
summaryIn: 13.35s-14.25s -> 0-1
c2Pulse: 14.15s-14.85s-15.80s -> 0-1-0
summary width: 1060
bottom: 128
auditId: mental-summary
```

运动设计：

- ref 面板先退出。
- 总结字幕进入。
- C2 pulse 一次，强调两个名字共同指向的 commit。

审计：

- `mental-summary` 不遮挡 `mental-main-ref` 或 `mental-feature-ref`。
- pulse 只发生一次。

当前状态：

已实现但需清理。总结字幕仍是 episode 内手写 div，应升级为 `NarrationSubtitle`。

### B-01 / git branch 写入 ref

时间：

- scene：`branch-write`
- global：48.00s-70.00s
- local：0.00s-22.00s
- frames：1440-2100

教学意图：

把命令和内部状态建立因果：执行 `git branch feature` 后，Git 写入 `refs/heads/feature -> C2`。

主视觉：

命令胶囊、base Git 图、ref 写入条。

组件/技术：

- `CommandPill`
- `CenterGraph`
- `GitGraph`
- `RefWriteBar`
- `SideLabel`

实现参数：

```ts
refProgress: 4.73s-7.00s -> 0-1
CommandPill: command="git branch feature", branch="main"
CenterGraph: state=base, top=374, width=980
RefWriteBar: x=676, y=744, refName=refs/heads/feature, target=C2
SideLabel: x=1235, y=748, tone=feature
```

运动设计：

- 命令先出现。
- Git 图保持 base 状态。
- ref 写入条填充，表达“写入”而不是“复制”。
- 侧边说明最后出现。

审计：

- `branch-write-ref-bar` 文字可读。
- `CommandPill` 不遮挡图。
- 此段不要长期同时出现终端、完整 refs 表、Git 图和长字幕。

当前状态：

已实现。ref 写入条已从 episode 散写迁移到 `RefWriteBar`。

### R-01 / feature 出现并同指 C2

时间：

- scene：`branch-result`
- global：70.00s-98.00s
- local：0.00s-28.00s
- frames：2100-2940

教学意图：

说明命令执行后的结果：feature 出现，且 main 仍在 C2。

主视觉：

`GitGraph` 中 main 和 feature 同时指向 C2。

组件/技术：

- `CommandPill`
- `CenterGraph`
- `MiniRefLine`
- `SideLabel`

实现参数：

```ts
progress: 1.27s-3.87s -> 0-1
state: progress < 0.5 ? base : withFeature
MiniRefLine: feature -> C2, top=730, left=700
SideLabel feature: x=1280, y=370
SideLabel main: x=230, y=710
```

运动设计：

- 当前实现是 base 到 withFeature 的状态切换。
- 目标规格应改成：ref 行写完后，feature 标签从 ref 区域落到 C2。

审计：

- feature/main 标签不能与 commit 节点重叠。
- 底部说明文字不应挤压图形。

当前状态：

已实现但需增强。该段是下一批动画质量提升重点。

### S-01 / HEAD 切换

时间：

- scene：`switch`
- global：98.00s-122.00s
- local：0.00s-24.00s
- frames：2940-3660

教学意图：

说明 `git switch feature` 不改变提交历史，只改变 HEAD 指向。

主视觉：

HEAD 从 main 滑到 feature。

组件/技术：

- `CommandPill`
- `CenterGraph`
- `GitGraph.headMotion`
- `MiniRefLine`
- `SideLabel`

实现参数：

```ts
progress: 3.67s-7.93s -> 0-1
headMotion: {from: main, to: feature, progress}
MiniRefLine: title=.git/HEAD, line=HEAD -> feature
```

运动设计：

- 命令出现后停顿。
- HEAD 单独运动，其他元素降权或保持稳定。
- `.git/HEAD` 小窗补充内部记录。

审计：

- HEAD 应是唯一高亮运动对象。
- `MiniRefLine` 不遮挡 branch 标签。

当前状态：

已实现。后续可以增强为“终端触发 -> HEAD 滑动 -> HEAD 文件更新”的完整因果链。

### C-01 / feature 前进到 C3

时间：

- scene：`commit`
- global：122.00s-154.00s
- local：0.00s-32.00s
- frames：3660-4620

教学意图：

说明在 feature 上提交时，新 commit 出现，移动的是当前 branch：feature 前进，main 不动。

主视觉：

C3 生成，feature 指针从 C2 移动到 C3。

组件/技术：

- `CommandPill`
- `CenterGraph`
- `GitGraph.branchMotion`
- `MiniRefLine`
- `SideLabel`

实现参数：

```ts
commitIn: 3.47s-6.20s -> 0-1
pointer: 6.27s-9.53s -> 0-1
state: commitIn < 0.55 ? switched : committed
branchMotion: {name: feature, from: C2, to: C3, progress: pointer}
MiniRefLine: feature -> C3
```

运动设计：

- 命令先出现。
- C3 出现后短暂停顿。
- feature 指针向 C3 滑动。
- main 保持在 C2，必须用停顿强调“main 没动”。

审计：

- C3 出现不能像硬切，后续需要生成动画。
- feature 前进时 main 不允许跟随移动。
- `feature -> C3` 小窗不遮挡图。

当前状态：

已实现但需增强。C3 生成感不足，是后续质量提升重点。

### X-01 / 状态对比

时间：

- scene：`compare`
- global：154.00s-168.00s
- local：0.00s-14.00s
- frames：4620-5040

教学意图：

让观众同时看到“刚创建”和“提交后”的区别。

主视觉：

左右两个 GitGraph：左侧同指 C2，右侧 feature 到 C3。

组件/技术：

- `GitGraph`
- 目标组件：`CompareGraphs`

实现参数：

```ts
left: graphState(withFeature), x=210, top=412, width=620
right: graphState(committed), right=210, top=412, width=680
title: 同一个历史，不同的名字
```

运动设计：

- 目标应改为：标题先出现，左图进入，右图进入，最后一句对比说明。
- 当前左右图静态同时呈现，课件感偏强。

审计：

- 左右图说明文字不重叠。
- 观众应能快速分辨 C2/C3 和 main/feature 差异。

当前状态：

已实现但需组件化。应抽成 `CompareGraphs` 并补进入节奏。

### T-01 / 最终结论

时间：

- scene：`takeaway`
- global：168.00s-180.00s
- local：0.00s-12.00s
- frames：5040-5400

教学意图：

用一句话完成记忆：branch 是名字，名字会移动。

主视觉：

左侧大结论，右侧 GitGraph 状态切换，底部三条动作总结。

组件/技术：

- `GitGraph`
- 目标组件：`TakeawayRecap`

实现参数：

```ts
state:
  0.00s-3.93s -> withFeature
  3.93s-7.87s -> switched
  7.87s-12.00s -> committed
steps:
  创建 feature：新增名字
  切换 feature：HEAD 改指向
  提交一次：feature 前进
```

运动设计：

- 结论文字先出现。
- GitGraph 按三步切换。
- 当前步骤用 HEAD 色点强调。

审计：

- 结论文字不遮挡 GitGraph。
- 底部列表不应过多抢视觉。
- 结束帧保持清楚，不出现下集预告。

当前状态：

已实现但需组件化。应抽成 `TakeawayRecap`，并减少底部列表的课件感。
