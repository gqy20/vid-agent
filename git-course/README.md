# 看得见的 Git

一套用 Remotion 制作的 Git 心智模型课程。

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

- `docs/course-production.md`: Git、GitHub、Claude Code 课程共享的生产生命周期与门禁
- `git-course/episodes/*.json`: 每集唯一内容源，包含教学、scene、旁白、审查记录和发布数据
- `git-course/components.md`: Remotion 组件系统与历史资产边界
- `git-course/workflow.md`: 每集从脚本到成片的生产流程，包含分段配音、BGM 复用、响度规范化和固定输出约定
- `git-course/checklist.md`: 从脚本、scene、音频到成片发布的通用验收门禁
- `git-course/release.md`: 系列级发布规范
- `scripts/manim/git-course/`: 历史 Manim 动画资产，仅用于旧版本追溯
- `remotion/src/videos/git-course/`: Remotion 最终课程编排
- `remotion/public/git-course/`: 课程音频、图片及保留的历史导出资产
- `remotion/renders/git-course/<episode-id>/`: 每集渲染产物

## 当前生产入口

第一季 EP01–EP08 均已有 Remotion composition。每集只维护一个 `episodes/<episode-id>.json`，统一通过 Git Course orchestrator 生产：

```bash
pnpm --dir remotion git-course plan <episode-id>
pnpm --dir remotion git-course preview <episode-id> --scenes=<scene-id>
pnpm --dir remotion git-course build <episode-id>
pnpm --dir remotion git-course approve <episode-id> --note="人工审查结论"
pnpm --dir remotion git-course promote <episode-id>
pnpm --dir remotion git-course release-build <episode-id>
pnpm --dir remotion git-course release-audit <episode-id>
pnpm --dir remotion git-course release-approve <episode-id> --note="发布版审查结论"
pnpm --dir remotion git-course publish <episode-id>
```

`build` 会最大化并行所有 dirty scene、TTS、规范化和分段审查，并自动执行 main assemble 与机器审查。审查统一使用连续 2fps、每条最多 5 帧、边界 10fps burst、精确关键帧和 16 帧总览，证据汇总在 `tmp/build/audit/<main|release>/report.html`。机器检查通过后 verdict 仍为 `needs_review`；人工检查后才能 approve。没有与候选 SHA 绑定的 `pass` verdict，promote 和 publish 都会拒绝执行。

存储约定是：`tmp/cache` 为唯一可复用存储，`tmp/preview` 为可重建视图，`tmp/build/tasks` 为运行时工作区，`tmp/build/candidate` 为待审批产物，`current` 只保存已批准版本。安全维护命令默认只预览删除计划：

```bash
pnpm --dir remotion git-course clean <episode-id>
pnpm --dir remotion git-course gc <episode-id> --bundles
# 确认输出后再追加 --apply
```

旧 `git-course:render` 以及 `tmp/scenes`、`tmp/chunks`、`tmp/audit-15f` 已退出生产流程。完整保留与回收规则见 `git-course/workflow.md`。

## 本地生产控制台

需要集中审查 Scene、candidate、版本 SHA、审查门禁并推进生产阶段时，可以启动大屏工作台：

```bash
pnpm --dir tools/git-course-dashboard install
pnpm --dir tools/git-course-dashboard dev
```

本机浏览器打开 `http://127.0.0.1:4178`，局域网设备打开 `http://<运行机器的局域网 IP>:4178`。工作台使用固定视口，分集、Scene、版本与审查信息在原位点击切换，不依赖整页上下滚动。它不使用访问令牌；preview、build、approve、promote 和 release / publish 操作统一调用上面的 orchestrator。实现和校验说明见 `tools/git-course-dashboard/README.md`。
