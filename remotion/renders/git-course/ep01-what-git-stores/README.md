# EP01 What Git Stores

当前审查输出固定放在 `renders/current/`，每次修改直接覆盖同名文件，不新增临时版本目录。

## 完整输出

| 文件 | 时长 | 内容 |
| --- | ---: | --- |
| `renders/current/ep01-what-git-stores.mp4` | 180s | 完整 EP01 成片，包含中文配音和 BGM |

## 音频素材

| 文件 | 用途 |
| --- | --- |
| `renders/current/audio/voiceover.txt` | 配音文稿 |
| `renders/current/audio/voiceover.mp3` | 原始中文配音 |
| `renders/current/audio/voiceover.srt` | 原始配音字幕时间轴 |
| `renders/current/audio/voiceover_segments/` | 分段配音文稿、原始音频、规范化音频、SRT 和对齐说明 |
| `renders/current/audio/voiceover_aligned.mp3` | 按 7 个片段起点和分段 SRT 重新对齐后的配音 |
| `renders/current/audio/bgm_raw.mp3` | 原始 BGM |
| `renders/current/audio/bgm_180.mp3` | 裁剪并淡入淡出的 180 秒 BGM |
| `renders/current/audio/mix_180.mp3` | 180 秒最终混音，用于封装进成片 |

## 分段输出

| 文件 | 时长 | 内容 |
| --- | ---: | --- |
| `01_hook.mp4` | 12s | 问题引入 |
| `02_bad_model.mp4` | 22s | 错误的文件复制模型 |
| `03_version_control.mp4` | 30s | 版本控制回答三个问题 |
| `04_snapshot_model.mp4` | 32s | commit 指向项目快照 |
| `05_local_history.mp4` | 30s | 完整历史在本地 |
| `06_integrity.mp4` | 30s | 内容变化导致 hash 变化 |
| `07_takeaway.mp4` | 24s | 本集结论和 EP02 问题 |
