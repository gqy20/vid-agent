# 真实终端录制体系

本项目不再把终端默认做成纯 React 假输出。Git 课程中出现的命令应优先来自真实 shell，并通过统一脚本生成可复现的视频资产。

## 目录约定

```text
scripts/terminal-recordings/
├── record-vhs.sh
└── git-course-lab/
    ├── presets/
    │   └── default.tape
    ├── tapes/
    │   └── ep00-git-object.tape
    ├── fixtures/
    └── record-ep00-git-object.sh
```

- `record-vhs.sh`：统一录制入口，负责临时 HOME、Git 身份、工作目录、输出路径。
- `presets/default.tape`：课程统一终端视觉，包括字体、尺寸、主题、打字速度。
- `tapes/*.tape`：每个片段的真实命令动作，只写 `Type` / `Enter` / `Sleep` 等 VHS 动作。
- `fixtures/*.sh`：可选。录制前准备复杂文件、远端仓库、冲突状态等。
- `record-*.sh`：可选的短入口，方便单独重录某个常用片段。

## 录制命令

通用方式：

```bash
scripts/terminal-recordings/record-vhs.sh git-course-lab ep00-git-object
```

列出当前项目所有可录制片段：

```bash
scripts/terminal-recordings/record-vhs.sh git-course-lab --list
```

重录当前项目全部片段：

```bash
scripts/terminal-recordings/record-vhs.sh git-course-lab all
```

短入口：

```bash
scripts/terminal-recordings/git-course-lab/record-ep00-git-object.sh
```

输出：

```text
remotion/public/<project>/terminal/<recording-id>.mp4
```

Remotion 使用 `TerminalRecording` 合成该视频。

## 为什么优先 vhs

- 命令真的执行。
- 输出可复现。
- 视觉比裸 `script`/`asciinema` 更稳定。
- 可以指定字体、窗口尺寸和打字速度。

## 录制环境

统一脚本会为每次录制创建隔离环境：

```text
/tmp/vid-agent-terminal-recordings/<project>/<recording-id>/
├── home/
├── work/
├── shell
└── recording.tape
```

默认 Git 身份固定为：

```text
Git Course <course@example.local>
```

这样可以避免录屏里出现本机用户名、邮箱、路径、token 或私人仓库信息。

## 新增一个片段

例如要录制 `ep02-status-lifecycle`：

```text
scripts/terminal-recordings/git-course-lab/tapes/ep02-status-lifecycle.tape
```

内容只写动作：

```tape
Type "git init -q -b main"
Enter
Sleep 250ms
Type "git status --short"
Enter
Sleep 900ms
```

然后运行：

```bash
scripts/terminal-recordings/record-vhs.sh git-course-lab ep02-status-lifecycle
```

输出会自动写到：

```text
remotion/public/git-course-lab/terminal/ep02-status-lifecycle.mp4
```

## 使用 fixture

如果录制前需要准备状态，新建同名 fixture：

```text
scripts/terminal-recordings/git-course-lab/fixtures/ep02-status-lifecycle.sh
```

脚本可使用：

```bash
cd "$TERMINAL_RECORDING_WORKDIR"
```

fixture 只负责准备环境，不负责呈现教学动作。观众需要看到的命令仍然写在 `tapes/*.tape` 中。

## 何时用 asciinema

`asciinema` 更适合保留文本时间线和后期重新渲染。如果后续要在 Remotion 中重建终端排版，可以使用：

```bash
asciinema rec scripts/terminal-recordings/git-course-lab/ep00-git-object.cast
```

长期理想方案是 `node-pty + xterm.js`：真实执行命令，同时保留 DOM/canvas 级别的 Remotion 控制能力。

## 录制规则

- 每段终端只解释一个动作。
- 命令执行后尽快退出终端主视觉。
- 不在终端中写长解释。
- 长命令优先拆成多个短命令，避免自动换行破坏画面。
- 命令必须能在临时目录重复执行。
- 录制脚本必须避免用户本机路径、用户名、token 和私人仓库信息。
- 不直接运行裸 `vhs`；必须通过 `record-vhs.sh`，确保环境和输出路径统一。
