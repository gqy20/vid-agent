# Git Course Review Workbench

面向大屏审查和阶段推进的本地工作台。分集、Scene、版本、检查证据和运行日志集中在一个固定视口内。

## 启动

```bash
pnpm --dir tools/git-course-dashboard install
pnpm --dir tools/git-course-dashboard dev
```

本机浏览器打开 `http://127.0.0.1:4178`；局域网设备打开 `http://<运行机器的局域网 IP>:4178`。Vite 开发服务使用 4178，生产 API 使用 4179。

生产方式：

```bash
pnpm --dir tools/git-course-dashboard build
pnpm --dir tools/git-course-dashboard start
```

生产服务默认监听 `0.0.0.0:4178`，启动日志会列出可用的局域网地址。可通过 `GIT_COURSE_DASHBOARD_HOST` 和 `GIT_COURSE_DASHBOARD_PORT` 覆盖。

工作台不使用登录或访问令牌。

## 可执行操作

- 状态通过 `remotion/scripts/git-course-cli.mjs status` 读取。
- 页面可以执行 `preview`、`build`、`approve`、`promote`、`release-build`、`release-audit`、`release-approve` 和 `publish`。
- 所有操作都通过 `pnpm --dir remotion git-course ...` 进入既有 orchestrator；运行日志在右侧 Runs 面板显示。

界面按 1480px 以上的大屏固定工作台设计。浏览器页面和中央审查区不做纵向滚动，分集、Scene、版本、Audit 与 Runs 通过点击原位切换；只有内容超长的队列、检查项和日志允许在各自面板内局部滚动。Scene 列表支持 `J` / `K` 快捷切换；Scene Preview 缺失时会回退到现有成片并跳至该 Scene 的进入时间。播放器控制条固定在画面上方，不覆盖字幕和课程自身的底部进度线。完整 HTML 审查报告在当前工作台覆盖层中打开。

## 校验

```bash
pnpm --dir tools/git-course-dashboard check
```
