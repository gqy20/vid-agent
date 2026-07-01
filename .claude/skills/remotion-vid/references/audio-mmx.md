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
