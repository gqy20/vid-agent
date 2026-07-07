# EP03 Commit 不是保存按钮 - Audit

## 当前状态

- 文档状态：已完成首版制作文档。
- Remotion 实现：未开始。
- Manim 实现：未开始。
- 渲染产物：无。

## 预渲染检查清单

- commit 必须被表达为对象，不是按钮或动作结果。
- `commit -> tree -> blob` 的箭头方向必须一致且可读。
- parent chain 的方向需要稳定，不要一会儿向左一会儿向右。
- hash 只展示短 hash，避免画面被字符串占满。
- 片尾只轻微引入 main 指向 C2，不讲 branch 机制。

## 抽帧检查点

| 时间 | 检查内容 |
|---:|---|
| 2s | 标题独占画面 |
| 22s | Index 是主视觉，Working Tree 已弱化 |
| 48s | blob 标签可读 |
| 62s | commit 指向 tree 的箭头不穿字 |
| 86s | tree 字段高亮对应快照 |
| 114s | C1 parent 箭头指向 C0 |
| 142s | hash 变化清楚但不过度 |
| 174s | main 标签只是铺垫，不解释 HEAD |

## 待实现风险

- Manim 导出和 Remotion 画布配色可能不一致，需要统一 `canvas.base`。
- 对象模型信息量较高，必须按 blob、tree、commit 顺序逐步出现。
- parent 箭头方向要提前固定，否则 EP04 的 branch 指针会难以衔接。
- `GitObjectModelScene` 需要升级，不应直接使用当前英文占位版本。
- `CommitParentChainScene` 是新增资产，不能用静态图临时代替。
