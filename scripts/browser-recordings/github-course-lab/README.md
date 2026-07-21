# github-course-lab

GitHub Course 的可重复浏览器录制入口。

它只负责生成浏览器证据资产，不负责课程时间线。episode JSON 声明需要哪条 recording，scenario 负责建立前置状态并执行真实操作，Remotion 负责裁切、标注和模型桥接。

## 环境

```bash
uv sync
uv run playwright install chromium
```

默认优先使用本机 Chrome channel，也可以通过 `--channel chromium` 使用 Playwright Chromium。

## Smoke test

无网络、无认证、无 GitHub 写操作：

```bash
uv run python scripts/browser-recordings/github-course-lab/record.py smoke
```

生成：

```text
remotion/public/github-course/browser/smoke.mp4
remotion/public/github-course/browser/smoke-poster.png
remotion/public/github-course/browser/smoke.json
```

这些文件是派生产物，默认被 Git 忽略。

## GH01 只读场景

`gh01-repository-layers` 打开 `github/docs` 公开仓库，只在 Code、Pull requests 和 Actions 之间移动与点击，不登录、不执行写操作：

```bash
uv run python scripts/browser-recordings/github-course-lab/record.py gh01-repository-layers
```

场景只依赖仓库级导航，不读取或断言会变化的 star、fork、issue、PR 或 commit 数量。
runner 会先完成页面准备，再按实际准备耗时裁掉网络加载段，只保留短 lead-in 和正式动作。

## 4K 录制

正式生产优先通过 GitHub Course orchestrator 录制，确保 episode JSON、录屏指纹和候选构建使用同一规格：

```bash
pnpm --dir remotion github-course browser-4k gh01-git-vs-github
```

需要单独调试录屏时，可以直接选择 `uhd30` profile：

```bash
uv run python scripts/browser-recordings/github-course-lab/record.py \
  gh01-repository-layers --profile uhd30
```

`uhd30` 使用 1600×900 教学视口和 2.4 device scale factor 原生捕获 3840×2160 画面，产物写入 `remotion/public/github-course/browser/uhd30/`。录制结束后会按 episode 中既有 1080p 证据的动作时长归一化时间线，避免编码负载改变讲解与操作的同步关系；不会对 1080p 画面做空间放大。

## 认证状态

真实 GitHub 场景只能使用专用测试账户或组织。storage state 放在：

```text
scripts/browser-recordings/github-course-lab/.auth/github.json
```

运行时显式传入：

```bash
uv run python scripts/browser-recordings/github-course-lab/record.py <scenario-id> \
  --storage-state scripts/browser-recordings/github-course-lab/.auth/github.json
```

`.auth/` 不得进入 `remotion/public/`、episode JSON、日志附件或版本控制。

## 新增 scenario

1. 在 `scenarios/` 新建模块，实现 `Scenario`。
2. 在 `scenarios/__init__.py` 注册稳定的 scenario id。
3. 在 episode JSON 的 `browserRecordings[]` 引用该 id。
4. 为写操作实现前置状态验证和 cleanup / fixture rebuild。
5. 录制后检查敏感信息、鼠标轨迹、页面加载抖动和最终状态。

正式场景不应依赖个人通知、随机推荐、相对时间或不受控的公共仓库状态。
