# 2026-07-01-ccinsights-brand

**Title:** cc-insights 品牌叙事宣传片
**Created:** 2026-07-01
**Brand color:** `#C15F3C` (terracotta orange)

Two deliverables, both produced silent and ready for voice + BGM post-processing:

| Asset | Duration | Path |
| --- | --- | --- |
| hero shot         | 3.4s | `renders/final/hero_final.mp4` |
| brand narrative   | 30.9s | `renders/final/brand-concat.mp4` |

Thumbnail: `thumbnail.png` (mid-frame of the brand narrative).

## Layout

```
2026-07-01-ccinsights-brand/
├── meta.json             # task, env, segment list, reproduce commands
├── README.md             # this file
├── thumbnail.png         # mid-frame preview
├── src/
│   ├── _lib.py           # brand palette + direction constants + helper
│   ├── hero.py           # 4s hero shot (logo geometry, brand-color peak)
│   └── brand/s0X_*.py    # 10 segments of the 35s narrative
├── scripts/
│   ├── voice-script.txt  # 10 Chinese scripts per segment
│   ├── concat.sh         # ffmpeg concat 10 segments -> brand-concat.mp4
│   └── mmx_post.sh       # voice + BGM via mmx-cli -> brand-final.mp4
├── tts/  bgm/            # mmx-cli output (currently empty)
└── renders/
    ├── debug/sNN_*.mp4   # per-segment renders (-ql)
    └── final/
        ├── hero_480p15_20260701-005500.mp4
        ├── hero_final.mp4
        └── brand-concat.mp4
```

## Storyboard

| # | Scene | Duration | Content |
| --- | --- | --- | --- |
| hero | Hero | 3.4s | Draw the `❯` pulse polyline from the logo, peak pulses in `#C15F3C`, "cc-insights" rises, subtitle fades in. |
| s01 | Hook       | 2.5s | "你每天都在用 Claude Code" + orange underline wipe. |
| s02 | Pain       | 2.8s | 6 fake `history.jsonl` lines scroll in; line 3 loops (Edit-fix-still-broken pattern). |
| s03 | Question   | 4.0s | "但你从未真正诊断过自己" + orange `?`. |
| s04 | Reveal     | 3.8s | Brand-color block wipes up; "cc-insights" + subtitle. |
| s05 | Promise    | 3.1s | Five verbs flash in `#C15F3C`: 读取 · 解析 · 汇总 · 推荐 · 改进. |
| s06 | DemoTease  | 4.2s | 6 dashboard cards fade in (numbers from docs/dashboard.png): 消息数 110,375 / 命令调用 14,578 / 工具调用 45,749 / Token 8.2G / 活跃项目 97 / 诊断项 3. |
| s07 | Highlight  | 3.1s | "Agent 单调用 24.5min" with a pulsing brand peak + "high" tag (matches dashboard). |
| s08 | Credibility| 2.5s | MIT · Go 1.21+ · 单 binary. |
| s09 | CTA        | 3.0s | Terminal prompt `❯ cc-insights` + three install commands. |
| s10 | End        | 2.0s | Logo again + `github.com/gqy20/cc-insights`. |

Total observed: 30.9s. Design target was 35s — each segment trimmed its trailing wait. Add `self.wait(...)` before `self.wait(end)` if you want a longer loopable product.

## Reproduce

From the project root:

```bash
# 1. Render every segment (debug, fast)
cd src
for f in hero.py brand/s0*.py; do
  case "$f" in
    hero.py)            SCN=Hero ;;
    s01_hook.py)        SCN=Hook ;;
    s02_pain.py)        SCN=Pain ;;
    s03_question.py)    SCN=Question ;;
    s04_reveal.py)      SCN=Reveal ;;
    s05_promise.py)     SCN=Promise ;;
    s06_demo_tease.py)  SCN=DemoTease ;;
    s07_highlight.py)   SCN=Highlight ;;
    s08_credibility.py) SCN=Credibility ;;
    s09_cta.py)         SCN=CTA ;;
    s10_end.py)         SCN=End ;;
  esac
  uv run manim -ql --media_dir "/tmp/build_${SCN}" "$f" "$SCN"
done
cd ..

# 2. Move each mp4 into renders/debug/  with the project's filename convention

# 3. Concatenate
bash scripts/concat.sh renders/debug renders/final/brand-concat.mp4
```

## Post-processing (voice + BGM)

Two scripts are wired but deferred until `mmx-cli` is installed:

```bash
# voice + BGM in one shot
bash scripts/mmx_post.sh
# → tts/voice.wav, bgm/bgm.wav, renders/final/brand-final.mp4
```

Ten Chinese voice lines live in `scripts/voice-script.txt`; mmx-cli reads them by `[sNN_name] HH:MM-HH:MM` markers, with one paragraph of free text per segment.

The BGM mood is `tech, calm, modern, educational` per `scripts/mmx_post.sh` — change if you want more energy.

## Known pitfalls avoided (per `.claude/skills/manim/anti-patterns.md`)

- **No `from manim import *`** — every Scene has an explicit grouped import block.
- **No MathTex / no Axes.get_axis_labels()** — LaTeX is absent; all formulas are `Text("2x² − 5x + 6")` with Unicode superscripts.
- **Updater parameter `dt` is literally `dt`** — `scripts/sNN_*.py` use plain `wait()` only, no time-based updaters, so the silent-freeze trap doesn't apply here.
- **Wall-clock budget (`Σ run_time + Σ wait`)** — each Scene documents the per-stage budget at the top of the file.

## One real bug we hit

`manim 0.20.1` has no `Polyline` class. Replaced with `VMobject.set_points_as_corners(...)` in `hero.py` and `s10_end.py`. If you copy this style elsewhere, use that helper instead of trying `Polyline(*points, ...)`.
