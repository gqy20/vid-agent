# 组件系统

课程采用单一 Remotion 组件体系：

- Remotion 组件库：负责成片编排、品牌系统、终端、代码、Git 状态、字幕、DAG、对象模型、hash、三路合并和 rebase。
- 历史 Manim 场景库、导出资产与 `ManimClip` 保留用于追溯旧版本，不再参与 Git Course 新制作。

原则：教学状态先建模，再用可复用的 React/SVG/CSS 组件表达。不要把复杂关系散写成 episode 内的一次性图形。

## 技术选型规则

每个镜头先判断表达目标，再决定使用现有 Remotion 组合、补充 kit 状态模型或引入必要的真实外部素材。不能只因为当前库里已有或没有某个组件就改变教学表达。

### Remotion 实现范围

- 课程包装：片头、片尾、标题、章节进度、底部进度条。
- 旁白字幕：`NarrationSubtitle`、`ActionCaption`、`QuestionCaption`。
- 终端输入、命令输出、代码块、diff、文件树。
- UI 状态流转：Working Tree、Index、Repository、refs 表。
- Git 图与抽象模型：commit 链、branch 标签、HEAD 指针、ref 写入、DAG、对象关系、hash、merge、rebase。
- 需要和字幕、终端、代码严格对齐的因果动作链。

### 复杂关系实现规则

- 把 blob、tree、commit、parent、DAG、merge base、three-way merge、rebase replay 等关系建模为明确状态，不从最终画面倒推零散动画。
- 通用 commit node、branch label、箭头、卡片和状态面板沉淀在 `remotion/src/videos/git-course/kit/`。
- 关键节点输出稳定的 `data-audit-id`，使用浏览器侧包围盒和抽帧审查验证箭头、节点、标签与字幕。
- 时间线只驱动状态变化与一次性强调；不使用循环运动掩盖模型不清楚的问题。

如果现有 kit 不足，应先在分集文档列出所需状态和复用边界，再新增 Remotion 组件，例如：

```text
remotion/src/videos/git-course/kit/git/SnapshotStream.tsx
```

### 外部图片和网络素材规则

Git 课程优先使用自制 Remotion 图形。只有这些情况才考虑外部图片或网络素材：

- 需要展示真实界面或真实产品，例如 Git 官网、GitHub 页面、终端真实截图。
- 需要历史语境，例如集中式版本控制、分布式协作的真实资料图。
- 需要观众能立即识别的真实对象，而自制抽象图会降低理解效率。

使用外部素材必须在分集文档中说明：

- 用途：为什么需要真实图片，而不是自制图。
- 来源：URL、许可或截图生成方式。
- 存放位置：`remotion/public/git-course/assets/<episode-id>/`。
- 替代方案：无法使用网络素材时，使用 Remotion 自制图。

不允许把网络图片当作装饰背景。外部素材必须服务解释，不负责风格。

## Remotion 组件库

路径：`remotion/src/videos/git-course/kit/`

### 视频框架

- `CourseLayout`: 统一课程背景、顶部品牌栏和章节进度。
- `Scene`: 统一安全区和基础场景容器。
- `Intro`: 统一片头。
- `EpisodeTitleCard`: 单集开头 hook 内使用的标题卡，不等同于全局品牌片头 `Intro`。
- `Outro`: 统一片尾和本集总结。
- `RefLightboxIntro`: 全课程统一品牌片头，独立 composition，默认 7 秒。
- `RefLightboxOutro`: 全课程统一品牌片尾，独立 composition，默认 6 秒；不绑定具体分集，不放下集预告。
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
- `CourseGraphPrimitives`: 固定 EP04/EP05 建立的 commit 半径、节点间距、线宽、ref 尺寸及 ref 到圆边的连接距离；EP06 之后的 merge、rebase 和 history 图必须复用这套几何基准。
- `GitGraph` 支持 `headMotion` 和 `branchMotion`，用于表现 HEAD 在分支间移动、branch 指针从旧 commit 滑到新 commit。
- `GitGraph` 支持 `auditId`，会给 commit、branch、HEAD 输出稳定的 `data-audit-id`，用于后续自动重叠检查。
- `GitRefWritePanel`: 表达“写入 ref -> 指针出现”的因果动画。
- `MiniRefLine`: 轻量 ref 行展示，用于短暂显示 `.git/refs/heads` 或 `.git/HEAD` 的当前值。
- `RefWriteBar`: 表达 ref 写入进度的状态条，适合命令导致 ref 改变的中间步骤。
- `SnapshotCard`: 统一 base / ours / theirs / result 等快照字段卡，供 merge 与后续快照比较复用。
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

## 历史 Manim 资产

路径包括 `scripts/manim/git-course/`、`scripts/manim/git-course-lab/`、`remotion/public/git-course/manim/` 和 `remotion/src/videos/git-course/kit/manim/ManimClip.tsx`。

- 这些文件为旧版本复现与设计参考保留，不删除、不继续扩展。
- Git Course composition 不得导入 `ManimClip`，episode JSON 不得声明 Manim scene 或 bridge。
- orchestrator 不扫描这些资产，不把它们纳入 scene 指纹，也不允许它们进入 candidate 或 release。
- 如需复用其中的教学表达，应把状态与关系重写为 Remotion kit 组件，并重新走 scene 审查。

### Remotion 位置检查

当前 GitGraph、终端、字幕、进度条和抽象模型都属于 Remotion 画面，应统一使用 Remotion/浏览器侧检查：

- 给关键元素加 `data-audit-id`。
- 在关键帧中读取 `getBoundingClientRect()` 或 SVG 的 `getBBox()`。
- 对字幕、终端、GitGraph 标签、进度条、说明文字做矩形碰撞检查。
- 最后仍保留抽帧人工复核，因为语义拥挤不是纯几何检查能完全判断的。

## 第一阶段目标

先支撑 3 到 5 集高质量课程：

- `git add`
- `git commit`
- `git branch`
- `git merge`
- `git rebase`

组件成熟前，不扩展过多装饰组件。每新增组件都必须至少服务一个真实课程镜头。
