# EP08 Reset、Revert、Restore - 审查记录

## 当前状态

- 仅完成制作脚本初稿。
- Remotion 主视频未实现。
- Manim 资产暂不需要，除非后续三棵树转场过于复杂。
- 尚未渲染抽帧。

## 重点审查项

- 三棵树语义必须和 EP02 保持一致。
- `reset --hard` 必须明确高风险，不能用轻松动效弱化覆盖工作区的含义。
- revert 必须新增 commit，不能画成删除旧 commit。
- restore 必须限制在文件层，不让观众误以为它移动 branch。
