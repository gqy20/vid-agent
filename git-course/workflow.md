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
pnpm --dir remotion git-course plan <episode-id>
pnpm --dir remotion git-course status <episode-id>
pnpm --dir remotion git-course build <episode-id>
```

`plan` 只计算 scene/TTS 指纹并显示 `HIT` 或 `BUILD`。`build` 执行统一 DAG：

```text
validate / generate
  ├── 所有 dirty scene 并行 render -> segment audit
  └── 所有 dirty TTS 并行 synthesize -> normalize
        ↓
assemble silent main + align/mix audio
        ↓
assemble main candidate
        ↓
machine audit -> needs_review / fail
```

默认并发为 `all`：所有依赖已满足的任务立即启动。Remotion 单进程 concurrency 默认按逻辑 CPU 数除以 dirty scene 数计算，尽量使用全部算力；可用 `--render-concurrency=<n>` 覆盖。TTS 和规范化默认对所有 dirty segment 同时执行。

候选、缓存、日志、manifest 和 verdict 位于 `tmp/`：

```text
tmp/cache/scenes/
tmp/build/candidate/<episode-id>.mp4
tmp/build/artifact-manifest.json
tmp/build/audit/main/{manifest.json,report.html,verdict.json}
tmp/build/audit/release/{manifest.json,report.html,verdict.json}
tmp/build/logs/
```

## 统一采样审查

所有审查都针对编码后的 MP4，而不是 Remotion still。统一采样协议如下：

- 连续审查以 `2fps` 抽取，即 30fps 视频每 15 帧取一张。
- 每张审查条最多合并 5 帧，固定为 `5×1`；最后一张可以少于 5 帧。
- 总览固定取 16 帧并合并为 `4×4`，只用于定位区间，不能代替连续审查。
- scene、片头/正片、正片/片尾边界在中心点前后各取 `0.5s`，以 `10fps` 生成 burst。
- scene 默认检查开头、中点、结尾精确关键帧；发布版额外检查片头结束、正片首尾、片尾开始/中点/结尾。

main 与 release 使用同构证据目录：

```text
tmp/build/audit/<main|release>/
├── manifest.json
├── report.html
├── verdict.json
├── overview/contact-16.jpg
├── review/{frames,sheets}/
├── boundaries/<boundary>/{frames,sheets}/
├── keyframes/
└── metrics/
```

`manifest.json` 记录预期和实际抽帧/拼图数量。数量不一致、边界或关键帧缺失都会使机器检查失败；机器通过后仍是 `needs_review`，人工必须完整查看 `report.html` 后才能 approve。

## 审查、晋升与发布

```bash
pnpm --dir remotion git-course approve <episode-id> --note="已检查字幕、Git 语义和状态变化"
pnpm --dir remotion git-course promote <episode-id>
pnpm --dir remotion git-course release-build <episode-id>
pnpm --dir remotion git-course release-audit <episode-id>
pnpm --dir remotion git-course release-approve <episode-id> --note="已检查片头片尾和音量边界"
pnpm --dir remotion git-course publish <episode-id>
```

统一 verdict 只有 `pass`、`fail`、`needs_review`。机器检查覆盖音视频流、分辨率、FPS、时长、SRT 停顿标记、采样覆盖率和证据数量；机器通过后仍需人工 approve。approve、promote、publish 都校验候选 SHA；main 还会重新计算 scene、TTS 和 BGM 指纹，输入变化后必须重新 build/audit。

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

机器检查负责时间轴、文件结构、旁白窗口、音视频流与生成文件新鲜度；人工检查负责 Git 语义、注意力、字幕遮挡、信息密度和动作因果。只有带匹配 `pass` verdict 的 candidate 才能原子晋升到 current。历史内容只进入 `tmp/legacy-*`，不得重新成为 current 输入。
