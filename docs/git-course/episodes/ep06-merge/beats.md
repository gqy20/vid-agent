# EP06 Merge 做了什么 - Beat Sheet

时间使用全局秒。括号内为 scene 内局部秒。

## 全局约束

- 分辨率：1920x1080。
- FPS：30。
- 主背景：`COLOR.canvas.base`。
- 语义色：`main = COLOR.git.main`，`feature = COLOR.git.feature`，`HEAD = COLOR.git.head`，`conflict = COLOR.git.conflict`。
- fast-forward 场景不得生成新 commit。
- 三方合并场景必须清楚标注 base / ours / theirs。
- merge commit 必须有两个 parent 箭头。

## 0-12s / hook

目标：提出 merge 先看历史形状。

| 时间 | 局部时间 | 画面 | 动作 | 技术 | 状态 | 旁白/字幕 | 审查 |
|---:|---:|---|---|---|---|---|---|
| 0.0-2.0 | 0.0-2.0 | 标题 `6. Merge 做了什么` | 淡入 | `EpisodeTitleCard` | 无 | 第六集，我们讲 merge | 标题独占 |
| 2.0-8.0 | 2.0-8.0 | 两种历史轮廓 | 左快进，右分叉依次出现 | `CenterGraph` | compare | 先看历史有没有分歧 | 左右不拥挤 |
| 8.0-12.0 | 8.0-12.0 | 问题句 | 底部字幕进入 | `QuestionCaption` | compare | 不同形状，不同动作 | 字幕安全 |

## 12-42s / fast-forward

目标：说明没有分歧时只是移动指针。

| 时间 | 局部时间 | 画面 | 动作 | 技术 | 状态 | 旁白/字幕 | 审查 |
|---:|---:|---|---|---|---|---|---|
| 12.0-18.0 | 0.0-6.0 | main=C2, hotfix=C3 | commit 链出现 | `GitGraph` | ff-before | hotfix 是 main 的后继 | 箭头方向明确 |
| 18.0-24.0 | 6.0-12.0 | 命令 `git merge hotfix` | 命令胶囊出现 | `CommandPill` | merge command | 执行 merge | 命令降权 |
| 24.0-34.0 | 12.0-22.0 | main 指针前进到 C3 | main 滑动 | `branchMotion` | ff-after | 只移动 main | 不出现新节点 |
| 34.0-42.0 | 22.0-30.0 | fast-forward 标签 | 说明淡入 | `SideLabel` | ff-after | 这叫 fast-forward | 标签不遮 commit |

## 42-68s / diverged

目标：建立分叉后的合并场景。

| 时间 | 局部时间 | 画面 | 动作 | 技术 | 状态 | 旁白/字幕 | 审查 |
|---:|---:|---|---|---|---|---|---|
| 42.0-48.0 | 0.0-6.0 | main 走到 C3 | C3 生成 | `GitGraph` | main=C3 | main 有自己的提交 | 不与 feature 混色 |
| 48.0-54.0 | 6.0-12.0 | feature 走到 C4 | C4 生成 | `GitGraph` | feature=C4 | feature 也变了 | 分叉清楚 |
| 54.0-62.0 | 12.0-20.0 | 命令 `git merge feature` | 终端/命令出现 | `TerminalFocusScene` or `CommandPill` | merge requested | 现在不能只移动指针 | 终端不长期抢焦点 |
| 62.0-68.0 | 20.0-26.0 | 三个快照标记准备 | base/ours/theirs 标签淡入 | `SideLabel` | three-way-ready | Git 要找三个快照 | 标签可读 |

## 68-108s / three-way

目标：用 Manim 展示三方合并。

| 时间 | 局部时间 | 画面 | 动作 | 技术 | 状态 | 旁白/字幕 | 审查 |
|---:|---:|---|---|---|---|---|---|
| 68.0-78.0 | 0.0-10.0 | base 快照居中 | base 从 DAG 中抽出 | `ManimClip` | base=C2 | 共同祖先 base | base 不使用 branch 色 |
| 78.0-88.0 | 10.0-20.0 | ours/theirs 两侧 | 两个快照展开 | `ManimClip` | ours=C3,theirs=C4 | 当前分支和目标分支 | 三列不重叠 |
| 88.0-100.0 | 20.0-32.0 | result 形成 | 非冲突修改流入 result | `ManimClip` | result | 能判断的自动合成 | 线条克制 |
| 100.0-108.0 | 32.0-40.0 | result 回到 Git 图 | result 收束成 M1 准备 | `ManimBridge` | result-ready | 结果会写成新提交 | 转场平稳 |

## 108-138s / merge-commit

目标：展示 merge commit 的两个 parent。

| 时间 | 局部时间 | 画面 | 动作 | 技术 | 状态 | 旁白/字幕 | 审查 |
|---:|---:|---|---|---|---|---|---|
| 108.0-116.0 | 0.0-8.0 | M1 生成 | 新节点从 result 出现 | `GitGraph` | M1 created | 新的 merge commit | M1 不是普通单 parent |
| 116.0-126.0 | 8.0-18.0 | 两个 parent 箭头 | 箭头依次绘制到 C3/C4 | SVG path draw | M1 parents | 它有两个 parent | 两箭头都可见 |
| 126.0-138.0 | 18.0-30.0 | main 指向 M1 | main 前进 | `branchMotion` | main=M1 | 历史重新汇合 | feature 可保留降权 |

## 138-166s / conflict

目标：说明冲突是 Git 停下来让人决定。

| 时间 | 局部时间 | 画面 | 动作 | 技术 | 状态 | 旁白/字幕 | 审查 |
|---:|---:|---|---|---|---|---|---|
| 138.0-146.0 | 0.0-8.0 | 同一行两种修改 | 两侧 diff 进入 | `CodeDiff` | conflicting edits | 两边改了同一处 | conflict 色只用于冲突 |
| 146.0-156.0 | 8.0-18.0 | conflict marker | marker 出现 | `CodeBlock` | conflict | Git 无法自动决定 | 不装饰化冲突标记 |
| 156.0-166.0 | 18.0-28.0 | 状态停在 unresolved | 状态板显示 unmerged | `GitStatePanel` | unresolved | 解决后再提交 | 信息密度低 |

## 166-180s / takeaway

目标：总结两种 merge。

| 时间 | 局部时间 | 画面 | 动作 | 技术 | 状态 | 旁白/字幕 | 审查 |
|---:|---:|---|---|---|---|---|---|
| 166.0-173.0 | 0.0-7.0 | fast-forward 小图 | 指针移动复现 | `GitGraph` | ff | 能快进就移动指针 | 小图清楚 |
| 173.0-180.0 | 7.0-14.0 | merge commit 小图 | 双 parent 高亮 | `GitGraph` | merge-commit | 已分叉就三方合并 | 结束稳定 |
