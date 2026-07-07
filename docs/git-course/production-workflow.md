# 生产工作流

课程生产从文字脚本开始，不直接写动画。

## 流程

```text
script.md
  ↓
scenes.json
  ↓
Remotion 主视频
  ↓
Manim 原理片段
  ↓
Remotion 合成
  ↓
抽帧审查与 meta 同步
```

## 每集目录

推荐每集保留这些文件：

```text
docs/git-course/episodes/<episode-id>.md
remotion/src/videos/git-course/lessons/<episode-id>/
scripts/manim/git-course/scenes/<topic>_scene.py
remotion/renders/git-course/<episode-id>/
```

当前 Ep04 仍位于 `episodes/` 目录，后续新增课程可以逐步迁移到 `lessons/`。

## script.md

写清楚：

- 本集要解决的问题。
- 观众已有前置知识。
- 每个镜头的旁白。
- 每个命令会造成什么状态变化。
- 哪些地方需要 Manim 原理动画。

## scenes.json

每个场景至少包含：

```json
{
  "id": "branch-create",
  "duration": 12,
  "layout": "terminal-split",
  "command": "git branch feature",
  "stateAfter": "feature 指向 C2",
  "subtitle": "写入一条 ref"
}
```

目标是让一集主要由数据驱动，而不是在 React 里散写镜头逻辑。

## Remotion

Remotion 负责：

- 课程品牌。
- 终端演示。
- 字幕。
- 代码和 diff。
- Git 状态图。
- Manim 片段合成。
- 最终音视频输出。

统一从 `remotion/src/videos/git-course/kit/` 使用组件，不在 episode 内重复实现终端、片头、片尾和基础 Git 图形。

## Manim

Manim 负责：

- DAG。
- Git 对象模型。
- hash / SHA。
- Merkle tree。
- 三路合并。
- diff 算法。

Manim 片段应该短，通常 8 到 20 秒。它解释一个抽象原理，然后回到 Remotion 的课程主线。

## 审查

每次出片后必须检查：

- 字幕是否遮挡终端、图形、HEAD、分支标签。
- 是否存在无意义循环动画。
- 命令、状态变化、图形变化是否有明确因果。
- 颜色是否只表达语义，不做随意装饰。
- 画面是否同时塞入太多信息。

当前可用命令：

```bash
pnpm --dir remotion video:audit <video> <output-dir>
pnpm --dir remotion meta:sync <episode-dir> "<render command>"
```
