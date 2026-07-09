# EP05 HEAD 是什么 - 制作目录

这个目录保存 EP05 的可执行制作脚本。

文件职责：

- `script.md`：教学目标、官方依据、旁白、字幕短句。
- `beats.md`：逐时间段的画面、动作、技术、状态和审查点。
- `scenes.json`：机器可读的 scene/beat 数据，后续可用于驱动 Remotion 或生成检查表。
- `audit.md`：渲染后抽帧、重叠、视觉问题和待优化记录。

当前主题：

```text
HEAD 表示当前位置。
通常它指向当前 branch，而 branch 再指向 commit。
```

官方依据：

- `docs/references/progit2-zh/book/03-git-branching/sections/nutshell.asc:77`
- `docs/references/progit2-zh/book/03-git-branching/sections/nutshell.asc:79`
- `docs/references/progit2-zh/book/03-git-branching/sections/nutshell.asc:111`
- `docs/references/progit2-zh/book/10-git-internals/sections/refs.asc:73`
- `docs/references/progit2-zh/book/10-git-internals/sections/refs.asc:78`
- `docs/references/progit2-zh/book/10-git-internals/sections/refs.asc:101`

原则：EP05 只解释 HEAD 的位置模型。不要提前展开 reflog、reset 细节或远程跟踪分支；detached HEAD 只作为边界出现。
