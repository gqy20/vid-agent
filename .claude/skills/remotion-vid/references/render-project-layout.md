# 渲染项目布局

> **适用范围：独立 Remotion 视频的 fallback。** 如果仓库已经存在 `AGENTS.md`、课程级
> `workflow.md` 或 orchestrator，必须使用项目定义的 episode、cache、candidate、audit、Current
> 和 Release 生命周期。本文件中的日期目录、`tmp/chunks`、`tmp/scenes` 和
> `promote --publish` 不得覆盖课程 adapter，也不能作为课程已通过门禁的证据。

> 一个 Remotion 工程**共享一套依赖**（package.json / node_modules / remotion.config.ts），
> 每条视频的**源码**隔离在 `src/videos/<slug>/`，**产物**归档到 `renders/<YYYY-MM-DD>-<slug>/`。
> 让视频可重现、可分享、易跨版本对比，且根目录不被 mp4 堆乱。

## 产物管理三原则（先记住）

1. **`current/` 是唯一发布版**——目录里永远只有 1 个 `<slug>.mp4`，文件名固定。CI/部署/分享都指这里。
2. **命名固化**——候选版 `<slug>_<label>.mp4`，label 是语义短词（`cutfix`/`ccopt`/`manim-hybrid`）。**禁止 ts-only、禁止 `V<n>`、禁止分辨率前缀**。
3. **`meta.json` 是真相源**——`current` 字段指向发布版 + sha256 + 生成命令；脚本和人都从这找答案。

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
│       └── <slug>/                      # ← 每条视频的源码（自包含）
│           ├── <Slug>.tsx               # 该视频主组件
│           ├── index.ts                 # 导出 registration（Root 自动聚合）
│           └── scenes/                  # 该视频的场景组件
└── renders/
    └── <YYYY-MM-DD>-<slug>/             # ← 每条视频的产物目录（带日期层级）
        ├── meta.json                    # 机读：任务 + 环境 + current + history
        ├── README.md                    # 人读：摘要 + 重现步骤
        ├── thumbnail.png                # 当前发布版的中点帧预览
        └── renders/
            ├── debug/                   # -ql 草稿迭代（gitignored）
            ├── tmp/                     # 高质量中间产物：chunks/scenes/audit/_work（gitignored）
            ├── candidates/              # 候选发布版 <slug>_<label>.mp4（gitignored，待评审）
            ├── current/                 # ★ 唯一发布版 <slug>.mp4（tracked，固定名）
            └── archive/                 # 历史发布版 <slug>_<label>_<date>.mp4（gitignored）
```

`current/` 只放**当前发布版**这一个文件，名字永远是 `<slug>.mp4`（无版本后缀）。
渲染产物、实验、旧版、分片、场景审查、工作目录**绝不**直接进 `current/`——它们进 `tmp/`（中间）
或 `candidates/`（待评审），评审通过才 `promote` 到 `current/`，旧 `current/` 自动归档到 `archive/`。

slug：小写、连字符、≤ 32 字符，匹配视频**讲什么**（如 `cc-insights-promo`、
`brand-intro`，不是 `video1`）。`<Slug>.tsx` 用大驼峰，对应 Composition id。

## 布局原因

- **一眼定位发布版：** `current/<slug>.mp4` 是唯一答案，不用扫目录猜。
- **可重现：** `meta.json:current.command` 是产 mp4 的准确命令；`sha256` 验证未被改过。
- **可版本：** 候选 → 评审 → 发布有流程（`promote.sh`）；历史进 `archive/` 不丢。
- **自描述：** `meta.json` 带任务、Composition id、尺寸/fps/时长、码率、环境。
- **根目录干净：** mp4 不散落工程根；中间产物全在 `tmp/`（gitignored + 可随时删）。
- **gitignore 永不漏：** 白名单制——默认忽略所有 mp4，只追踪 `current/*.mp4`。

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
mkdir -p "src/videos/<slug>/scenes" \
         "renders/$ID/renders/debug" "renders/$ID/renders/tmp" \
         "renders/$ID/renders/tmp/chunks" "renders/$ID/renders/tmp/scenes" \
         "renders/$ID/renders/tmp/audit" "renders/$ID/renders/candidates" "renders/$ID/renders/current" \
         "renders/$ID/renders/archive"
# 写 src/videos/<slug>/<Slug>.tsx + scenes/* + index.ts(导出 registration)
```

或用 `scripts/new-video.sh <slug>` 一键建骨架。

### 3. 抽帧调试（**必经**，见 still-check.md）

```bash
scripts/check-frames.sh <Slug> 90 300 470 880 1200   # 逐场景看 out/check/*.png
# 关键：still-check 通过 → 才进 debug/最终渲染
```

### 4. debug 渲染（草稿，快）

```bash
scripts/render-final.sh <Slug> <slug> --debug    # 720p 草稿渲入 renders/<id>/renders/debug/
```

### 5. 最终渲染 → 进 tmp/（不是 final/）

```bash
# render-final.sh 默认渲到 tmp/（高质量，含 _work/_visual 中间产物）
OUT_ROOT="renders/<id>/renders/tmp" scripts/render-final.sh <Slug> <slug>
```

`render-final.sh` 自动：带时间戳命名、建目录、渲染 `--concurrency=4`、ffprobe 校验。
产物落在 `tmp/`，等待 promote。

### 5b. 分片并发渲染（实验性）

超过 90s 或单片渲染超过 5 分钟时，按 frame range 分片（见 [`long-video-rendering.md`](long-video-rendering.md)）：

```bash
OUT_ROOT="renders/<id>/renders/tmp/chunks" \
JOBS=10 CONCURRENCY=2 TIMEOUT=120000 MUTED=1 \
scripts/render-ranges.sh <Slug> <slug> <total_frames> 600
```

分片产物（`segments/`、`*.ffconcat`）落 `tmp/`，确认稳定后 promote 合并后的 mp4。

如果只要分析某几个逻辑场景，不必合成全片。用 TSV 声明 `index/start/end`，把结果放进
`tmp/scenes/`：

```bash
OUT_ROOT="renders/<id>/renders/tmp/scenes" \
RANGES_FILE="scripts/ranges/<slug>-scenes.tsv" \
SKIP_CONCAT=1 AUDIT_SEGMENTS=1 TIMEOUT=120000 MUTED=1 \
scripts/render-ranges.sh <Slug> <slug> <total_frames> 600
```

`tmp/chunks/` 用于最终分片合成，`tmp/scenes/` 用于按镜头审查，`tmp/audit/` 用于成片抽帧和
质量报告。不要把这些目录散落到根 `out/`。

### 6. promote：tmp/ → candidates/ → current/（**关键新步骤**）

```bash
# 候选：把 tmp/ 里满意的版本提名为候选，带语义 label
scripts/promote.sh <slug> <label> --candidate <input.mp4>
#   → renders/<id>/renders/candidates/<slug>_<label>.mp4

# 评审通过：发布。旧 current/ 自动移到 archive/，meta.json 自动更新
scripts/promote.sh <slug> <label> --publish
#   → renders/<id>/renders/current/<slug>.mp4（旧版进 archive/）
```

label 必须是语义短词（`cutfix`/`ccopt`/`manim-hybrid`），描述这版改了什么。
**禁止** ts-only、`V2`/`V3`、分辨率前缀这种无语义或可推断的命名。

### 7. thumbnail（promote --publish 自动从 current/ 抽中点帧）

如需指定非中点帧：`ffmpeg -y -ss <秒> -i renders/<id>/renders/current/<slug>.mp4 -frames:v 1 renders/<id>/thumbnail.png`。

### 8. 写/更新 `meta.json` 与 `README.md`

`promote --publish` 会自动更新 `meta.json` 的 `current` + `history` 字段；`README.md` 手写。

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

  "current": {
    "label": "ccopt",
    "path": "renders/current/cc-insights-promo.mp4",
    "sha256": "<文件 sha256>",
    "resolution": "1920x1080",
    "fps": 30,
    "duration_s": 69.53,
    "bit_rate_bps": 1098000,
    "size_bytes": 9553196,
    "promoted_at": "2026-07-04T22:00:00+08:00",
    "promoted_from": "candidates/cc-insights-promo_ccopt.mp4",
    "command": "TS=20260704-ccopt END_FRAME_OFFSET=0 ... pnpm render"
  },

  "history": [
    {"label": "cutfix2", "path": "renders/archive/cc-insights-promo_cutfix2_20260704.mp4",
     "promoted_at": "2026-07-04T18:00:00+08:00", "archived": true}
  ],

  "thumbnail": "thumbnail.png",
  "notes": "本地字体零联网；durationInFrames = Σ场景2202 − Σ转场116。"
}
```

`pnpm_lock_sha` 记 `pnpm-lock.yaml` 的 SHA256，便于逐位重现。
`current.sha256` 让任何人验证 `current/<slug>.mp4` 没被悄悄替换。

## 命名规则

- **产物目录：** `YYYY-MM-DD-<slug>` —— 创建日期。
- **源码目录：** `src/videos/<slug>/`，主组件 `<Slug>.tsx`（大驼峰 = Composition id）。
- **`candidates/`：** `<slug>_<label>.mp4` —— label 是**语义短词**（`cutfix`/`ccopt`/`manim-hybrid`）。
- **`current/`：** `<slug>.mp4` —— **永远固定名**，无任何后缀。
- **`archive/`：** `<slug>_<label>_<YYYYMMDD>.mp4` —— 归档时加日期防重名。
- **禁止：** ts-only（`_20260704-203613`）、`V<n>`（`-V8`）、分辨率前缀（`_1080p30_`）。
  这些看不出改了啥，且让 `current/` 的固定名无法稳定。

## 清理

- **`tmp/`** 全是可重建的中间产物（`chunks`/`scenes`/`audit`/`_work`），
  随时可删：`scripts/cleanup.sh [--dry-run] [--force]`。
- **`debug/`** 旧草稿是迭代历史，磁盘紧张时只留最新。
- **`archive/`** 历史发布版，30 天以上的可清（`cleanup.sh --archive-older-than 30`）。
- **`current/`** 永远只有 1 个文件，不用清。
- **工程根 `out/`** 只做一次性 scratch；项目脚本必须设置 `OUT_ROOT` 写入对应
  `renders/<id>/renders/tmp/`，归档后可删。
- **`node_modules/`** 永远 gitignore。

## gitignore 策略（白名单）

默认忽略所有 mp4 + 中间目录，**只追踪 `current/*.mp4`** + 元数据。新增任何命名
自动被忽略，永远不用再改 gitignore。详见项目根 `.gitignore`。
