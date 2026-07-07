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
- `BranchPointerHookGraph`
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
