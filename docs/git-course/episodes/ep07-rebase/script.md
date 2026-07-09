# EP07 Rebase 做了什么 - 脚本

## 制作目标

本集解决第七个误解：rebase 不是把一条分支整体搬到另一条分支后面。它会找出当前分支相对共同祖先的独有修改，把这些修改按原顺序在新的 base 上重新播放，生成新的 commit。

观众看完后应该能说出三句话：

- rebase 是 replay 独有修改。
- rebase 后 commit 身份会改变。
- 不要随便 rebase 已经共享给别人的提交。

## 官方依据

本集知识依据来自 Pro Git：

- `rebasing.asc:23-24`：rebase 会把提交到某一分支上的修改移至另一分支上，就像重新播放。
- `rebasing.asc:36-42`：rebase 会找共同祖先、提取当前分支相对祖先的修改，再应用到目标分支。
- `rebasing.asc:55-58`：rebase 和 merge 最终快照可以一样，但历史更线性。
- `rebasing.asc:64-65`：rebase 按原有次序应用提交，merge 把最终结果合在一起。
- `rebasing.asc:145-156`：不要对别人可能基于其开发的公开提交执行 rebase；rebase 会丢弃旧提交并新建相似但不同的提交。
- `rewriting-history.asc:78-79`：历史重写会重写范围内提交及其后裔。

## 技术原则

- 主视频使用 Remotion 编排，replay 过程建议使用 Manim。
- merge/rebase 对比必须克制，避免暗示 rebase 永远更好。
- `C4` 和 `C4'` 必须使用不同 hash/身份表示，不只换位置。
- 公共历史风险用短场景说明，不展开 force push 教程。

## Remotion / Manim / 素材分工

| 片段 | 使用技术 | 原因 | 本地资产状态 | 输出物 |
|---|---|---|---|---|
| 0-12s hook | Remotion | 抛出直线历史问题 | 已有 Git 图组件 | Remotion scene |
| 12-38s compare-merge | Remotion | 承接 EP06，对比 merge commit | 已有 `GitGraph` | Remotion scene |
| 38-82s replay-model | Manim + Remotion | 找 base、提取 patch、replay 是复杂关系 | 需新增 rebase replay 场景 | Manim mp4 + Remotion captions |
| 82-112s new-identity | Manim + Remotion | hash 改变需要清楚表现 | 可复用 hash 场景风格 | Manim mp4 + Remotion captions |
| 112-138s fast-forward-after | Remotion | rebase 后 main 快进 | 已有 branch motion | Remotion scene |
| 138-166s public-risk | Remotion | 安全边界说明 | Git graph + warning panel | Remotion scene |
| 166-180s takeaway | Remotion | 总结 replay / identity / safety | Minimal graph | Remotion scene |

## 外部图片需求

本集不需要外部图片。Pro Git 的 rebase 图可作为参考，但主视觉必须重绘。

## 片段总览

| 全局时间 | Scene | 时长 | 目的 | 主技术 | 主视觉 |
|---:|---|---:|---|---|---|
| 0-12s | hook | 12s | 提出 rebase 是什么 | Remotion title + graph | 分叉历史 |
| 12-38s | compare-merge | 26s | 和 merge 的历史形状对比 | GitGraph split view | merge commit vs straight line |
| 38-82s | replay-model | 44s | 展示 replay 过程 | Manim | base、patch、new base |
| 82-112s | new-identity | 30s | 强调新 commit 身份 | Manim hash motion | C4 -> C4' |
| 112-138s | fast-forward-after | 26s | rebase 后 main 可快进 | GitGraph branchMotion | main 前进 |
| 138-166s | public-risk | 28s | 解释公开历史风险 | Graph + warning | two versions of same work |
| 166-180s | takeaway | 14s | 收束三条规则 | Minimal graph | replay / new identity / do not rebase shared |

## 旁白草案

### 0-12s / hook

> 第七集，我们讲 rebase。它常被说成“整理历史”，但 Git 实际做的不是整理文字，而是重新播放提交带来的修改。

字幕短句：

- `rebase = replay`
- `不是把节点整体平移`

### 12-38s / compare-merge

> 先和 merge 对比。merge 保留分叉，并创建一个汇合点。rebase 会把 feature 上独有的修改，放到 main 的最新位置之后，让历史看起来像一条直线。

字幕短句：

- `merge：保留分叉`
- `rebase：重放成直线`

### 38-82s / replay-model

> Git 会先找到共同祖先 C2。然后找出 feature 相对 C2 独有的修改，比如 C4 带来的 patch。接着把这些修改按顺序应用到新的 base，也就是 main 的最新提交后面。

字幕短句：

- `找共同祖先`
- `提取独有修改`
- `在新 base 上重放`

### 82-112s / new-identity

> 注意，重放后的提交不是原来的 C4。它内容可能等价，但 parent 变了，hash 也会变。所以我们把它叫作 C4 prime。

字幕短句：

- `C4 变成 C4'`
- `parent 变，身份变`

### 112-138s / fast-forward-after

> 变基完成后，feature 已经站在 main 后面。这时如果回到 main 合并 feature，通常只需要 fast-forward，main 指针向前移动。

字幕短句：

- `rebase 后可以快进`
- `main 指针向前`

### 138-166s / public-risk

> rebase 的代价是重写历史。如果这些提交已经推送，并且别人基于它们继续工作，你再 rebase，就会让同一份工作出现两个身份。公共历史里要非常谨慎。

字幕短句：

- `公开提交不要随便 rebase`
- `同一份修改会出现两个身份`

### 166-180s / takeaway

> 所以记住：rebase 是把修改重新播放到新 base 上。它能让历史更直，但会生成新的 commit 身份。

字幕短句：

- `replay 修改`
- `生成新 commit`
- `不要重写共享历史`
