# EP01 What Git Stores

当前审查输出固定放在 `current/`，每次修改直接覆盖同名文件，不新增临时版本目录。

## 完整输出

| 文件 | 时长 | 内容 |
| --- | ---: | --- |
| `current/ep01-what-git-stores.mp4` | 210s | 当前 EP01 正片 |
| `tmp/legacy-final/` | - | 历史静音版与带音频版，仅供追溯 |
| `current/release/ep01-what-git-stores.mp4` | 223s | EP01 发布版，包含公共片头、正片和公共片尾 |

## 音频素材

| 文件 | 用途 |
| --- | --- |
| `current/audio/voiceover.txt` | 配音文稿 |
| `current/audio/voiceover.mp3` | 原始中文配音 |
| `current/audio/voiceover.srt` | 原始配音字幕时间轴 |
| `current/audio/segments/` | 生成的原始音频、规范化音频和 SRT；可维护文稿位于根级 `git-course/` 分集目录 |
| `current/audio/voiceover-aligned.m4a` | 按 8 个片段起点和分段 SRT 重新对齐后的配音 |
| `current/audio/bgm_raw.mp3` | 原始 BGM |
| `current/audio/bgm_180.mp3` | 裁剪并淡入淡出的课程 BGM 源，混音时会循环覆盖完整正片 |
| `current/audio/mix.m4a` | 210 秒最终混音，用于封装进成片 |

## 分段输出

| 文件 | 时长 | 内容 |
| --- | ---: | --- |
| `01_hook.mp4` | 12s | 问题引入 |
| `02_bad_model.mp4` | 22s | 错误的文件复制模型 |
| `03_version_control.mp4` | 30s | 版本控制回答三个问题 |
| `04_snapshot_model.mp4` | 32s | commit 指向项目快照 |
| `05_practice_check.mp4` | 30s | 用 `git log` 和 `git show` 做最小实践验证 |
| `05_local_history.mp4` | 30s | 完整历史在本地 |
| `06_integrity.mp4` | 30s | 内容变化导致 hash 变化 |
| `07_takeaway.mp4` | 24s | 本集结论和 EP02 问题 |
