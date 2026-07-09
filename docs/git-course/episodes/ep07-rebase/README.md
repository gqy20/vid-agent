# EP07 Rebase 做了什么 - 制作目录

这个目录保存 EP07 的可执行制作脚本。

文件职责：

- `script.md`：教学目标、官方依据、旁白、字幕短句。
- `beats.md`：逐时间段的画面、动作、技术、状态和审查点。
- `scenes.json`：机器可读的 scene/beat 数据，后续可用于驱动 Remotion 或生成检查表。
- `audit.md`：渲染后抽帧、重叠、视觉问题和待优化记录。

当前主题：

```text
rebase 是把当前分支独有的修改在新的 base 上按顺序重放。
它改变历史形状，也会生成新的 commit 身份。
```

官方依据：

- `docs/references/progit2-zh/book/03-git-branching/sections/rebasing.asc:23`
- `docs/references/progit2-zh/book/03-git-branching/sections/rebasing.asc:24`
- `docs/references/progit2-zh/book/03-git-branching/sections/rebasing.asc:36`
- `docs/references/progit2-zh/book/03-git-branching/sections/rebasing.asc:55`
- `docs/references/progit2-zh/book/03-git-branching/sections/rebasing.asc:64`
- `docs/references/progit2-zh/book/03-git-branching/sections/rebasing.asc:150`
- `docs/references/progit2-zh/book/03-git-branching/sections/rebasing.asc:155`

原则：EP07 只讲基本 rebase 和公共历史风险。`--onto`、interactive rebase 和冲突解决留到后续进阶。
