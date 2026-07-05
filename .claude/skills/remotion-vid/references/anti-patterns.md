# 反模式(附修法)

## 1. 让首次渲染卡在 Chrome 下载
Remotion 首次渲染会下约 150 MB 的 Chrome Headless Shell;慢网下无进度卡住,看着像冻结。
**修法:** 渲染前 `Config.setBrowserExecutable('/opt/google/chrome/chrome')`。

## 2. 不稳网络下用 `@remotion/google-fonts`
它在渲染时拉字体文件 → 同样的卡死风险,或静默退回 fallback 字体。
**修法:** 用 `fc-list` 找本地字体,按字族名引用。

## 3. 线性运动
`interpolate(frame, [0,20], [0,1])` 不加缓动,显得机械。
**修法:** 入场 `Easing.bezier(0.16,1,0.3,1)`,出场 `Easing.in(Easing.cubic)`;永远 clamp。

## 4. 用 `transform` 字符串而非独立属性
`transform: \`scale(${s})\`` 在 Studio 里不可调,且易有顺序 bug。
**修法:** `style={{scale: s, translate: \`0px ${y}px\`, rotate: \`${r}deg\`}}`。`transform`
字符串只留给 `skew`/`perspective`/顺序敏感的组合。

## 5. 不分密度地给场景加 crossfade
两个高密度 UI / 截图 / 图表 / Manim 流程场景 crossfade,会把两套信息叠在一起,
中间帧像脏的双曝光。
**修法:** 低密度/情绪过渡才用 `TransitionSeries` + `fade()`/`slide()`。高密度到高密度
优先硬切、短黑场、wipe,或让前一场景先退场到低密度状态再切。

## 6. 把 `TransitionSeries.Transition` 包进组件
返回 `<TransitionSeries.Transition>` 的 `<TFade />` 会报错——父级检查直接子元素类型。
**修法:** 内联字面元素(`const el = <...Transition/>` 然后 `{el}` 引用可以;自定义组件不行)。

## 7. 忘了转场时长计算
加转场会缩短总帧数;Composition 的 `durationInFrames` 不再匹配 → 结尾被截或补黑帧。
**修法:** `durationInFrames` = Σ场景时长 − Σ转场时长。

## 8. 逐字符 opacity 打字机
逐字符动 opacity 又重又难看。
**修法:** 用 `text.slice(0, shown)`,`shown` 由帧推导(见 examples.md)。

## 9. CSS `transition` / `animation` / Tailwind `animate-*` / GSAP imperative tween
它们在 Remotion 里不渲染——帧是离散快照。GSAP 的 `gsap.to`/`timeline` 是同类问题的
进阶版:靠 wall-clock tick 持续改 DOM,Remotion 截图时还没 tick 到位,且并行渲染时
全局 timeline 状态会冲突。
**修法:** 一切动画值都从 `useCurrentFrame()` 驱动。馋 GSAP 某条曲线时手抄
`Easing.bezier(cp1x, cp1y, cp2x, cp2y)`,不要引入 gsap 包。详见
[`renderer-internals.md`](renderer-internals.md)「动画子系统」节。

## 10. 组件里用 `Math.random()` / `Date.now()`
逐帧非确定 → 闪烁。
**修法:** 用 remotion 的 `random('种子')`;时间戳作为 prop 传入。

## 11. 抽帧自检前就全片渲染
渲了几分钟才发现重叠/溢出。
**修法:** 先逐场景抽帧自检(references/still-check.md)。

## 12. 字体 fallback 显廉价(系统 DejaVu)
默认 `sans-serif`/`monospace` 退回普通字体,显廉价。
**修法:** 本地专业字体栈(JetBrains Mono + Noto Sans CJK / Inter)。

## 13. 字号低于官方层级 / 文字进了安全边距
小字在观看距离看不清;贴边文字会被裁。
**修法:** 1080p:标题 ≥84、正文 ≥44、标签 ≥32;距侧边 80px、上下 100px。

## 14. 一帧里塞满卡片/徽章/胶囊
Web UI 式的密度让视频显得杂乱。
**修法:** 每场景一个焦点;元素随时间逐个揭示,而非一次全上。

## 15. 音频/数据可视化的每个子组件都调 `useCurrentFrame()`
处于带 offset 的 `<Sequence>` 内的子组件会取到不连续的值。
**修法:** 在父组件读一次 frame 往下传。

## 16. 编造数据
虚构的指标会毁掉宣传片的可信度。
**修法:** 先从仓库/文档(`gh`)取真实数字。

## 17. 全片 karaoke 字幕压在产品画面上
有配音时又叠全片逐字字幕,会和场景标题、截图标注、Manim 标题争夺层级,把产品片变成教程录屏。
**修法:** 画面已有大标题和证据截图时默认不挂载字幕。需要无声版时做单独 captioned 版本,
用底部弱字幕,不要逐字高亮抢主视觉。

## 18. 直接把 Manim/Lottie/视频资产当最终画面
外部动画资产自带标题、底部指标、长句说明或背景,嵌入 Remotion 后可能和场景文案重复,
也可能在转场里叠成脏画面。
**修法:** 先抽嵌入后的 still,不只看资产单独输出。必要时裁切、遮罩、调整 playbackRate,
或回到 Manim/Lottie 源头重渲一个低文字版本。

## 19. 绝对定位 overlay 没有锚定父容器
给截图/视频面板加遮罩或高亮时,子元素 `position: absolute`,但父容器没有 `position: relative`,
overlay 会锚到页面或别的祖先,看似“没生效”。
**修法:** 凡是面板内部 overlay,父容器同时设 `position: relative`、稳定宽高、`overflow: hidden`。

## 20. 截图高亮框只按视觉位置,不按语义
框住了表格右侧数字、半截表头或空白区域,但没有把用户需要理解的对象一起框进去。观众看到框,
仍不知道这是哪条过滤条件、哪条命令、哪个模型或哪组 session。
**修法:** 先说清框的语义单元:过滤条件、行级归因、列级指标、局部控件。过滤条件只圈条件行;
行级归因要覆盖对象名和相关指标;列级指标要包含列名或让列含义在同一画面可见。用户指出秒点时,
从 final mp4 抽 `t-0.5/t/t+0.5/t+1.0` 复核,不要只在 Studio 里目测。
