# 长视频与并行渲染

## 先判断是否值得拆

Remotion 默认已经按帧并发渲染,`--concurrency` 控制单个 render 进程里的浏览器并发。
短片通常先提高这个值,不要一开始就引入分段流程。

经验阈值:

- `<90s`: 单 composition 渲染,提高 `--concurrency` 即可。
- `90s-5min`: 时间线必须数据化,并保留 frame-range 分片渲染入口。
- `>5min` 或频繁局部修改: 使用 frame-range 分片并发;如果要缓存单场景,再做 scene
  segment 渲染。

## 候选方案:按 frame range 分片完整片

把完整 Composition 按连续帧区间切开,并发运行多个 `remotion render --frames=A-B`,
最后 `ffmpeg concat -c copy` 拼回去。

优点:

- 保留完整时间线,转场不会丢。
- 全局字幕、全局遮罩、全局背景逻辑不需要特殊改造。
- 短片和长片都适用。
- 比按 scene 组件拆更不容易出现音画/转场错位。

注意:

- 先用几百帧 smoke test 验证当前 Remotion 版本。若 mp4 分片卡在最后一帧,不要继续
  走这条路,改用单进程高 `--concurrency` 或 image sequence 分片。
- 每个分片不要太短,否则 Remotion bundling/Chrome 启动成本会抵消收益。1080p 推荐
  `300-900` 帧一片;5 分钟 30fps 可先用 `600` 帧。
- 总并发 = `JOBS * CONCURRENCY`。先从 `JOBS=4 CONCURRENCY=4` 起测,再看 CPU、
  内存、Chrome 稳定性调到 `6x4` 或 `8x3`。
- 并发启动多个 Chrome 时,把 `TIMEOUT` 提高到 `120000` 或更高,避免 30s setup timeout
  误失败。
- 如果完整片内嵌音频,优先用 `MUTED=1` 分片只渲视频,最后统一 mux 全局配音/BGM。
  多进程同时处理完整音频容易在片段末尾编码阶段拖慢或卡住。

命令模板:

```bash
JOBS=2 CONCURRENCY=4 TIMEOUT=120000 MUTED=1 scripts/render-ranges.sh <CompId> <slug> <total_frames> 600
```

如果 smoke test 不稳定,先使用:

```bash
pnpm exec remotion render <CompId> out/video.mp4 --concurrency=8 --timeout=120000
```

## 进阶方案:按 scene segment 渲染

当目标是“改一个场景只重渲一个场景”时,再拆 scene segment。此时必须先完成:

- `timeline.ts`: 唯一场景时长、转场、fps、尺寸来源。
- `SceneRenderer`: `sceneId -> React scene component`。
- `Segment` Composition: 用 props 指定场景。
- 字幕支持 `offsetMs/startMs/endMs`。
- 音频最终统一 mux,不要每个 scene 自己挂完整音轨。

scene segment 的难点是转场。保真方案要给每段前后加 transition handles,或把转场
当作独立 segment。否则只能接受硬切。

## timeline 数据化模板

```ts
export const FPS = 30;
export const SCENES = [
  {id: 'hook', durationInFrames: 240, transitionAfter: {kind: 'fade', durationInFrames: 16}},
  {id: 'demo', durationInFrames: 600, transitionAfter: {kind: 'fade', durationInFrames: 16}},
  {id: 'cta', durationInFrames: 180},
] as const;

export const TOTAL_DURATION_IN_FRAMES =
  SCENES.reduce((sum, s) => sum + s.durationInFrames, 0) -
  SCENES.reduce((sum, s) => sum + ('transitionAfter' in s ? s.transitionAfter.durationInFrames : 0), 0);
```

Composition 的 `durationInFrames` 必须引用 `TOTAL_DURATION_IN_FRAMES`,不要手写。

## 什么时候不拆

- 片子很短,单片渲染已经低于 3-5 分钟。
- 渲染失败来自 Chrome/字体/素材加载,不是帧数太多。
- 画面仍在快速设计阶段,分片流程会增加调试噪声。
