# CLI 视频工具全景调研

> 调研日期：2026-07-01
> 调研方法：`gh search repos` + `gh repo view`（按 stars / 活跃度排序）
> 关注点：真 CLI、有 exit code、能 stdin/stdout 交接、可被 AI Agent 编排

---

## 第一梯队：生产级 CLI（≥10k ⭐ 真 CLI）

> 数据来源：`gh repo view <repo> --json stargazerCount`（2026-07-01 实测）

| 项目 | ⭐ | 协议 | 形态 | 最适合 |
|---|---|---|---|---|
| **FFmpeg/FFmpeg** | 61,581 | LGPL/GPL | CLI | 万能底座，转码/拼接/滤镜 |
| **remotion-dev/remotion** | 51,725 | 自定义商业 | CLI | React 代码生成视频 |
| **ManimCommunity/manim** | 39,273 | MIT | CLI | 数学/几何动画 |
| **HandBrake/HandBrake** | 23,635 | GPL-2.0 | CLI（`HandBrakeCLI`） | 转码（非编辑）|
| **Zulko/moviepy** | **14,746** | MIT | Python 库 | **声明式 Python 视频编辑** |
| **mltframework/shotcut** | 14,458 | GPL-3.0 | GUI 为主（底层 MLT） | melt CLI 可学但陡 |
| **mifi/lossless-cut** | 41,767 | GPL-2.0 | GUI 为主 + 部分 CLI | 无损裁剪 |

> **结论：≥10k ⭐ 真·CLI 视频编辑工具实际只有 5 个**：FFmpeg / Remotion / Manim / MoviePy / Shotcut（其中 Shotcut 是 GUI 为主）。其余大多 <10k 但 CLI 体验更现代。

---

## 第二梯队：CLI 体验更现代（<10k ⭐ 但活跃）

### editly ⭐ 5.4k（mifi/editly）
- 协议：**MIT**
- 语言：Node.js + ffmpeg
- CLI：
  ```bash
  editly spec.json5 --out output.mp4
  ```
- **定位**：声明式 NLE（JSON5 描述编辑规范）
- **特性**：转场、文字层、HTML5 Canvas/Fabric.js 自定义层、GLSL shader、Ken Burns、音频 ducking
- **AI 友好度**：⭐⭐⭐⭐⭐（JSON 输入，AI 直接生成 spec）
- **比 FFmpeg 简洁 10 倍**

### auto-editor ⭐ 4.5k（WyattBlue/auto-editor）
- 协议：**The Unlicense**（最宽松）
- 语言：Nim
- CLI：
  ```bash
  auto-editor input.mp4 --margin 0.2sec --output out.mp4
  ```
- **定位**：按音量/静默/动作检测自动切掉死寂段
- **AI 友好度**：⭐⭐⭐⭐（一行命令，零配置起步）

### ffmpeg-concat（transitive-bullshit/ffmpeg-concat）
- 协议：MIT
- CLI：
  ```bash
  ffmpeg-concat -i videos.txt -o out.mp4 --transition-name glitch
  ```
- **定位**：带 GL 转场的视频拼接（基于 gl-transitions.com 400+ 种 GLSL 转场）

### MLT / melt（mltframework/mlt）⭐ 1.8k
- 协议：**LGPL**
- **定位**：专业级多媒体框架，Kdenlive / Shotcut / OpenShot 都基于它
- **特性天花板**：多轨合成、混合、转场、特效、滤镜、动画曲线
- **AI 友好度**：⭐⭐（学习曲线陡）

### VapourSynth
- 协议：MIT
- 语言：Python 化的视频处理框架
- **定位**：Avisynth 精神续作，写 Python 做视频处理
- **AI 友好度**：⭐⭐⭐⭐（纯 Python，自定义算子）

### libopenshot（OpenShot/libopenshot）⭐ 1.5k
- 协议：**LGPL-3.0**
- **Python/Ruby 绑定**，OpenShot GUI 的底层
- **AI 友好度**：⭐⭐⭐

---

## 第三梯队：AI 原生 / Agentic 编辑器（2025-2026 新风口）

### vibeframe（vericontext/vibeframe）⭐ 139
- 协议：**MIT**
- **定位**：CLI-first + MCP-ready，专为 AI Agent 设计
- **特性**：JSON 输出、dry-run、cost gate、machine-readable reports
- **AI 友好度**：⭐⭐⭐⭐⭐

### vidai（Aczetic/vidai）⭐ 低
- 协议：**MIT**
- **定位**：**"Cursor for video"** —— 自然语言 → LLM 解析 → FFmpeg 执行
- CLI：
  ```bash
  python main.py --input raw_interview.mp4 \
    --prompt "remove silences, cut to 3min, add captions"
  ```
- **特性**：FCPXML 输出（可丢进 Premiere / DaVinci）

### FireRed-OpenStoryline（FireRedTeam）
- **定位**：AI 视频剪辑 Agent，LLM 规划 + 工具编排
- **特性**：自然语言 + Style Skills（风格复用）

### jianying-editor-skill（luoluoluo22）
- **定位**：Agent 自动化剪映的 Skill

### no-code-architects-toolkit（stephengpope）
- **定位**：免费 API 聚合（视频编辑/字幕/图片处理/云存储/Python 执行）

---

## 第四梯队：相关生态（CLI 友好，≥10k ⭐）

| 项目 | ⭐ | 协议 | 用途 |
|---|---|---|---|
| **yt-dlp/yt-dlp** | 174,414 | Unlicense | CLI 视频下载（素材采集）|
| **mpv-player/mpv** | 35,819 | GPL-2.0 | CLI 播放器 + 脚本化 |
| **xinntao/Real-ESRGAN** | 35,955 | BSD-3 | CLI 超分辨率 |
| **svg/svgo** | 22,558 | MIT | CLI SVG 优化 |
| **danielgatis/rembg** | 23,508 | MIT | CLI 去背景 |

---

## 综合对比表

| 工具 | ⭐ | 协议 | 真 CLI | AI 友好 | 上手 | 最适合 |
|---|---|---|---|---|---|---|
| FFmpeg | 61.6k | LGPL | ✅ | ⭐⭐⭐⭐⭐ | 中 | 万能底座 |
| Remotion | 51.7k | 商业 | ✅ | ⭐⭐⭐⭐⭐ | 中 | 代码生成视频 |
| Manim | 39.3k | MIT | ✅ | ⭐⭐⭐⭐⭐ | 中 | 数学动画 |
| MoviePy | 14.7k | MIT | ✅ | ⭐⭐⭐⭐⭐ | 低 | Python 编辑 |
| Shotcut | 14.5k | GPL-3.0 | ❌ | ⭐⭐ | 中 | GUI 编辑 |
| HandBrake | 23.6k | GPL-2.0 | ✅ | ⭐⭐⭐ | 低 | 转码 |
| LosslessCut | 41.8k | GPL-2.0 | 部分 | ⭐⭐ | 低 | 无损裁剪 |
| editly | 5.4k | MIT | ✅ | ⭐⭐⭐⭐⭐ | 低 | 声明式拼接 |
| auto-editor | 4.5k | Unlicense | ✅ | ⭐⭐⭐⭐ | 零 | 自动剪静默 |
| ffmpeg-concat | <1k | MIT | ✅ | ⭐⭐⭐ | 低 | GL 转场拼接 |
| MLT / melt | 1.8k | LGPL | ✅ | ⭐⭐ | 高 | 专业多轨 |
| VapourSynth | - | MIT | ✅ | ⭐⭐⭐⭐ | 中高 | 自定义算子 |
| libopenshot | 1.5k | LGPL | ✅ | ⭐⭐⭐ | 中 | 多轨合成 |
| vidai | 低 | MIT | ✅ | ⭐⭐⭐⭐⭐ | 低 | Agentic 编辑 |
| vibeframe | 139 | MIT | ✅ | ⭐⭐⭐⭐⭐ | 低 | AI-native 全流程 |

---

## 推荐组合

### 保守（仅 10k+ ⭐）
```
FFmpeg + MoviePy + Manim + Remotion
```

### 实用（10k+ + 现代 CLI）
```
FFmpeg + MoviePy + editly + auto-editor + Manim
```

### AI 原生
```
vibeframe 或 vidai + mmx-cli + editly + Manim
```

---

## 参考来源

- [mifi/editly](https://github.com/mifi/editly)
- [WyattBlue/auto-editor](https://github.com/WyattBlue/auto-editor)
- [Zulko/moviepy](https://github.com/Zulko/moviepy)
- [transitive-bullshit/ffmpeg-concat](https://github.com/transitive-bullshit/ffmpeg-concat)
- [mltframework/mlt](https://github.com/mltframework/mlt)
- [OpenShot/libopenshot](https://github.com/OpenShot/libopenshot)
- [vericontext/vibeframe](https://github.com/vericontext/vibeframe)
- [Aczetic/vidai](https://github.com/Aczetic/vidai)
- [FFmpeg/FFmpeg](https://github.com/FFmpeg/FFmpeg)
- [HandBrake/HandBrake](https://github.com/HandBrake/HandBrake)
- [mpv-player/mpv](https://github.com/mpv-player/mpv)
- [yt-dlp/yt-dlp](https://github.com/yt-dlp/yt-dlp)
- [remotion-dev/remotion](https://github.com/remotion-dev/remotion)
- [ManimCommunity/manim](https://github.com/ManimCommunity/manim)