# Character Story 30

30 秒 Remotion 角色视频：5 个场景、3 个人物、一个八方向角色资产展示段，带中文旁白和 BGM。

## Current

唯一发布版：

```text
renders/current/character-story.mp4
```

该文件由 `renders/candidates/character-story_voiceover.mp4` 发布而来。旧的静音版和 BGM-only 版已经移入 `renders/tmp/visual/`，只作为可重建参考。

## Layout

```text
2026-07-04-character-story/
  README.md
  meta.json
  thumbnail.png
  script/voiceover.txt
  renders/
    current/character-story.mp4
    candidates/character-story_voiceover.mp4
    archive/
    tmp/
      audio/voiceover.mp3
      audio/voiceover.srt
      audio/mix-voice-bgm.m4a
      stills/contact-sheet.jpg
      visual/character-story_silent.mp4
      visual/character-story_bgm-only.mp4
```

## Reproduce

```bash
cd remotion
REMOTION_VIDEO_FILTER=character-story pnpm exec remotion render \
  src/index.ts CharacterStory30 \
  renders/2026-07-04-character-story/renders/tmp/visual/character-story_silent.mp4 \
  --concurrency=4 --timeout=120000 --muted
```

Generate voiceover:

```bash
mmx speech synthesize \
  --text-file renders/2026-07-04-character-story/script/voiceover.txt \
  --model speech-2.8-hd --voice English_expressive_narrator \
  --format mp3 --sample-rate 32000 --bitrate 128000 \
  --language zh --subtitles \
  --out renders/2026-07-04-character-story/renders/tmp/audio/voiceover.mp3
```

Mix voiceover + BGM and mux:

```bash
ffmpeg -nostdin -y \
  -i renders/2026-07-04-character-story/renders/tmp/audio/voiceover.mp3 \
  -i public/bgm.mp3 \
  -filter_complex "[0:a]volume=1.0,apad=pad_dur=1.2[v];[1:a]atrim=0:30,asetpts=N/SR/TB,volume=0.16,afade=t=in:st=0:d=1.2,afade=t=out:st=28.4:d=1.6[bg];[v][bg]amix=inputs=2:duration=longest:dropout_transition=0,atrim=0:30,asetpts=N/SR/TB[a]" \
  -map "[a]" -c:a aac -b:a 192k \
  renders/2026-07-04-character-story/renders/tmp/audio/mix-voice-bgm.m4a

ffmpeg -nostdin -y \
  -i renders/2026-07-04-character-story/renders/tmp/visual/character-story_silent.mp4 \
  -i renders/2026-07-04-character-story/renders/tmp/audio/mix-voice-bgm.m4a \
  -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -shortest \
  renders/2026-07-04-character-story/renders/candidates/character-story_voiceover.mp4
```

## Notes

The video proves the Remotion path can carry generated characters into a real 30 second timeline. Remaining production work is asset cleanup: background removal, watermark cleanup, consistent cropping, and bad-frame regeneration for the eight-direction set.
