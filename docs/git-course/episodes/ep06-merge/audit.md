# EP06 Merge 做了什么 - 审查记录

## 当前状态

- 仅完成制作脚本初稿。
- Remotion 主视频未实现。
- Manim 三方合并资产待新增或规划。
- 尚未渲染抽帧。

## 重点审查项

- fast-forward 必须只表现为当前 branch 指针移动，不能生成新 commit。
- 三方合并必须同时可见 base、ours、theirs，且不要让三者颜色混淆。
- merge commit 必须有两个 parent 箭头。
- 冲突片段不能把 conflict marker 当装饰色使用。
