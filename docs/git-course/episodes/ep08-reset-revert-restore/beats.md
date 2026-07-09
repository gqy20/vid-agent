# EP08 Reset、Revert、Restore - Beat Sheet

时间使用全局秒。括号内为 scene 内局部秒。

## 全局约束

- 分辨率：1920x1080。
- FPS：30。
- 主背景：`COLOR.canvas.base`。
- 语义色复用 EP02 三层状态：Working Tree、Index、Repository/HEAD。
- `reset --hard` 使用明确 warning，不使用轻松弹跳动画。
- revert 必须新增提交，restore 必须保持在文件层。

## 0-12s / hook

目标：提出撤销前先问改哪一层。

| 时间 | 局部时间 | 画面 | 动作 | 技术 | 状态 | 旁白/字幕 | 审查 |
|---:|---:|---|---|---|---|---|---|
| 0.0-2.0 | 0.0-2.0 | 标题 `8. Reset、Revert、Restore` | 淡入 | `EpisodeTitleCard` | 无 | 第八集，我们讲撤销 | 标题独占 |
| 2.0-8.0 | 2.0-8.0 | 错误提交 C3 | C3 出现并标记 | `GitGraph` | bad commit | 撤销不是一个按钮 | 标记用 conflict 色 |
| 8.0-12.0 | 8.0-12.0 | 问题句 | `你要改哪一层？` | `QuestionCaption` | question | 先问目标 | 字幕安全 |

## 12-40s / three-trees

目标：建立 HEAD / Index / Working Tree 地图。

| 时间 | 局部时间 | 画面 | 动作 | 技术 | 状态 | 旁白/字幕 | 审查 |
|---:|---:|---|---|---|---|---|---|
| 12.0-20.0 | 0.0-8.0 | HEAD 快照 | Repository/HEAD 栏出现 | `GitStatePanel` | HEAD=v1 | HEAD 是当前提交快照 | 和 EP02 语义一致 |
| 20.0-28.0 | 8.0-16.0 | Index | Index 栏出现 | `GitStatePanel` | Index=v1 | Index 是下一次提交 | 不混用颜色 |
| 28.0-36.0 | 16.0-24.0 | Working Tree | Working Tree 栏出现 | `GitStatePanel` | WT=v2 | 工作区是正在编辑 | 三栏间距清楚 |
| 36.0-40.0 | 24.0-28.0 | 三棵树总结 | 三栏同时稳定 | `SceneCaption` | three-trees | 命令会改不同层 | 文字短 |

## 40-86s / reset-modes

目标：讲 reset 的三个停止点。

| 时间 | 局部时间 | 画面 | 动作 | 技术 | 状态 | 旁白/字幕 | 审查 |
|---:|---:|---|---|---|---|---|---|
| 40.0-50.0 | 0.0-10.0 | `reset --soft HEAD~` | branch 从 C3 回 C2 | `GitGraph` + state board | soft | 只移动 branch | Index/WT 不变 |
| 50.0-62.0 | 10.0-22.0 | soft 结果 | Index/WT 保留 C3 内容 | `GitStatePanel` | soft-result | 停在第一步 | 状态标签清楚 |
| 62.0-74.0 | 22.0-34.0 | mixed 结果 | Index 同步到 HEAD | state transition | mixed | 再更新 Index | 取消暂存含义清楚 |
| 74.0-86.0 | 34.0-46.0 | hard 结果 | WT 被覆盖，warning 出现 | state transition + warning | hard | 再覆盖 Working Tree | 明确危险 |

## 86-116s / revert

目标：revert 是新增反向提交。

| 时间 | 局部时间 | 画面 | 动作 | 技术 | 状态 | 旁白/字幕 | 审查 |
|---:|---:|---|---|---|---|---|---|
| 86.0-94.0 | 0.0-8.0 | C1-C2-C3 | 错误提交保持 | `GitGraph` | bad=C3 | 另一种撤销是 revert | 不删除 C3 |
| 94.0-104.0 | 8.0-18.0 | `git revert C3` | 命令出现 | `CommandPill` | revert command | 新增反向修改 | 命令降权 |
| 104.0-116.0 | 18.0-30.0 | R1 生成 | 新提交出现在 C3 后 | `GitGraph` | R1 created | 旧历史仍然可见 | R1 明确是新 commit |

## 116-146s / restore

目标：restore 改文件层，不移动 branch。

| 时间 | 局部时间 | 画面 | 动作 | 技术 | 状态 | 旁白/字幕 | 审查 |
|---:|---:|---|---|---|---|---|---|
| 116.0-124.0 | 0.0-8.0 | 文件在 WT 中被改坏 | 文件卡变红 | file card + state panel | WT dirty | restore 面向文件 | 不移动图上的 branch |
| 124.0-136.0 | 8.0-20.0 | `git restore app.js` | HEAD 版本复制到 WT | file motion | WT restored | 从 HEAD 恢复工作区文件 | 复制方向明确 |
| 136.0-146.0 | 20.0-30.0 | 图保持不动 | branch/HEAD 降权保持 | `GitGraph` | branch unchanged | branch 没有移动 | 避免误解 |

## 146-168s / choose

目标：用选择表总结三者边界。

| 时间 | 局部时间 | 画面 | 动作 | 技术 | 状态 | 旁白/字幕 | 审查 |
|---:|---:|---|---|---|---|---|---|
| 146.0-154.0 | 0.0-8.0 | reset 行 | `改引用和三棵树` 高亮 | decision table | choose-reset | 本地历史用 reset | 表格不拥挤 |
| 154.0-161.0 | 8.0-15.0 | revert 行 | `新增反向提交` 高亮 | decision table | choose-revert | 共享历史用 revert | 文字短 |
| 161.0-168.0 | 15.0-22.0 | restore 行 | `恢复文件内容` 高亮 | decision table | choose-restore | 文件内容用 restore | 高亮只一行 |

## 168-180s / takeaway

目标：收束第一季核心。

| 时间 | 局部时间 | 画面 | 动作 | 技术 | 状态 | 旁白/字幕 | 审查 |
|---:|---:|---|---|---|---|---|---|
| 168.0-174.0 | 0.0-6.0 | 三个命令图标 | 依次出现 | icons + text | summary | reset、revert、restore 改不同东西 | 图标克制 |
| 174.0-180.0 | 6.0-12.0 | 第一季总结 | `移动指针 / 写提交 / 同步三棵树` | centered text | season close | Git 命令都在改对象和状态 | 结束稳定 |
