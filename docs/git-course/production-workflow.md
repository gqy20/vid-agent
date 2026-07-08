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

### 分段配音

每个 scene 保留独立文稿和音频：

```text
remotion/renders/git-course/<episode-id>/renders/current/audio/
├── bgm.mp3                         # 或复用 EP01 的 bgm_180.mp3
├── voiceover-aligned.mp3           # 180s 对齐人声轨，命名可沿用单集既有风格
├── mix.m4a                         # 最终混音，命名可沿用单集既有风格
├── alignment.md                    # 音频对齐说明
└── segments/
    ├── 01_hook.txt
    ├── 01_hook.mp3                 # TTS 原始输出
    ├── 01_hook.srt                 # TTS 句子级时间轴
    └── 01_hook_norm.mp3            # FFmpeg 规范化后用于成片的人声
```

如果单集已经使用 `voiceover_segments/` 或 `mix_180.mp3` 之类名称，可以沿用，但同一集内必须稳定，不要新增 `new`、`v2`、`final-2` 等临时文件名。

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
- 整条 `voiceover-aligned.mp3` 因为包含留白，整轨 LUFS 会低于单段，这是正常现象；评估人声一致性应看单段 `_norm.mp3`。

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
  -i voiceover-aligned.mp3 \
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
