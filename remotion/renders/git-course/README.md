# Git 课程渲染产物

这个目录存放 Git 课程的 Remotion 渲染产物。它是输出索引，不是课程内容的源头。

课程文档和策划在 `docs/git-course/`。
Remotion 源码在 `remotion/src/videos/git-course/`。
公开媒体素材在 `remotion/public/git-course/`。

## 目录约定

```text
remotion/renders/git-course/
├── README.md
├── <episode-id>/
│   ├── README.md              # 可选：单集渲染说明
│   ├── meta.json              # 可选：当前输出元信息
│   ├── quality-audit.md       # 可选：质量审查记录
│   ├── thumbnail.png          # 可选：缩略图
│   └── renders/
│       ├── current/           # 已确认的当前成片
│       ├── candidates/        # 待评审候选版本
│       ├── tmp/               # 临时渲染、抽帧、分段审查
│       └── archive/           # 被替换的旧成片
├── visible-system-intro/      # 课程公共片头
├── outro/                     # 课程公共片尾
└── component-gallery/         # 组件和渲染实验
```

新的单集成片应该发布到：

```text
remotion/renders/git-course/<episode-id>/renders/current/<episode-id>.mp4
```

分段预览应该固定覆盖到：

```text
remotion/renders/git-course/<episode-id>/renders/current/scenes/<NN>_<scene-id>.mp4
```

其中 `<NN>` 是两位数分段序号，例如 `01_hook.mp4`、`02_bad-model.mp4`。除非明确需要版本对比，不要为每次修改新建带日期或描述词的 mp4 输出目录。抽帧检查可以短暂放在 `renders/tmp/`，检查完成后应清理，避免影响找当前版本。

不要把单集专属的审查目录直接放在 `remotion/renders/git-course/` 根目录下；应该放到对应单集的 `renders/tmp/`。

## 当前输出

| 项目 | 状态 | 当前输出 |
| --- | --- | --- |
| `ep01-what-git-stores` | 已有当前成片；旧抽帧和 hook 审查保留 | `ep01-what-git-stores/renders/current/ep01-what-git-stores.mp4` |
| `ep02-working-tree-index-repo` | 只有候选渲染和检查产物；还没有发布 current | 无 |
| `ep03-commit-snapshot` | 已有当前成片 | `ep03-commit-snapshot/renders/current/ep03-commit-snapshot.mp4` |
| `ep04-branch-is-pointer` | 已有当前成片，并有 README/meta/审查记录 | `ep04-branch-is-pointer/renders/current/ep04-branch-is-pointer.mp4` |
| `visible-system-intro` | 公共片头渲染 | `visible-system-intro/renders/current/visible-system-intro.mp4` |
| `outro` | 公共片尾参考渲染 | `outro/current/ref-lightbox-outro.mp4` |

## 备注

- `ep01-what-git-stores/stills/` 是早期 ep01 输出抽出的审查帧和 contact sheet。
- `ep01-what-git-stores/renders/tmp/hook-audit/` 是单独做的 ep01 hook 优化审查，原来散落在课程根目录下。
- 单集目录里的 `check*` 文件夹都是审查产物。后续再处理对应集数时，建议逐步归入 `renders/tmp/`。
- 目前最稳定的模式是 ep03/ep04：`renders/current/` 放确认成片，`renders/tmp/` 放工作过程产物。
