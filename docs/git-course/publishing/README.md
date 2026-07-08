# Git 课程发布物料规范

这个目录保存 B 站发布所需的可维护源内容。

原则：

- 文案源文件进 Git，生成图片、视频和临时审查图不进 Git。
- 每集固定一个发布目录，避免在渲染目录里散落多个临时版本。
- 标题、封面、简介、大纲、标签和置顶评论要能互相呼应。
- 封面强调一个核心问题，简介解释本集收益，时间轴帮助观众跳转复看。

每集目录建议：

```text
docs/git-course/publishing/episodes/<episode-id>/
  bilibili.md     # 最终上传文案：标题、简介、大纲、标签、动态、置顶评论
  cover-brief.md  # 封面设计 brief：主标题、视觉结构、候选文案
  checklist.md    # 发布前检查清单
```

成品输出建议：

```text
remotion/renders/git-course/<episode-id>/renders/current/publishing/
  01_cover.svg
  01_cover.png
  bilibili-upload.md
```

`01_cover.png` 永远代表当前主封面。`01_cover.svg` 是同版矢量输出，便于快速检查和复用。需要候选时使用 `02_cover_alt-a.png`、`03_cover_alt-b.png`，不要创建散乱的新版本目录。

静态封面优先使用 SVG 构建脚本生成，再转 PNG 上传，避免每次为了单帧封面启动 Remotion：

```bash
cd remotion
node scripts/git-course-build-ep01-cover.mjs
```
