# EP05 HEAD 是什么 - Beat Sheet

本文件是制作级脚本。它描述每个时间段的画面、动画、组件、状态变化和审查点。

时间使用全局秒。括号内为 scene 内局部秒。

## 全局约束

- 分辨率：1920x1080。
- FPS：30。
- 主背景：`COLOR.canvas.base`。
- 语义色：`main = COLOR.git.main`，`feature = COLOR.git.feature`，`HEAD = COLOR.git.head`。
- HEAD 必须表现为当前位置指针，不作为 branch 色使用。
- 大多数画面使用 `HEAD -> branch -> commit` 两级链路；detached 场景才使用 `HEAD -> commit`。
- 每个 scene 只解释一个状态变化。

## 0-12s / hook

目标：提出 HEAD 是当前位置，不是一个额外分支。

主技术：Remotion title + `CenterGraph`。

| 时间 | 局部时间 | 画面 | 动作 | 技术 | 状态 | 旁白/字幕 | 审查 |
|---:|---:|---|---|---|---|---|---|
| 0.0-2.0 | 0.0-2.0 | 标题 `5. HEAD 是什么` | 淡入 | `EpisodeTitleCard` | 无 | 第五集，我们只讲 HEAD | 标题独占 |
| 2.0-7.5 | 2.0-7.5 | C0-C2 + main | commit 链依次出现，main 落到 C2 | `CenterGraph` | main=C2 | HEAD 不是新分支 | 图居中 |
| 7.5-12.0 | 7.5-12.0 | HEAD 指向 main | HEAD 箭头出现，问题句进入 | `GitGraph` | HEAD=main | 我现在站在哪里？ | HEAD 不压 main |

## 12-34s / symbolic-ref

目标：用 `.git/HEAD` 文件建立 symbolic reference 模型。

| 时间 | 局部时间 | 画面 | 动作 | 技术 | 状态 | 旁白/字幕 | 审查 |
|---:|---:|---|---|---|---|---|---|
| 12.0-16.0 | 0.0-4.0 | 文件卡 `.git/HEAD` | 文件卡淡入 | file card | HEAD file visible | HEAD 通常指向当前分支 | 文件文字可读 |
| 16.0-23.0 | 4.0-11.0 | `ref: refs/heads/main` | 逐字输入 | `TypewriterText` | HEAD -> main | 文件里是一条引用 | 不读成终端命令 |
| 23.0-30.0 | 11.0-18.0 | 图上两级指向 | HEAD 箭头和 main 箭头依次强调 | `GitGraph` | HEAD->main->C2 | HEAD 指向 main，main 指向 C2 | 两条箭头方向明确 |
| 30.0-34.0 | 18.0-22.0 | 总结句 | 字幕淡入 | `SceneCaption` | stable | 当前位置是一条链 | 字幕不遮图 |

## 34-56s / terminal

目标：给出真实命令序列。

| 时间 | 局部时间 | 画面 | 动作 | 技术 | 状态 | 旁白/字幕 | 审查 |
|---:|---:|---|---|---|---|---|---|
| 34.0-38.0 | 0.0-4.0 | 全屏终端 | prompt 出现 | `TerminalFocusScene` | HEAD=main | 看两条命令 | 终端独占 |
| 38.0-46.0 | 4.0-12.0 | `git switch feature` | 逐字输入并执行 | typed terminal | HEAD moving | 切到 feature | 不提前显示图解 |
| 46.0-56.0 | 12.0-22.0 | `git commit -m "work"` | 逐字输入 | typed terminal | commit pending | 提交会推进当前分支 | 命令不溢出 |

## 56-88s / switch

目标：只解释 `git switch feature` 改变 HEAD。

| 时间 | 局部时间 | 画面 | 动作 | 技术 | 状态 | 旁白/字幕 | 审查 |
|---:|---:|---|---|---|---|---|---|
| 56.0-60.0 | 0.0-4.0 | 命令胶囊 + base 图 | `git switch feature` 出现 | `CommandPill` + `GitGraph` | main=C2, feature=C2, HEAD=main | 执行 switch | 命令降权 |
| 60.0-70.0 | 4.0-14.0 | HEAD 从 main 到 feature | HEAD 箭头移动 | `headMotion` | HEAD=feature | 改变的是 HEAD | 只高亮 HEAD |
| 70.0-80.0 | 14.0-24.0 | `.git/HEAD` 更新 | `refs/heads/main` 变 `refs/heads/feature` | file card | HEAD file updated | 文件也更新了 | 文件卡不挡图 |
| 80.0-88.0 | 24.0-32.0 | 图保持 | 侧边说明进入 | `SideLabel` | commits unchanged | commit 没变 | main/feature 都可见 |

## 88-120s / commit-current

目标：解释 commit 推进 HEAD 所在的 branch。

| 时间 | 局部时间 | 画面 | 动作 | 技术 | 状态 | 旁白/字幕 | 审查 |
|---:|---:|---|---|---|---|---|---|
| 88.0-94.0 | 0.0-6.0 | 命令胶囊 | `git commit -m "work"` 出现 | `CommandPill` | HEAD=feature | 在 feature 上提交 | 不抢主图 |
| 94.0-102.0 | 6.0-14.0 | C3 出现 | 新 commit 生成 | `GitGraph` | C3 created | 新提交 C3 | C3 有生成感 |
| 102.0-112.0 | 14.0-24.0 | feature 前进 | feature 指针滑到 C3 | `branchMotion` | feature=C3 | feature 前进 | main 留在 C2 |
| 112.0-120.0 | 24.0-32.0 | HEAD 仍指 feature | HEAD 跟随当前分支 | `GitGraph` | HEAD=feature | HEAD 没单独变成 C3 | 避免误画 HEAD->C3 |

## 120-156s / detached

目标：展示 detached HEAD 是边界状态。

| 时间 | 局部时间 | 画面 | 动作 | 技术 | 状态 | 旁白/字幕 | 审查 |
|---:|---:|---|---|---|---|---|---|
| 120.0-126.0 | 0.0-6.0 | 命令 `git switch --detach C1` | 命令出现 | `CommandPill` | detach requested | 特殊情况 | 使用中性提示 |
| 126.0-136.0 | 6.0-16.0 | HEAD 离开 branch 指向 C1 | HEAD 箭头移动到 commit | `GitGraph` | HEAD=C1 | HEAD 直接指向 commit | 不使用 branch 语义色 |
| 136.0-148.0 | 16.0-28.0 | `.git/HEAD` 显示短 hash | 文件卡更新 | file card | detached | 不再是 ref 行 | hash 可读但不需完整 |
| 148.0-156.0 | 28.0-36.0 | 边界说明 | warning panel | semantic warning | detached | 适合查看历史 | 不恐吓，不展开救援 |

## 156-180s / takeaway

目标：收束三条规则。

| 时间 | 局部时间 | 画面 | 动作 | 技术 | 状态 | 旁白/字幕 | 审查 |
|---:|---:|---|---|---|---|---|---|
| 156.0-164.0 | 0.0-8.0 | `HEAD -> branch -> commit` | 链路依次高亮 | `CenterGraph` | normal | 记住这条链 | 三段关系清楚 |
| 164.0-172.0 | 8.0-16.0 | switch 规则 | HEAD 箭头短动一次 | `GitGraph` | switch model | switch 改 HEAD | 动作一次 |
| 172.0-180.0 | 16.0-24.0 | commit 规则 | branch 前进示意 | `GitGraph` | commit model | commit 推进当前分支 | 结束画面稳定 |
