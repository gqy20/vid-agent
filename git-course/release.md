# Git Course 发布规范

本文件是仓库级 [`课程视频统一生产规范`](../docs/course-production.md) 的 Git Course 发布适配。共享的 Current/Release SHA 关系、release audit/approve 和 publish 门禁优先适用；本文只补充 Git 课程的包装与平台物料。

每集发布源数据直接维护在 `episodes/<episode-id>.json` 的 `release` 字段：

- `bilibiliMarkdown`：标题、简介、章节、标签、动态和置顶评论；
- `coverBriefMarkdown`：封面主标题、构图和候选文案；
- `checklistMarkdown`：仅保留需要人工确认的平台检查项。

机器可以判断的时长、音视频流、文件路径和命名不写进人工 checklist，由统一校验器负责。

生成文件统一进入：

```text
remotion/renders/git-course/<episode-id>/current/release/
├── <episode-id>.mp4
├── cover.svg
├── cover.png
├── bilibili.md              # 由 episode JSON 的 release.bilibiliMarkdown 生成
├── checklist.md             # 有源数据时生成
├── cover-brief.md           # 有源数据时生成
├── audio-alignment.md       # 有源数据时生成
├── verdict.json
└── release-manifest.json
```

`release/` 同时容纳封面和最终发布视频，不再区分 `publishing/` 与 `published/`。生成文件默认不进入 Git。

发布视频经过两级门禁：main candidate 通过 audit/approve 后才能 promote；片头、正片、片尾组成的 release candidate 再次通过 release-audit/release-approve 后才能 publish。verdict 与候选 SHA 绑定，候选或输入变化后旧批准自动失效。禁止直接运行底层 `git-course-publish-episode.sh`。

`bilibili.md` 是方便发布时直接查看和复制的物化文件，不是第二份事实源；修改文案时应编辑 episode JSON。`publish` 会从 episode JSON 物化文档、校验并晋升封面候选，再将视频、封面、文档、verdict 和 manifest 原子替换为一套发布物料：

```bash
pnpm --dir remotion git-course publish <episode-id>
```

如果只需预览 episode JSON 派生的文档，可运行 `pnpm --dir remotion git-course:release <episode-id>`；它只写 `tmp/release-source/`，不得写入 `current/release/`。

静态封面由对应 `remotion/scripts/git-course-build-epXX-cover.mjs` 生成；如调整生成的 SVG，必须把有效参数反推回脚本，不能让生成物成为事实源。
