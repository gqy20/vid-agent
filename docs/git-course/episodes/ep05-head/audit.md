# EP05 HEAD 是什么 - 审查记录

## 当前状态

- 仅完成制作脚本初稿。
- Remotion 主视频未实现。
- Manim 资产未实现。
- 尚未渲染抽帧。

## 重点审查项

- HEAD 必须清楚指向 branch，branch 再指向 commit；不要画成 HEAD、main 两个并列 branch。
- `git switch` 片段只突出 HEAD 改指向，不让 commit 图发生额外变化。
- detached HEAD 必须使用中性色和 warning 语义，不复用 branch 语义色。
- 字幕不能重复 `.git/HEAD` 文件内容，只补充因果。
