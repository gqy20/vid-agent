# 渲染项目布局

> 一个 Remotion 工程**共享一套依赖**（package.json / node_modules / remotion.config.ts），
> 每条视频的**源码**隔离在 `src/videos/<slug>/`，**产物**归档到 `renders/<YYYY-MM-DD>-<slug>/`。
> 让视频可重现、可分享、易跨版本对比，且根目录不被 mp4 堆乱。

## 与 manim 的差异（为什么不能每条视频一个独立目录）

manim 每条动画是自洽的 `.py`，共用 `.venv`，所以整条放进 `renders/<id>/src/`。
Remotion 必须有 bundler 入口 + node_modules，**每条视频自带一份依赖代价太高**。
因此采用：**单工程 + 每视频源码子目录 + 每视频产物目录**。源码与产物分离，
产物目录靠 `meta.json:source` 指回源码。

## 目录模板

```
<remotion-project>/                      # 单一工程，依赖共享
├── package.json  remotion.config.ts  tsconfig.json
├── node_modules/                        # gitignored
├── src/
│   ├── Root.tsx                         # 注册所有 <Composition>
│   ├── theme.ts                         # 全局 COLORS/FONTS/EASE
│   ├── components/                      # 跨视频复用：Terminal/Reveal/Typed/Bar
│   └── videos/
│       └── <slug>/                      # ← 每条视频的源码（加的那一层）
│           ├── <Slug>.tsx               # 该视频主组件（被 Root 注册）
│           └── scenes/                  # 该视频的场景组件
└── renders/
    └── <YYYY-MM-DD>-<slug>/             # ← 每条视频的产物目录（带日期层级）
        ├── meta.json                    # 机读：任务 + 环境 + 渲染信息
        ├── README.md                    # 人读：摘要 + 重现步骤
        ├── thumbnail.png                # 中点帧预览（final 质量）
        └── renders/
            ├── debug/<slug>_720p30_<YYYYMMDD-HHMMSS>.mp4
            └── final/<slug>_1080p30_<YYYYMMDD-HHMMSS>.mp4
```

slug：小写、连字符、≤ 32 字符，匹配视频**讲什么**（如 `cc-insights-promo`、
`brand-intro`，不是 `video1`）。`<Slug>.tsx` 用大驼峰，对应 Composition id。

## 布局原因

- **可重现：** `meta.json:renders[*].command` 是产 mp4 的准确命令。
- **可版本：** 迭代时把带时间戳的 mp4 加到 `debug/`；`final/` 是要发的版本。
- **自描述：** `meta.json` 带任务、Composition id、尺寸/fps/时长、码率、环境（含
  浏览器路径与字体策略）。不跑也能读懂。
- **根目录干净：** mp4 不散落工程根；`out/` 临时输出渲染后归档到 `renders/<id>/`。
- **日期层级：** `renders/<YYYY-MM-DD>-<slug>/` 让几十条视频不互相淹没。

## 工作流

### 1. 工程只建一次

```bash
npm create video@latest -- --blank <remotion-project>   # 或 pnpm
cd <remotion-project>
# remotion.config.ts: setBrowserExecutable(本地Chrome) + setOverwriteOutput(true)
```

### 2. 新视频骨架

```bash
ID="$(date +%Y-%m-%d)-<slug>"
mkdir -p "src/videos/<slug>/scenes" "renders/$ID/renders/debug" "renders/$ID/renders/final"
# 写 src/videos/<slug>/<Slug>.tsx + scenes/*；在 Root.tsx 注册 <Composition id="<Slug>">
```

或用 `scripts/new-video.sh <slug>` 一键建上面两处骨架。

### 3. 抽帧调试（**必经**，见 still-check.md）

```bash
scripts/check-frames.sh <Slug> 90 300 470 880 1200   # 逐场景看 out/check/*.png
# 关键：still-check 通过 → 才进 debug/final 渲染
```

### 4. debug 渲染（草稿，快）

```bash
scripts/render-final.sh <Slug> <slug> --debug    # 720p 草稿渲入 renders/<id>/renders/debug/
```

### 5. final 渲染（debug 通过后）

```bash
scripts/render-final.sh <Slug> <slug>            # 1080p 渲入 final/ + ffprobe + 抽 thumbnail
```

`render-final.sh` 自动:带时间戳命名、建目录、渲染 `--concurrency=4`、ffprobe 校验;
final 角色还会抽中点帧到 `renders/<id>/thumbnail.png`。手动等价命令见脚本内注释。

### 6.（thumbnail 已由 render-final.sh 在 final 阶段自动生成）

如需指定非中点帧:`ffmpeg -y -ss <秒> -i <final.mp4> -frames:v 1 renders/<id>/thumbnail.png`。

### 7. 写 `meta.json` 与 `README.md`（见下 schema）

## meta.json schema

```json
{
  "id": "2026-07-01-cc-insights-promo",
  "title": "cc-insights CLI 宣传片",
  "created": "2026-07-01T00:42:00+08:00",
  "description": "72s 终端风宣传片：痛点→品牌→rec/tok/cmd/web 演示→卖点→CTA。",
  "composition_id": "CCInsightsPromo",
  "source": "src/videos/cc-insights-promo/",
  "theme_tags": ["promo", "terminal", "cli"],

  "env": {
    "remotion_version": "4.0.484",
    "node": "25.8.0",
    "browser_executable": "/opt/google/chrome/chrome",
    "fonts": "local: JetBrainsMono Nerd Font + Noto Sans CJK SC",
    "pnpm_lock_sha": null
  },

  "composition": {"width": 1920, "height": 1080, "fps": 30, "durationInFrames": 2086},

  "renders": [
    {
      "role": "final",
      "resolution": "1920x1080",
      "fps": 30,
      "command": "pnpm exec remotion render CCInsightsPromo renders/.../final/cc-insights-promo_1080p30_20260701-004200.mp4 --concurrency=4",
      "output": "renders/final/cc-insights-promo_1080p30_20260701-004200.mp4",
      "duration_s": 69.53,
      "bit_rate_bps": 1098000,
      "size_bytes": 9553196,
      "render_wall_s": 208
    }
  ],

  "thumbnail": "thumbnail.png",
  "reproduce": {
    "still_check": "scripts/check-frames.sh CCInsightsPromo 90 470 880 1200 1500 1800",
    "final": "pnpm exec remotion render CCInsightsPromo <final-path> --concurrency=4"
  },
  "notes": "本地字体零联网；durationInFrames = Σ场景2202 − Σ转场116。"
}
```

`pnpm_lock_sha` 记 `pnpm-lock.yaml` 的 SHA256，便于逐位重现。

## 命名规则

- **产物目录：** `YYYY-MM-DD-<slug>` —— 创建日期。
- **源码目录：** `src/videos/<slug>/`，主组件 `<Slug>.tsx`（大驼峰 = Composition id）。
- **渲染产物：** `<slug>_<质量>_<时间戳>.mp4`，质量后缀 `720p30`(debug `--scale`)/
  `1080p30`(final)；时间戳 `YYYYMMDD-HHMMSS` 本地时间。

## 清理

- 工程根的 `out/`（含 `out/check/` 抽帧）是临时——归档进 `renders/<id>/` 后可删:
  `scripts/cleanup.sh [--dry-run] [--force]`。`.gitignore` 已排除 `out/`。
- `renders/<id>/renders/debug/*.mp4` 旧版本是历史，磁盘紧张时只留最新。
- `final/` 最新版是核心产物，至少保留。
- `node_modules/` 永远 gitignore。
