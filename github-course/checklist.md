# GitHub Course 生产检查清单

本清单建立在 [`课程视频统一生产规范`](../docs/course-production.md) 之上。当前 orchestrator 只实现 1080p 内容 Candidate 与审查；4K、Current 和发布部分是后续实现的准入条件，不是可绕过的手工步骤。

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
- [ ] 人工审查记录绑定当前 visual/full Candidate SHA。

1080p approval 只允许进入 4K 重建，永远不能覆盖 `current/`。

## 4K 母版门禁（尚未实现）

- [ ] 4K browser profile、录制尺寸和 metadata 已进入指纹。
- [ ] 正式浏览器资产以 3840×2160 重新录制，未使用 1080p upscale。
- [ ] Remotion 以 3840×2160、30fps 重新渲染完整 Candidate。
- [ ] focus bounding box 已按 4K 录制重新采集。
- [ ] 针对 4K Candidate 重新执行全部视觉、边界、音频和敏感信息审查。
- [ ] 4K verdict 为 `pass` 且绑定实际 artifact SHA。
- [ ] `promote` 核对 manifest、输入指纹和磁盘 SHA 后原子写入 Current。

上述能力未进入 orchestrator 前，`approve`、`promote` 必须保持阻断。

## Release 与 Publish（尚未实现）

- [ ] release-build 明确绑定当前 4K Current SHA。
- [ ] 片头、正片、片尾、封面和平台文案来自 episode JSON 与课程固定资产。
- [ ] release audit 重新执行连续 2fps、包装边界 burst、关键帧和媒体 metrics。
- [ ] release approval 绑定 release candidate 的实际 SHA。
- [ ] Current 更新后旧 release verdict 与 Published 自动失效。
- [ ] publish 重新核对磁盘文件 SHA，再写入 `current/release/`。

这些命令实现并通过端到端验证前，不得建立手工 `current/`、`release/` 或 Dashboard 发布按钮。
