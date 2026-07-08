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
│       │   ├── audio/         # 当前配音、BGM、混音和对齐说明
│       │   ├── published/     # 带公共片头片尾的对外发布版
│       │   └── scenes/        # 当前分段预览
│       ├── candidates/        # 待评审候选版本
│       ├── tmp/               # 临时渲染、抽帧、分段审查
│       └── archive/           # 被替换的旧成片
├── visible-system-intro/      # 课程公共片头
├── outro/                     # 课程公共片尾
└── component-gallery/         # 组件和渲染实验
```

新的单集成片应该输出到本地固定路径：

```text
remotion/renders/git-course/<episode-id>/renders/current/<episode-id>.mp4
```

带公共片头和片尾的对外发布版固定覆盖到本地路径：

```text
remotion/renders/git-course/<episode-id>/renders/current/published/<episode-id>_published.mp4
```

分段预览应该固定覆盖到：

```text
remotion/renders/git-course/<episode-id>/renders/current/scenes/<NN>_<scene-id>.mp4
```

其中 `<NN>` 是两位数分段序号，文件名统一使用下划线，例如 `01_hook.mp4`、`02_bad_model.mp4`。除非明确需要版本对比，不要为每次修改新建带日期或描述词的 mp4 输出目录。抽帧检查可以短暂放在 `renders/tmp/`，检查完成后应清理，避免影响找当前版本。

不要把单集专属的审查目录直接放在 `remotion/renders/git-course/` 根目录下；应该放到对应单集的 `renders/tmp/`。

发布版只在正片确认后生成。公共片头、正片、公共片尾合成时优先用 FFmpeg concat filter 重新编码，避免直接 copy 拼接在段落边界产生音频时间戳警告。片头片尾 BGM 从课程统一 BGM 截取低音量片段，不单独换歌；发布封装默认片头增益 `0dB`、片尾增益 `-5dB`，让当前片尾 BGM 比片头约高 `2dB`。

这些 mp4/mp3/m4a/srt 是本地生成产物，默认不由 git 管理；仓库保留源码、脚本、文稿、对齐说明和流程文档。

## 音频约定

单集音频固定放在：

```text
remotion/renders/git-course/<episode-id>/renders/current/audio/
```

约定：

- 每个 scene 单独生成 TTS 文稿、音频和 SRT；文件名必须带序号，例如 `01_hook.txt`、`01_hook.mp3`、`01_hook.srt`。
- TTS 文稿可以使用 MiniMax 停顿标记，例如 `<#0.25#>`；生成后必须检查 SRT，确认标记没有被读出来。
- 原始 TTS 文件保留，规范化人声使用 `_norm.mp3` 后缀。
- 全片对齐人声统一输出为 `voiceover-aligned.m4a`。
- 最终混音统一输出为 `mix.m4a`。
- 人声规范化目标约 `-20 LUFS`，峰值约 `-3 dBFS`。
- BGM 在 Git 课程内优先复用已确认版本；当前 EP01/EP02 使用同一条 BGM。
- BGM 使用固定低音量混入，当前为 `volume=0.05`；不做 sidechain ducking。
- `audio/alignment.md` 或 `audio/voiceover_segments/alignment.md` 记录 scene 时间窗、旁白进入时间、规范化文件和句子级 SRT 对齐公式。
- 发布版统一使用 `remotion/scripts/git-course-publish-episode.sh` 生成；默认 `INTRO_AUDIO_GAIN_DB=0`、`OUTRO_AUDIO_GAIN_DB=-5`。

## 当前输出

| 项目 | 状态 | 当前输出 |
| --- | --- | --- |
| `ep01-what-git-stores` | 已有当前成片；旧抽帧和 hook 审查保留 | `ep01-what-git-stores/renders/current/ep01-what-git-stores.mp4` |
| `ep01-what-git-stores` 发布版 | 已加公共片头、片尾和统一 BGM，193s / 5790 帧 | `ep01-what-git-stores/renders/current/published/ep01-what-git-stores_published.mp4` |
| `ep02-working-tree-index-repo` | 已有当前带音频成片，音频复用 EP01 BGM 并完成分段规范化 | `ep02-working-tree-index-repo/renders/current/final/ep02-working-tree-index-repo_with-audio.mp4` |
| `ep02-working-tree-index-repo` 发布版 | 已加公共片头、片尾和统一 BGM，193s / 5790 帧 | `ep02-working-tree-index-repo/renders/current/published/ep02-working-tree-index-repo_published.mp4` |
| `ep03-commit-snapshot` | 已有当前成片 | `ep03-commit-snapshot/renders/current/ep03-commit-snapshot.mp4` |
| `ep04-branch-is-pointer` | 已有当前成片，并有 README/meta/审查记录 | `ep04-branch-is-pointer/renders/current/ep04-branch-is-pointer.mp4` |
| `visible-system-intro` | 公共片头本地渲染；发布封装时加入统一 BGM 片段 | `visible-system-intro/renders/current/visible-system-intro.mp4` |
| `outro` | 公共片尾本地渲染；发布封装时加入统一 BGM 片段 | `outro/current/ref-lightbox-outro.mp4` |

## 备注

- `ep01-what-git-stores/stills/` 是早期 ep01 输出抽出的审查帧和 contact sheet。
- `ep01-what-git-stores/renders/tmp/hook-audit/` 是单独做的 ep01 hook 优化审查，原来散落在课程根目录下。
- 单集目录里的 `check*` 文件夹都是审查产物。后续再处理对应集数时，建议逐步归入 `renders/tmp/`。
- 目前最稳定的模式是 ep03/ep04：`renders/current/` 放确认成片，`renders/tmp/` 放工作过程产物。
