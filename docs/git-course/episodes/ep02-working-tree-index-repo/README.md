# EP02 工作区、暂存区、仓库 - 制作目录

这个目录保存 EP02 的可执行制作脚本。

文件职责：

- `script.md`：教学目标、官方依据、旁白、字幕短句。
- `beats.md`：逐时间段的画面、动作、技术、状态和审查点。
- `scenes.json`：机器可读的 scene/beat 数据，后续可用于驱动 Remotion 或生成检查表。
- `audit.md`：渲染后抽帧、重叠、视觉问题和待优化记录。

当前主题：

```text
一次 commit 之前，文件不是直接从编辑器进入历史。
它会经历 Working Tree -> Index -> Repository。
```

官方依据：

- `docs/references/progit2-zh/book/01-introduction/sections/what-is-git.asc:79`
- `docs/references/progit2-zh/book/01-introduction/sections/what-is-git.asc:88`
- `docs/references/progit2-zh/book/01-introduction/sections/what-is-git.asc:102`
- `docs/references/progit2-zh/book/02-git-basics/sections/recording-changes.asc:1`
- `docs/references/progit2-zh/book/02-git-basics/sections/recording-changes.asc:116`

原则：EP02 的主角是文件状态流转，不是 commit 对象结构。commit 内部留给 EP03。
