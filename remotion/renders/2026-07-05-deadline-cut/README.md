# Deadline Cut

3 分钟小故事：三个人在截止时间前，把“不完美的角色八向图”从技术验证救成真正的叙事短片。

## Naming

`deadline-cut` 是片名，不是版本号。它描述故事冲突：截止时间前完成一版能交付、能成立的 cut。

## Current

当前有两个输出：

```text
renders/current/deadline-cut.mp4         # 3 分钟图文叙事版
renders/current/deadline-cut-actors.mp4  # 75 秒 actor-driven 小故事版
renders/current/deadline-cut-storyboard.mp4 # 120 秒分镜驱动短片版
```

## Layout

```text
2026-07-05-deadline-cut/
  README.md
  meta.json
  thumbnail.png
  thumbnail-actors.png
  thumbnail-storyboard.png
  script/voiceover.txt
  renders/
    current/deadline-cut.mp4
    current/deadline-cut-actors.mp4
    current/deadline-cut-storyboard.mp4
    candidates/deadline-cut_story.mp4
    archive/
    tmp/
      story-audit/contact-sheet.jpg
```

Runtime assets:

```text
remotion/public/deadline-cut/
  audio/deadline-cut-voiceover.mp3
  audio/deadline-cut-voiceover.srt
  audio/deadline-cut-voiceover.txt
  actors/audio/*.mp3
  actors/audio/*.txt
  story-plates/*.jpg
  storyboard-plates/*.jpg
  storyboard-audio/narration.mp3
```

## Storyboard Film

`DeadlineCutStoryboard` 是这次新的方向：不再把方向图当核心，而是先写镜头动作，再让素材服务镜头。

- 用 6 张 mmx 关键镜头图表现具体动作：围看屏幕、递交坏帧、按住提交、钉上坏帧、倾听特写、黎明交付。
- Remotion 负责镜头裁切、Ken Burns 推拉、暗角、对白框、问题卡浮层和收束页。
- 补了独立旁白音轨 `storyboard-audio/narration.mp3`，BGM 被压低到背景层。
- 输出是 120 秒，不强行拉满 3 分钟；当前重点是验证“分镜驱动”比“方向图位移”更成立。

## Actor System

`DeadlineCutActors` 是 actor-driven 小故事片段：

- `actors/directions.ts` 支持 8 向和 16 向方向集合。
- `actors/manifests.ts` 让每个角色声明自己拥有的方向图；当前阿导使用八向图，小析和阿程使用正面图 fallback。
- 小析和阿程已经用 mmx 生成 16 向候选图，候选 contact sheet 保存在 `public/characters/*/directions16/contact-sheet.jpg`。这批资源未通过一致性质量门，因此暂不接入正式 actor manifest。
- `actors/path.ts` 根据路径关键帧插值位置。
- `actors/CharacterActor.tsx` 根据移动方向自动选最近方向图，并叠加脚步 bob、投影和远近缩放。
- 场景内包含可变化的预览窗、QA 标记、素材卡拖拽、故事板填充、提交进度和多角色对话音频，人物动作会推动剧情状态变化。

后续补 16 向时，只需要把 `directions` manifest 扩成 `NNE/ENE/ESE/...` 等 16 个方向，场景代码不需要改。

## Story Beats

1. 倒计时启动
2. 八向图的代价
3. 质检员的质疑
4. 导演的坚持
5. 时间出现裂痕
6. 错误的修复
7. 灵感来自坏帧
8. 重新诠释角色
9. 真正的协作开始
10. 最后一帧落定
11. 截止前交付
12. 留下来的不是完美

## Reproduce

```bash
cd remotion
REMOTION_VIDEO_FILTER=deadline-cut pnpm exec remotion render \
  src/index.ts DeadlineCut \
  ../remotion/renders/2026-07-05-deadline-cut/renders/current/deadline-cut.mp4 \
  --overwrite --timeout=120000 --concurrency=8
```

Render the actor-driven demo:

```bash
cd remotion
REMOTION_VIDEO_FILTER=deadline-cut pnpm exec remotion render \
  src/index.ts DeadlineCutActors \
  ../remotion/renders/2026-07-05-deadline-cut/renders/current/deadline-cut-actors.mp4 \
  --overwrite --timeout=120000 --concurrency=8
```

Generate voiceover:

```bash
mmx speech synthesize \
  --text-file remotion/public/deadline-cut/audio/deadline-cut-voiceover.txt \
  --model speech-2.8-hd --voice "Chinese (Mandarin)_Warm_Bestie" \
  --speed 0.55 --format mp3 --sample-rate 32000 --bitrate 128000 \
  --channels 2 --language zh --subtitles \
  --out remotion/public/deadline-cut/audio/deadline-cut-voiceover.mp3
```

## Notes

The 3-minute version uses a lighter editorial palette and a fixed two-zone layout: text stays in the left safe area, characters and visual plates stay on the right, and the bottom rail is reserved for progress only. This was checked with a 12-frame story contact sheet to avoid subtitle/card/person overlap.

The actor story uses a dedicated contact sheet at `renders/tmp/actor-story-audit/contact-sheet.jpg` to check title/caption/person/card overlap across the main beats. The current story also shows the 16-direction candidate review inside the timeline instead of silently accepting unstable assets.
