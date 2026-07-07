# 组件系统

课程采用两层组件库：

- Remotion 组件库：负责成片编排、品牌系统、终端、代码、Git 状态、字幕和 Manim 片段合成。
- Manim 场景库：负责难以用普通 UI 表达的精密原理动画，例如 DAG、对象模型、hash、三路合并。

原则：Remotion 做可复用的视频系统，Manim 做专题原理动画。不要让 Manim 编排整集，也不要让 Remotion 硬画复杂数学结构。

## Remotion 组件库

路径：`remotion/src/videos/git-course/kit/`

### 视频框架

- `CourseLayout`: 统一课程背景、顶部品牌栏和章节进度。
- `Scene`: 统一安全区和基础场景容器。
- `Intro`: 统一片头。
- `EpisodeTitleCard`: 单集开头 hook 内使用的标题卡，不等同于全局品牌片头 `Intro`。
- `Outro`: 统一片尾和本集总结。
- `ChapterProgress`: 顶部只显示当前章节编号和名称，避免观众迷失。
- `VideoProgress`: 底部全局进度条，支持章节节点。视频内不需要 hover、预览或交互状态。
- `PositionedMotion`: 统一绝对定位、透明度和位移动画容器，避免 episode 内反复散写定位 wrapper。

进度设计原则：

- 顶部不再显示分段条，避免和底部进度重复。
- 底部进度条固定贴边，厚度保持克制，不侵入字幕和主体安全区。
- 章节节点只作为节奏标记，不显示文字标签。

### 时间线规范

课程代码采用“语义用秒，执行用帧”：

- 分镜、scene duration、镜头内动画节拍用 `seconds(...)` 表达。
- 渲染、抽帧、chunk 切分仍然使用帧，因为 Remotion 的确定性边界是 frame。
- 不在 episode 里直接写 `12 * FPS` 或 `getSceneStart(id) + 36`。
- 跨 scene 的触发点使用 `sceneTime(sceneId, offsetSeconds)`。
- scene 容器使用 `getSceneStart(id)` 和 `getSceneDuration(id)`，避免同一个时长在 `timeline.ts` 和 episode 中重复维护。

示例：

```ts
export const SCENES = [
  {id: 'hook', title: '问题', duration: seconds(12)},
];

const at = sceneTime('commit', 1.27);
```

### 终端

- `TerminalPanel`: 统一终端外框。
- `AnimatedTerminal`: 当前主用终端动画，已复用 `TerminalPanel`。
- `CommandPill`: 用于在图形场景中短暂显示当前命令，不承载完整终端交互。
- `TerminalFocusScene`: 终端全屏输入命令。
- `TerminalSplitScene`: 可复用的终端/解释双栏布局；不作为整集默认常驻布局。
- `CommandStep`: 单条命令的静态渲染单元。
- `CommandOutput`: 命令输出渲染单元。

标准节奏：

1. 全屏终端输入命令。
2. 终端缩到左侧并降权，只保留因果上下文。
3. 当前 ref 行短暂出现，说明这条命令改变了什么。
4. GitGraph 或 GitStatePanel 放大，显示内部状态变化。
5. 动作提示用一句短字幕收束，不重复画面信息。

### 代码

- `CodeBlock`: 普通代码或配置片段。
- `CodeDiff`: diff 片段，区分新增、删除和上下文。
- `FileTree`: 文件树、`.git` 目录结构、工作区文件状态。
- 旧 `CodeWindow`: 继续用于 refs 表等简单键值展示，后续可逐步替换。

### Git 可视化

- `GitGraph`: 提交图、branch 标签、HEAD 位置。
- `CenterGraph`: 居中展示 `GitGraph` 的课程场景容器，只接收标准 `GitGraphState`，不依赖具体 episode 的业务数据类型。
- `GitGraph` 支持 `headMotion` 和 `branchMotion`，用于表现 HEAD 在分支间移动、branch 指针从旧 commit 滑到新 commit。
- `GitGraph` 支持 `auditId`，会给 commit、branch、HEAD 输出稳定的 `data-audit-id`，用于后续自动重叠检查。
- `GitRefWritePanel`: 表达“写入 ref -> 指针出现”的因果动画。
- `MiniRefLine`: 轻量 ref 行展示，用于短暂显示 `.git/refs/heads` 或 `.git/HEAD` 的当前值。
- `RefWriteBar`: 表达 ref 写入进度的状态条，适合命令导致 ref 改变的中间步骤。
- `BranchPointerHookGraph`: 片头问题段使用的极简 branch 指针图。
- `BranchRefMentalModelGraph`: “branch 是 ref”模型段使用的 commit 链、main/feature 指针图。
- 数据入口：`GitGraphState`。

推荐数据结构：

```ts
type GitGraphState = {
  commits: {id: string; label?: string}[];
  branches: {name: string; target: string; active?: boolean; lane?: 'top' | 'bottom'}[];
  head?: {target: string; branch?: string};
};
```

动画必须表达状态变化，而不是装饰：

- branch 创建：出现一个新 ref。
- ref 写入：先写入 `refs/heads/<name> -> <commit>`，再出现 branch 标签。
- HEAD 移动：当前位置从一个 branch 切到另一个 branch。
- commit 生成：新 commit 出现，当前 branch 向前移动。
- merge / rebase / reset：必须能看出提交图或引用发生了什么变化。

### Git 状态

- `GitStatePanel`: Working Tree、Index、Repository 三段状态。

用于讲：

- `git add`
- `git commit`
- `git restore`
- `git reset`

### 讲解辅助

- `Callout`: 一句话结论、常见误区、提示。
- `QuestionCaption`: hook 或问题场景中的底部问题句。
- `SideLabel`: 图形场景中的侧边短说明，带 main / feature / HEAD 语义色圆点。
- `NarrationSubtitle`: 旁白完整句，底部安全区，最多两行。
- `ActionCaption`: 短动作提示，底部更窄，不超过一行。
- 字幕样式集中在 `subtitleTokens.ts`，episode 内不再直接使用旧的 `Subtitle` 组件。

## Manim 场景库

路径：`scripts/manim/git-course/`

### 位置检查边界

Manim 可以原生检查自己的图形位置，因为每个 `Mobject` 都有包围盒信息，例如 `get_left()`、`get_right()`、`get_top()`、`get_bottom()`、`width`、`height` 和 `get_bounding_box()`。适合给 Manim 场景库增加：

- `assert_no_overlap(a, b, padding=...)`
- `assert_inside_frame(mobject, margin=...)`
- 对 commit node、branch label、箭头、说明文字做构建期检查。

但 Manim 不能原生检查 Remotion 里的 DOM、HTML、CSS 或 SVG 布局。当前 GitGraph、终端、字幕、进度条都属于 Remotion 画面，应使用 Remotion/浏览器侧检查：

- 给关键元素加 `data-audit-id`。
- 在关键帧中读取 `getBoundingClientRect()` 或 SVG 的 `getBBox()`。
- 对字幕、终端、GitGraph 标签、进度条、说明文字做矩形碰撞检查。
- 最后仍保留抽帧人工复核，因为语义拥挤不是纯几何检查能完全判断的。

### shared

- `shared/palette.py`: 与 Remotion 对齐的语义色。
- `shared/primitives.py`: Manim 基础图元和构建期检查。

当前基础图元：

- `label_text`: 统一 Manim 中文/英文文字样式。
- `commit_node`: commit 圆点。
- `branch_label`: 分支标签。
- `pointer_to`: 指向 commit 或对象的 ref 指针。
- `object_box`: blob / tree / commit 等对象盒子。
- `graph_edge`: commit 图连线。
- `causal_arrow`: 因果箭头。
- `assert_inside_frame`: 检查元素没有出画。
- `assert_no_overlap`: 检查两个元素没有几何重叠。

Remotion 合成 Manim 输出时统一使用 `ManimClip`：

```tsx
<ManimClip
  src="git-course/manim/ep04/branch-pointer.mp4"
  title="branch pointer"
  caption="branch 是一个 ref，指向某个 commit"
/>
```

Manim 片段不直接承担整集标题、章节进度、字幕系统；这些由 Remotion 的 `CourseLayout`、`SceneSequence` 和字幕组件统一处理。

### scenes

第一阶段场景：

- `GitDAGScene`: Git history 是 DAG。
- `GitObjectModelScene`: blob、tree、commit 的关系。
- `HashScene`: 内容变化导致 hash 变化。
- `ThreeWayMergeScene`: base / ours / theirs / result。

Manim 输出视频后放入：

```text
remotion/public/git-course/manim/<lesson-id>/
```

再由 Remotion 作为素材合成。

## 第一阶段目标

先支撑 3 到 5 集高质量课程：

- `git add`
- `git commit`
- `git branch`
- `git merge`
- `git rebase`

组件成熟前，不扩展过多装饰组件。每新增组件都必须至少服务一个真实课程镜头。
