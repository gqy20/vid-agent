# GitHub Course 生产检查清单

本清单建立在 [`课程视频统一生产规范`](../docs/course-production.md) 之上。当前 orchestrator 已实现 1080p 内容 Candidate、原生 4K Candidate/audit 和 4K approve/promote；Release 与 Publish 仍是硬门禁。

## Episode 与来源

- [ ] episode JSON 通过 `episode.schema.json` 校验。
- [ ] 每个 scene 只解释一个平台动作、平台状态或 Git 状态变化。
- [ ] `episodeId`、Composition、浏览器 scenario 和产物目录映射唯一。
- [ ] `scenes[].narration` 使用单个对象，`segmentId` 使用 `NN_scene_id`。
- [ ] GitHub UI、套餐、认证、API 和 preview 功能已对照当前官方文档核验。
- [ ] `sourceOfTruth.verifiedAt` 与实际核验日期一致。

## 浏览器证据

- [ ] 正式录制从 `scripts/browser-recordings/github-course-lab/` 进入。
- [ ] viewport、locale、timezone、主题、fixture 和 sandbox repository 可复现。
- [ ] storage state 只留在 `.auth/`，公开资产不包含 token、邮箱、通知或私有仓库信息。
- [ ] 动作前验证前置状态，动作后保留可读的结果状态。
- [ ] focus region 由 locator 和 metadata 派生，不在 episode 中手填像素坐标。
- [ ] 浏览器动作与 Git refs、commit、checks、merge 结果一致。

## 1080p 内容验收（当前已实现）

- [ ] `validate`、`plan`、`browser` 和 `build` 成功。
- [ ] dirty browser、Scene、TTS 和 BGM 指纹与 Candidate manifest 一致。
- [ ] 成功 Scene/TTS 已进入内容寻址 cache，失败任务没有清除成功结果。
- [ ] visual candidate 和 full candidate 只位于 `tmp/build/candidate/`。
- [ ] 连续 2fps、overview、边界 burst、关键帧和完整 metrics 已生成。
- [ ] 字幕、音轨、响度、scene 窗口、敏感信息和平台状态检查通过。
- [ ] 画面字幕逐句来自当前 TTS SRT，并按 `voiceStart` 与实际旁白同时进入、同时退出；没有手写延迟总结冒充字幕。
- [ ] 画面模型没有额外复述当前或即将出现的字幕完整句；对象名、命令、状态和关系标签除外。
- [ ] Git/GitHub 对比镜头使用各自 Logo，主模型、卡片组和字幕相对 1920×1080 画布保持视觉居中。
- [ ] 课程解释层只使用 `palette.ts`、`typography.ts` 和 `spacing.ts` 的共享 token；真实浏览器 UI、品牌 Logo 与浏览器控制点之外没有硬编码颜色或相近字号。
- [ ] 课程画布没有装饰性渐变、光斑或点阵；平台彩色只表示 action、open、approved、merged、pending、failed 等真实状态。
- [ ] `text.tertiary` 没有承担正文、字幕或关键状态；字幕与正文使用既定 36px / 30px 角色并留出底部安全区。
- [ ] 浏览器证据窗位于 `y=96–896px`，字幕只占用 `y=920–1022px`；两者之间没有边框、阴影、文字或 focus region 冲突。
- [ ] 浏览器保持 1600px 教学宽度并顶部对齐裁切；视频、poster 和 metadata highlight 仍使用同一 1600×900 内层坐标系。
- [ ] 字幕无边框、白底、圆角和阴影；每个 SRT cue 最多两行，`subtitle.layout-capacity` 检查通过。
- [ ] 人工审查记录绑定当前 visual/full Candidate SHA。

1080p approval 只允许进入 4K 重建，永远不能覆盖 `current/`。

## 4K 母版门禁（当前已实现）

- [ ] 4K browser profile、录制尺寸和 metadata 已进入指纹。
- [ ] 正式浏览器资产以 3840×2160 重新录制，未使用 1080p upscale。
- [ ] Remotion 以 3840×2160、30fps 重新渲染完整 Candidate。
- [ ] 所有 4K Scene 使用一致的视频时间基，`assembly.scene-timebase` 通过且拼接日志没有 `Non-monotonic DTS`。
- [ ] focus bounding box 已按 4K 录制重新采集。
- [ ] 针对 4K Candidate 重新执行全部视觉、边界、音频和敏感信息审查。
- [ ] 4K verdict 为 `pass` 且绑定实际 artifact SHA。
- [ ] `promote` 核对 manifest、输入指纹和磁盘 SHA 后原子写入 Current。

`approve` 前以上检查必须全部无 `fail` 并完成人工复核；`promote` 必须再次核对当前 4K artifact、manifest、输入指纹和磁盘 SHA。

## Release 与 Publish（尚未实现）

- [ ] release-build 明确绑定当前 4K Current SHA。
- [ ] 片头、正片、片尾、封面和平台文案来自 episode JSON 与课程固定资产。
- [ ] release audit 重新执行连续 2fps、包装边界 burst、关键帧和媒体 metrics。
- [ ] release approval 绑定 release candidate 的实际 SHA。
- [ ] Current 更新后旧 release verdict 与 Published 自动失效。
- [ ] publish 重新核对磁盘文件 SHA，再写入 `current/release/`。

这些命令实现并通过端到端验证前，不得建立手工 `current/`、`release/` 或 Dashboard 发布按钮。
