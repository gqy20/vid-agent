# EP04：Branch 只是一个指针

`看得见的 Git` 系列课程的原型集。

## 当前产物

- Composition：`GitCourseEp04BranchIsPointer`
- 源码：`remotion/src/videos/git-course/`
- 输出：`current/ep04-branch-is-pointer.mp4`
- 缩略图：`thumbnail.png`
- Manim 参考资产：`remotion/public/git-course/manim/ep04/branch-pointer.mp4`

## 实现说明

- Remotion 是最终编排层，负责课程外壳、终端、refs 窗口、字幕和镜头节奏。
- 当前主视频使用 Remotion 原生图形解释分支指针，避免内嵌 Manim 视频带来多层标题和重复说明。
- Manim 资产保留为参考，可用于后续统一 Git 图形组件时复用动作设计。
- 当前原型时长约 70 秒；正式课程应扩展到 3-6 分钟，并加入旁白。
- 当前视频还没有真实配音；Remotion 输出的是静音 AAC 音轨。

## 复现命令

```bash
scripts/fetch-progit-references.sh
.claude/skills/manim-viz/scripts/render_scene.sh scripts/manim/git-course/ep04_branch_pointer.py BranchPointer qh /home/qy113/workspace/project/2607/vid-agent/renders/2026-07-06-git-course-ep04-manim/renders/final
cp renders/2026-07-06-git-course-ep04-manim/renders/final/ep04_branch_pointer_qh_20260706-210342.mp4 remotion/public/git-course/manim/ep04/branch-pointer.mp4
cd remotion
REMOTION_VIDEO_FILTER=git-course pnpm exec remotion render src/index.ts GitCourseEp04BranchIsPointer renders/git-course/ep04-branch-is-pointer/current/ep04-branch-is-pointer.mp4 --overwrite --timeout=120000 --concurrency=2
```

## 检查命令

```bash
cd remotion
pnpm typecheck
pnpm meta:sync renders/git-course/ep04-branch-is-pointer
pnpm video:audit \
  renders/git-course/ep04-branch-is-pointer/current/ep04-branch-is-pointer.mp4 \
  renders/git-course/ep04-branch-is-pointer/tmp/audit-visual
```

最终抽帧检查图：

```text
tmp/audit-visual/contact-16.jpg
```
