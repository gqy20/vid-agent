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

## 必读背景

写任何动画代码前,先读官方 Remotion skill:**github.com/remotion-dev/skills**
(`SKILL.md` + `rules/*`)。里面有具体的缓动 bezier、字体规则、转场时长、字号层级、
安全边距。跳过它是"不精致"的头号原因。

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

// src/index.ts     → registerRoot(RemotionRoot)
// src/Root.tsx     → 一个视频一个 <Composition>
// src/scenes/*.tsx → 一场景一组件；文案/配色/字体/缓动都做成常量
```

## 工作流(第一遍——跑通,廉价验证)

1. **内容基于真实** —— 读真实源头(用 `gh` 读仓库 README、文档),陈述真实信息,
   绝不编造数字。
2. **脚手架** —— 一场景一组件;文案/数据/配色/字体/缓动都做成文件顶部常量
   (references/render-project-layout.md)。
3. **修掉 Chrome 下载** —— 在首次渲染前(references/environment.md)。
4. **本地字体** —— `fc-list`;按字族名引用(references/environment.md)。
5. **抽帧自检循环** —— 全片渲染前,逐场景渲一帧检查
   (references/still-check.md)。一帧只要几秒,全片渲染要几分钟。
6. **长视频先数据化时间线** —— 超过 90s 或未来可能到 5min 时,把场景时长、
   转场、fps、尺寸抽进 `timeline.ts`,Composition 的 `durationInFrames` 从常量计算
   (references/long-video-rendering.md)。
7. **渲染 → 归档** —— 先用 `--concurrency=8` 起测,再按机器调到 12/16;渲进带日期的产物目录
   `renders/<YYYY-MM-DD>-<slug>/renders/{debug,final}/`,补上 `thumbnail.png` +
   `meta.json` + `README.md`;用 `ffprobe` 校验。绝不让 mp4 堆在工程根目录
   (references/render-project-layout.md)。
8. **需要更快时先测再拆** —— 先尝试单进程高 `--concurrency`;frame range 分片必须先
   smoke test 当前 Remotion 版本是否会卡在 mp4 分片末帧,稳定后才用于生产。

## 第二遍——按官方 skill 精修(按收益排序)

本地专业字体 → 官方缓动 → `TransitionSeries` 转场 → 字号层级与安全边距 → 独立
transform 属性。代码见 references/api-cheatsheet.md 与 references/anti-patterns.md。

## 参考文件

支持文档放 `references/`,工具放 `scripts/`。

| 文件 | 用途 |
|------|------|
| references/environment.md | pnpm、Chrome 下载修复、本地字体、排错 |
| references/render-project-layout.md | **产物布局** `renders/<日期>-<slug>/`、meta.json、debug/final、命名 |
| references/still-check.md | 渲染前抽帧自检 SOP(`scripts/check-frames.sh`) |
| references/api-cheatsheet.md | 核心 API:interpolate / spring / Sequence / TransitionSeries / Easing |
| references/examples.md | 可复用组件模式(Terminal、打字机、Reveal、动态 Bar) |
| references/terminal-scenes.md | 模拟终端场景:配色、打字命令、输出形态、spinner/进度条 |
| references/anti-patterns.md | 让视频显廉价或出错的反模式及修法 |
| references/audio-mmx.md | 用 mmx-cli 生成配音/BGM + ffmpeg 混音 + Remotion 音视频合流 |
| references/long-video-rendering.md | 长视频 timeline 数据化、frame-range 分片并发、scene segment 取舍 |
| scripts/check-env.sh | 探测 Chrome/字体/工具链,打印建议配置行 |
| scripts/new-video.sh | 一键建一条视频的源码 + 带日期的产物目录 |
| scripts/check-frames.sh | 批量渲抽帧,供自检循环用 |
| scripts/render-final.sh | 渲进带日期产物目录 + ffprobe + 抽 thumbnail |
| scripts/render-ranges.sh | 按 frame range 并发渲染完整 Composition,再 ffmpeg concat |
| scripts/audio-mix.sh | 配音 + BGM 混音,并 mux 进视频成 with-audio 版本 |
| scripts/cleanup.sh | 清理工程根临时 `out/` |

## 常见错误

| 错误 | 修法 |
|---|---|
| 首次渲染无进度卡死 | Chrome Headless Shell 在下载 —— `setBrowserExecutable` 指向本地 Chrome |
| 成片"不够精致" | 跳过了官方 remotion-dev/skills;套用其字体/缓动/转场 |
| 全片渲染后才发现排版 bug | 先逐场景抽帧自检(references/still-check.md) |
| 渲染卡住 / 字体不对 | `@remotion/google-fonts` 渲染时联网;改用 `fc-list` 本地字体 |
| 加转场后结尾被截 | `durationInFrames` = Σ场景 − Σ转场 |
| 想一遍到位 | 两遍:先跑通+验证,再精修 |
