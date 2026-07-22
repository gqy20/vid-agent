# Claude Code 终端录屏

这套录制流程会同时生成成片和一个可直接供后续剪辑使用的时间线 sidecar：

- `<episode-id>.mp4`：脱敏后的终端成片。
- `<episode-id>.json`：媒体尺寸、帧数和 hold frame 等基础元数据。
- `<episode-id>.timeline.json`：内容分段、媒体帧范围和建议剪辑策略。

三者输出到 `remotion/public/claude-code-course/terminal/`。`.cast`、GIF 和含敏感值的中间视频只存在于临时目录，完成后删除；导演日志、原始事件和 Claude session 按下述本地日志规则归档。timeline 不保存命令正文、终端输出或认证令牌。

## 本地录制日志

每次录制都会生成唯一 run id，并把 Claude Code 会话证据归档到本集已忽略的本地目录：

```text
remotion/renders/claude-code-course/<episode-id>/tmp/recordings/<run-id>/
├── manifest.json
├── raw/
│   ├── projects/                 # 容器 ~/.claude/projects
│   ├── debug/                    # 容器 ~/.claude/debug
│   └── director/{run.log,events.jsonl}
├── sanitized/
│   ├── session-trace.jsonl
│   └── session-architecture.json
└── audit/sensitive-scan.json
```

- run 目录和子目录固定为 `700`，文件固定为 `600`，并由 `remotion/.gitignore` 阻止提交。
- 原始 `.cast`、GIF、中间视频和 `~/.claude/settings.json` 不进入归档；真实认证配置仍随临时目录销毁。
- `session-trace.jsonl` 保留事件序号、父序号、消息序号、内容块类型、工具序号与结果配对、错误标记、checkpoint 计数和导演 segment 元数据；工具输入只保留字段名，不保留字段值。
- `session-architecture.json` 汇总事件链、assistant event/message 数量、工具调用闭合率、错误结果和 file-history 计数，供课程动画与审查读取。
- 两个 sanitized 文件都不保存提示词、回复正文、工具参数值、工具结果正文、绝对路径、session id、message id、uuid 或 tool id。它们是受版本约束的派生观察数据，不是 Claude Code JSONL 的稳定公共 API。
- `sensitive-scan.json` 只保存分类、数量和相对文件名，不保存命中的敏感值。`fail` 表示本地 raw 中检测到凭据或私钥，需要人工处理；它不能替代公开视频的像素脱敏和 cast 泄漏阻断。
- `manifest.json` 绑定 episode、run id、退出状态、Claude Code 版本、镜像身份以及归档文件 SHA。成功和失败录制使用同一结构，不再覆盖一个固定的 failure log。

默认 run id 为 UTC 时间加进程号；需要重现实验名称时可显式设置 `CC_RECORDING_RUN_ID`，但同一集不得复用已有 id：

```bash
CC_RECORDING_RUN_ID=ep02-permissions-review \
  scripts/terminal-recordings/claude-code-lab/record-tmux.sh ep02-interactive-guide run
```

查看本集的本地录制记录：

```bash
python3 scripts/terminal-recordings/claude-code-lab/manage-recording-logs.py \
  list ep02-interactive-guide
```

清理命令默认只预览。下面先列出“仅保留最新 10 次”会删除的目录，只有传入布尔值为真的 `--apply` 才实际删除：

```bash
python3 scripts/terminal-recordings/claude-code-lab/manage-recording-logs.py \
  prune ep02-interactive-guide --keep 10
python3 scripts/terminal-recordings/claude-code-lab/manage-recording-logs.py \
  prune ep02-interactive-guide --keep 10 --apply=true
```

## 基础镜像

基础镜像按 `envs/base/` 的有效输入生成内容指纹标签，避免复用过期的 `cc-base:latest`：

```bash
scripts/terminal-recordings/claude-code-lab/build-image.sh
scripts/terminal-recordings/claude-code-lab/verify-image.sh
```

`build-image.sh` 会在镜像不存在时构建，存在时复用。使用 `--rebuild` 或 `REBUILD=1` 可强制重建；`--print` 只输出当前输入对应的镜像标签。

如果 Docker 默认构建网络无法解析外部下载地址，可仅为构建显式使用宿主网络：

```bash
CC_BUILD_NETWORK=host scripts/terminal-recordings/claude-code-lab/build-image.sh
```

构建入口只会转发当前环境中标准的大小写代理变量，不会把 `.env` 中的认证变量传给 Docker build。

EP01 的安装录制如果需要访问宿主代理，应显式传入代理地址：

```bash
CC_INSTALL_PROXY=http://127.0.0.1:7890 \
  scripts/terminal-recordings/claude-code-lab/record-tmux.sh ep01-install-first-start install
```

4K 课程预览保持 `120×28` 的终端布局，仅把字体栅格密度提升为两倍：

```bash
CC_TERMINAL_FONT_SIZE=48 \
  scripts/terminal-recordings/claude-code-lab/record-tmux.sh ep01-install-first-start install
```

该配置生成约 `3516×2020` 的终端内容面，进入 3840×2160 Remotion 成片时只缩小、不放大；
脱敏坐标会依据实际媒体尺寸自动缩放。

代理与认证信息只在运行容器时传入，不进入镜像层。录制脚本会从仓库根目录的本地 `.env` 加载 `ANTHROPIC_AUTH_TOKEN`、`ANTHROPIC_BASE_URL` 和 `ANTHROPIC_MODEL`；该文件必须保持 `600` 权限且不得提交。EP01 沿用原流程，在受控的原始 cast 中输入真实 Token，然后对 Shell 和 `settings.json` 中的两处出现执行像素马赛克。原始 cast、GIF 和中间 MP4 无论成功、失败或中断都会删除。

## 在导演脚本中标记内容

导演脚本先加载 `_lib.sh`，再用成对的分段事件包住一段完整内容：

```bash
source "$SCRIPT_DIR/../_lib.sh"

segment_start 03_install_wait wait "下载安装 Claude Code" speed 3 5
# 等待安装完成
segment_end 03_install_wait
```

`segment_start` 参数依次为：

1. 稳定的 segment id；
2. 内容类型，如 `command`、`wait`、`result`、`edit`、`onboarding`；
3. 给剪辑者看的短标签；
4. 建议策略：`normal`、`speed`、`jump` 或 `cut`；
5. 可选的目标时长（秒）；
6. 可选的建议播放倍率。

同一时刻只允许一个 segment 生效，遗漏结束标记、重复 id 或区间重叠都会让录制失败，防止错误时间线进入后续合成。

## 时间映射

导演事件先记录宿主单调时钟上的原始时间。`agg` 会用 `--idle-time-limit` 压缩长时间无输出的等待，`build-timeline.py` 再读取 cast 的事件增量，使用相同 idle limit 把原始时间映射到最终 MP4 的秒数与帧号。

因此后续剪辑只需读取 timeline 中每段的 `source.startFrame` 和 `source.endFrameExclusive`，不需要重新猜测安装、等待响应或 onboarding 的边界。episode JSON 仍是教学内容与发布数据的唯一内容源；timeline 是每次真实录屏派生出的素材索引。
