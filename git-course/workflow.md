# Git Course 生产流程

## 唯一内容源

每集只维护一个文件：

```text
git-course/episodes/<episode-id>.json
```

它同时保存：

- 教学目标、参考依据和制作策略；
- scene 顺序、标题、时长、视觉动作和审查点；
- `scenes[].narration` 中的分段旁白、segment id 和进入时间；
- 人工质量与对齐记录；
- `release` 中的发布文案、封面 brief 和人工检查项。

不得再为单集新增同名目录、`script.md`、`scenes.json`、`beats.md`、旁白 `.txt` 源或独立 publishing 源目录。

## 派生关系

```text
episode JSON
  ├── Remotion typed timeline
  ├── tmp/generated-ranges/*.tsv
  ├── tmp/narration-source/*.txt + manifest.tsv
  ├── current/audio/segments/*.{mp3,srt}
  ├── current/audio/{voiceover-aligned,mix}.m4a
  ├── current/scenes/*.mp4
  ├── current/<episode-id>.mp4
  └── current/release/{cover.png,<episode-id>.mp4}
```

所有派生物都可以删除重建，不作为内容事实源。

## 常用命令

```bash
pnpm --dir remotion git-course:validate
pnpm --dir remotion git-course:generate
pnpm --dir remotion git-course:render <episode-id>
pnpm --dir remotion git-course:render <episode-id> --scene <scene-id>
```

生成音频时从 `remotion/` 运行：

```bash
scripts/git-course-build-voiceover.sh \
  <episode-id> \
  renders/git-course/<episode-id>/current/<episode-id>.mp4
```

脚本会先从 episode JSON 派生临时文稿和 manifest，再执行 TTS、SRT 检查、响度规范化、对齐、混音和封装。

发布版：

```bash
scripts/git-course-publish-episode.sh \
  <episode-id> \
  renders/git-course/<episode-id>/current/<episode-id>.mp4
```

## 时间与音频约束

- 每集通常 3–5 分钟，不为整数时长重复解释。
- scene 必须首尾连续，总和等于 `durationSeconds`。
- narration 的 `voiceStart` 必须位于对应 scene 窗口；历史过渡最多允许提前 `0.5s`。
- TTS 固定使用 `speech-2.8-hd`、`Chinese (Mandarin)_Gentleman`、`zh`、`1.25`。
- 单段规范化目标约 `-20 LUFS`、峰值约 `-3 dBFS`。
- BGM 使用固定低音量，当前基准为 `0.05`，不做 sidechain ducking。
- SRT 不得泄漏 `<#...#>` 停顿标记。

## Remotion 与 Manim

- Remotion：课程壳、终端、字幕、代码、轻量 Git 图、状态面板和最终合成。
- Manim：DAG、对象模型、hash、三路合并、rebase 等几何关系复杂的原理动画。
- 技术选择由教学表达决定，不因现有资产缺失而降级。

## 审查与晋升

```text
tmp/       临时渲染、ranges、TTS 源、抽帧和历史归档
current/   当前通过审查的单集、scene、音频和 release
```

机器检查负责时间轴、文件结构、旁白窗口、音视频流与生成文件新鲜度；人工检查负责 Git 语义、注意力、字幕遮挡、信息密度和动作因果。历史内容只进入 `tmp/legacy-*`，不得重新成为 current 输入。
