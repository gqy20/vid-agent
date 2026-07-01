# 示例 —— 可复用组件模式

提炼自一条真实的 CLI 工具宣传片。每个都是完整、可改用的模式。假设 `theme.ts` 导出
`MONO`、`SANS`、`EASE_OUT`、`CLAMP`(见 render-project-layout.md)。

## Reveal —— 缓动淡入 + 上移(主力组件)

包住任意内容;错峰的 delay 拼成一个场景。用独立 `translate` 属性。

```tsx
const Reveal: React.FC<{delay: number; dur?: number; y?: number; style?: React.CSSProperties; children: React.ReactNode}> =
({delay, dur = 14, y = 12, style, children}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [delay, delay + dur], [0, 1], {easing: EASE_OUT, ...CLAMP});
  const ty = interpolate(f, [delay, delay + dur], [y, 0], {easing: EASE_OUT, ...CLAMP});
  return <div style={{opacity: o, translate: `0px ${ty}px`, ...style}}>{children}</div>;
};
```

## Typed —— 字符串切片打字机(绝不用逐字 opacity)

```tsx
const Typed: React.FC<{text: string; start: number; cps?: number}> = ({text, start, cps = 26}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const shown = Math.max(0, Math.min(text.length, Math.floor(((f - start) * cps) / fps)));
  const done = shown >= text.length;
  const cursorOn = Math.floor(f / 8) % 2 === 0;     // 闪烁
  return (
    <div style={{whiteSpace: 'pre', fontFamily: MONO}}>
      <span style={{color: '#3fb950'}}>$ </span>{text.slice(0, shown)}
      <span style={{opacity: !done || cursorOn ? 1 : 0}}>▋</span>
    </div>
  );
};
```

## Terminal —— CLI/代码场景的窗口外壳

```tsx
const Terminal: React.FC<{title: string; width: number; appear: number; children: React.ReactNode}> =
({title, width, appear, children}) => {
  const f = useCurrentFrame();
  const sc = interpolate(f, [appear, appear + 16], [0.94, 1], {easing: EASE_OUT, ...CLAMP});
  const op = interpolate(f, [appear, appear + 14], [0, 1], {easing: EASE_OUT, ...CLAMP});
  return (
    <div style={{width, background: '#0d1117', border: '1px solid #21262d', borderRadius: 14,
      overflow: 'hidden', boxShadow: '0 40px 90px rgba(0,0,0,.6)', opacity: op, scale: sc, fontFamily: MONO}}>
      <div style={{height: 44, background: '#161b22', display: 'flex', alignItems: 'center', gap: 9, padding: '0 18px'}}>
        {['#ff5f56', '#ffbd2e', '#27c93f'].map(c => (
          <span key={c} style={{width: 13, height: 13, borderRadius: 7, background: c}} />
        ))}
        <span style={{marginLeft: 16, color: '#8b949e', fontSize: 17}}>{title}</span>
      </div>
      <div style={{padding: '28px 36px', fontSize: 24, lineHeight: 1.62, color: '#c9d1d9'}}>{children}</div>
    </div>
  );
};
```

## Bar —— 动态横向条(数据可视化)

```tsx
const Bar: React.FC<{label: string; pct: number; delay: number; color: string}> = ({label, pct, delay, color}) => {
  const f = useCurrentFrame();
  const w = interpolate(f, [delay, delay + 26], [0, pct], {easing: EASE_OUT, ...CLAMP});
  return (
    <Reveal delay={delay} y={8} style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 14}}>
      <span style={{width: 168}}>{label}</span>
      <div style={{flex: 1, height: 24, background: '#161b22', borderRadius: 5, overflow: 'hidden'}}>
        <div style={{width: `${w}%`, height: '100%', background: color}} />
      </div>
      <span style={{width: 62, textAlign: 'right'}}>{pct}%</span>
    </Reveal>
  );
};
```

## SVG 线条描边(图表、logo)

把 `strokeDashoffset` 从路径长度动到 0:

```tsx
const draw = interpolate(frame, [0, 42], [LEN, 0], {easing: EASE_OUT, ...CLAMP});
<polyline points="..." fill="none" stroke="#56d4c4" strokeWidth={3}
  strokeDasharray={LEN} strokeDashoffset={draw} />
```

## 场景骨架

```tsx
export const SceneRec: React.FC = () => (
  <AbsoluteFill style={{background: COLORS.bg, justifyContent: 'center', alignItems: 'center', fontFamily: SANS}}>
    <Terminal title="cli — diagnose" width={1220} appear={0}>
      <Typed text="cli rec -p 7d" start={6} />
      <Reveal delay={42}>…输出…</Reveal>
    </Terminal>
  </AbsoluteFill>
);
```
