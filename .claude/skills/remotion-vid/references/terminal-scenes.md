# 模拟终端场景 —— 仿 CLI/终端模式

CLI 工具宣传片最有价值的场景类型:一个可信的终端,命令逐字敲出、输出逐步揭示。这里
全是纯 CSS/SVG(没有真 shell)。与 examples.md 里的 `Terminal`、`Typed`、`Reveal`、
`Bar` 组件配套。

## 类 ANSI 配色(GitHub 暗色,读起来像真终端)

```ts
export const TERM = {
  bg: '#0d1117', head: '#161b22', border: '#21262d',
  text: '#c9d1d9', dim: '#8b949e',
  green: '#3fb950',   // 提示符 $、成功 ✓
  cyan: '#56d4c4',    // 路径、键、链接
  purple: '#a5b4fc',  // 值、模型
  warn: '#e3b341',    // 警告 ⚠
  red: '#f85149',     // 错误 ✗
  white: '#f0f6fc',   // 强调
};
```

## 让它显得真实的规则

- **永远等宽字体**(`MONO` 栈,带中文等宽 fallback)。
- **用固定 `px` 宽度对齐列,不要用 tab/空格。** 每个单元格是
  `<span style={{width: 240}}>`——tab 在 Chrome 里渲染不一致。
- 单行内用 `whiteSpace: 'pre'` 保留间距。
- 仅在空闲时闪烁光标(`Math.floor(f/8)%2`);打字时保持常亮。
- 按 token 角色上色(提示符/路径/值/错误),而非整行。
- 真实间距:`lineHeight: ~1.6`,正文留白宽裕(`28px 36px`)。

## 命令 + 输出的节奏(一个场景)

```tsx
<Terminal title="cli — diagnose" width={1220} appear={0}>
  <Typed text="cli rec -p 7d" start={6} />          {/* 约 26 字符/秒 */}
  <Reveal delay={42} style={{color: TERM.dim}}>DIAGNOSIS · 3 results</Reveal>
  <Reveal delay={58}>                                {/* 命令打完后再揭示输出 */}
    <div style={{color: TERM.red}}>[1] ⚠ timeouts slow sessions</div>
    <div style={{paddingLeft: 28}}>
      <span style={{color: TERM.cyan}}>evidence</span>  28 timeouts in WebFetch/Bash
    </div>
    <div style={{paddingLeft: 28}}>
      <span style={{color: TERM.green}}>fix</span>  cli why --reason timeout
    </div>
  </Reveal>
</Terminal>
```

节奏:命令打字(start 6 → 约 26 帧)→ 表头揭示(约 42)→ 正文分块错峰揭示(58、98…)。
绝不在命令打完前就揭示输出。

## 铺垫镜头 —— 乱码日志("之前"的痛点)

一墙滚动的暗淡 JSONL/日志行,随标题出现而压暗。把 CLI 工具要解决的痛点演出来。

```tsx
const lines = new Array(22).fill(0).map((_, i) =>
  `~/.claude/projects/{"${pick(i)}","ts":17${Math.floor(random(`t${i}`) * 9e8)}...}`);
const scroll = f * 6;
const dim = interpolate(f, [36, 70], [1, 0.12], {easing: EASE_OUT, ...CLAMP}); // 标题出现前先压暗
<AbsoluteFill style={{opacity: dim}}>
  <div style={{translate: `0px ${-scroll}px`}}>
    {lines.concat(lines).map((l, i) => (
      <div key={i} style={{fontFamily: MONO, fontSize: 19, color: i % 5 === 0 ? TERM.red : TERM.dim, opacity: .5}}>{l}</div>
    ))}
  </div>
</AbsoluteFill>
```

要在标题揭示**之前**把背景压暗到约 0.12,否则两者抢注意力(单一焦点原则)。

## 输出形态

**键值诊断** —— 标签 span(带色)+ 值文本,用 `paddingLeft` 做缩进。

**表格** —— 表头行 + 数据行,每个单元格是固定宽度 span:
```tsx
const Row = ({c, n, rate, warn}) => (
  <Reveal delay={...} style={{display: 'flex', color: warn ? TERM.warn : TERM.text}}>
    <span style={{width: 240}}>{c}</span><span style={{width: 130}}>{n}</span>
    <span style={{width: 130}}>{rate}{warn ? '  ⚠' : ''}</span>
  </Reveal>
);
```

**条形图** —— 见 examples.md 的 `Bar`(用 `EASE_OUT` 动宽度)。

**进度条** —— 填充一段方块:
```tsx
const pct = interpolate(f, [0, 40], [0, 100], {easing: EASE_OUT, ...CLAMP});
const filled = Math.round(pct / 5);
<span style={{color: TERM.green}}>{'█'.repeat(filled)}{'░'.repeat(20 - filled)} {Math.round(pct)}%</span>
```

**spinner** —— 确定性地循环帧(不要用 `Date.now`):
```tsx
const S = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'];
const glyph = S[Math.floor(f / 3) % S.length];
```

**成功行** —— `<span style={{color: TERM.green}}>✓ done → http://localhost:8932</span>`。

## 模拟浏览器 / Dashboard(当 CLI 自带 Web UI)

复用 `Terminal` 外壳,但正文里放指标卡(flex 行)+ 一个 SVG 线条描边图表——不用录真
浏览器也能展示 `cli web`。SVG 描边片段见 api-cheatsheet.md。

## 易错点

| 易错点 | 修法 |
|---|---|
| 列抖动/对不齐 | 用固定 `px` 宽度 span,别用 tab/空格 |
| 终端里中文成豆腐块 | 在 MONO 栈里加 `Noto Sans Mono CJK SC` |
| 打字时光标也在闪 | 仅 `shown >= text.length` 时才闪 |
| 输出在命令打完前出现 | 把输出 `Reveal delay` 放到打字结束之后 |
| emoji 图标(⚠✓)显得扁平/缺失 | 它们走 Chrome 的 emoji 字体;当点缀用,别当正文 |
