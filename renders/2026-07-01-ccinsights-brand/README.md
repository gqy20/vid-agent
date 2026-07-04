# 2026-07-01-ccinsights-brand

**Title:** cc-insights 品牌叙事宣传片
**Created:** 2026-07-01 · **Revised:** 2026-07-04 (V6 polish)
**Brand color:** `#C15F3C` (terracotta orange)

## Deliverables

| Asset | Duration | Path |
| --- | --- | --- |
| brand narrative (final, V6) | 30.5s | `renders/final/brand-final-1080p-V6.mp4` |
| brand narrative (silent concat) | 30.5s | `renders/final/brand-concat-1080p-V6.mp4` |
| hero shot | 3.4s | `renders/final/hero_final.mp4` |

Thumbnail: `thumbnail.png`.

## Typography

Split by audience signal (verified via frame audits):
- **JetBrains Mono** → pure-English terminal/shell (s02, s09). The IDE font.
- **Sarasa Mono SC** → any CJK text. Latin+CJK share one equal-width grid.
  JetBrains Mono has no CJK; using it for Chinese lines falls back to a
  proportional face and breaks alignment.

Constants in `src/_lib.py` (`FONT_MONO`, `FONT_GOTHIC`). Install with
`fc-list | grep -iE 'jetbrains|sarasa mono sc'`; JetBrains Mono lives in
`~/.fonts/`, Sarasa was already present.

## Storyboard (V6)

| # | Scene | Dur | Content |
| --- | --- | --- | --- |
| s01 | Hook | 2.5s | "你每天都在用 Claude Code" + brand underline. |
| s02 | Pain | 2.8s | Terminal (Catppuccin, JetBrains Mono): fix loop, Read/Edit syntax-colored, "↻ loop detected" chip, status bar. |
| s03 | Question | 4.0s | "但你从未真正诊断过自己" + brand "?". |
| s04 | Reveal | 4.0s | Brand block floods; "cc-insights" + white underline + subtitle. |
| s05 | Promise | 2.8s | 5-stage pipeline 读取→…→改进, brand color flows L→R, sub-line. |
| s06 | DemoTease | 4.0s | 6-card dashboard, hero metric 消息数 110,375 in brand color. |
| s07 | Highlight | 3.0s | Giant "24.5min" + 行业均值 2.1min ⬆11.6× baseline. |
| s08 | Credibility | 2.4s | "开源·生产就绪" + 3 brand-stroked badges (MIT/Go/单binary). |
| s09 | CTA | 3.0s | Terminal: `❯ cc-insights` + 3 install cmds + `✓ installed` echo + status bar. |
| s10 | End | 2.0s | Logo + "cc-insights" + slogan + ★ Star on GitHub CTA button. |

Segment-mean frame-audit score: **4.55 → ~8.0** (mmx VLM, 1080p hold frames).

## Reproduce

```bash
# 1. Render all 10 segments at 1080p60
SLUGS=(s01_hook s02_pain s03_question s04_reveal s05_promise s06_demo_tease s07_highlight s08_credibility s09_cta s10_end)
CLS=(Hook Pain Question Reveal Promise DemoTease Highlight Credibility CTA End)
for i in 0 1 2 3 4 5 6 7 8 9; do
  slug=${SLUGS[$i]}; cls=${CLS[$i]}
  uv run manim -qh --media_dir /tmp/qh_$slug src/brand/$slug.py $cls
  cp /tmp/qh_$slug/videos/$slug/1080p60/$cls.mp4 renders/final/${slug}_1080p60_V3.mp4
done

# 2. Concat (process substitution may be disabled — write a list file)
: > /tmp/concat.txt
for slug in ${SLUGS[@]}; do echo "file '$PWD/renders/final/${slug}_1080p60_V3.mp4'" >> /tmp/concat.txt; done
ffmpeg -y -f concat -safe 0 -i /tmp/concat.txt \
  -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -movflags +faststart \
  renders/final/brand-concat-1080p-V6.mp4

# 3. Mux voice + BGM (assets already in tts/ bgm/)
ffmpeg -y -i renders/final/brand-concat-1080p-V6.mp4 -i tts/voice.wav -i bgm/bgm.wav \
  -filter_complex "[1:a]volume=0.95[v];[2:a]volume=0.18[b];[v][b]amix=inputs=2:duration=longest[m]" \
  -map 0:v -map "[m]" -c:v copy -c:a aac -b:a 192k -shortest \
  renders/final/brand-final-1080p-V6.mp4
```

## Known pitfalls avoided (per `.claude/skills/manim-viz`)

- **No `from manim import *`** — explicit grouped imports everywhere.
- **No MathTex / no Axes.get_axis_labels()** — LaTeX absent; CJK always `Text`.
- **Wall-clock budget** — each Scene documents its beat × run_time at the top.
- **`set_stroke()` uses `width=` not `stroke_width=`** — manim 0.20 method API
  differs from the constructor; bitten by this once in s05.

## One real bug we hit

`manim 0.20.1` has no `Polyline`. Used `VMobject.set_points_as_corners(...)`
in `hero.py` and `s10_end.py`.
