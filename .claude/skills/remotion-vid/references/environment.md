# 环境与排错

## pnpm 工作流(这里支持的工作流)

```bash
pnpm install
pnpm exec remotion studio              # 本地实时预览 localhost:3000
pnpm exec remotion render <CompId> out.mp4 --concurrency=4
pnpm exec remotion still <CompId> f.png --frame=N
```

- Node ≥ 18。React 19 + remotion 4.x 兼容。
- pnpm 默认拦截依赖的构建脚本。esbuild 的脚本被忽略也无妨;Remotion 自带 esbuild。

## 头号坑:Chrome Headless Shell 下载

**首次渲染**时,Remotion 会从 `remotion.media` 下载自带的 Chrome Headless Shell
(约 150 MB)。慢网/不稳网络下它会**无任何输出地卡住**——看起来像渲染冻结了。这
**不是**"缺 chromium"的报错;无论系统是否装了 Chrome,Remotion 都会下自己的。

**修法——渲染前让 Remotion 用系统已装的 Chrome:**

```ts
// remotion.config.ts
import {Config} from '@remotion/cli/config';
Config.setBrowserExecutable('/opt/google/chrome/chrome');
```

找到二进制并确认能跑(或直接 `scripts/check-env.sh` 一键探测 + 打印建议配置行):

```bash
scripts/check-env.sh        # 探测 Chrome 路径、字体、工具链
```

系统 Chrome 与 Remotion 目标版本相差 1~2 个大版本以内即可。逐次渲染的替代写法:
`--browser-executable=/opt/google/chrome/chrome`。

## 字体:本地优先于运行时 Google Fonts

`@remotion/google-fonts` 会在**渲染时**从网络拉字体文件——同样有慢网卡死风险。
优先用机器上已装的字体。

```bash
fc-list :lang=zh family | sort -u            # 中文字族(思源黑体 = Noto Sans CJK SC)
fc-list :spacing=mono family | sort -u       # 等宽字族
fc-list | grep -iE "inter|jetbrains|fira|noto sans cjk"
```

在 CSS 里按字族名引用——Chrome 用第一个含该字形的字族,所以把拉丁字体放前、中文
放后:

```ts
const MONO = '"JetBrainsMono Nerd Font", "Noto Sans Mono CJK SC", ui-monospace, monospace';
const SANS = '"Noto Sans CJK SC", "JetBrainsMono Nerd Font", system-ui, sans-serif';
```

仅当网络可靠时才用 `@remotion/google-fonts`;它类型安全,且会阻塞渲染直到字体就绪。

## 校验产物

```bash
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,duration,nb_frames -of default=noprint_wrappers=1 out.mp4
```

## 排错表

| 现象 | 原因 / 修法 |
|---|---|
| 首次渲染打印下载 URL 后停住 | Chrome Headless Shell 在下载 —— 设 `setBrowserExecutable` |
| 渲染卡在某用字体的帧 | google-fonts 联网拉取 —— 改用 `fc-list` 本地字体 |
| 中文渲染成豆腐块 | 字体栈里没有中文字族;加 `Noto Sans CJK SC` |
| `Cannot find module @remotion/...` | `pnpm add @remotion/<pkg>`(transitions、media-utils 等) |
| 后台渲染任务输出 0 字节 | 它根本没开始渲 —— 还卡在下载 Chrome |
