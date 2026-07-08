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

## 当前制作状态

- Remotion 主视频：已实现 7 个 scene 的首版。
- 规范分段输出：7 个分段已全部生成到 `remotion/renders/git-course/ep02-working-tree-index-repo/renders/current/scenes/`。
- 完整正片：已生成到 `remotion/renders/git-course/ep02-working-tree-index-repo/renders/current/final/ep02-working-tree-index-repo_with-audio.mp4`。
- 发布版：已生成到 `remotion/renders/git-course/ep02-working-tree-index-repo/renders/current/published/ep02-working-tree-index-repo_published.mp4`，包含片头、正片和片尾。
- 音频：已按 EP01 流程重做，复用 EP01 BGM，分段 TTS 固定使用 `Chinese (Mandarin)_Gentleman`、`speed=1.25`、停顿标记、SRT、FFmpeg 人声响度规范化和固定低音量 BGM 混音；文件位于 `remotion/renders/git-course/ep02-working-tree-index-repo/renders/current/audio/`。
- 已完成分段：
  - `01_hook.mp4`：0-12s，12.000s。
  - `02_three-areas.mp4`：12-38s，26.000s。
  - `03_modify.mp4`：38-68s，30.000s。
  - `04_add.mp4`：68-104s，36.000s。
  - `05_edit-after-add.mp4`：104-134s，30.000s。
  - `06_commit.mp4`：134-164s，30.000s。
  - `07_takeaway.mp4`：164-180s，16.000s。
- 待继续：如需发布版，可再做一次全片精听和字幕节奏微调。
