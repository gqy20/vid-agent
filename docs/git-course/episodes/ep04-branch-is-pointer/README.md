# EP04 Branch 只是一个指针 - 制作目录

这个目录保存 EP04 的可执行制作脚本。

文件职责：

- `script.md`：教学目标、旁白、字幕短句。
- `beats.md`：逐时间段的画面、动作、技术、状态和审查点。
- `scenes.json`：机器可读的 scene/beat 数据，后续可用于驱动 Remotion 或生成检查表。
- `audit.md`：渲染后抽帧、重叠、视觉问题和待优化记录。

当前代码入口：

```text
remotion/src/videos/git-course/episodes/Ep04BranchIsPointer.tsx
```

当前时间线入口：

```text
remotion/src/videos/git-course/timeline.ts
```

原则：先审 `script.md` 和 `beats.md`，再改 Remotion。任何“9s 重叠”“17s 没箭头”这类问题，都应该能回到 beat spec 判断是脚本遗漏还是实现偏差。
