# Claude Code 终端录屏

这套录制流程会同时生成成片和一个可直接供后续剪辑使用的时间线 sidecar：

- `<episode-id>.mp4`：脱敏后的终端成片。
- `<episode-id>.json`：媒体尺寸、帧数和 hold frame 等基础元数据。
- `<episode-id>.timeline.json`：内容分段、媒体帧范围和建议剪辑策略。

三者输出到 `remotion/public/claude-code-course/terminal/`。`.cast`、导演日志和原始事件只存在于临时目录，完成后删除；timeline 不保存命令正文、终端输出或认证令牌。

## 在导演脚本中标记内容

导演脚本先加载 `_lib.sh`，再用成对的分段事件包住一段完整内容：

```bash
source "$SCRIPT_DIR/../_lib.sh"

segment_start install-wait wait "下载安装 Claude Code" speed 3 5
# 等待安装完成
segment_end install-wait
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
