# 看得见的 Git

一套用 Remotion + Manim 制作的 Git 心智模型课程。

目标不是背命令，而是让观众看懂 Git 在移动哪些对象：

- 工作区、暂存区、仓库分别是什么
- commit 是快照节点，不是保存按钮
- branch 是指针，不是项目副本
- HEAD 是当前位置
- merge / rebase / reset 改变的是提交图、引用或文件状态

## 参考资料

- 中文主参考：`docs/references/progit2-zh/*.asc`
- 英文交叉校对：`docs/references/progit2/*.asc`
- 参考资料下载脚本：`scripts/fetch-progit-references.sh`

核心参考章节：

- Pro Git 2: Git 基础
- Pro Git 3: Git 分支
- Pro Git 7.6: 重写历史
- Pro Git 7.7: 重置揭密
- Pro Git 10: Git 内部原理

## 文件分工

- `git-course/episodes/*.json`: 每集唯一内容源，包含教学、scene、旁白、审查记录和发布数据
- `git-course/components.md`: Remotion 组件库与 Manim 场景库边界
- `git-course/workflow.md`: 每集从脚本到成片的生产流程，包含分段配音、BGM 复用、响度规范化和固定输出约定
- `git-course/checklist.md`: 从脚本、scene、音频到成片发布的通用验收门禁
- `git-course/release.md`: 系列级发布规范
- `scripts/manim/git-course/`: Manim 抽象动画资产
- `remotion/src/videos/git-course/`: Remotion 最终课程编排
- `remotion/public/git-course/`: Manim 导出、音频、图片等公开资产
- `remotion/renders/git-course/<episode-id>/`: 每集渲染产物

## 当前生产入口

第一季 EP01–EP08 均已有 Remotion composition。每集只维护一个 `episodes/<episode-id>.json`，使用以下命令校验并生成运行时时间线：

```bash
pnpm --dir remotion git-course:validate
pnpm --dir remotion git-course:generate
pnpm --dir remotion git-course:render <episode-id> [--scene <scene-id>]
```
