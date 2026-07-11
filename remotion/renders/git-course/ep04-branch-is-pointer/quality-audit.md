# 质量评估

## 检查范围

- 视频：`current/ep04-branch-is-pointer.mp4`
- 抽帧总览：`tmp/audit-visual/contact-16.jpg`
- 样帧目录：`tmp/audit-visual/frames/`
- 镜头变化日志：`tmp/audit-visual/scene-changes.log`

## Meta 更新流程

`meta.json` 之前不会自动更新，是因为这一集直接渲染到了 `current/`，绕过了 `scripts/promote.sh`。已有的 promote 流程会探测视频元数据并更新 `meta.json`，但它要求先走 candidate/publish 发布流程。

直接覆盖 current 的渲染现在有专用同步命令：

```bash
pnpm --dir remotion meta:sync renders/git-course/ep04-branch-is-pointer
```

抽帧检查现在有专用命令：

```bash
pnpm --dir remotion video:audit \
  renders/git-course/ep04-branch-is-pointer/current/ep04-branch-is-pointer.mp4 \
  renders/git-course/ep04-branch-is-pointer/tmp/audit-visual
```

## 初始布局结论

样帧中没有发现明显的物理遮挡。字幕位于底部安全区内，没有压住终端、refs 表、提交图或 Manim 面板。

真正的问题是语义重叠：同一个概念在同一帧里被多个元素重复表达。

- `22-36s`：终端命令、refs 表、Manim 标题、Manim 注释、图标签和底部字幕都在解释“branch 是指针”。
- `35-36s`：底部字幕重复了 Manim 面板里的命令注释。
- `40-54s`：左侧终端已经不再提供主要新信息，但视觉上仍然太强。

## 初始动画结论

镜头变化检测只找到四个强视觉变化点：

- `10s`：开场切到提交链布局
- `22s`：提交链布局切到 Manim 面板
- `40s`：Manim 面板切到 Remotion 图形
- `58s`：图形布局切到收束画面

大部分时间仍然是静态讲解板，只在局部发生打字和指针变化。概念能讲清楚，但趣味性不够，还不像一段精心编排的课程视频。

## 初始冗余评估

当前信息层级过载：

- 顶部标题持续重复本集主题。
- 字幕在解释图形已经表达的内容。
- Manim 面板内部有标题和说明，Remotion 又在底部加了一层字幕。
- 当前概念已经转向 refs 或图形移动时，终端历史仍然常驻。

这会让视频更像教学材料的屏幕录制，而不是有节奏的课程片段。

## 下一轮优化

1. 每个节拍只让一个元素承担主叙事。
   终端节拍以终端为主，图形缩小；图形节拍以图形为主，终端降权；Manim 节拍不要再出现多层标题。

2. 把解释型字幕改成动作提示。
   优先使用 `写入一条 ref`、`HEAD 切过去`、`feature 前进` 这类短句，避免重复画面里已有的完整解释。

3. 强化命令和结果之间的因果动画。
   每条命令执行后，只高亮被改变的 ref 行和正在移动的指针，让观众看到“命令导致一个对象变化”。

4. 降低过期终端信息的视觉权重。
   旧命令淡到 35-45%，或只保留最近命令，让图形和 refs 表承担当前节拍。

5. 让最后 12 秒动起来。
   收束段快速回放三步变化：创建分支、切换 HEAD、提交后 feature 前进。静态口号停留 12 秒太长。

## 初始判断

视频可读、没有明显布局错误，但还不够像一集打磨过的 Git 课程。需要减少同屏文字重复，并增加可见的状态变化动画。

## 已执行优化

- 底部字幕从长解释改为短动作提示，例如 `写入一条 ref`、`只移动 feature`。
- 字幕样式已集中到 `src/videos/git-course/subtitleTokens.ts`，分为旁白字幕和动作提示两套 token。
- Ep04 已清理旧字幕用法，改为 `NarrationSubtitle` 与 `ActionCaption`。
- branch 段不再直接嵌入带内部标题的 Manim 视频，改为 Remotion 原生图形面板。
- 旧终端内容在 refs / 图形节拍中降低视觉权重，只保留因果上下文。
- refs 表的当前变化行使用稳定高亮，不再循环缩放或左右晃动。
- 结尾从静态口号改为三步状态回放：创建 feature、HEAD 切过去、feature 前进。

## 优化后复核

- 重新生成抽帧总览：`tmp/audit-visual/contact-16.jpg`。
- 组件库接入后重新生成抽帧总览：`tmp/audit-kit/contact-16.jpg`。
- branch 写入面板已沉淀为 `GitRefWritePanel`，Ep04 不再保留局部实现。
- branch 段已移除 Manim 内部标题和重复说明，同屏信息从“终端 + refs + Manim 标题 + Manim 注释 + 长字幕”降为“终端上下文 + refs 变化 + 原生图形面板 + 短动作提示”。
- commit 段仍保留终端上下文，但终端已降权，主变化由 refs 高亮和右侧指针移动承担。
- 结尾 12 秒不再是静态口号，而是三步状态回放，节奏明显更像课程收束。
- 复核 `36s`、`54s`、`64s` 关键帧，未发现字幕、refs 表、图形标签之间的物理重叠；HEAD 标签裁切已修复。
- 复核组件化后的片尾关键帧，HEAD 与 feature 标签距离偏近但没有物理重叠，仍保持可读。
- 顶部栏已压缩为轻量导航；终端不再通过整体 opacity 变暗，阴影已减轻。
- 仍待后续处理：正式版需要加入旁白、BGM，并把时长扩展到 3-6 分钟。

## 2026-07-07 导演层复核

本轮按 restrained palette 重置课程配色：石白画布、青灰软底、白色抬升层，`main` 使用矿物青绿，`feature` 使用氧化铜，`HEAD` 只作为高亮/环/点出现。背景渐变和阴影进一步减弱，避免重色和课件卡片感。

Ep04 时间线已从 5 段重构为 7 段：

- `0-6s`：问题和极简图形。
- `6-14s`：全屏终端输入。
- `14-22s`：放大 commit 链。
- `22-38s`：`git branch feature` 写入 ref，feature 标签落到 C2。
- `38-50s`：`git switch feature` 后 HEAD 从 main 滑到 feature。
- `50-64s`：`git commit` 后 C3 出现，feature 从 C2 前进到 C3，main 保持在 C2。
- `64-70s`：三步结论回放。

已复核关键帧：

- `frame-0090`：开头留白充足，顶部栏没有占用过高空间。
- `frame-0300`：终端全屏阶段没有其它叙事层抢焦点，终端不整体发暗。
- `frame-0540`：commit 链为单主视觉，字幕没有压住节点。
- `frame-0840`：branch 写入阶段已移除重复底层 Git 图，feature 标签与写入面板不再重叠。
- `frame-1260`：HEAD 切换阶段只显示当前 `.git/HEAD` 变化行，右侧图形承担主叙事。
- `frame-1680`：commit 阶段修复了 C3 右侧 HEAD 裁切，并避免 HEAD 覆盖 feature 文本。
- `frame-1980`：片尾仍是结论回放，没有下集预告。

仍可继续提升：

- branch / switch / commit 三段左侧仍保留终端上下文和当前 ref 行，信息层已减少但还不是完全电影化。下一轮可以在命令完成后让终端进一步退到角落，甚至只保留命令胶囊。
- 当前动作链已可读，但还可以加入更细的 easing 和短暂停顿，让“main 没动”更有强调。

## 2026-07-07 三分钟版本复核

本轮把 Ep04 拉长到 3 分钟，时间线调整为 9 个节拍：

- 问题：12s
- 模型：18s
- 命令：18s
- 写入 ref：22s
- 分支出现：28s
- HEAD 切换：24s
- feature 前进：32s
- 对比：14s
- 结论：12s

关键优化：

- 顶部章节区压缩为轻量文字，移除顶部进度分段条。
- 新增 `VideoProgress` 底部全局进度条和章节节点。
- `GitGraph` 增加 `auditId`，commit、branch、HEAD 都有稳定的 `data-audit-id`，后续可做 DOM/SVG 包围盒重叠检查。
- `branch-write`、`switch`、`commit` 三段都改为命令胶囊触发，再切到 Git 图和 ref 行的因果动画。

已复核关键帧：

- `frame-1590`：branch 写入阶段，小图形、ref 行和说明文字没有物理重叠；底部进度条只占画面底边。
- `frame-3150`：HEAD 切换阶段，HEAD 与 feature 标签保持可读距离；左侧说明没有压住 Git 图。
- `frame-4020`：commit 阶段，feature 与 HEAD 标签距离偏紧但没有遮挡；字幕、ref 行、图形之间没有压叠。
- `frame-5220`：结论阶段，图形、步骤列表和底部进度条互不干扰。

关于 Manim 检查：

- Manim 可以原生检查 Manim `Mobject` 的包围盒，适合未来给 DAG、对象模型、三路合并等 Manim 场景加 `assert_no_overlap`。
- 当前 Ep04 的小图形主要是 Remotion SVG/DOM，应该基于 `data-audit-id` 在浏览器侧取 `getBoundingClientRect()` / `getBBox()` 做检查，而不是让 Manim 检查 Remotion 布局。
