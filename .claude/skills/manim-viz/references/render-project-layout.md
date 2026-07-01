# 渲染项目布局

> 每个动画一个独立项目，放在 `renders/` 下。让动画**可重现、可分享、易跨版本对比**。

## 目录模板

```
renders/
└── <YYYY-MM-DD>-<topic-slug>/
    ├── meta.json                # 机读：任务 + 环境 + 渲染信息
    ├── README.md                # 人读：摘要 + 重现步骤
    ├── thumbnail.png            # 中点帧预览（final 质量）
    ├── src/
    │   └── <topic_slug>.py      # Scene 脚本
    └── renders/
        ├── debug/
        │   └── <topic_slug>_480p15_<YYYYMMDD-HHMMSS>.mp4
        └── final/
            └── <topic_slug>_1080p60_<YYYYMMDD-HHMMSS>.mp4
```

主题 slug：小写、连字符、≤ 32 字符，匹配动画**讲什么**（如 `fourier-square-wave`、`double-well-particle`，不是 `tmp1`）。

## 布局原因

- **可重现：** `meta.json:renders[*].command` 是产 mp4 的准确命令。再跑一次得同一个视频。
- **可版本：** 通过加带时间戳的 mp4 到 `debug/` 来迭代。`final/` 是要发的版本。
- **自描述：** `meta.json` 带任务描述、Scene 类、bit_rate、时长、环境。未来 Claude（或人）不跑也能读懂。
- **根目录干净：** 没 `media/videos/...` 残留——用 `--media_dir renders/<role>/_build` 隔开。

## 工作流

### 1. 建项目骨架

```bash
ID="<YYYY-MM-DD>-<topic-slug>"
mkdir -p "renders/$ID/src" "renders/$ID/renders/debug" "renders/$ID/renders/final"
```

### 2. 写脚本

`renders/$ID/src/<topic_slug>.py` — 从 `examples.md` 模板或现有 Scene 开始，按 SKILL.md 规则。

### 3. 抽帧调试（**必经**）

```bash
cd renders/$ID

# 先 -ql 跑（短迭代）
DEBUG_OUT="renders/debug/<topic_slug>_480p15_$(date +%Y%m%d-%H%M%S).mp4"
uv run manim -ql --media_dir renders/debug/_build src/<topic_slug>.py <SceneName>

# 移产物，清理临时
mv "renders/debug/_build/videos/<basename>/480p15/<SceneName>.mp4" "$DEBUG_OUT"
rm -rf renders/debug/_build

# 抽帧 + 过 13 条 checklist
scripts/extract_frames.sh "$DEBUG_OUT" frames_<scene> 0.10 0.30 0.50 0.75 0.90
# 关键：* 抽帧 checklist 通过 * → 才能进 final 阶段
```

未通过就改 Scene 重跑。不要跳到 -qh。

### 4. 渲最终（当 debug + checklist 都通过）

```bash
cd renders/$ID

FINAL_OUT="renders/final/<topic_slug>_1080p60_$(date +%Y%m%d-%H%M%S).mp4"
uv run manim -qh --media_dir renders/final/_build src/<topic_slug>.py <SceneName>

mv "renders/final/_build/videos/<basename>/1080p60/<SceneName>.mp4" "$FINAL_OUT"
rm -rf renders/final/_build

ffprobe -v error -show_entries format=duration,bit_rate \
        -of default=noprint_wrappers=1 "$FINAL_OUT"
```

### 5. 抽 thumbnail

```bash
# 取约 50% 时长作中点；如场景有视觉焦点，可调到对应秒
DUR=$(ffprobe -v error -show_entries format=duration \
       -of default=noprint_wrappers=1:nokey=1 "$FINAL_OUT")
MID=$(awk "BEGIN { printf \"%.2f\", $DUR/2 }")
ffmpeg -y -ss "$MID" -i "$FINAL_OUT" -frames:v 1 thumbnail.png
```

### 6. 写 `meta.json` 与 `README.md`

`meta.json` — 见下面 schema。`README.md` 看 demo 项目 `../../../renders/<demo>/README.md`。

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

  "renders": [
    {
      "role": "debug | final",
      "quality_flag": "-ql | -qm | -qh | -qk",
      "resolution": "WxH",
      "fps": 15 | 30 | 60,
      "command": "exact uv run manim command",
      "output": "renders/<role>/<script>_<quality>_<timestamp>.mp4",
      "duration_s": 5.066,
      "bit_rate_bps": 66350,
      "size_bytes": 42019,
      "anim_count": 3
    }
  ],

  "thumbnail": "thumbnail.png",

  "reproduce": {
    "debug": "uv run manim -ql ...",
    "final": "uv run manim -qh ..."
  },

  "notes": "First project under this layout convention."
}
```

`uv_lock_sha` 应记 `uv.lock` 的 SHA256，使同样 lockfile 哈希的再渲染是逐位可重现。

## 命名规则

- **项目目录：** `YYYY-MM-DD-<topic-slug>` —— 创建日期，不是动画描绘日期。
- **脚本文件：** `<topic_slug>.py` —— 必须能 import 跑 Scene。
- **渲染产物：** `<topic_slug>_<quality>_<timestamp>.mp4`，`<quality>` 与 manim flag 后缀对应（`480p15` = `-ql`，`1080p60` = `-qh`）。
- **时间戳：** `YYYYMMDD-HHMMSS` 本地时间。

## 清理

- `_build/` 是临时，每渲染后删。
- `renders/debug/*.mp4` 旧版本是版本历史——保留，除非磁盘压力；压时只留最新。
- `final/` 副本是核心产物；至少保留最新。
- 抽帧调试时产生的 `frames_<scene>/` 临时目录不入版本库——本布局在 `.gitignore` 排除它。
