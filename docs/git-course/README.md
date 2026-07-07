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

- `docs/git-course/`: 大纲、讲稿、术语、视觉语言
- `docs/git-course/component-system.md`: Remotion 组件库与 Manim 场景库边界
- `docs/git-course/production-workflow.md`: 每集从脚本到成片的生产流程
- `scripts/manim/git-course/`: Manim 抽象动画资产
- `remotion/src/videos/git-course/`: Remotion 最终课程编排
- `remotion/public/git-course/`: Manim 导出、音频、图片等公开资产
- `remotion/renders/git-course/<episode-id>/`: 每集渲染产物

## 首集原型

当前先做：

- 集数：`ep04-branch-is-pointer`
- Remotion composition：`GitCourseEp04BranchIsPointer`
- Manim scene：`BranchPointer`

这一集验证课程的核心表现方法：终端命令、提交图、分支指针和字幕解释能否同步讲清楚。
