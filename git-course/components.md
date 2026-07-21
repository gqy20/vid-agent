# Git Course 组件体系

Git Course 使用单一 Remotion 组件体系。episode JSON 负责教学内容和时间数据，episode 组件负责组合，`remotion/src/videos/git-course/kit/` 负责稳定的视觉语法与几何规则。

历史 Manim 脚本、导出资产和 `ManimClip` 只为旧版本追溯保留，不进入新 scene、构建指纹、candidate 或 release。

## 抽象边界

只在满足以下任一条件时新增共享组件：

- 已经在两个真实 scene 中重复出现。
- 后续章节已确定会复用同一教学状态，而不仅是相似外观。
- 组件集中解决会反复出错的几何、字幕、真实素材或审查问题。

仅服务一个镜头的内容先留在 episode 内；一段零散 JSX 只有在教学语义和输入输出都稳定后才进入 kit。组件不得反向决定课程必须使用哪种镜头。

## 分层

### Episode Runtime

- `createEpisodeRuntime(scenes)`：从生成的 scene 数据建立唯一运行时。
- `EpisodeTimeline`：按 scene id 绑定组件和 Remotion `Sequence`。
- `runtime.start(id)`、`runtime.duration(id)`、`runtime.captions(id)`：替代各集重复维护的查找函数。

episode JSON 仍是 scene、旁白和字幕的唯一内容源。Runtime 只消费生成数据，不保存第二份教学时间线。

### Layout Geometry

- `COURSE_RECTS`：1920×1080 课程画布的 header、主舞台、终端、状态流、总结和字幕安全区。
- `SceneStage`：按 `question`、`center-model`、`terminal`、`state-transition`、`takeaway` 选择确定性舞台。
- `CenterInRect`：在明确矩形中居中，允许显式 optical offset。
- `FitToRect`：根据内容 bounds 计算缩放与位移，不凭肉眼反复微调。
- `MotionLayer`：只承载动画位移、缩放和透明度，不与静态布局坐标混写。
- `LayoutDebug`：仅供 Component Lab 显示课程矩形，不进入成片。

布局顺序固定为：先选主角和舞台，再算内容 bounds，最后添加一次性运动。不要用 motion transform 修复静态布局错误。

### Git Graph

- `GitGraph`：线性 commit 图、branch、HEAD、ref 移动。
- `CourseGraphPrimitives`：后续 DAG、merge、rebase 使用的节点、历史边、branch label 和 HEAD 基准。
- `graphGeometry`：根据节点实际半径和描边计算圆边连接点。
- `CenterGraph`：标准图状态的居中组合。

共享基准来自 EP04–EP06 已确认的视觉比例。节点缩放时必须同步更新边端点、ref 连接和说明位置。历史边在下，commit 节点在上；一对 parent 只画一条边。

### Git State Flow

- `GitStatePanel`：Working Tree、Index、Repository 的状态卡。
- `GitStateFlow`：在状态卡上增加明确的 source、target、命令标签和过渡进度。
- `GitStateTransition`：描述从哪个区域写向哪个区域，不把因果关系埋进 CSS。

调用方决定三栏顺序和当前 active 状态。`git add`、`git commit`、`restore`、`reset` 应优先使用状态流，而不是重新画三套卡片。

### Recorded Terminal

- `TerminalPanel`：真实录屏的课程外框。
- `RecordedTerminalPanel`：底层录屏播放器；只在确有裁切需求时直接使用。
- `RecordedTerminalStage`：默认入口，把录屏放进课程终端矩形。
- `CommandPill`、`CommandStrip`：状态解释阶段保留命令上下文，不冒充真实终端。

所有完整终端操作来自 `git-course-lab` 录制资产。旧的 `AnimatedTerminal`、`TerminalFocusScene`、`TypedCommandTerminal` 和 `StatusTerminalPanel` 已退出并删除，不能重新作为 episode 入口。

### Captions

- `CaptionLayer`：统一文字清理、宽度、底部位置、行高和审查属性。
- `NarrationSubtitle`：渲染 episode timeline 派生的逐 cue 旁白字幕。
- `SceneCaption`：短结论或动作收束。
- `QuestionCaption`：问题镜头的收束句。

EP05–EP08 的旁白字幕由 episode JSON / SRT 派生；EP01–EP04 的历史人工 cue 仍通过同一 `CaptionLayer` 渲染，迁移内容时间线时必须单独审查，不能为了组件统一而悄悄改写旁白。

## Component Lab

`GitCourseComponentLab` 是 30 秒开发 composition，包含六个 5 秒分区：

1. Layout geometry
2. Git graph
3. State flow
4. Recorded terminal
5. Caption layer
6. Stress case

每个分区也注册为独立 composition，便于在 Remotion Studio 中直接选择。它们不是 episode，不接 TTS、BGM、candidate、current 或 release，也不提交渲染媒体。

共享组件视觉改动至少执行：

```bash
pnpm --dir remotion typecheck
pnpm --dir remotion git-course:lab:audit
```

需要人工看运动时，把 `GitCourseComponentLab` 渲染到 `remotion/renders/git-course/tmp/component-lab/`。Lab 只能补充真实分集审查，不能代替受影响 episode 的 preview 和抽帧。

## 自动布局审查

关键可见元素使用稳定的 `data-audit-id`。布局容器使用 `data-audit-safe-area`；纯调试或容器框使用 `data-audit-ignore`；同一 Git 图内部允许靠近但仍禁止相交的元素使用相同 `data-audit-group`。

`remotion/scripts/audit-overlaps.sh` 检查：

- 两个独立审查元素的真实 DOM 包围盒相交。
- 可见元素距离过小。
- 低透明度残影。
- 元素超出 1920×1080 画布。
- 元素超出最近的安全区容器。

`STRICT=1` 时任一问题都会返回非零。自动几何检查无法判断 Git 语义和注意力竞争，最终仍要审查编码后的 MP4。

## 公共入口纪律

episode 优先从 `kit.ts` 的公开入口导入。低层文件可以保留给共享组合内部使用，但不要因为“可能以后有用”就全部加入 barrel。

新增或修改公开组件时同时完成：

- 明确 props 的教学语义，不只传任意 style。
- 在 Component Lab 中覆盖正常输入和长内容输入。
- 为关键边界添加审查属性。
- 在至少一个真实 scene 中验证编码后画面。
- 更新本文件、`workflow.md` 与 `checklist.md` 中受影响的规则。
