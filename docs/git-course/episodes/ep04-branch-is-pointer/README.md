# EP04 Branch 只是一个指针 - 制作目录

这个目录保存 EP04 的可执行制作脚本。

文件职责：

- `script.md`：教学目标、旁白、字幕短句。
- `beats.md`：逐时间段的画面、动作、技术、状态和审查点；后半部分包含可反查代码与帧范围的执行规格卡。
- `scenes.json`：机器可读的 scene/beat 数据，后续可用于驱动 Remotion 或生成检查表。
- `audit.md`：渲染后抽帧、重叠、视觉问题和待优化记录。

当前代码入口：

```text
remotion/src/videos/git-course/episodes/Ep04BranchIsPointer.tsx
```

当前时间线入口：

```text
remotion/src/videos/git-course/episodes/Ep04BranchIsPointer.tsx
```

## 当前制作状态

- Remotion 主视频：已对齐 EP01/EP02 的 episode 内 scene 结构。
- 分段渲染：已生成 9 个分段，文件输出到 `remotion/renders/git-course/ep04-branch-is-pointer/renders/current/scenes/`：
  - `01_hook.mp4`（0-12s）
  - `02_mental-model.mp4`（12-30s）
  - `03_terminal.mp4`（30-48s）
  - `04_branch-write.mp4`（48-70s）
  - `05_branch-result.mp4`（70-98s）
  - `06_switch.mp4`（98-122s）
  - `07_commit.mp4`（122-154s）
  - `08_compare.mp4`（154-168s）
  - `09_takeaway.mp4`（168-180s）
- 说明：每次命令分段默认走 `renders/tmp/scenes/<scene-id>/`，完成后会拷贝到 current 场景目录。
- 命令入口：
  - `pnpm --dir remotion run render:git:ep04:hook`
  - `pnpm --dir remotion run render:git:ep04:mental-model`
  - `pnpm --dir remotion run render:git:ep04:terminal`
  - `pnpm --dir remotion run render:git:ep04:branch-write`
  - `pnpm --dir remotion run render:git:ep04:branch-result`
  - `pnpm --dir remotion run render:git:ep04:switch`
  - `pnpm --dir remotion run render:git:ep04:commit`
  - `pnpm --dir remotion run render:git:ep04:compare`
  - `pnpm --dir remotion run render:git:ep04:takeaway`

原则：先审 `script.md` 和 `beats.md`，再改 Remotion。任何“9s 重叠”“17s 没箭头”这类问题，都应该能回到 beat spec 判断是脚本遗漏还是实现偏差。
