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
