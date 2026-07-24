# GitHub Course 视觉语言

## 总体气质

保持浅色中性画布、工程感和克制运动。GitHub 页面本身已经具有较高信息密度，因此课程壳不增加装饰性噪声、强渐变或持续缩放。

课程壳采用“编辑式纸面 + 真实产品证据”的方向：课程解释层使用略带温度的纸白，浏览器证据层保持 GitHub 自己的冷白界面。两者依靠明度、边框和留白区分，不靠大面积彩色背景区分。

## Awwwards 调研结论

本规范参考的不是 Awwwards 上高饱和、强 3D 或以运动为主体的案例，而是适合技术教学的极简与排版类案例：

- [kurzform.®](https://www.awwwards.com/sites/kurzform-r-design-brandingstudio) 使用 `#0a0a0a / #fafafa`，说明极简页面可以主要依靠字体层级与留白建立结构。
- [Park](https://www.awwwards.com/sites/park) 使用 `#111111 / #ffffff`，适合作为“正文先读、装饰退后”的排版参考。
- [Electronic Materials Office](https://www.awwwards.com/sites/electronic-materials-office) 使用黑、白与单一橙色强调，适合作为技术主题中“一个身份色足够”的参考。
- [CMO Paris](https://www.awwwards.com/sites/cmo-paris) 使用黑色与低饱和棕色，说明强调色不必高亮铺满画面，也可以只承担品牌识别。

GitHub Course 不直接复制这些站点的配色。可复用的结论只有三点：大面积使用中性色、彩色只承担明确角色、视觉层级主要由字号和留白建立。GitHub 的平台状态已经有完整语义，因此课程不再增加一套装饰性“品牌彩色”。

平台色的命名与用途继续对齐 [GitHub Primer 的颜色使用规范](https://primer.style/product/getting-started/foundations/color-usage/) 和 [Primer 当前颜色 token](https://primer.style/product/primitives/color/)；Awwwards 参考只决定课程壳的视觉气质，不覆盖 GitHub 的产品语义。

## Token 入口

后续分集不得在 episode 内重新定义全局色板、字号或间距：

- 色彩：`remotion/src/videos/github-course/palette.ts`
- 字体与字号：`remotion/src/videos/github-course/typography.ts`
- 间距、圆角与安全边距：`remotion/src/videos/github-course/spacing.ts`

真实 GitHub 浏览器 UI、Git/GitHub Logo 原色和 macOS 浏览器红黄绿控制点属于忠实还原例外；课程解释层的硬编码颜色不属于例外。

## 课程中性色

| Token | 数值 | 用途 |
| --- | --- | --- |
| `canvas.base` | `#f7f7f5` | 课程解释画布，略暖，和浏览器冷白拉开层级 |
| `canvas.soft` | `#f0f1ef` | 次级解释区域，不用于大面积状态强调 |
| `canvas.raised` | `#ffffff` | 卡片、模型节点和字幕底 |
| `text.primary` | `#191c20` | 标题与主要结论 |
| `text.secondary` | `#515963` | 正文解释与辅助信息 |
| `text.tertiary` | `#7a8490` | 低权重元信息，不承载关键结论 |
| `stroke.soft` | `#e1e3e5` | 分隔线和轻边框 |
| `stroke.default` | `#d1d5da` | 卡片与浏览器壳边界 |
| `stroke.strong` | `#77818d` | 箭头、连接关系和必要的结构强调 |

阴影只用于把白色实体从纸面画布中分开，不能制造悬浮卡片墙。课程背景保持纯色，不使用径向光斑、科技渐变或点阵纹理。

`text.primary` 与 `text.secondary` 在课程纸白和白色卡片上均满足正文对比度；action、open、merged、pending、failed 等状态前景色也都按至少约 `4.5:1` 控制。`text.tertiary` 只允许用于不影响理解的元信息，不用于正文、字幕和关键状态。

## 字体与字号

英文必须先命中 Inter，中文再回退到 Noto Sans CJK SC：

- 大标题：Inter Display SemiBold 600 → Noto Sans CJK SC Medium 500。
- 正文：Inter Regular 400 → Noto Sans CJK SC Regular 400。
- 字幕：Noto Sans CJK SC Medium 500，不使用 Bold 700。
- UI 标签：Inter Medium 500。
- 代码：JetBrains Mono 400；只在真实需要强调的代码片段使用 700。

1080p 正片固定使用下面的字号阶梯。字号只允许通过 `TYPE` 角色调用，不在 episode 内随意写相近数字：

| 角色 | 字号 / 行高 / 字重 | 使用边界 |
| --- | --- | --- |
| `display` | `96 / 1.04 / 600` | 每个 scene 最多一个主命题或品牌落版 |
| `hero` | `64 / 1.10 / 600` | 全宽章节标题、核心对比结论 |
| `title` | `48 / 1.16 / 600` | 页面或主要模型标题 |
| `section` | `36 / 1.22 / 600` | 卡片标题、模型节点标题 |
| `subtitle` | `36 / 1.40 / 500` | 与旁白同步的中文字幕 |
| `body` | `30 / 1.50 / 400` | 正文解释与较长中文句子 |
| `ui` | `24 / 1.36 / 500` | UI 标签、次级结论 |
| `uiSmall` | `20 / 1.32 / 500` | eyebrow、元信息、短标签 |
| `code` | `24 / 1.45 / 400` | 命令、ref、对象名和短代码 |

浏览器录屏中的产品 UI 保留录制时真实字号；课程重建的地址栏和浏览器 chrome 可以使用 13–16px，因为它们只负责忠实呈现浏览器，不属于教学正文。

## 间距与密度

基础间距阶梯为 `8 / 12 / 16 / 24 / 32 / 48 / 64 / 80 / 96`。默认使用规则：

- 标签到标题：`16–24px`。
- 标题到正文：`24–32px`。
- 卡片内边距：最少 `32px`；长正文或主模型使用 `36–48px`。
- 同组卡片间距：最少 `30px`；两张主对比卡使用 `40–48px`。
- 1920×1080 课程安全边距：左右 `72px`。
- 字幕使用独立底部轨道：轨道从 `y=920px` 开始，底边 `58px`，最大宽度 `1460px`。
- 字幕不使用边框、白底、圆角或阴影。它直接落在课程纸白画布上，不覆盖浏览器、模型或卡片。
- 字幕最多两行，每行建议 `28–34` 个中文等宽字符，硬上限按 `38` 个中文等宽字符计算；中英混排由 audit 折算字宽。
- 单个 SRT cue 超过 `76` 个中文等宽字符容量时必须拆句。不得使用 CSS 截断、缩小字号或让第三行侵入主视觉。
- 有字幕的 scene 必须把 `y=920–1022px` 视为字幕专属区域，其他教学元素不得进入。
- 完整判断句只由旁白和同步字幕承担。画面模型保留对象名、命令、状态、数字和关系，不得在当前或即将出现的 SRT cue 之外再写一遍同义结论。

圆角只使用 `8px` 小圆角、`12px` 面板圆角和完整胶囊三档。卡片不因为层级不同不断增加新圆角。

## 系列品牌片头与片尾

GitHub Course 的系列品牌核心是 GitHub 自身的协作系统，不是“Git 与 GitHub 有什么区别”。职责边界只属于 GH01 正文，不能提升为全课程片头片尾的品牌命题。

全局片头与片尾使用独立 Remotion composition，不绑定任何分集：

- 片头先让 Issue、Contributor、Fork、Review、Actions、Merge 等平台信号在全画布汇聚成 Pull Request，再展开为 GitHub repository；Pull Request 沿 Review、Checks、Merge 的可读轨道完成协作闭环，Merge 核心最终变形成 GitHub 标志并收束为“看得见的 GitHub”。
- repository 只保留平台身份、一条图标化平台导航与一张会变化的协作状态面；不缩小复刻完整页面，不同时陈列文件列表和多张解释卡。
- 平台导航只让 `Pull requests` 显示文字和 action 蓝激活线；Code、Issues、Actions 只作为低权重符号提供 GitHub 上下文。
- Watch、Fork、Star 只作为无文字的 GitHub 界面符号进入仓库顶栏，不显示虚构计数，也不承担正文信息。
- 片尾使用反向语法：分散的平台节点组成协作网络，信号流入 Pull Request 核心，再依次变成 Merge 和 GitHub 标志，最后归位到统一品牌 lockup。
- Git 提交线只允许作为 repository 内部的低权重结构出现，不和 GitHub 并列成为第二主角。
- 片头片尾不使用真实浏览器录屏，不依赖会随 GitHub 页面改版的具体布局。
- 全局片尾不放下集预告、订阅 CTA、本集 bullet 总结或终端。

最终 lockup 只使用一枚 GitHub mark。`GitHub` 保持为连续单词，正常显示 `GitHu`，最后一个小写 `b` 使用定制字形：竖笔和圆腹保持清晰，GitHub mark 收进圆腹的白色字腔中，使 Logo 成为字形细节而不是单词分隔符。“看得见的”与 GitHub 使用同一条视觉基线，不再形成上下两层标题：

```text
看得见的  GitHu [b / GitHub mark]
          repo · pr · actions
```

品牌落版阶段只能保留这一套主视觉；前一阶段的 repository、状态卡和连线必须完全退出。

## GitHub 品牌与界面色

品牌基底参考 GitHub Logo 与浅色界面，而不是沿用 Git Course 的 Git 语义色作为主品牌色：

- `logo`：GitHub mark 与最终标题使用接近 Logo 的深黑。
- `canvas / surface / border`：使用 GitHub 浅色界面的冷白、白色和中性灰。
- `action`：蓝色只表示当前交互、链接、焦点或正在推进的动作。
- `open / approved / pending / failed / merged`：只在对应平台状态真实出现时使用。
- `main / feature / HEAD / commit`：继续保留 Git Course 语义，但只用于解释底层 Git 状态。

不把 action 蓝当作所有 GitHub 文字的默认品牌色，也不把 open 绿、merged 紫或 failed 红作为装饰色铺满画面。

## 三套语义不得混用

### Git 状态

- `main`：主线 ref。
- `feature`：topic branch。
- `HEAD`：当前 Git 位置。
- `commit`：提交对象。

这些颜色沿用 Git Course，不能拿来表达 Review、Checks 或平台按钮。

### GitHub 平台状态

- `action`：浏览器中的当前平台动作。
- `open`：开放中的 Issue / Pull Request。
- `approved`：Review 或检查通过。
- `changesRequested`：需要修改。
- `merged`：Pull Request 已合并。
- `pending`：检查或部署等待中。
- `failed`：检查、部署或规则失败。

平台状态色只说明 GitHub 状态，不直接表示 Git refs 已经变化。例如 Checks 通过只表示平台允许继续，不能把 `main` 提前画到合并后的 commit。

### 浏览器录制

浏览器 chrome 使用中性灰；地址栏、鼠标和一次性 focus ring 服务定位。不要用 GitHub 平台状态色给整个浏览器边框染色。

## 布局语法

- 正文 scene 默认不显示永久课程顶栏或高亮进度条。课程名与 episode 标题只在单集标题卡或品牌包装中出现；真实浏览器和核心模型不再被一层应用式 chrome 长期包围。
- 观点镜头使用大字号与一个核心对比关系；证据镜头让真实浏览器近似独占；机制镜头让对象沿关系线发生状态变化；总结镜头复用本集已经建立的模型，不重新生成一组总结卡片。
- 卡片只用于真实容器语义，例如 repository、Pull Request、Issue、文件或 commit。普通标题、解释和三步因果不得因为排版方便自动套白色面板。
- 左右或三栏结构必须共同组成一个比较或因果模型，不能把每一栏做成彼此竞争的独立主视觉。空白用于建立层级，不用装饰元素填满。
- 真实操作：`BrowserFocusScene`，浏览器独占或近似独占。
- 观察结果：`BrowserEvidenceScene`，停止操作，只强调一个区域。
- 解释机制：`GitHubStateBridge`，按浏览器动作、平台状态、Git 状态三步展开。
- 设置说明：优先静态 poster 或截图，不用长时间录制鼠标寻找菜单。
- Git 状态变化：回到 GitGraph 或 Manim，不在 GitHub 页面上用装饰箭头代替提交图。

## 录制裁切

- 默认录制 viewport 为 1600×900，课程合成为 1920×1080、30fps。
- 1080p 浏览器证据窗固定为 `1600×800`，位于 `x=160px、y=96px`，底部在 `y=896px`；其下方只属于字幕轨道。
- 浏览器录制保持 1600px 教学宽度，按顶部对齐裁掉页面底部低价值内容。不得为了给字幕让位而继续整体缩小真实 UI。
- 视频、poster 与 metadata focus region 必须共享同一个 1600×900 内层坐标系，再由外层证据窗裁切；禁止裁切后直接按新高度重算高亮百分比。
- 裁切必须保留页面标题、当前仓库或关键导航上下文。
- 如果教学目标位于被裁掉的页面底部，应调整录制滚动位置或为该目标定义局部 focus crop，不能让字幕覆盖证据。
- 地址栏可以由课程壳稳定重建，不录制操作系统桌面、浏览器标签栏或个人书签。
- focus ring 一次只标记一个教学对象，并在模型接管前退出。

## 运动

- 课程动作统一分为 `reveal → focus → transfer → settle`。标题和普通解释使用 12–20 帧 Bézier；只有对象确实在层级之间迁移或归位时才使用高阻尼 spring，禁止无意义弹跳。
- 因果关系按时间展开：先出现动作，再推进平台状态，最后说明 Git 状态。不要让三层同时淡入后只靠箭头暗示关系。
- 高密度浏览器退出时使用短淡出、轻微缩放或硬切，不得把完整页面快速缩成装饰性缩略图，也不与完整模型长时间 crossfade。
- 浏览器聚焦缩放通常限制在 `1.0 → 1.025`；超过这一范围必须有明确的裁切或对象迁移理由。
- 鼠标先移动到目标，再点击，点击后等待页面反馈稳定。
- 页面加载、Checks 状态和合并结果按真实因果出现，不用假进度条替代。
- 高亮只进入一次，不循环 pulse。
- 从浏览器转到模型时保持对象对应，例如 `base: main`、`head: feature` 的标签位置和颜色连续。
