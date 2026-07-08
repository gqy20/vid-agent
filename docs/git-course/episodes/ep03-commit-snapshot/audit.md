# EP03 Commit 不是保存按钮 - Audit

## 当前状态

- 文档状态：已完成制作脚本、beats、scenes.json 和本次审查记录。
- Remotion 实现：已完成 `GitCourseEp03CommitSnapshot`，主线为 hook -> Index -> object model -> fields -> parent -> hash -> takeaway。
- Manim 实现：已完成并接入 `object-model.mp4`、`parent-chain.mp4`、`hash-identity.mp4`。
- 分段产物：已输出到 `remotion/renders/git-course/ep03-commit-snapshot/renders/current/scenes/`。
- 完整正片：已输出 `renders/current/final/ep03-commit-snapshot_with-audio.mp4`。
- 发布版：已输出 `renders/current/published/ep03-commit-snapshot_published.mp4`。

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

- 已修复：takeaway 初版出现 `HEAD` 标签；按本集审查点去掉，只保留 `main` 指向 C2。
- 已确认：Manim 底色与课程浅色画布一致。
- 已确认：对象模型按 blob、tree、commit 顺序出现，最终关系方向为 commit 指向 tree，tree 指向 blob。
- 已确认：parent 箭头方向一致，C2 -> C1 -> C0。
- 已确认：hash 只展示短 hash，不展开 40 位字符串。
- 已确认：TTS SRT 未泄漏 `<#...#>` 停顿标记。

## 本次渲染审查

| 项目 | 结果 |
|---|---|
| 分段渲染 | 7 段均通过，帧数分别为 360 / 780 / 1080 / 900 / 840 / 780 / 660 |
| 正片视频 | 180.000s，1920x1080，5400 帧 |
| 正片音频 | 180.000s，AAC，BGM volume `0.05` |
| 发布版 | 193.000s，5790 帧，包含公共片头和片尾 |
| 抽帧 | 已审查分段 contact sheet、正片 contact sheet、发布版 contact sheet |
| 类型检查 | `pnpm exec tsc --noEmit --pretty false` 通过 |
