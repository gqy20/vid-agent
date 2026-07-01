# 音频 —— 配音 + BGM 与 Remotion 对接

Remotion 只生成 silent 视频。配音(voiceover)和背景音乐(BGM)用 **mmx-cli**
(MiniMax AI 平台 CLI)生成,再用 **ffmpeg** 混音并 mux 进 mp4。

通用 mmx 命令全表见 `mmx-cli` skill。本文件只覆盖**视频场景**的子集:
TTS + music generate + 混音 + Remotion 桥接。

## 0. 前置:认证(只做一次)

```bash
npm install -g mmx-cli
mmx auth login --api-key sk-xxxxx           # 写入 ~/.mmx/config.json
# 或环境变量
export MINIMAX_API_KEY=sk-xxxxx
mmx auth status                              # 确认 active
```

## 1. 配音(voiceover / TTS)

文案先落 `script.txt`(中文,每段一行),再用 `mmx speech synthesize` 一次出 mp3:

```bash
mmx speech synthesize \
  --text-file script.txt \
  --voice English_expressive_narrator \
  --model speech-2.8-hd \
  --format mp3 --sample-rate 32000 --bitrate 128000 \
  --language zh \
  --out renders/<id>/renders/voiceover.mp3
# 单次最多 10k 字符；超长可拆段，再 ffmpeg concat。
# 加 --subtitles 可同时出 .srt（与 CCInsightsPromo 等做词级字幕匹配）
```

- `script.txt` 的**自然段切分**应大致对应视频的**场景切分**;时长差通过 `ffprobe` 反查对齐。
- 想逐句精控可加 `--subtitles` + `@remotion/captions` 生成 TikTok 风词级高亮(详见 skill `display-captions` 规则)。

## 2. 背景音乐(BGM)

```bash
mmx music generate \
  --prompt "Soft cinematic ambient, calm documentary, 60 seconds long" \
  --instrumental \
  --use-case "background music for video" \
  --mood calm --tempo slow --bpm 72 \
  --instruments "piano, soft pads" \
  --format mp3 --bitrate 256000 \
  --out renders/<id>/renders/bgm.mp3
```

- **`--instrumental` 必加**:BGM 要纯器乐,否则混入人声打架。
- **时长写在 prompt 里**(参数里没秒数),如 "60 seconds long"。`ffprobe` 反查实际
  时长;偏短用 `atempo` 循环或生成时改 prompt。
- `--bpm 60–90` 配讲解类最稳;`--mood` 与视频调性对齐(科技冷静 = `calm/cool`)。

## 3. 混音(配音为主、BGM 压低)

```bash
mix() {
  ffmpeg -y -i renders/$ID/renders/voiceover.mp3 -i renders/$ID/renders/bgm.mp3 \
    -filter_complex "[1:a]volume=0.22[bg];[0:a][bg]amix=inputs=2:duration=first:dropout_transition=0" \
    -c:a libmp3lame -b:a 192k renders/$ID/renders/mix.mp3
}
```

要点:
- BGM 比例 `volume=0.20–0.30`(降 12–14 dB),留出语音净空。
- `amix:duration=first` 跟配音时长截;`dropout_transition=0` 避免末帧杂音。
- 输出 192k mp3 兼顾文件大小与质量。

## 4. 与 Remotion 视频合流

**两种方案,推荐 A(后端 ffmpeg mux)**:

### 方案 A(推荐):Remotion 渲 silent + ffmpeg 合并

```bash
# 1) Remotion 渲视频(无音轨,默认就这样)
scripts/render-final.sh CCInsightsPromo cc-insights-promo
# 产出: renders/<id>/renders/final/cc-insights-promo_1080p30_*.mp4  ← silent

# 2) 用 mix.mp3 mux 进视频
F=$(ls renders/$ID/renders/final/cc-insights-promo_1080p30_*.mp4 | tail -1)
ffmpeg -y -i "$F" -i renders/$ID/renders/mix.mp3 \
  -c:v copy -c:a aac -b:a 192k -shortest \
  "renders/$ID/renders/final/cc-insights-promo_with-audio_$(date +%Y%m%d-%H%M%S).mp4"
```

`-c:v copy` 不重压视频流,几十秒搞定;`-shortest` 跟最短的音轨截。

### 方案 B:Remotion 内部混合(配字幕/波形等需要时间同步)

```tsx
import {Audio, staticFile, Sequence} from 'remotion';
// 在 <Composition> 内最外层:
<Audio src={staticFile('renders/<id>/renders/voiceover.mp3')} />
<Audio src={staticFile('renders/<id>/renders/bgm.mp3')} volume={(f) => f < 30 ? f/30 : 0.22} />
// 音量曲线:fade-in BGM,或随场景变化
```

- 静态资源放工程根 `public/`,用 `staticFile('path-in-public')` 引用;`renders/` 在
  `public/` 之外,需先 `cp renders/<id>/renders/*.mp3 public/`,或改 audio 直接读
  `import x from '.../mix.mp3?url'`(Remotion bundler 支持)。
- BGM 音量用 `volume={(f) => ...}` 做入场淡入、随场景起伏。

## 5. 完整体流程(宣传片示例)

```bash
ID=2026-07-01-cc-insights-promo
mkdir -p renders/$ID/renders

# 1) 写脚本与生成配音
echo -e "为什么 Claude Code 越来越慢、越来越贵?\n... (各场景台词)" > script.txt
mmx speech synthesize --text-file script.txt --language zh --out renders/$ID/renders/voiceover.mp3

# 2) 生成 BGM
mmx music generate --prompt "Calm tech 70s" --instrumental --bpm 72 --out renders/$ID/renders/bgm.mp3

# 3) 混音
ffmpeg -y -i renders/$ID/renders/voiceover.mp3 -i renders/$ID/renders/bgm.mp3 \
  -filter_complex "[1:a]volume=0.22[bg];[0:a][bg]amix=inputs=2:duration=first" \
  -c:a libmp3lame -b:a 192k renders/$ID/renders/mix.mp3

# 4) Remotion 渲 silent
scripts/render-final.sh CCInsightsPromo cc-insights-promo

# 5) 合并成 final with-audio
F=$(ls renders/$ID/renders/final/cc-insights-promo_1080p30_*.mp4 | tail -1)
ffmpeg -y -i "$F" -i renders/$ID/renders/mix.mp3 \
  -c:v copy -c:a aac -b:a 192k -shortest \
  "renders/$ID/renders/final/cc-insights-promo_with-audio_$(date +%Y%m%d-%H%M%S).mp4"

# 6) 记入 meta.json 的 env.fonts 旁边,新加 env.audio_voice / env.audio_bgm
```

## 6. 失败/常见问题

| 现象 | 原因 / 修法 |
|---|---|
| `mmx: command not found` | 未装或 PATH 没: `npm i -g mmx-cli && hash -r` |
| 401 / 403 | API key 失效/余额不足:`mmx auth status` 验;新 key 用 `auth login --api-key` 覆盖 |
| BGM 自带人声 | 没加 `--instrumental`;重新生成 |
| 合成时音画不同步 | 方案 A 一般同步(视频恒速);B 需对齐 `Sequence` 偏移 |
| 视频合成时丢帧/卡顿 | `-c:v copy` 不要加 `-vf`;转换只跑在 audio 端 |
| TTS 超过 10k 字符报错 | 拆 `script.txt` 多段,每段独立 `synthesize` 后 `ffmpeg` concat |

---

## 附 A. 音画对齐 —— 配音时长 ≠ 视频场景时长(最易翻车,2026-07 新增)

mmx TTS 各段时长由语速决定,**不自动匹配视频各场景时长**。直接拿 srt 时间戳做字幕,
后半段会累积偏移,出现「CTA 字幕配 Features 画面」的违和(cc-insights-promo 实测 CTA
提前 7.4s)。

**诊断**:
- `ffprobe` 配音总时长 vs 视频 `durationInFrames/fps`,差 >3s 必须处理。
- 逐段 srt 时间戳 vs 视频场景起止帧(`/fps`)列表,看累积偏移在哪段开始发散。
- 中文播报腔 voice(`Male_Announcer` 等)实测 ~3.3 字/秒,比常见的 4–4.5 慢——字数预算
  按实际 voice 估,**宁少勿多**(超长只能砍脚本)。

**修法 A(整体同比偏移)**:`ffmpeg -af atempo=X` 等比拉/压(轻微变调)。适合所有段
同比例偏短/偏长。参见根 `renders/ccinsights-brand` 的 `atempo=1.32`。

**修法 B(分段不均偏移,精确)**:`atrim` 切段 + 每段 `adelay` 填静音对齐到对应视频场景
起始 + `concat`,再**同步重写 srt**(每段时间戳 += 新起始 − 原起始):
```bash
ffmpeg -y -i voice.mp3 -filter_complex "\
[0:a]atrim=0:7.110,asetpts=N/SR/TB[a1];\
[0:a]atrim=7.272:12.199,asetpts=N/SR/TB,adelay=220[a2];\
[0:a]atrim=12.348:22.442,asetpts=N/SR/TB[a3];\
[0:a]atrim=22.608:29.068,asetpts=N/SR/TB,adelay=2320[a4];\
... 每段 atrim=原起:原止,需要前置静音的段加 adelay=N毫秒 ...;\
[a1][a2][a3][a4]...concat=n=8:v=0:a=1[out]" \
  -map "[out]" -ac 1 -c:a libmp3lame -b:a 128k -ar 32000 voice_aligned.mp3
```
要点:mono 用 `adelay` 单值(非 `N|N`);`adelay=0` 的段直接省略该 filter;`asetpts=N/SR/TB`
重置时间戳避免 dts 警告(无妨但刷屏)。cc-insights-promo 实测 60.8s→68.3s,最大偏移
7.4s→≤1.3s。

**总时长超视频**:**砍脚本重生成**(按实际字/秒算 ≤ 视频秒数),**不要延帧**——延帧连锁
改 Composition `durationInFrames` + 所有场景时长 + TransitionSeries 转场算式。

## 附 B. 中文逐字高亮字幕 —— 别用 createTikTokStyleCaptions(2026-07 新增)

`@remotion/captions` 的 `createTikTokStyleCaptions()` 官方主推,但**对中文逐字完全失效**:
它靠**空格切词** + **相邻 token 时间间隔**换页。中文单字无空格 → 整句并成一页;字间线性
插值后间隔=0 → 永不换页。

**中文正解**(cc-insights-promo 实装):
1. `parseSrt()` 得**句级** Caption[](mmx srt 每块 = `script.txt` 一行)。
2. 长句按中文标点二次切短句:`text.split(/(?<=[,。！？；])/)`,时间按字数比例分配——
   更贴近 TikTok 风短词组。
3. **每句一个 `<Sequence>`**;句内 `splitToChars` 把单字在 `[startMs,endMs]` 按字数线性
   插值;`useCurrentFrame()` → 绝对 ms → 当前字满足 `startMs<=t<endMs` 高亮。
4. 每字前加空格(首字除外) + 容器 `whiteSpace:'pre-wrap'`;CJK 用 `Array.from` 切(正确
   处理代理对);描边 `WebkitTextStroke` + `paintOrder:'stroke fill'`。

完整 `KaraokeCaptions.tsx`(`delayRender` fetch srt → parseSrt → splitLongLine → 句级
Sequence + 句内逐字 span)实装于 `remotion/src/components/KaraokeCaptions.tsx`。

## 附 C. 静音占位轨陷阱

Remotion silent 视频的容器可能带一条 **-91 dB 全静音占位轨**。`ffprobe` 报「有 audio
stream」**≠**「有声音」。用 `ffmpeg -i x.mp4 -af volumedetect -f null -` 看 `max_volume`:
-91 dB(且 = mean_volume)即静音占位,等于没声音,要从零加音轨(cc-insights-promo 原片
即此——看着像有音轨,实际全程静音)。
