# Manim 视频提质工具栈

> 综合结论：把上述调研落地到 vid-agent 项目的具体推荐
> 约束：**CLI 优先**（方便 AI Agent 串工作流）、**与 Manim Python 同源**（零摩擦）、**协议宽松**

---

## Manim 自身的提质手段（先内部）

按 [CLAUDE.md](../../CLAUDE.md) 的约定，vid-agent 项目优先用 Manim 自家能力：

- **`manim-slides` / `manim-presentation`** —— 单脚本多场景控制
- **`manim-voiceover`** —— 旁白配音
- **色彩系统统一** —— `color.MANIM_COLOR`
- **`camera_config` 调优** —— 画幅与镜头

这些不需要外部依赖，**立刻能做**。

---

## 美术资源管线（按资产形态选择工具）

| 美术资产形态 | 推荐工具 | 协议 | 说明 |
|---|---|---|---|
| 静态位图（PNG/JPG） | Manim `ImageMobject` | MIT | 直接读 |
| 矢量插画（SVG） | Manim `SVGMobject` | MIT | 每层 path 可单独操控 |
| 设计 SVG 素材 | Figma / Inkscape | SaaS/GPL | 导出 SVG → Manim |
| Lottie 循环动画 | `manim-lottie` + LottieFiles | MIT / 资源各异 | 最大免费 Lottie 库 |
| 角色骨骼动画 | DragonBones | Apache 2.0 | Spine 的开源替代 |
| 3D / 程序化背景 | Blender headless | GPL | `blender -b -P script.py` |
| AI 生图 | mmx-cli（已有） / ComfyUI | 商用 / 开源 | 自然语言 / 工作流 |
| AI 去背景 | rembg | MIT | CLI 一行 |
| AI 超分辨率 | Real-ESRGAN | BSD-3 | CLI 一行 |
| 位图转矢量 | Potrace | GPL | 接 AI 生图 |
| SVG 优化 | svgo | MIT | 接 Figma/Inkscape |

---

## 后处理管线（拼接/合成/出片）

按"组合复杂度"分档：

### 🥇 最低摩擦（Python 同源）
```
MoviePy（Python，BSD）+ FFmpeg（CLI，LGPL）
```
- AI 写 Python 调用 MoviePy
- FFmpeg 处理 MoviePy 难做的（烧字幕、复杂滤镜）

### 🥈 现代化拼接（声明式 JSON）
```
editly（MIT）+ auto-editor（Unlicense）
```
- AI 生成 JSON5 spec → editly 渲染
- auto-editor 一行剪静默

### 🥉 AI 原生编排（新一代）
```
vibeframe / vidai（MIT）
```
- 自然语言 prompt → 自动化剪辑
- 为 AI Agent 设计

### 包装层（可选）
```
Remotion CLI（自定义商业，个人免费）
```
- 复用本地 `remotion/`
- 片头/字幕/包装层

---

## 完整 AI 工作流示例

**目标**：从一段中文脚本 → 自动产出"角色讲解数学"的短视频

```bash
# ============ Step 1: 美术资产生成 ============
mmx image "可爱的猫头鹰讲师，卡通风格，透明背景" -o assets/owl.png
mmx image "黑板背景，简洁数学风格" -o assets/blackboard.png
rembg i assets/owl.png assets/owl_nobg.png

# ============ Step 2: 旁白生成 ============
mmx speech "高斯小时候的故事" -o voice.mp3 --voice narrator
mmx music "calm educational background music" -o bgm.mp3

# ============ Step 3: 3D 背景渲染（可选） ============
blender -b -P scripts/breathe.py -o frames/owl_####.png -a

# ============ Step 4: Manim 渲染动画 ============
uv run manim -ql --media_dir out src/lesson.py LessonScene

# ============ Step 5: 自动剪静默（可选） ============
auto-editor out/LessonScene.mp4 --margin 0.2sec --output out/edited.mp4

# ============ Step 6: 合成输出 ============
ffmpeg -i out/edited.mp4 -i voice.mp3 -i bgm.mp3 \
  -filter_complex "[1:a]volume=1.0[v];[2:a]volume=0.3[m];[v][m]amix=inputs=2[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac final.mp4
```

---

## 推荐栈（按"个人项目"）

| 环节 | 工具 | 已在本地 |
|---|---|---|
| AI 生图/音 | mmx-cli | ✅ |
| 动画渲染 | Manim | ✅ |
| 视频底座 | FFmpeg | ✅ |
| 美术设计 | Figma / Inkscape | ❌ 装 |
| 美术处理 | rembg / svgo / Potrace | ❌ 装 |
| 循环动画 | LottieFiles 资源 + manim-lottie | ❌ 装 |
| 后处理 | MoviePy | ❌ 装 |
| 声明式拼接 | editly / auto-editor | ❌ 装 |
| 包装层 | Remotion（已有 remotion）| ✅ |

---

## 决策树

```
你想做什么？
│
├── 立刻让 Manim 视频更专业 → 加 manim-voiceover / manim-slides
│
├── 插入自己画的美术资源
│   ├── 静态位图/矢量 → Manim 原生 + Figma/Inkscape
│   ├── 循环动画 → Lottie + manim-lottie
│   └── 3D 背景 → Blender headless
│
├── 接入 AI 工作流
│   ├── AI 生图/音 → mmx-cli（已有）+ rembg
│   ├── AI 串剪辑 → editly + auto-editor
│   └── AI Agent 总控 → vibeframe / vidai
│
└── 做产品级包装层 → Remotion（独立演进）
```

---

## 选型 vs 项目现状

按 [CLAUDE.md](../../CLAUDE.md)：
- ✅ **优先**：Manim / FFmpeg / mmx-cli（已在本地）
- ✅ **推荐引入**：MoviePy / rembg / svgo（Python 同源，CLI 友好）
- ⚠️ **按需引入**：editly / auto-editor（<10k ⭐ 但 CLI 优秀）
- ❌ **独立演进**：Remotion（`remotion/` 不动）

---

## 参考

- [Manim 官方文档](https://docs.manim.community/)
- [mmx-cli skill](../../.claude/skills/mmx-cli/)（项目内）
- [remotion-dev/remotion](https://github.com/remotion-dev/remotion)
- [Zulko/moviepy](https://github.com/Zulko/moviepy)
- [mifi/editly](https://github.com/mifi/editly)
- [WyattBlue/auto-editor](https://github.com/WyattBlue/auto-editor)
- [vericontext/vibeframe](https://github.com/vericontext/vibeframe)
- [Aczetic/vidai](https://github.com/Aczetic/vidai)
- [danielgatis/rembg](https://github.com/danielgatis/rembg)
- [FFmpeg/FFmpeg](https://github.com/FFmpeg/FFmpeg)