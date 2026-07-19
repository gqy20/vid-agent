# Git Course 渲染产物

本目录只保存 Git Course 的本地派生产物。课程内容唯一来源是 `git-course/episodes/*.json`，生产规则见 `git-course/workflow.md` 和 `docs/course-production.md`。

所有生产动作必须从 Git Course orchestrator 进入：

```bash
pnpm --dir remotion git-course status <episode-id>
pnpm --dir remotion git-course preview <episode-id> --scenes=<scene-id>
pnpm --dir remotion git-course build <episode-id>
pnpm --dir remotion git-course approve <episode-id> --note="人工审查结论"
pnpm --dir remotion git-course promote <episode-id>
pnpm --dir remotion git-course release-build <episode-id>
pnpm --dir remotion git-course release-audit <episode-id>
pnpm --dir remotion git-course release-approve <episode-id> --note="发布版审查结论"
pnpm --dir remotion git-course publish <episode-id>
```

不要直接调用底层 TTS、Remotion、FFmpeg 或 `git-course-publish-episode.sh` 写正式目录。

## 目录所有权

```text
remotion/renders/git-course/<episode-id>/
├── tmp/
│   ├── cache/                  # 唯一可复用的内容寻址存储
│   ├── preview/                # cache 的可重建审查视图
│   ├── narration-source/       # episode JSON 派生文本
│   └── build/
│       ├── state.json          # Scene/TTS 指纹状态
│       ├── activity.json       # 仅运行期间存在的互斥记录
│       ├── tasks/              # 一次运行的临时工作区
│       ├── candidate/          # 待审主候选
│       ├── release-candidate/  # 待审发布候选
│       └── audit/              # 与候选 SHA 绑定的审查证据
└── current/
    ├── <episode-id>.mp4        # 通过 main approve/promote 的当前正片
    ├── audio/                  # 与正片同批晋升的音频
    └── release/
        └── <episode-id>.mp4    # 通过 release gate 的发布版
```

固定语义：

- build、preview 和 audit 只写 `tmp/`，不会覆盖 Current。
- `tmp/preview/scenes/<NN>_<scene-id>.mp4` 是可重建视图，不是正式分段版本。
- `current/` 不保存 preview、临时 scene、审查帧或工作文件。
- 只有与候选 SHA、Scene/TTS/BGM 指纹全部匹配的 main `pass` verdict 才能 promote。
- Release Candidate 必须绑定当前正片 SHA；只有 release `pass` verdict 和磁盘 SHA 都匹配时才能 publish。
- Current 正片改变后，旧 Release Candidate 和旧 Published 不再代表当前版本。

## 命名与派生产物

- Scene 文件使用两位顺序号和下划线，例如 `01_hook.mp4`、`02_bad_model.mp4`。
- narration `.txt`、`manifest.tsv`、MP3、SRT 和规范化音频均由 episode JSON 派生。
- build 音频先进入 `tmp/build/candidate/audio/`；promote 后才原子同步到 `current/audio/`。
- 人声默认约 `-20 LUFS / -3 dBFS`，最终上传混音约 `-16 LUFS`；具体门禁以 orchestrator 和 `git-course/workflow.md` 为准。
- 历史正式成片只归档到 `tmp/legacy-final/`，不再参与生产状态。
- 不产生 `new`、`v2`、`final-final`、`publishing/` 或 `published/` 等平行正式目录。

这些本地媒体默认不提交。仓库提交 episode JSON、源码、脚本和规范，不提交可重建的 cache、preview、审查帧或音频派生产物。

## 清理

```bash
pnpm --dir remotion git-course clean <episode-id>
pnpm --dir remotion git-course gc <episode-id> --bundles
# 核对 dry-run 后才追加 --apply
```

`clean` 和 `gc` 必须保护活动任务、manifest、有效 verdict、Candidate、Current 和 Published 引用。禁止按目录年龄直接批量删除。
