# EP01 Git 到底记录什么 - 制作目录

这个目录保存 EP01 的可执行制作脚本。

文件职责：

- `script.md`：教学目标、官方依据、旁白、字幕短句。
- `beats.md`：逐时间段的画面、动作、技术、状态和审查点。
- `scenes.json`：机器可读的 scene/beat 数据，后续可用于驱动 Remotion 或生成检查表。
- `audit.md`：渲染后抽帧、重叠、视觉问题和待优化记录。

当前主题：

```text
Git 不是保存一堆文件夹副本，也不是只保存每个文件的差异。
Git 的核心心智模型是：提交形成一个快照流。
```

官方依据：

- `docs/references/progit2-zh/book/01-introduction/sections/about-version-control.asc:1`
- `docs/references/progit2-zh/book/01-introduction/sections/what-is-git.asc:9`
- `docs/references/progit2-zh/book/01-introduction/sections/what-is-git.asc:19`
- `docs/references/progit2-zh/book/01-introduction/sections/what-is-git.asc:32`
- `docs/references/progit2-zh/book/01-introduction/sections/what-is-git.asc:50`

原则：EP01 只建立一个问题和一个模型。可以用 `git log` / `git show` 做最小实践验证 commit 历史，但不要提前展开暂存区、branch、HEAD。它们只作为后续悬念出现。
