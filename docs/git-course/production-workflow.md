# 生产工作流

课程生产从文字脚本开始，不直接写动画。

## 流程

```text
script.md
  ↓
scenes.json
  ↓
Remotion 主视频
  ↓
Manim 原理片段
  ↓
Remotion 合成
  ↓
抽帧审查与 meta 同步
```

## 每集目录

推荐每集保留这些文件：

```text
docs/git-course/episodes/<episode-id>.md
remotion/src/videos/git-course/lessons/<episode-id>/
scripts/manim/git-course/scenes/<topic>_scene.py
remotion/renders/git-course/<episode-id>/
```

当前 Ep04 仍位于 `episodes/` 目录，后续新增课程可以逐步迁移到 `lessons/`。

## script.md

写清楚：

- 本集要解决的问题。
- 观众已有前置知识。
- 每个镜头的旁白。
- 每个命令会造成什么状态变化。
- 哪些地方需要 Manim 原理动画。

## scenes.json

每个场景至少包含：

```json
{
  "id": "branch-create",
  "duration": 12,
  "layout": "terminal-split",
  "command": "git branch feature",
  "stateAfter": "feature 指向 C2",
  "subtitle": "写入一条 ref"
}
```

目标是让一集主要由数据驱动，而不是在 React 里散写镜头逻辑。

## Remotion

Remotion 负责：

- 课程品牌。
- 终端演示。
- 字幕。
- 代码和 diff。
- Git 状态图。
- Manim 片段合成。
- 最终音视频输出。

统一从 `remotion/src/videos/git-course/kit/` 使用组件，不在 episode 内重复实现终端、片头、片尾和基础 Git 图形。

## 音频

Git 课程音频使用“分段生成、统一后期、固定输出”的流程。不要整集一次性生成旁白后强行切片；每个 scene 都应该能单独重做。

格式约定：

- `.mp3` 只作为源素材或分段中间产物：MiniMax TTS 原始输出、单段规范化人声、原始 BGM。
- `.m4a` 作为可复用的聚合结果：全片对齐人声 `voiceover-aligned.m4a`、最终混音 `mix.m4a`、片头片尾 BGM。
- 新流程不再生成 `voiceover_aligned.mp3`、`voiceover-aligned.mp3`、`mix_180.mp3` 这类最终音频名。

### 分段配音

每个 scene 保留独立文稿和音频：

```text
remotion/renders/git-course/<episode-id>/renders/current/audio/
├── bgm.mp3                         # 或复用 EP01 的 bgm_180.mp3
├── voiceover-aligned.m4a           # 180s 对齐人声轨，AAC/M4A
├── mix.m4a                         # 180s 最终混音，AAC/M4A
├── alignment.md                    # 音频对齐说明
└── segments/
    ├── 01_hook.txt
    ├── 01_hook.mp3                 # TTS 原始输出
    ├── 01_hook.srt                 # TTS 句子级时间轴
    └── 01_hook_norm.mp3            # FFmpeg 规范化后用于成片的人声
```

`voiceover-aligned.m4a` 和 `mix.m4a` 是统一输出名。旧的 `voiceover_aligned.mp3`、`voiceover-aligned.mp3`、`mix_180.mp3` 只作为历史本地产物，不再作为新流程目标。

### 文稿节奏

TTS 文稿按教学节拍写短句，不把一整段塞成一行。MiniMax TTS 支持文本内停顿标记，课程旁白默认使用：

```text
<#0.25#>
<#0.35#>
<#0.45#>
```

用法示例：

```text
执行 git add app.js。<#0.3#>Git 把当前这一刻的 app.js 放进 Index。
```

生成后必须检查 `.srt`：

- 停顿标记不能出现在 SRT 文字里。
- 每段旁白时长必须短于对应 scene 时长。
- 句子级 cue 应能解释画面当前主视觉，不要跨到下一段。

### 人声后期

不要用 `mmx speech synthesize --volume` 当作响度标准化。`--volume` 是生成参数，不是测量后的 LUFS 控制。

每段 TTS 生成后，用 FFmpeg 做轻压缩和响度规范化：

```bash
ffmpeg -y -i 01_hook.mp3 \
  -af "acompressor=threshold=-22dB:ratio=2.0:attack=8:release=120:makeup=1.0,loudnorm=I=-20:TP=-3:LRA=7,alimiter=limit=0.90" \
  -ar 44100 -ac 1 -c:a libmp3lame -b:a 128k \
  01_hook_norm.mp3
```

验收目标：

- 单段人声 integrated loudness 约 `-20 LUFS`。
- 单段峰值约 `-3 dBFS`。
- 段与段之间响度差异尽量控制在 1 LU 以内。
- 整条 `voiceover-aligned.m4a` 因为包含留白，整轨 LUFS 会低于单段，这是正常现象；评估人声一致性应看单段 `_norm.mp3`。

### 对齐与混音

先把 `_norm.mp3` 按 scene 起点拼成 180 秒人声轨，再混 BGM。对齐说明必须写进 `audio/alignment.md`：

```text
absolute sentence time = Voice starts + cue time in segment .srt
```

BGM 策略：

- Git 课程集与集之间优先复用已确认 BGM。
- BGM 使用固定低音量，不做 sidechain ducking，避免背景音乐随人声忽高忽低。
- 当前 EP01/EP02 使用 `volume=0.05`。

混音示例：

```bash
ffmpeg -y \
  -i voiceover-aligned.m4a \
  -i bgm.mp3 \
  -filter_complex "[0:a]aresample=44100,volume=1.0[vo];[1:a]volume=0.05[bg];[vo][bg]amix=inputs=2:duration=longest:dropout_transition=0,alimiter=limit=0.94,atrim=0:180[out]" \
  -map "[out]" -ar 44100 -c:a aac -b:a 192k \
  mix.m4a
```

最终封装时只替换音频，不重渲画面：

```bash
ffmpeg -y \
  -i renders/current/final/<episode-id>_silent.mp4 \
  -i renders/current/audio/mix.m4a \
  -map 0:v:0 -map 1:a:0 -c:v copy -c:a copy -shortest \
  renders/current/final/<episode-id>_with-audio.mp4
```

根据单集既有路径调整文件名，但输出必须覆盖固定成片路径。

### 发布版包装

单集当前成片确认后，再生成对外发布版。发布版包含三段：

```text
公共片头 7s
正片 180s
公共片尾 6s
```

当前 EP01/EP02 发布版总长为 `193s`，即 `5790` 帧。发布版固定输出到：

```text
remotion/renders/git-course/<episode-id>/renders/current/published/<episode-id>_published.mp4
```

片头和片尾也要有 BGM，但不单独换音乐。优先从课程统一 BGM 中截取短片段，降低到固定低音量，并做短淡入淡出：

```bash
ffmpeg -y -i audio/bgm_180.mp3 \
  -filter_complex "atrim=start=0:end=7,asetpts=PTS-STARTPTS,volume=0.08,afade=t=in:st=0:d=0.4,afade=t=out:st=6.2:d=0.8" \
  -ar 44100 -c:a aac -b:a 192k intro-bgm.m4a
```

最终三段拼接时优先使用 concat filter 重新编码并重置时间轴，不用 concat copy 直接拼接。直接 copy 容易在片头、正片、片尾边界产生音频 DTS/PTS 警告。

统一发布命令：

```bash
scripts/git-course-publish-episode.sh \
  <episode-id> \
  renders/git-course/<episode-id>/renders/current/<main-with-audio>.mp4
```

例如：

```bash
scripts/git-course-publish-episode.sh \
  ep01-what-git-stores \
  renders/git-course/ep01-what-git-stores/renders/current/ep01-what-git-stores.mp4
```

发布版和正片审查版分开：平时检查单集内容看 `renders/current/<episode-id>.mp4` 或单集既有 `final/*_with-audio.mp4`；确认发布完整包装时才看 `renders/current/published/*_published.mp4`。

发布版 mp4、混音、分段 TTS、SRT 和 BGM 都是本地生成产物，默认不进 git。仓库只保留源码、脚本、TTS 文稿 `.txt`、对齐说明 `.md` 和生产流程文档。

## Manim

Manim 负责：

- DAG。
- Git 对象模型。
- hash / SHA。
- Merkle tree。
- 三路合并。
- diff 算法。

Manim 片段应该短，通常 8 到 20 秒。它解释一个抽象原理，然后回到 Remotion 的课程主线。

## 审查

每次出片后必须检查：

- 字幕是否遮挡终端、图形、HEAD、分支标签。
- 是否存在无意义循环动画。
- 命令、状态变化、图形变化是否有明确因果。
- 颜色是否只表达语义，不做随意装饰。
- 画面是否同时塞入太多信息。
- 完整成片是否包含视频流和音频流，时长一致。
- 发布版是否包含公共片头、正片、公共片尾，当前 180 秒正片集的发布版应为 `193s` / `5790` 帧。
- 分段人声响度是否统一，BGM 是否固定低音量且低于人声。
- `audio/alignment.md` 是否记录 scene 起点、旁白进入时间和使用的规范化文件。

当前可用命令：

```bash
pnpm --dir remotion video:audit <video> <output-dir>
pnpm --dir remotion meta:sync <episode-dir> "<render command>"
```

音频校验常用命令：

```bash
ffprobe -v error -show_entries format=duration -show_entries stream=codec_type,codec_name,duration,nb_frames <final.mp4>
ffmpeg -hide_banner -i <final.mp4> -af volumedetect -f null -
ffmpeg -hide_banner -nostats -i <segment_norm.mp3> -af ebur128=peak=true -f null -
```
