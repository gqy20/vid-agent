# cc-insights CLI 宣传片

43 秒终端风宣传片,介绍 [cc-insights](https://github.com/gqy20/cc-insights)
(Claude Code 使用诊断 CLI)。**含中文男声配音 + 科技冷静 ambient BGM；主推版不叠加全片字幕**
(Remotion 内嵌音轨,非后端 mux)。

![thumbnail](thumbnail.png)

## 分镜(8 场景,1295 帧 @ 30fps)

| 时间 | 帧 | 场景 | 内容 |
|------|----|------|------|
| 0.000–9.000s | 0–269 | 痛点钩子 | 乱码 JSONL 滚动 → 证据锁定 |
| 8.667–15.667s | 260–469 | 品牌亮相 | 第一条 finding: 慢调用不是感觉 |
| 15.333–20.500s | 460–614 | `rec` | 判断 / 证据 / 动作三段式 |
| 20.500–23.500s | 615–704 | `tok` | 同一过滤条件继续下钻 |
| 23.167–26.167s | 695–784 | `cmd` | 命令族失败率 + 高风险命令告警 |
| 25.833–31.333s | 775–939 | `web` | 本地 Dashboard，定位模型 / Session / 项目 |
| 31.000–38.500s | 930–1154 | 输出 | JSON / Markdown / Table 交给 AI 继续处理 |
| 38.167–43.167s | 1145–1294 | CTA | logo + 命令 + GitHub 地址 |

## 音轨(2026-07-04 优化版)

- **配音**:`public/script-52s.txt` → `public/voiceover-52s.mp3` / `public/voiceover-52s.srt`。
  实际语音到 42.6s 结束，因此视频重排为 43.17s，避免旧版 52.7s 后半段音画错位。
- **混音**:`public/mix-cc-insights-52s.m4a`，渲染脚本按当前视频长度 trim 到 43.17s。
- **字幕**:主推版不挂载全片字幕，避免和 Manim 标题、截图标注争夺顶部层级；
  `voiceover-52s.srt` 和 `KaraokeCaptions` 保留给可选 captioned 版本。
- 详见 skill `remotion-vid/references/audio-mmx.md` 附 A(音画对齐)/B(中文逐字)/C(静音轨)。

## Manim 混合版(2026-07-04)

这版把两类“解释性强、适合几何化”的片段交给 Manim 预渲染，再作为本地视频资产嵌入
Remotion：

- `hook`: JSONL 事件 → 聚类维度 → finding，使用 `public/manim/cc-jsonl-to-finding.mp4`。
- `rec`: symptom → evidence → root cause → next cmd，使用 `public/manim/cc-rec-chain.mp4`。

这样保留 Remotion 对场景节奏、截图和音轨的统一控制，同时让因果链/数据流动画更稳。
Manim 源码在 `../../../renders/2026-07-04-cc-insights-manim/src/cc_manim_overlays.py`；
生成的 `media/` 目录不入库，只提交 Remotion 消费的两个 mp4 资产。最终混合优化版输出：
`renders/final/cc-insights-promo_20260704-tokbox_final.mp4`。

`rec → tok` 使用硬切，不做 crossfade；这两个高密度画面叠化会产生严重信息重影。
图上标注只保留框线/高亮，不再把解释性文字压在截图或 Manim 画面上。
18–20s 的 `rec` 链路面板已改为只保留四段链路；Manim 底部指标 rail 已从源素材删除，19s 不再出现右侧文字重叠。
20.5–23s 的 `tok` 标注只圈过滤条件行，框线不压文字；24s 的 `cmd` 标注横向圈住 echo/grep 两行，覆盖命令名、调用、失败和失败率。

## 重现

```bash
cd remotion
pnpm install

# 1) 配音 + srt(脚本在 public/script-52s.txt)
mmx speech synthesize --text-file public/script-52s.txt \
  --voice "Chinese (Mandarin)_Male_Announcer" --model speech-2.8-hd \
  --language zh --subtitles --out public/voiceover-52s.mp3

# 2) BGM
mmx music generate --prompt "Calm cinematic tech ambient, 45 seconds, no vocals" \
  --instrumental --mood calm --bpm 72 --out public/bgm.mp3

# 3) 终渲
pnpm render

# 4) Manim 混合 + 无全片字幕 + tok 框位修正主推版终渲
TS=20260704-tokbox END_FRAME_OFFSET=0 CONCURRENCY=4 JOBS=1 CHUNK_FRAMES=600 pnpm render
```

源码:`src/videos/cc-insights-promo/`(主合成 `CCInsightsPromo.tsx` + 8 场景),主题常量在
`src/theme.ts`。配音脚本 `public/script-52s.txt`,字幕组件 `src/components/KaraokeCaptions.tsx`。
详见 meta.json。
