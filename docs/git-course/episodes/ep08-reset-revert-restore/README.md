# EP08 Reset、Revert、Restore - 制作目录

这个目录保存 EP08 的可执行制作脚本。

文件职责：

- `script.md`：教学目标、官方依据、旁白、字幕短句。
- `beats.md`：逐时间段的画面、动作、技术、状态和审查点。
- `scenes.json`：机器可读的 scene/beat 数据，后续可用于驱动 Remotion 或生成检查表。
- `audit.md`：渲染后抽帧、重叠、视觉问题和待优化记录。

当前主题：

```text
撤销不是一个动作。
reset、revert、restore 分别改引用、新提交或文件状态。
```

官方依据：

- `docs/references/progit2-zh/book/07-git-tools/sections/reset.asc:9`
- `docs/references/progit2-zh/book/07-git-tools/sections/reset.asc:20`
- `docs/references/progit2-zh/book/07-git-tools/sections/reset.asc:53`
- `docs/references/progit2-zh/book/07-git-tools/sections/reset.asc:73`
- `docs/references/progit2-zh/book/07-git-tools/sections/reset.asc:154`
- `docs/references/progit2-zh/book/07-git-tools/sections/reset.asc:171`
- `docs/references/progit2-zh/book/07-git-tools/sections/reset.asc:185`
- `docs/references/progit2-zh/book/07-git-tools/sections/advanced-merging.asc:587`

原则：EP08 使用三棵树统一撤销命令。不要做命令大全，只解释安全选择：本地改历史用 reset，已共享历史用 revert，文件恢复用 restore。
