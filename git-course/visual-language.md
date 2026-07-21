# 视觉语言

## 气质

安静、清晰、工程感。采用 restrained palette：中性底色占绝大多数，色彩只服务语义。避免黑底终端铺满全片，也避免高饱和科技感。

## 色彩系统

课程使用 semantic color tokens，不直接在组件里写裸色值。

### 画布

- `canvas.base`: `#f7f7f4`
- `canvas.soft`: `#eef1ec`
- `canvas.raised`: `#ffffff`
- `canvas.overlay`: `rgba(255,255,255,0.86)`

### 文本

- `text.primary`: `#182321`
- `text.secondary`: `#5f6b67`
- `text.tertiary`: `#89928d`
- `text.inverse`: `#f7f7f4`

### Git 语义色

- `git.main`: `#1f6869`，主线分支
- `git.feature`: `#a45f49`，实验分支
- `git.head`: `#b98723`，当前位置和瞬时焦点
- `git.commit`: `#182321`，提交节点
- `git.graphLine`: `#c7cec5`，提交父子关系
- `git.workingTree`: `#60766a`，工作区变化
- `git.index`: `#b98723`，暂存区
- `git.conflict`: `#b64e45`，冲突

### 终端

- `terminal.bg`: `#17211f`
- `terminal.bgTop`: `#202a27`
- `terminal.border`: `#33403c`
- `terminal.output`: `#cdd8d3`
- `terminal.comment`: `#91a79f`

终端可以是深色，但不能是黑洞。它是实验台，不是整套课程的视觉中心。

### 规则

颜色必须表达教学语义。`main`、`feature`、`HEAD`、`workingTree`、`index`、`conflict` 不作为装饰色随意复用。

## 布局

- 每个节拍只保留一个主视觉。终端输入时终端是主角；命令完成后，Git 图或 ref 变化接管主视觉。
- 底部字幕最多一行半，不遮挡提交图。
- 一个镜头只强调一个概念：commit、branch、HEAD、index 不同时抢焦点。
- 顶部栏只做轻量定位，不承担主叙事；高度控制在 50px 内。
- 终端不做整体降透明或重阴影。需要降权时，只降低历史命令行的透明度，当前命令保持清晰。
- refs 不常驻完整表格，只在变化时显示当前被写入或改变的一行。

## 字幕规范

字幕分两类，不混用：

- 旁白字幕：用于完整句子，位置为底部安全区，左右各留 `420px`，字号使用 `TYPE.subtitle`，颜色使用 `text.primary`，最多两行。
- 动作提示：用于短因果提示，例如 `写入一条 ref`、`只移动 feature`，左右各留 `690px`，字号使用 `TYPE.ui`，不超过 12 个汉字或一个短代码短语。
- 组件使用：旁白统一用 `NarrationSubtitle`，动作提示统一用 `SceneCaption`，不在 episode 中直接使用旧的 `Subtitle` API。

统一规则：

- 字体统一使用 `FONT.sans`，即 `"GitCourseSans", "GitCourseLatin", sans-serif`；代码、终端、hash/graph 标签使用 `FONT.mono`，即 `"GitCourseMono", "SFMono-Regular", Consolas, monospace`。
- `GitCourseSans` / `GitCourseLatin` / `GitCourseMono` 通过 `remotion/src/fonts.css` 注册，并从 `remotion/public/fonts/` 加载；根目录 `fronts/` 保留同一批字体文件作为归档。
- 字重只允许使用 `WEIGHT.regular = 400`、`WEIGHT.bold = 700` 和 `WEIGHT.black = 900`，不在 episode 或 kit 中手写数字字重。`WEIGHT.black` 只用于真实提供 Heavy/Black 字形的 `FONT.brand`；普通中文和等宽文字只使用 400/700。
- 本地文件的真实字重为：Noto Sans CJK SC 400/700、Inter 400/700/900、JetBrains Mono 400/700、MiSans Heavy 900。`GitCourseMono` 使用 JetBrains Mono Regular/Bold，不再把单个 Medium 文件声明成 400–900。
- 字幕背景统一使用 `canvas.overlay`，描边使用 `stroke.soft`，文字使用 `text.primary`。
- 字幕不负责重复画面信息；画面已经能表达的内容，字幕只写动作或结论。
- SRT 字幕标点按观看节奏处理，不照搬讲稿。默认去掉句尾句号和分号；普通停顿用 `，`，短语并列用 `、`，问题句保留 `？`，解释或命令引出时少量使用 `：`。
- 禁止为了强调做循环缩放、左右晃动或持续闪烁；字幕和高亮只允许一次性进入或状态切换。

## 动画规则

- 指针移动必须可见，不能跳帧。
- 命令出现后，图形变化延迟 0.3-0.6 秒，让观众建立因果。
- 高亮颜色只短暂出现，用完退回语义色。
- 标准动作链：终端输入 -> 当前 ref 变化 -> GitGraph 放大 -> 指针运动 -> 短字幕总结。
