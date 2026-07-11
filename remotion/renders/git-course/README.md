# Git 课程渲染产物

这个目录存放 Git 课程的 Remotion 渲染产物。它是输出索引，不是课程内容的源头。

课程内容源和策划在仓库根目录 `git-course/`。
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
│   ├── current/               # 已确认的当前成片
│   │   ├── audio/             # 当前配音、BGM 和混音
│   │   ├── release/           # 封面、上传文案和带片头片尾的发布版
│   │   └── scenes/            # 当前分段预览
│   └── tmp/                   # 临时渲染、抽帧、历史审查与旧成片
├── visible-system-intro/      # 课程公共片头
├── outro/                     # 课程公共片尾
└── component-gallery/         # 组件和渲染实验
```

新的单集成片应该输出到本地固定路径：

```text
remotion/renders/git-course/<episode-id>/current/<episode-id>.mp4
```

带公共片头和片尾的对外发布版固定覆盖到本地路径：

```text
remotion/renders/git-course/<episode-id>/current/release/<episode-id>.mp4
```

分段预览应该固定覆盖到：

```text
remotion/renders/git-course/<episode-id>/current/scenes/<NN>_<scene-id>.mp4
```

其中 `<NN>` 是两位数分段序号，文件名统一使用下划线，例如 `01_hook.mp4`、`02_bad_model.mp4`。除非明确需要版本对比，不要为每次修改新建带日期或描述词的 mp4 输出目录。抽帧检查可以短暂放在 `tmp/`，检查完成后应清理，避免影响找当前版本。

不要把单集专属的审查目录直接放在 `remotion/renders/git-course/` 根目录下；应该放到对应单集的 `tmp/`。

发布版只在正片确认后生成。公共片头、正片、公共片尾合成时优先用 FFmpeg concat filter 重新编码，避免直接 copy 拼接在段落边界产生音频时间戳警告。片头片尾 BGM 从课程统一 BGM 截取低音量片段，不单独换歌；发布封装默认片头增益 `0dB`、片尾增益 `-5dB`，让当前片尾 BGM 比片头约高 `2dB`。

这些 mp4/mp3/m4a/srt 是本地生成产物，默认不由 git 管理；仓库保留源码、脚本、文稿、对齐说明和流程文档。

## 音频约定

单集音频固定放在：

```text
remotion/renders/git-course/<episode-id>/current/audio/
```

约定：

- 每个 scene 单独生成 TTS 文稿、音频和 SRT；文件名必须带序号，例如 `01_hook.txt`、`01_hook.mp3`、`01_hook.srt`。
- TTS 文稿可以使用 MiniMax 停顿标记，例如 `<#0.25#>`；生成后必须检查 SRT，确认标记没有被读出来。
- 概念切换、命令切换、列表结束转结论时必须显式写停顿标记，不能只靠换行。生成后检查相邻 SRT cue：低于约 `0.2s` 的概念边界通常要补 `<#0.3#>` 到 `<#0.45#>`。
- 原始 TTS 文件保留，规范化人声使用 `_norm.mp3` 后缀。
- 全片对齐人声统一输出为 `voiceover-aligned.m4a`。
- 最终混音统一输出为 `mix.m4a`。
- 人声规范化目标约 `-20 LUFS`，峰值约 `-3 dBFS`。
- BGM 在 Git 课程内优先复用已确认版本；当前 EP01/EP02 使用同一条 BGM。
- BGM 使用固定低音量混入，当前为 `volume=0.05`；不做 sidechain ducking。
- 分段旁白必须通过 `remotion/scripts/git-course-build-voiceover.sh` 生成，不手工散跑 TTS。临时 `.txt` 与 manifest 由 episode JSON 派生。
- TTS 必须显式固定 `model / voice / language / speed`。当前 Git course 默认使用 `speech-2.8-hd`、`Chinese (Mandarin)_Gentleman`、`zh`、`1.25`。
- 人工对齐说明保存在根级 episode JSON 的 `content.alignmentMarkdown`；机器时间窗直接校验 `scenes[].narration`。
- 发布版统一使用 `remotion/scripts/git-course-publish-episode.sh` 生成；默认 `INTRO_AUDIO_GAIN_DB=0`、`OUTRO_AUDIO_GAIN_DB=-5`。

## 当前输出

| 项目 | 状态 | 当前输出 |
| --- | --- | --- |
| `ep01-what-git-stores` | 已有当前成片；旧抽帧和 hook 审查保留 | `ep01-what-git-stores/current/ep01-what-git-stores.mp4` |
| `ep01-what-git-stores` 发布版 | 已加公共片头、片尾和统一 BGM，193s / 5790 帧 | `ep01-what-git-stores/current/release/ep01-what-git-stores.mp4` |
| `ep02-working-tree-index-repo` | 已有当前带音频成片，音频复用 EP01 BGM 并完成分段规范化 | `ep02-working-tree-index-repo/current/ep02-working-tree-index-repo.mp4` |
| `ep02-working-tree-index-repo` 发布版 | 已加公共片头、片尾和统一 BGM，193s / 5790 帧 | `ep02-working-tree-index-repo/current/release/ep02-working-tree-index-repo.mp4` |
| `ep03-commit-snapshot` | 已有当前成片 | `ep03-commit-snapshot/current/ep03-commit-snapshot.mp4` |
| `ep04-branch-is-pointer` | 已有当前成片，并有 README/meta/审查记录 | `ep04-branch-is-pointer/current/ep04-branch-is-pointer.mp4` |
| `visible-system-intro` | 公共片头本地渲染；发布封装时加入统一 BGM 片段 | `visible-system-intro/current/visible-system-intro.mp4` |
| `outro` | 公共片尾本地渲染；发布封装时加入统一 BGM 片段 | `outro/current/ref-lightbox-outro.mp4` |

## 备注

- 早期 `stills/`、`check*` 审查目录已统一归入对应单集的 `tmp/legacy-checks/`。
- 旧 `current/final/` 文件已归入 `tmp/legacy-final/`，不参与当前生产流程。
- 目前最稳定的模式是 ep03/ep04：`current/` 放确认成片，`tmp/` 放工作过程产物。
