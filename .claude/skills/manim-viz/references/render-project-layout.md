# 渲染项目布局

> 每个动画一个独立项目，放在 `renders/` 下。让动画**可重现、可分享、易跨版本对比**。

## 产物管理三原则（先记住）

1. **`current/` 是唯一发布版**——目录里永远只有 1 个 `<slug>.mp4`，文件名固定。分享/嵌入都指这里。
2. **命名固化**——候选版 `<slug>_<label>.mp4`，label 是语义短词（`hero-fix`/`v7-polish`/`concat-final`）。**禁止 ts-only、禁止 `V<n>`、禁止分辨率前缀**。
3. **`meta.json` 是真相源**——`current` 字段指向发布版 + sha256 + 生成命令；脚本和人都从这找答案。

## 目录模板

```
renders/
└── <YYYY-MM-DD>-<topic-slug>/
    ├── meta.json                # 机读：任务 + 环境 + current + history
    ├── README.md                # 人读：摘要 + 重现步骤
    ├── thumbnail.png            # 当前发布版的中点帧预览
    ├── src/
    │   └── <topic_slug>.py      # Scene 脚本
    └── renders/
        ├── debug/               # -ql 草稿迭代（gitignored）
        ├── tmp/                 # 高质量中间：_build/partial_movie_files/抽帧产物（gitignored）
        ├── candidates/          # 候选发布版 <slug>_<label>.mp4（gitignored，待评审）
        ├── current/             # ★ 唯一发布版 <slug>.mp4（tracked，固定名）
        └── archive/             # 历史发布版 <slug>_<label>_<date>.mp4（gitignored）
```

`current/` 只放**当前发布版**这一个文件，名字永远是 `<slug>.mp4`（无版本后缀）。
渲染产物、实验、旧版、`_build` 残留**绝不**直接进 `current/`——它们进 `tmp/`（中间）
或 `candidates/`（待评审），评审通过才 `promote` 到 `current/`，旧 `current/` 自动归档。

主题 slug：小写、连字符、≤ 32 字符，匹配动画**讲什么**（如 `fourier-square-wave`、
`double-well-particle`，不是 `tmp1`）。

## 布局原因

- **一眼定位发布版：** `current/<slug>.mp4` 是唯一答案，不用扫目录猜。
- **可重现：** `meta.json:current.command` 是产 mp4 的准确命令；`sha256` 验证未被改过。
- **可版本：** 候选 → 评审 → 发布有流程（`promote.sh`）；历史进 `archive/` 不丢。
- **自描述：** `meta.json` 带任务描述、Scene 类、bit_rate、时长、环境。不跑也能读懂。
- **根目录干净：** 没 `media/videos/...` 残留——用 `--media_dir renders/tmp/_build` 隔开；
  中间产物全在 `tmp/`（gitignored + 可随时删）。
- **gitignore 永不漏：** 白名单制——默认忽略所有 mp4，只追踪 `current/*.mp4`。

## 工作流

### 1. 建项目骨架

```bash
ID="<YYYY-MM-DD>-<topic-slug>"
mkdir -p "renders/$ID/src" \
         "renders/$ID/renders/debug" "renders/$ID/renders/tmp" \
         "renders/$ID/renders/candidates" "renders/$ID/renders/current" \
         "renders/$ID/renders/archive"
```

### 2. 写脚本

`renders/$ID/src/<topic_slug>.py` — 从 `examples.md` 模板或现有 Scene 开始，按 SKILL.md 规则。

### 3. 抽帧调试（**必经**）

```bash
cd renders/$ID

# 先 -ql 跑（短迭代），渲到 tmp/（中间产物，可随时删）
uv run manim -ql --media_dir renders/tmp/_build src/<topic_slug>.py <SceneName>
mv "renders/tmp/_build/videos/<basename>/480p15/<SceneName>.mp4" \
   "renders/debug/<topic_slug>_480p15_$(date +%Y%m%d-%H%M%S).mp4"
rm -rf renders/tmp/_build

# 抽帧 + 过 13 条 checklist（references/frame-check.md）
scripts/extract_frames.sh renders/debug/<latest>.mp4 frames_<scene> 0.10 0.30 0.50 0.75 0.90
# 关键：抽帧 checklist 通过 → 才能进最终渲染
```

未通过就改 Scene 重跑。不要跳到 -qh。

### 4. 最终渲染 → 进 tmp/（不是 final/）

```bash
cd renders/$ID

# -qh 渲到 tmp/，等待 promote
uv run manim -qh --media_dir renders/tmp/_build src/<topic_slug>.py <SceneName>
mv "renders/tmp/_build/videos/<basename>/1080p60/<SceneName>.mp4" \
   "renders/tmp/<topic_slug>_1080p60_$(date +%Y%m%d-%HMMSS).mp4"
rm -rf renders/tmp/_build

ffprobe -v error -show_entries format=duration,bit_rate \
        -of default=noprint_wrappers=1 "renders/tmp/<latest>.mp4"
```

### 5. promote：tmp/ → candidates/ → current/（**关键新步骤**）

```bash
# 候选：把 tmp/ 里满意的版本提名为候选，带语义 label
scripts/promote.sh <slug> <label> --candidate <input.mp4>
#   → renders/<id>/renders/candidates/<slug>_<label>.mp4

# 评审通过：发布。旧 current/ 自动移到 archive/，meta.json 自动更新
scripts/promote.sh <slug> <label> --publish
#   → renders/<id>/renders/current/<slug>.mp4（旧版进 archive/）
```

label 必须是语义短词（`hero-fix`/`v7-polish`/`concat-final`），描述这版改了什么。
**禁止** ts-only、`V2`/`V3`、分辨率前缀这种无语义或可推断的命名。
（这是从 `brand-final-V2...V8` 这种「看不出改了啥」的旧命名教训来的硬规矩。）

### 6. thumbnail（promote --publish 自动从 current/ 抽中点帧）

```bash
# 如需手抽：取约 50% 时长作中点
DUR=$(ffprobe -v error -show_entries format=duration \
       -of default=noprint_wrappers=1:nokey=1 "renders/current/<slug>.mp4")
MID=$(awk "BEGIN { printf \"%.2f\", $DUR/2 }")
ffmpeg -y -ss "$MID" -i "renders/current/<slug>.mp4" -frames:v 1 thumbnail.png
```

### 7. 写/更新 `meta.json` 与 `README.md`

`promote --publish` 会自动更新 `meta.json` 的 `current` + `history` 字段；`README.md` 手写。

## meta.json schema

```json
{
  "id": "2026-07-01-circle-to-square",
  "title": "Blue circle morphs into red square",
  "created": "2026-07-01T00:01:34+08:00",
  "description": "5s animation: blue circle to red square, center fixed.",
  "scene_class": "ShapeMorph",
  "script_path": "src/shape_morph.py",
  "theme_tags": ["geometry", "primitives"],

  "env": {
    "manim_version": "0.20.1",
    "python": "3.13.5",
    "latex": "absent",
    "uv_lock_sha": null
  },

  "current": {
    "label": "hero-fix",
    "path": "renders/current/circle-to-square.mp4",
    "sha256": "<文件 sha256>",
    "quality_flag": "-qh",
    "resolution": "1920x1080",
    "fps": 60,
    "duration_s": 5.066,
    "bit_rate_bps": 66350,
    "size_bytes": 42019,
    "anim_count": 3,
    "promoted_at": "2026-07-04T22:00:00+08:00",
    "promoted_from": "candidates/circle-to-square_hero-fix.mp4",
    "command": "uv run manim -qh --media_dir renders/tmp/_build src/shape_morph.py ShapeMorph"
  },

  "history": [
    {"label": "first-pass", "path": "renders/archive/circle-to-square_first-pass_20260701.mp4",
     "promoted_at": "2026-07-01T10:00:00+08:00", "archived": true}
  ],

  "thumbnail": "thumbnail.png",
  "notes": "First project under this layout convention."
}
```

`uv_lock_sha` 记 `uv.lock` 的 SHA256，使同样 lockfile 的再渲染逐位可重现。
`current.sha256` 让任何人验证 `current/<slug>.mp4` 没被悄悄替换。

## 命名规则

- **项目目录：** `YYYY-MM-DD-<topic-slug>` —— 创建日期。
- **脚本文件：** `<topic_slug>.py` —— 必须能 import 跑 Scene。
- **`candidates/`：** `<slug>_<label>.mp4` —— label 是**语义短词**（`hero-fix`/`v7-polish`）。
- **`current/`：** `<slug>.mp4` —— **永远固定名**，无任何后缀。
- **`archive/`：** `<slug>_<label>_<YYYYMMDD>.mp4` —— 归档时加日期防重名。
- **`debug/`：** `<slug>_480p15_<YYYYMMDD-HHMMSS>.mp4` —— 草稿迭代（带 ts，因为只是过程产物）。
- **禁止（candidates/current/archive）：** ts-only、`V<n>`、分辨率前缀。
  这些看不出改了啥，且让 `current/` 的固定名无法稳定。

## 清理

- **`tmp/`** 全是可重建的中间产物（`_build`/`partial_movie_files`/抽帧临时），随时可删：
  `scripts/cleanup.sh [--dry-run] [--force]`。
- **`debug/`** 旧草稿是迭代历史，磁盘紧张时只留最新。
- **`archive/`** 历史发布版，30 天以上的可清（`cleanup.sh --archive-older-than 30`）。
- **`current/`** 永远只有 1 个文件，不用清。
- 抽帧调试时的 `frames_<scene>/` 临时目录不入版本库（gitignored）。

## gitignore 策略（白名单）

默认忽略所有 mp4 + 中间目录，**只追踪 `current/*.mp4`** + 元数据。新增任何命名
自动被忽略，永远不用再改 gitignore。详见项目根 `.gitignore`。
