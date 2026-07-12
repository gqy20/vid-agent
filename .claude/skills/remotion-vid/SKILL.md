---
name: remotion-vid
description: 当需要用 Remotion (React) 从零制作一条精致视频并渲成 MP4 时使用——宣传片、品牌片头、讲解片、数据或终端风动画。也适用于 Remotion 首次渲染卡住、成片不够精致、或字体/Chrome 下载卡死时。
---

# 用 Remotion 制作视频

## 总览

Remotion 通过无头 Chrome 把 React 组件**逐帧**渲成视频。做出*精致*成片是
**两遍流程**,不是一次到位:第一遍跑通并廉价验证,第二遍套用官方 Remotion skill
精修。浪费时间多半来自首次渲染卡在 Chrome/字体下载,或全片渲染几分钟后才发现排版
bug。

## Skill 与项目的边界

本 skill 定义通用能力，不定义某个系列视频的实现。开始工作时先查仓库的 `AGENTS.md`、
项目工作流和已有 orchestrator：

- **skill 负责**：内容指纹、增量任务、内容寻址缓存、共享 bundle、并行资源预算、候选产物、
  审查证据、verdict、批准与晋升这些通用阶段。
- **项目适配器负责**：内容 schema、目录、命令、scene 划分、品牌/教学规则、采样参数、响度目标、
  发布平台和准入阈值。
- 已有项目 orchestrator 时必须从它进入，不绕过它直接调用底层 TTS、Remotion 或 FFmpeg。
- 没有项目适配器时，才使用本 skill 的 `scripts/` 作为轻量 fallback；通用脚本不是项目事实源。

详见 `references/incremental-production.md`。不要把项目名、episode id、固定 voice、语义色或
项目目录反写进 skill。

## 必读背景

写任何动画代码前,先读官方 Remotion skill:**github.com/remotion-dev/skills**
(`SKILL.md` + `rules/*`)。里面有具体的缓动 bezier、字体规则、转场时长、字号层级、
安全边距。跳过它是"不精致"的头号原因。

如果用户指出"品味差"、"不高级"、"像 PPT"、"字幕重复"、"整体要优化",先读
`references/taste.md`,再改代码。它规定叙事结构、字体、截图、动效、Lottie 使用边界和
交付前检查。

如果用户在做系列课程、品牌片头/片尾、Remotion + Manim 混合课程包装，先读
`references/course-branding.md`。它规定统一片头片尾、Concept Outro、Remotion/Manim
分工、外部素材说明和最终抽帧对齐检查。

## 必备环境

```bash
pnpm install                                   # remotion + @remotion/cli + react
pnpm exec remotion render <CompId> out.mp4 --concurrency=8
```

- **先干掉 Chrome 下载**(references/environment.md):Remotion 首次渲染会自下载
  约 150 MB 的 Chrome Headless Shell,**慢网会静默卡死**。在 `remotion.config.ts`
  里用 `Config.setBrowserExecutable(...)` 指向系统 Chrome。
- **优先本地字体**,而非 `@remotion/google-fonts`(后者渲染时联网拉取)。用
  `fc-list` 找本地字体。

## 最小模板

```tsx
// remotion.config.ts
import {Config} from '@remotion/cli/config';
Config.setOverwriteOutput(true);
Config.setBrowserExecutable('/opt/google/chrome/chrome'); // 跳过 150MB 下载

// src/index.ts        → registerRoot(RemotionRoot)
// src/Root.tsx        → require.context 扫描 ./videos/*/index.ts 自动聚合（见下）
// src/videos/<slug>/  → 一视频一目录：主组件 + scenes/ + index.ts(registration)
// src/videos/<slug>/scenes/*.tsx → 一场景一组件；文案/配色/字体/缓动都做成常量
```

## Composition 自动聚合（多视频并行友好）—— 必须这样做

一个 Remotion bundle 只有一个 Root，所有 `<Composition>` 必须出现在 Root 树里。
**不要每加一条视频就手动改 `Root.tsx`**——多视频并行时会撞同一个文件、git 冲突。
让 Root 用 `require.context` 扫描聚合：加视频 = 新建 `src/videos/<slug>/index.ts`，
**零改 Root**，不同视频源码彻底隔离，可并行。

```ts
// src/videos/types.ts
import type {ComponentType} from 'react';
export type CompositionDescriptor = {
  id: string;
  component: ComponentType<any>;
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
  defaultProps?: Record<string, unknown>;
  calculateMetadata?: (args: {props: Record<string, unknown>}) =>
    {durationInFrames?: number} & Record<string, unknown>;
};
export type VideoRegistration = {slug: string; compositions: CompositionDescriptor[]};
```

```ts
// src/videos/<slug>/index.ts —— 每条视频导出自己的 registration
import {MyVideo} from './MyVideo';
import type {VideoRegistration} from '../types';
export const registration: VideoRegistration = {
  slug: 'my-video',
  compositions: [
    {id: 'MyVideo', component: MyVideo, durationInFrames: 900, fps: 30, width: 1080, height: 1920},
    // 单场景预览 Composition（抽帧自检用）按需加，带 calculateMetadata 读场景时长
  ],
};
```

```tsx
// src/Root.tsx —— 写一次，永不再改
import {Composition} from 'remotion';
import type {CompositionDescriptor, VideoRegistration} from './videos/types';
declare const require: {context: (d: string, sub?: boolean, re?: RegExp) =>
  {keys: () => string[]; (k: string): unknown}};
const ctx = require.context('./videos', true, /\/index\.ts$/);
const COMPOSITIONS: CompositionDescriptor[] = ctx.keys().sort()
  .map((k) => (ctx(k) as {registration: VideoRegistration}).registration)
  .flatMap((r) => r.compositions);
export const RemotionRoot: React.FC = () => (
  <>{COMPOSITIONS.map((c) => <Composition key={c.id} {...c} />)}</>
);
```

**陷阱**：① 注释里**别出现 `*/`**（例如写 `*/index.ts`）——会提前闭合块注释，esbuild 报
"Expected ; but found 中文符号"。用行注释 `//` 或 `<slug>` 占位。② Remotion 用 webpack 5，
原生支持 `require.context`（vid-agent 工程已验证，`remotion compositions` 正确列出全部）。
③ 工程未装 `@types/webpack-env` 时，顶部 `declare const require` 局部声明即可，无需装包。
④ 验证聚合：`pnpm exec remotion compositions` 应列出所有视频的 Composition。

## 工作流(第一遍——跑通,廉价验证)

1. **内容基于真实** —— 读真实源头(用 `gh` 读仓库 README、文档),陈述真实信息,
   绝不编造数字。
2. **脚手架** —— 一场景一组件;文案/数据/配色/字体/缓动都做成文件顶部常量
   (references/render-project-layout.md)。
3. **修掉 Chrome 下载** —— 在首次渲染前(references/environment.md)。
4. **本地字体** —— `fc-list`;按字族名引用(references/environment.md)。
5. **抽帧自检循环** —— 全片渲染前,逐场景代表帧 + 转场前后帧都要检查
   (references/still-check.md)。一帧只要几秒,全片渲染要几分钟。用户指出具体秒点时,
   先从**最终 mp4**抽 `t-0.5/t/t+0.5/t+1.0`,不要凭感觉改。检查截图/图表标注时,
   不只看“有没有框”,还要确认框的语义是否准确:圈过滤条件就不要带表头,圈命令归因就要覆盖
   命令名和相关指标,不要只圈一列数字或空白区域。
6. **长视频先数据化时间线** —— 超过 90s 或未来可能到 5min 时,把场景时长、
   转场、fps、尺寸抽进 `timeline.ts`,Composition 的 `durationInFrames` 从常量计算
   (references/long-video-rendering.md)。
7. **渲染 → 归档** —— 优先读取项目资源策略；无策略时用短片 smoke test 探测最大稳定并发，
   不把保守常量当生产默认值。渲进产物目录
   `renders/<id>/renders/{tmp,candidates,current,archive}/`,补上 `thumbnail.png` +
   `meta.json` + `README.md`;用 `ffprobe` 校验。分片、场景审查、抽帧都必须放
   `renders/<id>/renders/tmp/{chunks,scenes,audit}/`。绝不让 mp4 堆在工程根目录
   (references/render-project-layout.md)。
8. **多个独立任务默认最大稳定并行** —— 先由 orchestrator 计算全局资源预算，再让 dirty
   scene、TTS、审查扫描等互不依赖任务并行。Remotion 源码只 bundle 一次并持久缓存；每个
   并行 `renderMedia` 使用独立 browser pool，不能共享同一个 Chrome 实例。成功任务立即写入
   内容寻址缓存，批次失败也不得丢弃已完成结果。无项目 orchestrator 时，才用
   `scripts/render-ranges.sh` fallback。并发以机器探测到的最大稳定值为默认，遇到资源型失败
   自动降档并记录可复用的机器 profile，而不是长期写死一个小数字。
9. **需要更快时先测再拆** —— frame range 分片必须先 smoke test 当前 Remotion 版本是否
   会卡在 mp4 分片末帧,稳定后才用于生产。分析单段时用
   `SKIP_CONCAT=1 AUDIT_SEGMENTS=1`,不要为了看一个场景强行合成全片。

## 第二遍——按官方 skill 精修(按收益排序)

本地专业字体 → 官方缓动 → 转场策略 → 字号层级与安全边距 → 独立 transform 属性。
低密度/情绪过渡用 `TransitionSeries` fade/slide;高密度 UI、截图、图表、Manim 流程之间
优先硬切、短黑场、wipe,或让前一场景先退到低密度状态。代码见
references/api-cheatsheet.md 与 references/anti-patterns.md。

## 参考文件

支持文档放 `references/`,工具放 `scripts/`。

| 文件 | 用途 |
|------|------|
| references/environment.md | pnpm、Chrome 下载修复、本地字体、排错 |
| references/taste.md | **品味标准**:Awwwards 式叙事/动效原则、Lottie 使用边界、字幕去重、截图和交付检查 |
| references/course-branding.md | **系列课程包装**:统一片头/片尾、Concept Outro、Remotion/Manim 分工、外部素材规则 |
| references/render-project-layout.md | **产物布局** `renders/<日期>-<slug>/`、meta.json、debug/final、命名 |
| references/still-check.md | 渲染前/成片后抽帧自检 SOP(`scripts/check-frames.sh`),含用户点名秒点复核 |
| references/api-cheatsheet.md | 核心 API:interpolate / spring / Sequence / TransitionSeries / Easing |
| references/examples.md | 可复用组件模式(Terminal、打字机、Reveal、动态 Bar) |
| references/terminal-scenes.md | 模拟终端场景:配色、打字命令、输出形态、spinner/进度条 |
| references/anti-patterns.md | 让视频显廉价或出错的反模式及修法 |
| references/audio-mmx.md | 用 mmx-cli 生成配音/BGM + ffmpeg 混音 + Remotion 音视频合流 |
| references/incremental-production.md | **通用生产管线**：项目适配器、指纹/CAS、最大稳定并行、候选审查与晋升门禁 |
| references/long-video-rendering.md | 长视频 timeline 数据化、frame-range 分片并发、scene segment 取舍 |
| references/renderer-internals.md | **源码层**:Remotion 五层架构、项目做法↔源码模块对照、chunk/sequence/音频三条绕开路径、升级影响 |
| scripts/check-env.sh | 探测 Chrome/字体/工具链,打印建议配置行 |
| scripts/new-video.sh | 一键建一条视频的源码 + 带日期的产物目录 |
| scripts/check-frames.sh | 批量渲抽帧,供自检循环用 |
| scripts/render-final.sh | 渲进带日期产物目录 + ffprobe + 抽 thumbnail |
| scripts/render-ranges.sh | 按 frame range 并发渲染完整 Composition;支持 `OUT_ROOT`、`RANGES_FILE`、`AUDIT_SEGMENTS`、`SKIP_CONCAT` |
| scripts/audio-mix.sh | 配音 + BGM 混音,并 mux 进视频成 with-audio 版本 |
| scripts/cleanup.sh | 清理工程根临时 `out/` |

## 常见错误

| 错误 | 修法 |
|---|---|
| 首次渲染无进度卡死 | Chrome Headless Shell 在下载 —— `setBrowserExecutable` 指向本地 Chrome |
| 成片"不够精致" | 跳过了官方 remotion-dev/skills;套用其字体/缓动/转场 |
| 全片渲染后才发现排版 bug | 先逐场景抽帧自检(references/still-check.md) |
| 用户指出某秒框位不准 | 从 final mp4 抽该秒附近帧,按语义重定框位,不要只微调像素 |
| 渲染卡住 / 字体不对 | `@remotion/google-fonts` 渲染时联网;改用 `fc-list` 本地字体 |
| 一个 episode 出现很多 `out/` 目录 | 给项目脚本显式设置 `OUT_ROOT=renders/<id>/renders/tmp/{chunks,scenes}`;根 `out/` 只可做短期 scratch |
| 加转场后结尾被截 | `durationInFrames` = Σ场景 − Σ转场 |
| 转场中两套 UI 糊在一起 | 高密度场景不做 crossfade;改硬切/短黑场/先退场 |
| Manim/Lottie/视频资产嵌入后遮挡 | 先抽嵌入后的 still;必要时裁切、遮罩或重渲资产 |
| 想一遍到位 | 两遍:先跑通+验证,再精修 |
