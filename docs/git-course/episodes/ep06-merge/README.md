# EP06 Merge 做了什么 - 制作目录

这个目录保存 EP06 的可执行制作脚本。

文件职责：

- `script.md`：教学目标、官方依据、旁白、字幕短句。
- `beats.md`：逐时间段的画面、动作、技术、状态和审查点。
- `scenes.json`：机器可读的 scene/beat 数据，后续可用于驱动 Remotion 或生成检查表。
- `audit.md`：渲染后抽帧、重叠、视觉问题和待优化记录。

当前主题：

```text
merge 有两种基础形态。
没有分歧时只是 fast-forward；有分歧时使用共同祖先、ours、theirs 做三方合并。
```

官方依据：

- `docs/references/progit2-zh/book/03-git-branching/sections/basic-branching-and-merging.asc:111`
- `docs/references/progit2-zh/book/03-git-branching/sections/basic-branching-and-merging.asc:115`
- `docs/references/progit2-zh/book/03-git-branching/sections/basic-branching-and-merging.asc:172`
- `docs/references/progit2-zh/book/03-git-branching/sections/basic-branching-and-merging.asc:177`
- `docs/references/progit2-zh/book/03-git-branching/sections/basic-branching-and-merging.asc:178`
- `docs/references/progit2-zh/book/03-git-branching/sections/basic-branching-and-merging.asc:196`

原则：EP06 的主角是“分叉历史如何合到一起”。冲突只讲到为什么出现和 Git 停在哪里，不讲高级冲突排查。
