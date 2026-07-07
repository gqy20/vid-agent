# EP03 Commit 不是保存按钮 - 制作目录

这个目录保存 EP03 的可执行制作脚本。

文件职责：

- `script.md`：教学目标、官方依据、旁白、字幕短句。
- `beats.md`：逐时间段的画面、动作、技术、状态和审查点。
- `scenes.json`：机器可读的 scene/beat 数据，后续可用于驱动 Remotion 或生成检查表。
- `audit.md`：渲染后抽帧、重叠、视觉问题和待优化记录。

当前主题：

```text
commit 不是保存按钮。
commit 是一个对象：它指向项目快照，记录 parent、作者、时间和 message。
```

官方依据：

- `docs/references/progit2-zh/book/03-git-branching/sections/nutshell.asc:9`
- `docs/references/progit2-zh/book/03-git-branching/sections/nutshell.asc:26`
- `docs/references/progit2-zh/book/03-git-branching/sections/nutshell.asc:37`
- `docs/references/progit2-zh/book/10-git-internals/sections/objects.asc:250`
- `docs/references/progit2-zh/book/10-git-internals/sections/objects.asc:280`
- `docs/references/progit2-zh/book/10-git-internals/sections/objects.asc:330`

原则：EP03 可以第一次使用 Manim 做对象模型，因为 blob/tree/commit 之间的指针关系需要更精密的图形动画。
