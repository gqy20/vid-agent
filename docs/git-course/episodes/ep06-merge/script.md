# EP06 Merge 做了什么 - 脚本

## 制作目标

本集解决第六个误解：merge 不是把两个目录粗暴拼接。Git 会先判断历史形状：如果当前分支能沿着历史走到目标分支，就 fast-forward；如果已经分叉，就找共同祖先、ours 和 theirs，做三方合并并生成 merge commit。

观众看完后应该能说出三句话：

- fast-forward merge 只是移动当前 branch 指针。
- 分叉后的 merge 使用 base、ours、theirs 三个快照。
- merge commit 有两个 parent；冲突表示 Git 无法自动决定同一位置的修改。

## 官方依据

本集知识依据来自 Pro Git：

- `basic-branching-and-merging.asc:111-115`：fast-forward 是在没有分歧时简单推进指针。
- `basic-branching-and-merging.asc:152-163`：合并时先切到接收合并的分支，再运行 `git merge`。
- `basic-branching-and-merging.asc:172-178`：Git 使用两个分支末端快照和共同祖先做三方合并，并自动创建新提交。
- `basic-branching-and-merging.asc:177-181`：merge commit 有不止一个父提交。
- `basic-branching-and-merging.asc:192-204`：同一文件同一位置不同修改会导致冲突。
- `advanced-merging.asc:9-10`：Git 会处理无歧义合并，但不会智能猜测冲突解决方案。

## 技术原则

- 主视频使用 Remotion 编排，三方合并快照建议使用 Manim。
- fast-forward 用 Remotion Git 图即可，必须只移动 branch 指针。
- 三方合并段使用 Manim 展示 base / ours / theirs 到 result 的几何关系。
- 冲突段只做最小示意，不讲 `--ours`、`--theirs`、`rerere`。

## Remotion / Manim / 素材分工

| 片段 | 使用技术 | 原因 | 本地资产状态 | 输出物 |
|---|---|---|---|---|
| 0-12s hook | Remotion | 问题和分叉图 | 已有 Git 图组件 | Remotion scene |
| 12-42s fast-forward | Remotion | 指针推进是简单状态变化 | 已有 `GitGraph` | Remotion scene |
| 42-68s diverged | Remotion | 展示分叉历史和命令 | 已有终端/图组件 | Remotion scene |
| 68-108s three-way | Manim + Remotion | base/ours/theirs/result 关系复杂 | 需新增或复用 `three_way_merge_scene.py` | Manim mp4 + Remotion captions |
| 108-138s merge-commit | Remotion | 两个 parent 指针需要和 Git 图同步 | 已有 `CenterGraph` | Remotion scene |
| 138-166s conflict | Remotion | 冲突标记和状态面板 | 需组合 code diff | Remotion scene |
| 166-180s takeaway | Remotion | 总结两种 merge | 已有课程布局 | Remotion scene |

## 外部图片需求

本集不需要外部图片。Pro Git 的 merge 图可以作为官方参考，但主视觉必须重绘，保证语义色和动画可控。

## 片段总览

| 全局时间 | Scene | 时长 | 目的 | 主技术 | 主视觉 |
|---:|---|---:|---|---|---|
| 0-12s | hook | 12s | 提出 merge 到底改什么 | Remotion title + Git graph | 两条历史靠近 |
| 12-42s | fast-forward | 30s | 讲没有分歧时只移动指针 | GitGraph branchMotion | main 快进到 hotfix |
| 42-68s | diverged | 26s | 建立分叉历史 | Terminal + CenterGraph | main / feature 分叉 |
| 68-108s | three-way | 40s | 展示三方合并 | Manim | base、ours、theirs、result |
| 108-138s | merge-commit | 30s | merge commit 有两个 parent | GitGraph | M1 双 parent |
| 138-166s | conflict | 28s | 说明冲突边界 | CodeDiff + state panel | conflict marker |
| 166-180s | takeaway | 14s | 总结两种 merge | Minimal graph | fast-forward vs merge commit |

## 旁白草案

### 0-12s / hook

> 第六集，我们讲 merge。它不是把两个文件夹合在一起，而是先看历史有没有分歧。不同的历史形状，会得到不同的合并动作。

字幕短句：

- `merge 先看历史形状`
- `没有分歧和已经分叉，不是一回事`

### 12-42s / fast-forward

> 第一种情况最简单。main 停在 C2，hotfix 是从 C2 往前走到 C3。如果顺着 main 能走到 hotfix，Git 不需要新建提交，只要把 main 指针向前推进。这叫 fast-forward。

字幕短句：

- `fast-forward：只移动指针`
- `没有新 commit`

### 42-68s / diverged

> 第二种情况，历史已经分叉。main 有自己的 C3，feature 有自己的 C4。现在 Git 不能只移动一个指针，因为两边都发生了变化。

字幕短句：

- `两边都变了`
- `不能只移动指针`

### 68-108s / three-way

> 这时 Git 找三个快照：共同祖先 base，当前分支 ours，目标分支 theirs。它比较三者，把能自动判断的修改合成一个新结果。

字幕短句：

- `base：共同祖先`
- `ours：当前分支`
- `theirs：要合进来的分支`

### 108-138s / merge-commit

> 合并结果会被写成一个新的 commit。这个 commit 特别之处在于，它有两个 parent：一个来自 main，一个来自 feature。历史从这里重新汇合。

字幕短句：

- `merge commit 有两个 parent`
- `历史重新汇合`

### 138-166s / conflict

> 如果两边改了同一处，Git 无法安全判断你想要哪一个结果。它会停下来，把冲突标记放进文件，让你手动决定。

字幕短句：

- `冲突 = Git 无法自动决定`
- `解决后再提交合并结果`

### 166-180s / takeaway

> 所以 merge 有两种基础心智模型：能快进，就移动指针；已经分叉，就做三方合并，生成一个有两个 parent 的提交。

字幕短句：

- `能快进：移动指针`
- `已分叉：三方合并`
- `结果：merge commit`
