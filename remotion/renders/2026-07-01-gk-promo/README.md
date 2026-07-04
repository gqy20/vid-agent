# gk-promo 中国高校信息地图

25 秒 9:16 竖版宣传片,介绍 [gk.gqy20.top](https://gk.gqy20.top)
—— 高考志愿填报辅助工具(中国高校地图 + 大学四年预演 + 模拟器)。
**含中文男声配音 + ambient BGM**(Remotion 静帧渲 + ffmpeg 后端 mux)。

![thumbnail](thumbnail.png)

## 分镜(6 场景,746 帧 @ 30fps)

| 时间      | 场景      | 内容 |
|-----------|-----------|------|
| 0–4s      | 痛点钩子  | 642 分浮现（0→60 帧 ease-out 计数, **serif**）→ 圆环视觉框架 → "分数出来了。" + caption |
| 4–7s      | 品牌亮相  | GK logo + "GK"(**serif**) + 中国高校信息地图 + slogan |
| 7–12s     | 高校地图  | **34 城 · 147 所 双一流** 散点按入选数加权（mega+halo / major / mid / single 四档）|
| 12–18s    | 未来预演  | "你的目标大学" + "你的方向" 输入卡 + 大一→大四 4 节点纵向时间线 |
| 18–22s    | 大学模拟器 | 小明人设卡 + 3 个情境(大一报到/期末抢座/社团招新) + 分享按钮（**无 eyebrow**） |
| 22–25s    | CTA       | "去看见 你的未来"(**serif**) + gk.gqy20.top ↗ + logo |

## 音轨(2026-07-01 增补,v2 调音)

- **配音**:`mmx speech synthesize` 中文 `Male_Announcer` / `speech-2.8-hd`,
  6 句 19.18s,再 `ffmpeg atrim+adelay+concat` 把各段对齐到对应视频场景起始 → 25.85s
  (`voiceover_aligned.mp3` + `voiceover.srt`)。
- **BGM**:`mmx music generate --instrumental --mood calm --bpm 72`,
  178s。**v2 音量 0.22→0.16** 落入 taste.md 推荐区间 0.12-0.18。
- **混音**:`mix.mp3 = voiceover_aligned + bgm@0.16`,
  192kbps,`atrim` 双方都到视频全时长 24.87s。配音 19.18s 结束后 BGM 持续 ~5.7s + CTA 收尾。
- **字幕**(v2 简化):`src/videos/gk-promo/captions.tsx` 仅保留 hook + map 两个 SceneCaption。
  其它 4 个场景（brand/future/simulator/cta）画面文字已自足，按 taste.md
  "若画面已有大标题和产品截图，默认不加底部字幕" 删冗余。
- 详见 skill `remotion-vid/references/audio-mmx.md` 附 A(音画对齐)/B(逐字)/C(静音占位)。

## 重现

```bash
cd remotion
pnpm install

# 1) 配音 + srt(脚本在 renders/2026-07-01-gk-promo/script.txt)
mmx speech synthesize --text-file script.txt \
  --voice "Chinese (Mandarin)_Male_Announcer" --model speech-2.8-hd \
  --language zh --subtitles --out voiceover.mp3
#   按 skill 附 A 用 atrim+adelay 把各段对齐视频场景起始,改写 voiceover.srt

# 2) BGM
mmx music generate --prompt "Calm cinematic tech ambient, 25 seconds, no vocals" \
  --instrumental --mood calm --bpm 72 --out bgm.mp3

# 3) 混音(双方 trim 到视频全时长 24.87s,音量比 1:0.16)
ffmpeg -y -i voiceover_aligned.mp3 -i bgm.mp3 \
  -filter_complex "[0:a]atrim=0:24.87,asetpts=N/SR/TB[vo];[1:a]volume=0.16,atrim=0:24.87,asetpts=N/SR/TB[bg];[vo][bg]amix=inputs=2:duration=first" \
  -c:a libmp3lame -b:a 192k mix.mp3

# 4) 抽帧自检
bash ../.claude/skills/remotion-vid/scripts/check-frames.sh GkPromo 30 90 200 400 580 700

# 5) 终渲(silent mp4)
pnpm exec remotion render GkPromo \
  renders/2026-07-01-gk-promo/renders/final/gk-promo_1080p30_$(date +%Y%m%d-%H%M%S).mp4 \
  --concurrency=4

# 6) ffmpeg 合音(-map 显式选 mix.mp3,避开 silent 占位 -91dB)
F=$(ls renders/2026-07-01-gk-promo/renders/final/gk-promo_1080p30_*.mp4 | tail -1)
ffmpeg -y -i "$F" -i mix.mp3 \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest \
  "renders/2026-07-01-gk-promo/renders/final/gk-promo_with-audio_$(date +%Y%m%d-%H%M%S).mp4"
```

源码:`src/videos/gk-promo/`(主合成 `GkPromo.tsx` + 6 场景),
主题常量在 `src/videos/gk-promo/theme.ts`,
字幕单源在 `src/videos/gk-promo/captions.tsx`。
配音脚本 `renders/2026-07-01-gk-promo/script.txt`,SRT 在 `renders/.../voiceover.srt`。
详见 `meta.json`。

## v3 vs v2 改动（2026-07-01 20:02）

| 项 | v2 | v3 | 理由 |
|----|----|----|------|
| Map 散点 | 61 等大抽象点 | **34 真实城市按 双一流 数量加权** | taste.md "使用真实数据" |
| Map tier | 2 档（big/normal） | **4 档**（mega/major/mid/single）+ halo | 数据层级感 |
| Map 标签 | 7 个等大 | **9 个**（mega + major 各保留名字） | 信息密度 |
| Simulator | 5 元素含 eyebrow | **4 元素** 删 eyebrow | "一帧最多 3 元素" |
| Hero 字体 | Sarasa UI SC | **Noto Serif CJK SC** | taste.md "标题可以用 serif" |
| 配色 | warm-cream + 琥珀 | 同 v2 | 不变 |

## v2 vs v1 改动（2026-07-01 19:40）

| 项 | v1 | v2 | 理由 |
|----|----|----|------|
| 场景数 | 7 | 6 | 删 SceneFeatures（命中"功能点罗列"禁用） |
| 时长 | 28.5s | 24.9s | 砍 features 120 帧 + 1 转场 14 帧 |
| 字幕数 | 6/6 | 2/6 | 仅 hook + map 保留（其它画面自足） |
| Hook 飘问号 | 4 个浮字 + 圆环 | 仅圆环 | 装饰动效违反 taste.md |
| BGM 音量 | 0.22 | 0.16 | 落入推荐区间 |

## 已知小坑(供后续改进)

- **配音 19.18s vs 视频 24.87s**:配音结束后 BGM 独奏 ~5.7s,视觉(CTA 收尾)无字幕。
  简单做法是砍脚本重生成配音(目标 ≤视频秒数);复杂做法是补一段静音 + 文案场景。
- **SRT 与 TransitionSeries 帧边界未严格对齐**:`atrim+adelay` 按"段 1 起点 = 视频 frame 0"
  近似算的,`SceneCaption` 全部 `from=0` 是兼容兜底。如要精确到每段,需按
  TransitionSeries 内部帧边界重算 `adelay`。
- **CTA 无二维码**:硬塞 SVG QR 要引外部库违反 ponytail。当前靠"↗"符号暗示外链。
  真需要 QR 时:`pnpm add qrcode @types/qrcode` → 在 CTA 渲 `<img src={qrSvg}>`。
- **Map 标签碰撞**:北京/天津、上海/南京 因经度接近,标签 `x=r+6` 单向右移会撞。
  ponytail 临时方案：标签做"东/西侧智能偏置"（西边城市标签左移、东边右移）
  或砍到只剩 mega 3 城。当前接受为密度可视化的代价。