# 看得见的 GitHub

一套建立在 Git Course 之上的 GitHub 协作课程。

Git Course 解释 commit、branch、HEAD、remote 和提交图；GitHub Course 解释团队如何围绕这些 Git 对象组织 Pull Request、Review、Checks、Rulesets、Actions、权限和发布流程。

## 课程边界

- Git Course 负责平台无关的 Git 心智模型。
- GitHub Course 负责 GitHub 平台状态与真实浏览器操作。
- 浏览器录制展示真实平台行为，Remotion 负责课程结构和状态标注，GitGraph / Manim 解释底层 Git 变化。
- GitHub UI、套餐、认证和 API 在制作每集前必须对照当前 GitHub 官方文档重新核验。

## 文件分工

- `outline.md`：系列级课程顺序。
- `episodes/*.json`：每集唯一内容源。
- `episode.schema.json`：episode 内容和浏览器录制声明的基础 schema。
- `workflow.md`：浏览器录制、Remotion 合成和审查流程。
- `checklist.md`：从 1080p 内容验收到 4K 发布的阶段门禁。
- `visual-language.md`：Git 与 GitHub 平台状态的视觉语义边界。
- `../docs/course-production.md`：三门课程共享的生产生命周期与状态语义。
- `scripts/browser-recordings/github-course-lab/`：可重复的浏览器录制场景。
- `remotion/src/videos/github-course/`：课程壳、浏览器组件和 GitHub 状态模型。
- `remotion/public/github-course/browser/`：派生浏览器录制资产，不提交。

## 前置知识

第一季默认要求完成 Git Course EP01–EP16。EP17–EP24 属于推荐但非必需的进阶前置。

## 画质规格

- 日常开发、布局调整、浏览器标注和内容验收使用 1920×1080、30fps 的迭代 candidate，优先保证反馈速度。
- 1080p candidate 通过教学、画面、字幕、音频和边界审查后，才进入 3840×2160、30fps 的最终母版构建。
- 4K 阶段必须重新生成足够分辨率的浏览器录屏和 poster，不允许把 1080p 浏览器素材直接放大伪装成 4K。
- `current/`、release 和 publish 最终只接受通过 4K 审查且 SHA 匹配的完整 candidate；1080p candidate 永不具备晋升资格。

## 当前状态

- 两季 16 集大纲已建立。
- 浏览器录制 runner 和无网络 smoke scenario 已建立。
- Remotion 浏览器组件与状态桥接 gallery 已注册。
- GH01 已完成 episode JSON、1080p 迭代候选、原生 4K 浏览器重录、4K Remotion scene、MMX 分段配音和 4K 完整 candidate。
- orchestrator 已接入 `hd30` / `uhd30` 双 profile、浏览器/scene/TTS 指纹、内容寻址 cache、4K 全量 audit、SHA-bound `approve` 与 `promote`。
- `release-build`、release audit/approve 和 publish 尚未接入，继续保持硬门禁；其余 15 集仍是规划。
