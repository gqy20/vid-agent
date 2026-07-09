# EP07 Rebase 做了什么 - Beat Sheet

时间使用全局秒。括号内为 scene 内局部秒。

## 全局约束

- 分辨率：1920x1080。
- FPS：30。
- 主背景：`COLOR.canvas.base`。
- 语义色：`main = COLOR.git.main`，`feature = COLOR.git.feature`，`HEAD = COLOR.git.head`。
- rebase 必须表现为 replay 修改，不得表现为整条分支被物理拖动。
- 新提交必须标记为 `C4'`、`C5'` 或新 hash，不能与旧提交混淆。

## 0-12s / hook

目标：提出 rebase 是 replay。

| 时间 | 局部时间 | 画面 | 动作 | 技术 | 状态 | 旁白/字幕 | 审查 |
|---:|---:|---|---|---|---|---|---|
| 0.0-2.0 | 0.0-2.0 | 标题 `7. Rebase 做了什么` | 淡入 | `EpisodeTitleCard` | 无 | 第七集，我们讲 rebase | 标题独占 |
| 2.0-8.0 | 2.0-8.0 | 分叉历史 | main/feature 分叉出现 | `CenterGraph` | diverged | 它不是整体平移 | 分叉清楚 |
| 8.0-12.0 | 8.0-12.0 | `rebase = replay` | 等式出现 | text + graph | diverged | 重新播放修改 | 不使用花哨动效 |

## 12-38s / compare-merge

目标：和 merge 对比历史形状。

| 时间 | 局部时间 | 画面 | 动作 | 技术 | 状态 | 旁白/字幕 | 审查 |
|---:|---:|---|---|---|---|---|---|
| 12.0-20.0 | 0.0-8.0 | 左侧 merge 结果 | M1 双 parent 出现 | `GitGraph` | merge-result | merge 保留分叉 | 两图尺寸一致 |
| 20.0-30.0 | 8.0-18.0 | 右侧 rebase 目标 | 直线占位出现 | `GitGraph` | rebase-target | rebase 让历史更直 | 不暗示内容不同 |
| 30.0-38.0 | 18.0-26.0 | 对比标题 | `形状不同，快照可等价` | `SceneCaption` | compare | 最终快照可以一样 | 文字克制 |

## 38-82s / replay-model

目标：用 Manim 展示 rebase 的三个动作。

| 时间 | 局部时间 | 画面 | 动作 | 技术 | 状态 | 旁白/字幕 | 审查 |
|---:|---:|---|---|---|---|---|---|
| 38.0-50.0 | 0.0-12.0 | 找共同祖先 C2 | base 高亮 | `ManimClip` | base=C2 | 先找共同祖先 | base 颜色中性 |
| 50.0-62.0 | 12.0-24.0 | 提取 feature 独有修改 | C4/C5 变成 patch 卡 | `ManimClip` | patches | 提取独有修改 | patch 不是 commit |
| 62.0-74.0 | 24.0-36.0 | 新 base C3 | patch 移到 C3 后 | `ManimClip` | replaying | 在新 base 上重放 | 不拖整条分支 |
| 74.0-82.0 | 36.0-44.0 | C4'/C5' 生成 | 新 commit 依次出现 | `ManimClip` | rebased | 生成新的提交 | prime 标记可读 |

## 82-112s / new-identity

目标：强调 rebase 产生新 commit 身份。

| 时间 | 局部时间 | 画面 | 动作 | 技术 | 状态 | 旁白/字幕 | 审查 |
|---:|---:|---|---|---|---|---|---|
| 82.0-90.0 | 0.0-8.0 | C4 与 C4' 对比 | 两张 commit card 出现 | `ManimClip` or Remotion card | identity-compare | 内容可能相似 | 卡片不拥挤 |
| 90.0-100.0 | 8.0-18.0 | parent 字段变化 | parent 行高亮 | object card | parent changed | parent 变了 | 字段可读 |
| 100.0-112.0 | 18.0-30.0 | hash 改变 | hash 从旧到新 | `HashScene` style | hash changed | 身份也变了 | 不讲 hash 算法细节 |

## 112-138s / fast-forward-after

目标：展示 rebase 后 main 可以快进。

| 时间 | 局部时间 | 画面 | 动作 | 技术 | 状态 | 旁白/字幕 | 审查 |
|---:|---:|---|---|---|---|---|---|
| 112.0-120.0 | 0.0-8.0 | rebase 后 feature 在 main 后 | 图稳定 | `GitGraph` | feature-after-main | feature 已站到 main 后面 | 关系清楚 |
| 120.0-130.0 | 8.0-18.0 | `git merge feature` | 命令出现 | `CommandPill` | merge command | 回 main 合并 | 命令降权 |
| 130.0-138.0 | 18.0-26.0 | main 快进 | main 滑到 C5' | `branchMotion` | main=C5prime | 只需要 fast-forward | 不出现 M1 |

## 138-166s / public-risk

目标：说明不要重写共享历史。

| 时间 | 局部时间 | 画面 | 动作 | 技术 | 状态 | 旁白/字幕 | 审查 |
|---:|---:|---|---|---|---|---|---|
| 138.0-146.0 | 0.0-8.0 | 已推送的 C4 | remote 标记出现 | `GitGraph` | shared=C4 | 已共享的提交 | remote 色不抢主线 |
| 146.0-156.0 | 8.0-18.0 | rebase 后 C4' | 同一修改两个身份 | graph compare | C4 and C4prime | 会出现两个身份 | 不画成灾难特效 |
| 156.0-166.0 | 18.0-28.0 | 规则卡 | `不要 rebase 共享历史` | warning panel | rule | 别人可能基于它工作 | 文字短 |

## 166-180s / takeaway

目标：收束三条规则。

| 时间 | 局部时间 | 画面 | 动作 | 技术 | 状态 | 旁白/字幕 | 审查 |
|---:|---:|---|---|---|---|---|---|
| 166.0-172.0 | 0.0-6.0 | replay 小图 | patch 重放一次 | mini graph | replay | rebase 是 replay | 动作一次 |
| 172.0-176.0 | 6.0-10.0 | identity 小图 | C4 -> C4' | mini card | new identity | 新 commit 身份 | prime 可读 |
| 176.0-180.0 | 10.0-14.0 | 安全规则 | 总结句保持 | text | rule | 不重写共享历史 | 结束稳定 |
