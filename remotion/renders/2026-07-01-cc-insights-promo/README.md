# cc-insights CLI 宣传片

72 秒终端风宣传片,介绍 [cc-insights](https://github.com/gqy20/cc-insights)
(Claude Code 使用诊断 CLI)。**含中文男声配音 + 科技冷静 ambient BGM + 顶部逐字高亮字幕**
(Remotion 内嵌音轨,非后端 mux)。

![thumbnail](thumbnail.png)

## 分镜(8 场景,2086 帧 @ 30fps)

| 时间 | 场景 | 内容 |
|------|------|------|
| 0–8s | 痛点钩子 | 乱码 JSONL 滚动 → "为什么变慢/变贵/老失败?" |
| 8–13s | 品牌亮相 | 折线 logo 描边 + `cc-insights` 辉光浮现 |
| 13–26s | `rec` | 根因 + 证据 + 下钻命令 |
| 26–35s | `tok` | 按项目动态条形图 |
| 35–44s | `cmd` | 命令族失败率 + 高风险命令告警 |
| 44–54s | `web` | Dashboard 卡片 + 趋势折线 |
| 54–65s | 卖点 | 四张特性卡 |
| 65–72s | CTA | logo + 命令 + GitHub 地址 |

## 音轨(2026-07-01 增补)

- **配音**:`mmx speech synthesize` 中文 `Male_Announcer` / `speech-2.8-hd`,218 字 60.9s,
  再 `ffmpeg atrim+adelay+concat` 把各段对齐到对应视频场景起始 → 68.3s
  (`public/voiceover.mp3` + `public/voiceover.srt`)。原 raw 配音 60.8s 比视频 69.5s 短且各段
  不均,直接用会让 CTA 字幕提前 7.4s 落在 Features 画面上。
- **BGM**:`mmx music generate --instrumental --mood calm --bpm 72`,`<Audio volume>` 曲线
  fade-in 30 帧→0.22→维持→fade-out(`public/bgm.mp3`)。
- **字幕**:`@remotion/captions` 句级 `<Sequence>` + 句内逐字高亮(**弃用对中文失效的
  `createTikTokStyleCaptions`**),组件 `src/components/KaraokeCaptions.tsx`。
- 详见 skill `remotion-vid/references/audio-mmx.md` 附 A(音画对齐)/B(中文逐字)/C(静音轨)。

## 重现

```bash
cd remotion
pnpm install

# 1) 配音 + srt(脚本在 public/script.txt)
mmx speech synthesize --text-file public/script.txt \
  --voice "Chinese (Mandarin)_Male_Announcer" --model speech-2.8-hd \
  --language zh --subtitles --out public/voiceover.mp3
#   按 skill 附A 用 atrim+adelay 把各段对齐视频场景起始,并同步重写 voiceover.srt

# 2) BGM
mmx music generate --prompt "Calm cinematic tech ambient, 70 seconds, no vocals" \
  --instrumental --mood calm --bpm 72 --out public/bgm.mp3

# 3) 抽帧自检(字幕对位 + 不遮挡)
bash ../.claude/skills/remotion-vid/scripts/check-frames.sh CCInsightsPromo 120 560 1140 1470 1980

# 4) 终渲(自带音轨,无需再 ffmpeg mux)
pnpm exec remotion render CCInsightsPromo \
  renders/2026-07-01-cc-insights-promo/renders/final/cc-insights-promo_1080p30_$(date +%Y%m%d-%H%M%S).mp4 \
  --concurrency=4
```

源码:`src/videos/cc-insights-promo/`(主合成 `CCInsightsPromo.tsx` + 8 场景),主题常量在
`src/theme.ts`。配音脚本 `public/script.txt`,字幕组件 `src/components/KaraokeCaptions.tsx`。
详见 meta.json。
