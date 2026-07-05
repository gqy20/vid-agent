# Renderer 内部体系 —— 源码层调试与优化参考

> 调试脚本和优化管线时，知道每个 trap 对应 Remotion 源码哪一行。
> 升级 Remotion 时，知道哪些行为是稳的、哪些要重测。
> 这是 [`long-video-rendering.md`](long-video-rendering.md)（怎么用）和
> [`anti-patterns.md`](anti-patterns.md)（怎么写）的**源码层补充**——解释为什么。

## 五层架构（基于 4.0.484 实际安装）

```
1 CLI 薄壳    @remotion/cli   still / render / studio / compositions / bundle
                              ↑ 每个命令只 require("@remotion/renderer/client")
2 渲染引擎    @remotion/renderer   ← 核心，所有 trap 都在这层
3 原生二进制  @remotion/compositor-linux-x64-gnu   ffmpeg+ffprobe+Rust 二进制（4.x 新）
4 Studio      @remotion/studio + player   不走 renderMedia，零渲染成本
5 Bundler     @remotion/bundler (webpack5) + remotion React 运行时
```

**CLI 是薄壳**：`still.js`/`render.js` 都只 `require("@remotion/renderer/client")`，自己几乎不干事。
所以 shell 组装 CLI 命令 = 组装 renderer API。理论上也能用 Node 直接调 renderer API
（更细粒度，能拿到 `onFrameUpdate`/`onBrowserDownload` 回调），但 shell + CLI 更薄、更易调试。

## 项目做法 ↔ 源码模块 对照

| 项目做法 | 源码层 | 源码证据 |
|---|---|---|
| `setBrowserExecutable` 跳过 ~150MB 下载 | `ensure-browser.js` | `getBrowserStatus`: 有 `browserExecutable` → `type:'user-defined-path'`，**不调** `downloadBrowser` |
| 首次渲染卡死下 Chrome | `ensure-browser.js` | 本地版本 ≠ `TESTED_VERSION` → `downloadBrowser()` 同步阻塞，带进度条 |
| `remotion still` 一帧几秒 | renderer 短路径 | bundler 打包一次 → `ensureBrowser` → 单 tab 渲**一帧** → 截图。不调 ffmpeg、不分片、不 combine-chunks |
| `remotion render` 几分钟 | renderer 全流水线 | bundler → `ensureBrowser` → 多 tab 按 `chunk()` 并发渲帧 → `combine-chunks` → `call-ffmpeg` |
| `render-ranges.sh` 分片 | `frame-range.js` | 用原生 `--frames=`；**进程级 concat + 续渲是项目加的** |
| `RESUME=1` 续渲 | （原生无） | 原生 chunk 在进程内存；项目把 chunk 状态提到**文件系统 + ffprobe `nb_frames` 校验** |
| `END_FRAME_OFFSET=1` 避尾帧 | （原生无） | 项目对 mp4 尾帧不稳的经验补丁，`render-report.json` 里记 reason |
| `--muted` + 外置 ffmpeg mux | 绕开 `combine-audio.js` 整套 | renderer 音频侧 10+ 文件；项目用预混整段 m4a，trim+mux 两步 |
| `require.context` 聚合多视频 | bundler (webpack5) | 原生支持，`remotion compositions` 能列出全部 |
| ffprobe 校验产物 | compositor 包自带 ffprobe | 项目用**系统 ffprobe** 做独立校验，不依赖 Remotion 内部那份 |

## 三条「绕开原生」的关键路径

### 1. chunk 提升：进程内 → 管线级

原生 `chunk.js` 是 8 行纯函数切数组；`combine-chunks.js` 在 `renderMedia`
**进程内**合并（注释原话 "useful for decentralized rendering"），进程崩全丢、无续渲。

项目 `render-ranges.sh` 把 chunk 提升成：

- **每 chunk 一个独立进程** `remotion render --frames=start-end`
- **持久文件** `segments/NNN_START-END.mp4`（帧区间写进文件名）
- **ffprobe `nb_frames` 校验**，匹配则 skip（`RESUME=1`）
- **ffconcat manifest** + `ffmpeg -f concat -c copy` 合并

补上了原生缺的「跨进程续渲」。失败重跑只删坏 chunk。

### 2. sequence 编码：让 `can-concat-seamlessly` 失效

`renderer/can-concat-seamlessly.js`（极简判定，约束极硬）：

```js
canConcatVideoSeamlessly(codec)  { return codec === 'h264'; }
canConcatAudioSeamlessly(a, n)   { return n <= 4 ? false : a === 'aac'; }
```

**只有 h264 + aac + 每块 >4 帧** 才走 `-c copy` 无缝 concat；否则 `combine-video-streams.js`
带 `-filter_complex` 重编码，边界易掉帧/PTS 不齐。CLI 里还有专门的
`forSeamlessAacConcatenationOption` flag——一个 flag 的存在就证明**默认不 seamless**。

`RENDER_MODE=sequence`（默认）：每 chunk 出 jpeg 帧序列（`--sequence --image-format=jpeg`），
再用项目 ffmpeg 同参数（同 CRF/pix_fmt/fps）一次性 encode 成 mp4。所有 chunk 同参数 →
`ffmpeg -f concat -c copy` **永远无缝**，因为根本没经过 seamless 判定和重编码路径。

这是 `render-final.sh` 注释 *"sequence is safer than direct mp4 chunks on unstable
tail frames"* 的源码层含义。

### 3. 音频外置：绕开 `combine-audio` 子流水线

renderer 音频侧 10+ 文件（combine-audio / create-audio / preprocess / merge / mux...），
三个核心痛点（源码可证）：

- `combine-audio.js`: AAC 每帧 1024 samples，`getClosestAlignedTime` 对齐边界，
  注释直引 `https://github.com/remotion-dev/remotion/issues/6010` 承认 audio imperfections
- `mux-video-and-audio.js`: 特意加 `-r fps` 防 drift——源码注释原话「否则 ffmpeg 推断出
  `95940000/3197999` 这种近似帧率，长视频累积成可见音画 drift」
- CLI 专门做 `forSeamlessAacConcatenationOption`——默认不 seamless

**项目场景不同**：音频是 mmx 外部预混的**整段 m4a**（人声+BGM 一次成），不分 chunk 生成。
所以 `--muted` 一刀关掉 renderer 音频，`render-final.sh` 用系统 ffmpeg 两步搞定：

```bash
ffmpeg -i "$AUDIO_FILE" -t "$DURATION" -c:a aac -b:a 192k "$AUDIO_TRIMMED"   # trim 到视频时长
ffmpeg -i "$VISUAL" -i "$AUDIO_TRIMMED" -map 0:v:0 -map 1:a:0 \
       -c:v copy -c:a aac -b:a 192k -shortest "$FINAL"                        # mux
```

红利：音频改动**秒级重跑**（不用重渲视频）、`-shortest` 自动对齐结尾、绕开 AAC 对齐/drift/
seamless 全部已知问题。代价（做不到帧级音画同步）在「预混整段配音」场景里为零。

## 动画子系统：帧驱动的纯函数

渲染管线讲完了「帧怎么编码」,这一节讲**帧里的值怎么算出来**——这是
deterministic 的另一半保证。**核心:动画 = `(frame) => JSX` 的 pure function**。
没有 ticker、没有 timeline 状态机、没有 side effect。三个正交纯函数原语:

### interpolate:分段 + 每段 easing(`interpolate.js:272-313`)

```js
result = easing(result);   // 归一化进度喂给 easing,再映射到 outputRange
```

- 多段 `inputRange/outputRange` = keyframe;每段可独立 easing(`easing` 入参可传数组)
- `EasingFunction = (t) => number`——任何 [0,1]→[0,1] 纯函数都行(GSAP 能表达的
  曲线这里全能表达)
- `extrapolateLeft/Right`:`clamp` / `extend` / `identity` / `wrap`

### spring:阻尼谐振子的解析解(`spring/spring-utils.js`)

```js
const zeta = c / (2 * Math.sqrt(k * m));        // 阻尼比
const omega0 = Math.sqrt(k / m);                 // 无阻尼角频率
// 欠阻尼 (zeta<1): 过冲振荡衰减;临界阻尼 (zeta>=1): 平滑趋近
```

**不是数值积分,是 closed-form**。两重含义:

- **frame-driven 不是 wall-clock**:`spring({frame, fps, config})` 给定帧号输出唯一,
  完全无 `Date.now()` / rAF
- **`advanceCache` 跨帧复用**:按 9 元组缓存每步解析解,并行 worker 渲不同帧都能
  命中同一缓存

这就是「并行/乱序渲染依然 deterministic」的根源——和 GSAP wall-clock 数值积分的
根本区别。

### Sequence:相对帧偏移(`Sequence.js:76-82`)

`<Sequence from={30} durationInFrames={60}>` 不产生动画值,只把子树的
`useCurrentFrame()` 基准偏移 30 帧。`<Series>` / `<Loop>` / `TransitionSeries`
全是这套偏移的组合。

### 一帧的生命周期

```
1. renderer 设 timelinePosition = N
2. React 渲染 Composition 树:组件调 useCurrentFrame()→N,interpolate/spring 算值,返回 JSX
3. React diff 到 DOM
4. Chrome 截图 → JPEG/PNG
5. ffmpeg 编码进帧序列
─────────────────────────
第 N+1 帧:从第 1 步重新开始,完全独立的一次执行
```

整条链**无跨帧可变状态**(`timelinePosition` 外部注入,`advanceCache` 纯函数缓存,
React state 每帧重置)。这就是为什么帧能并行/乱序/续渲,为什么 time-based 动画
(CSS animation、GSAP tween)在这里全 broken——见 [`anti-patterns.md`](anti-patterns.md) #9。

## 升级影响：为什么换 Remotion 版本几乎零成本

项目全部贴着 CLI/API 接缝走，**没 patch 内部**：

- **能力层**（CLI/Studio/React）—— 直接用，跟版本走
- **渲染层**（renderer）—— 当「渲帧 + 编码」纯执行器，绕开音视频耦合复杂度
- 4.x 自带 Rust compositor 这种大改动，shell 管线一行不用改

换版本后**唯一要重测**的：先 smoke test 分片是否仍稳（`can-concat-seamlessly` 判定可能变），
其它都自动跟。

## 源码定位速查

定位 renderer 源码：

```bash
ls -d node_modules/.pnpm/@remotion+renderer@*/node_modules/@remotion/renderer/dist
```

| 找什么 | 看哪个文件 |
|---|---|
| Chrome 下载/检测 | `ensure-browser.js` / `get-local-browser-executable.js` |
| chunk 切分 | `chunk.js`（8 行纯函数） |
| chunk 合并 + seamless 判定 | `combine-chunks.js` / `can-concat-seamlessly.js` |
| 音视频合流 + drift 修复 | `mux-video-and-audio.js`（看 `-r` 注释） |
| 音频对齐 + issue/6010 | `combine-audio.js` |
| ffmpeg 调用 | `call-ffmpeg.js` / `ffmpeg-args.js` |
| composition 元数据 | `get-compositions.js` |
| 原生二进制（ffmpeg/Rust） | `@remotion/compositor-linux-x64-gnu/` |

## 何时查这份文档

- 调试脚本行为反常（卡住、丢帧、音画不同步）—— 先定位是 renderer 哪一层，再决定绕开还是配置
- 想改管线（换 codec、加分片、改音频来源）—— 先确认是否落在原生已知痛点上
- Remotion 升级后 —— 按上文「升级影响」重测那一项
- 读到 SKILL/anti-patterns 里某条 trap 想知其所以然 —— 来这里查源码行
