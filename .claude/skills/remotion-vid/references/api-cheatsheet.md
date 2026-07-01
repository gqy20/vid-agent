# API 速查

## 核心 import

```tsx
import {
  AbsoluteFill, Sequence, Series,
  useCurrentFrame, useVideoConfig,
  interpolate, spring, Easing, random, staticFile,
} from 'remotion';
```

## 时间 → 数值

`useCurrentFrame()` 是时钟。在 `<Sequence>` 内部它是**局部的**(该序列开始时从 0
计),所以每个场景的动画计算很简单。

```tsx
const frame = useCurrentFrame();
const {fps, width, height, durationInFrames} = useVideoConfig();
```

## interpolate(运动的首选)

除非明确要物理感,否则优先用 `interpolate` 而非 `spring`。**永远 clamp**,并加缓动
——绝不留线性。

```tsx
const opacity = interpolate(frame, [0, 20], [0, 1], {
  easing: Easing.bezier(0.16, 1, 0.3, 1),   // 入场:快进、缓停
  extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
});
```

官方缓动:入场 `Easing.bezier(0.16,1,0.3,1)`,出场 `Easing.in(Easing.cubic)`,
编辑感 `Easing.bezier(0.45,0,0.55,1)`,俏皮过冲 `Easing.bezier(0.34,1.56,0.64,1)`。

## 独立 transform 属性(不要用 transform 字符串)

便于在 Studio 调,且避免顺序 bug。

```tsx
// ✅
<div style={{scale: s, translate: `0px ${y}px`, rotate: `${r}deg`}} />
// ❌  transform: `scale(${s}) translate(0, ${y}px)`
```

## spring(仅当要弹/物理感时)

```tsx
const s = spring({frame, fps, config: {damping: 16}}); // 提高 damping = 更少弹跳
```

## 序列(Sequencing)

```tsx
<Sequence from={1 * fps} durationInFrames={2 * fps} layout="none">…</Sequence>
```

- 默认布局是 `AbsoluteFill`;内联内容需加 `layout="none"`。
- 负 `from` 裁掉开头;`durationInFrames` 裁掉结尾。
- `<Series>` 让序列依次播放;`offset={-15}` 重叠做错峰。

## 转场(Transitions)

```tsx
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={240}><A /></TransitionSeries.Sequence>
  <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: 16})} />
  <TransitionSeries.Sequence durationInFrames={156}><B /></TransitionSeries.Sequence>
</TransitionSeries>
```

- 推荐时长:fade 15、slide 20、有机感 `springTiming({config:{damping:200}})`。
- `<TransitionSeries.Transition>` 必须是**直接字面子元素**——包进自己的组件会报
  "only accepts ... Sequence/Transition/Overlay"。
- **总帧数 = Σ场景时长 − Σ转场时长。** 把 Composition 的 `durationInFrames` 设成
  这个值。

## 确定性随机

`Math.random()` 会破坏逐帧确定性。用 `random('种子串')` → 稳定的 [0,1)。

## 布局(官方,1080p)

- 字号层级:标题 ≥ 84px,正文 ≥ 44px,标签 ≥ 32px(1920px 宽则相应放大)。
- 安全边距:关键文字距侧边 80px、距上下 100px。
- 用 flex/grid + gap 布局;绝对定位留给背景、光晕、粒子。每个场景一个焦点。

## 禁止

CSS `transition`/`animation` 和 Tailwind `animate-*`/`transition-*` class **不会**
渲染——一切动画值都从 `useCurrentFrame()` 驱动。
