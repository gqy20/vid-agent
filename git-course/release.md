# Git Course 发布规范

本文件是仓库级 [`课程视频统一生产规范`](../docs/course-production.md) 的 Git Course 发布适配。共享的 Current/Release SHA 关系、release audit/approve 和 publish 门禁优先适用；本文只补充 Git 课程的包装与平台物料。

## 课程总物料

课程名称、定位、简介、平台文案、总封面规格和课程级人工检查项统一维护在 [`course.json`](course.json)。课程大纲继续维护在 [`outline.md`](outline.md)，由 `course.json` 的 `outlineSource` 显式引用并纳入发布指纹。

课程级发布流程为：

```text
course.json
  -> series-release-build
  -> series-release-audit
  -> series-release-approve
  -> series-publish
  -> remotion/renders/git-course/series/current/release/
```

对应命令：

```bash
pnpm --dir remotion git-course series-release-build
pnpm --dir remotion git-course series-release-audit
pnpm --dir remotion git-course series-release-approve --note="课程总物料人工审查结论"
pnpm --dir remotion git-course series-publish
```

课程级 build 将封面和派生文档写入 `series/tmp/build/release-candidate/`；audit 核对两种封面尺寸、SVG viewBox、文档完整性、内容指纹和 package SHA，并生成 `report.html` 与 `needs_review` verdict。approve 不移动文件；publish 只接受与当前 candidate 和输入完全匹配的 `pass` verdict，并原子写入：

```text
remotion/renders/git-course/series/current/release/
├── cover-1080x1080.png
├── cover-1080x1080.svg
├── cover-960x540.png
├── cover-960x540.svg
├── course-intro.md
├── bilibili.md
├── douyin.md
├── cover-brief.md
├── checklist.md
├── outline.md
├── course.json
├── verdict.json
└── release-manifest.json
```

这些文件是 `course.json`、`outline.md` 和封面源码的物化结果，不是新的事实源。禁止从 `tmp/cover-candidate/` 手工复制，也不新增 `publishing/` 或 `published/`。

## 单集发布物料

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
