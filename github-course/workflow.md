# GitHub Course 生产流程

## 唯一内容源

每集只维护：

```text
github-course/episodes/<episode-id>.json
```

episode JSON 同时保存教学目标、官方依据、scene、旁白、浏览器录制声明、Git / GitHub 状态和审查要求。浏览器脚本、MP4、poster、SRT 和 Remotion timeline 都是派生产物。

## 三层表达

```text
browser recording   真实平台操作与页面反馈
Remotion            课程结构、裁切、标注、字幕和平台状态
GitGraph / Manim    refs、commit graph 和几何关系复杂的底层模型
```

浏览器输入阶段由浏览器独占或近似独占画面。操作完成后浏览器降权为证据，再由平台状态或 Git 模型接管。不要让真实 UI、Git 图、长字幕和设置说明同时争夺注意力。

## 双规格生产与 4K 门禁

GitHub Course 使用“1080p 快速迭代、4K 最终交付”的两阶段生产策略：

```text
episode JSON
  -> 1080p iteration candidate
  -> 教学 / 画面 / 标注 / 字幕 / 音频 / 边界审查通过
  -> 4K browser assets + 4K full candidate
  -> 4K audit + SHA-bound approval
  -> promote / release / publish
```

- `resolution` 是迭代规格，固定为 1920×1080、30fps；日常 dirty scene、代表帧、完整候选和问题修复默认使用这一规格。
- `deliveryResolution` 是最终交付规格，固定为 3840×2160、30fps；只有 1080p 内容候选确认后才开始，避免在内容未稳定时支付 4 倍像素成本。
- 1080p 的 approval 只表示内容与构图可以进入 4K 重建，不得继承为发布批准，也不得覆盖 `current/`。
- 4K 构建必须重新渲染 Remotion，并为真实浏览器镜头重新录制高分辨率 MP4 / poster；禁止把 1080p candidate 或低分辨率录屏直接 upscale 后当作 4K 母版。
- DOM focus region 使用归一化坐标，可以跨规格复用语义 id，但 4K 重录后仍须重新采集 bounding box、写入 metadata 并抽帧核对。
- 最终 audit 必须针对 3840×2160 完整 candidate 重新执行连续 2fps、边界 burst、关键帧、浏览器敏感信息、字幕和音频检查；只有 4K verdict 为 `pass` 且 artifact SHA 匹配时才允许晋升。

## 浏览器录制

所有正式录制必须通过：

```text
scripts/browser-recordings/github-course-lab/
```

录制场景应固定 viewport、locale、timezone、主题、测试账户和 fixture。场景先验证前置状态，再执行动作；涉及创建 PR、Review、Merge 或 Ruleset 的脚本必须使用专用 sandbox repository，并提供明确的清理或重建策略。

派生资产统一输出：

```text
remotion/public/github-course/browser/<recording-id>.mp4
remotion/public/github-course/browser/<recording-id>-poster.png
remotion/public/github-course/browser/<recording-id>.json
```

认证 storage state 只能保存在 `scripts/browser-recordings/github-course-lab/.auth/`，不得复制到 `remotion/public/`、episode JSON 或构建报告。

需要标注真实 UI 时，scenario 在 `prepare` 完成后通过 Playwright locator 采集目标元素的
`bounding_box()`；多个 locator 会合并为一个区域，加入少量像素 padding 后按录制 viewport
归一化，并写入 recording metadata 的 `focusRegions[]`。Remotion 只在 episode 中按区域 id
引用，例如 `highlightIds={["collaboration-navigation"]}`，不得在 episode 里重复手填
`x / y / width / height`。这样重新录制后，GitHub UI 布局变化会随 metadata 自动进入标注层。

## 推荐镜头语法

1. `BrowserFocusScene`：真实输入、点击和页面反馈。
2. `BrowserEvidenceScene`：录制停止在关键状态，使用一次性局部标注指出证据。
3. `GitHubStateBridge`：从 UI 动作过渡到平台状态，再过渡到 Git refs / commits。

静态设置适合截图和局部标注；创建 PR、Review、Checks、Merge 和 Deployment 适合短浏览器视频；base/head、merge 策略和 ref 变化必须回到模型解释。

## 审查

除 Git Course 已有的 2fps 连续抽帧、边界 burst 和关键帧审查外，GitHub Course 还必须检查：

- 是否泄漏 token、邮箱、私有仓库、通知或 Actions 日志中的敏感值；
- 录制页面是否与当前 GitHub 官方文档一致；
- 鼠标动作是否明确且只发生一次；
- 浏览器裁切是否保留操作上下文；
- UI 按钮和最终 Git 状态是否匹配；
- 套餐或 preview 功能是否被误写成所有账户都可用。

## 当前框架边界

当前 orchestrator 入口：

```bash
pnpm --dir remotion github-course validate
pnpm --dir remotion github-course plan gh01-git-vs-github
pnpm --dir remotion github-course browser gh01-git-vs-github
pnpm --dir remotion github-course build gh01-git-vs-github
pnpm --dir remotion github-course audit-full gh01-git-vs-github
pnpm --dir remotion github-course status gh01-git-vs-github
```

当前 `browser` 根据 scenario 源码、runner 和 viewport 指纹判断录制是否 dirty，并把源码指纹写入派生
metadata；接入 4K adapter 时，画质 profile 和录制尺寸也必须进入该指纹。`build` 复用一次
Remotion bundle，并行渲染 dirty scene 与 dirty TTS；成功 scene 和分段语音立即进入内容寻址
cache。视觉 candidate 与带声完整 candidate 都只组装到 `tmp/build/candidate/`。

TTS 通过仓库现有语音脚本调用 MMX CLI，配置从 episode JSON 固定为
`speech-2.8-hd`、`Chinese (Mandarin)_Gentleman`、`zh`、`1.25`。每段生成 MP3 与 SRT，
SRT 保留 MMX 时间码、使用 episode JSON 停顿段规范文本，再清理句尾标点；分段人声约
`-20 LUFS / -3 dBFS`，复用 Git Course BGM `volume=0.05`，完整混音约
`-16 LUFS`。完整审查检查音轨、采样率、响度、scene 窗口、SRT 停顿标记与视觉审查结果。

视觉审查仍可使用 `approve-visual --note=...` 绑定候选 SHA，但当前 1080p visual/full candidate
的 `promotable` 固定为 false。正式 `approve / promote / release-build / release-audit /
release-approve / publish` 仍主动拒绝执行，不能覆盖 `current/`。下一阶段是接入 4K browser /
render profile、发布包装和平台物料，并让发布门禁验证 `deliveryResolution`，禁止 1080p
candidate 晋升。
