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
- `visual-language.md`：Git 与 GitHub 平台状态的视觉语义边界。
- `scripts/browser-recordings/github-course-lab/`：可重复的浏览器录制场景。
- `remotion/src/videos/github-course/`：课程壳、浏览器组件和 GitHub 状态模型。
- `remotion/public/github-course/browser/`：派生浏览器录制资产，不提交。

## 前置知识

第一季默认要求完成 Git Course EP01–EP16。EP17–EP24 属于推荐但非必需的进阶前置。

## 当前状态

- 两季 16 集大纲已建立。
- 浏览器录制 runner 和无网络 smoke scenario 已建立。
- Remotion 浏览器组件与状态桥接 gallery 已注册。
- 正式 episode 尚未进入制作；开始时先创建 `episodes/<episode-id>.json`。
