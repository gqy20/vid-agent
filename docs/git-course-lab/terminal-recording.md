# 真实终端录制体系

Git 课程终端默认使用 `asciinema -> agg -> FFmpeg`。命令在真实 PTY 和隔离 Git 仓库中执行，录制过程不依赖 Chrome、ttyd 或浏览器 canvas。

## 目录约定

```text
scripts/terminal-recordings/
├── record-asciinema.sh
├── record-vhs.sh
└── git-course-lab/
    ├── demos/
    │   ├── _lib.sh
    │   └── ep02-add.sh
    ├── fixtures/
    │   └── ep02-add.sh
    ├── presets/
    └── tapes/
```

- `record-asciinema.sh`：Git 课程默认入口，负责隔离环境、录制、主题渲染、MP4 转换和尾帧生成。
- `demos/*.sh`：观众实际看到的命令、输入节奏和真实输出。
- `demos/_lib.sh`：统一提示符、打字节奏、Git 状态语义色和尾帧光标。
- `fixtures/*.sh`：录制前准备 Git 状态，不负责呈现教学动作。
- `record-vhs.sh`、`tapes/*.tape`：仅保留给尚未迁移的历史片段，不再用于新增 Git 课程终端。

## 录制命令

录制单个片段：

```bash
scripts/terminal-recordings/record-asciinema.sh git-course-lab ep02-add
```

列出片段：

```bash
scripts/terminal-recordings/record-asciinema.sh git-course-lab --list
```

重录全部 asciinema 片段：

```bash
scripts/terminal-recordings/record-asciinema.sh git-course-lab all
```

固定输出：

```text
remotion/public/<project>/terminal/<recording-id>.mp4
remotion/public/<project>/terminal/<recording-id>-hold.png
```

Remotion 使用 `RecordedTerminalPanel` 播放 MP4，并在指定帧切换到 `-hold.png`，避免媒体尾部闪黑。

## 录制环境

每次录制使用独立目录：

```text
/tmp/vid-agent-terminal-recordings/<project>/<recording-id>-asciinema/
├── home/
├── work/
├── <recording-id>.cast
└── <recording-id>.gif
```

Git 身份固定为：

```text
Git Course <course@example.local>
```

终端固定为 `72x14`、Source Code Pro Medium `28px`、30fps，并使用参考 Termius Dark 对比关系的中性 macOS Graphite 主题。Index 状态使用克制的琥珀黄，Working Tree 状态使用灰青色；背景和提示符不复用 Git 语义色。

## 新增片段

新增同名 demo 与 fixture：

```text
scripts/terminal-recordings/git-course-lab/demos/<recording-id>.sh
scripts/terminal-recordings/git-course-lab/fixtures/<recording-id>.sh
```

demo 使用公共函数：

```bash
source "$(dirname "$0")/_lib.sh"
cd "$TERMINAL_RECORDING_WORKDIR"
begin_terminal
type_command 'git status --short'
semantic_status
finish_terminal
```

fixture 使用：

```bash
cd "$TERMINAL_RECORDING_WORKDIR"
```

fixture 只准备状态。观众需要看到的命令必须放在 demo 中，并真实执行。

## 录制规则

- 每段终端只解释一个动作。
- 命令执行后尽快退出终端主视觉。
- 不在终端中写长解释。
- 长命令优先拆成多个短命令，避免自动换行。
- 命令必须能在临时目录重复执行。
- 不得暴露本机路径、用户名、token 或私人仓库信息。
- `.cast` 和 GIF 是临时产物；仓库保留 demo、fixture、MP4 和尾帧。
