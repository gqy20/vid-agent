# Git Course 发布规范

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
└── bilibili.md              # 由 episode JSON 的 release.bilibiliMarkdown 生成
```

`release/` 同时容纳封面和最终发布视频，不再区分 `publishing/` 与 `published/`。生成文件默认不进入 Git。

发布视频经过两级门禁：main candidate 通过 audit/approve 后才能 promote；片头、正片、片尾组成的 release candidate 再次通过 release-audit/release-approve 后才能 publish。verdict 与候选 SHA 绑定，候选或输入变化后旧批准自动失效。禁止直接运行底层 `git-course-publish-episode.sh`。

`bilibili.md` 是方便发布时直接查看和复制的物化文件，不是第二份事实源；修改文案时应编辑 episode JSON，再运行：

```bash
pnpm --dir remotion git-course:release <episode-id>
```

静态封面由对应 `remotion/scripts/git-course-build-epXX-cover.mjs` 生成；如调整生成的 SVG，必须把有效参数反推回脚本，不能让生成物成为事实源。
