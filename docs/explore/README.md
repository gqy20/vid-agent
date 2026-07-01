# 视频工具生态调研

> 目的：为 vid-agent 项目寻找能"用 CLI 串起来、被 AI Agent 编排"的视频工具链。
> 调研时间：2026-07-01
> 调研方法：`gh` CLI 搜 GitHub + WebFetch 读官方文档

## 文档导航

| 文件 | 内容 |
|---|---|
| [remotion-license.md](./remotion-license.md) | Remotion 协议调研（自定义双轨 + 三档套餐）|
| [cli-video-tools.md](./cli-video-tools.md) | CLI 视频编辑工具全景调研（含 10k+ 过滤版）|
| [manim-video-stack.md](./manim-video-stack.md) | 综合结论：推荐栈 + AI 工作流示例 |

## TL;DR

**推荐组合（CLI 友好 + AI 可编排）：**

```
mmx-cli  (你已有, AI 生图/音)
   ↓
rembg + svgo + Potrace  (图像预处理)
   ↓
uv run manim  (你已有, 数学动画)
   ↓
MoviePy + FFmpeg + editly + auto-editor  (声明式拼接/转场/剪静默)
   ↓
vibeframe 或 vidai  (可选, Agentic 总控)
```

**严格 10k+ ⭐ 过滤后只剩 3 个真 CLI 视频工具**：FFmpeg、MoviePy、Remotion——其余 editly / auto-editor / vidai / vibeframe 均 <10k 但 CLI 体验更现代。

## 关键判断

| 维度 | 结论 |
|---|---|
| **Remotion 是否值得引入** | 个人/≤3 人免费；若要做"产品级包装层"复用 `remotion/`；否则按 CLAUDE.md 独立演进 |
| **开源替代是否充足** | 在"React 代码生成视频"这条窄路上 Remotion 没有真开源竞品；GUI 编辑器走 OpenCut / Motionity |
| **CLI 工具生态** | FFmpeg + MoviePy 是稳底；editly/auto-editor 是现代化补充 |
| **AI 串工作流** | vibeframe / vidai 是专为 AI Agent 设计的下一代 CLI |