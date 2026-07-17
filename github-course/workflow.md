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

当前已建立内容 schema、浏览器 runner、Remotion 组件和 gallery，并完成 GH01 的 episode JSON、只读浏览器场景与 Remotion 第一版。正式 orchestrator、TTS、scene CAS、audit verdict、promote 和 publish 应在第一集内容稳定后，复用 Git Course 的通用机制另行接入。
