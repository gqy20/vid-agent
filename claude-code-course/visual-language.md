# Claude Code Course 视觉语言

## 方向

课程采用“官方 UI 原生型”：暖白纸面、暖黑文字、克制描边和单一主强调色。参考 Claude 官方界面的色彩关系，但课程拥有独立 token，不复制或依赖官方商业字体，也不与 Git Course 共用语义色。

画面配比：70–80% 暖白与白色结构面，15–20% 暖黑终端或深色证据面，不超过 5% 的强调色。一个 scene 只设一个主要焦点；蓝、绿、黄、红只在确有信息、成功、提醒或错误语义时出现。

参考来源：

- Claude UI design guidelines: <https://claude.com/docs/connectors/building/mcp-apps/design-guidelines>
- Anthropic brand example: <https://claude.com/blog/how-to-create-skills-key-steps-limitations-and-examples>

## 色彩 token

结构色直接采用官方 UI 的中性层级：

| Token | 值 | 用途 |
|---|---:|---|
| `canvas.paper` | `#FAF9F5` | 默认课程画布 |
| `canvas.soft` | `#F5F4ED` | 次级分组、代码值背景 |
| `canvas.raised` | `#FFFFFF` | 卡片与截图容器 |
| `canvas.inverse` | `#141413` | 深色反转画布 |
| `canvas.darkPanel` | `#262624` | 终端主体 |
| `canvas.darkRaised` | `#30302E` | 终端标题栏 |
| `text.primary` | `#141413` | 标题与核心正文 |
| `text.secondary` | `#3D3D3A` | 解释文本 |
| `text.tertiary` | `#73726C` | 次要标签，最低正文对比层 |
| `text.inverse` | `#FAF9F5` | 深色面主文字 |
| `text.inverseMuted` | `#C2C0B6` | 深色面次要文字 |

品牌色只做焦点，不承担浅色画布上的小字号正文：

| Token | 值 | 用途 |
|---|---:|---|
| `brand.orange` | `#D97757` | Claude、当前焦点、进度线 |
| `brand.blue` | `#6A9BCC` | 外部服务或网络信息的装饰层 |
| `brand.green` | `#788C5D` | 验证成功的装饰层 |
| `text.brand` | `#9C4F37` | 需要橙色语义的小字号文字 |
| `text.info` | `#3266AD` | 信息文字与服务渠道 |
| `text.success` | `#265B19` | 成功结论 |
| `text.warning` | `#5A4815` | 凭据和风险提醒 |
| `text.danger` | `#7F2C28` | 错误与失败 |

`brand.orange` 在纸白背景上不用于小字；需要文字时使用对比度更高的 `text.brand`，或使用暖黑文字配橙色底。禁止默认紫蓝霓虹渐变、发光 blob、装饰性噪声和多色卡片墙。

## 字体 token

字体只使用本机可验证的开放或系统字族，不下载、不声明官方商业字体：

| 角色 | 字族 | 1080p 基准 | 用途 |
|---|---|---:|---|
| `TYPE.display` | `Noto Serif CJK SC` | 82 / 1.10 / 700 | 单集标题、重要收束句 |
| `TYPE.heading` | `Noto Sans CJK SC` | 52 / 1.18 / 700 | scene 主标题 |
| `TYPE.subheading` | `Noto Sans CJK SC` | 38 / 1.34 / 700 | 卡片标题、二级判断 |
| `TYPE.body` | `Noto Sans CJK SC` | 28 / 1.48 / 400 | 解释正文 |
| `TYPE.label` | `Noto Sans CJK SC` | 24 / 1.40 / 700 | UI 标签、短结论 |
| `TYPE.labelSmall` | `Noto Sans CJK SC` | 20 / 1.32 / 700 | 进度、元信息 |
| `TYPE.chrome` | `Noto Sans CJK SC` | 19 / 1.25 / 400 | 顶栏课程名与当前章节 |
| `TYPE.chromeIndex` | `JetBrains Mono` | 18 / 1.20 / 400 | 顶栏章节序号，使用等宽数字 |
| `TYPE.chromeStrong` | `Noto Sans CJK SC` | 20 / 1.25 / 700 | 顶栏唯一强层级：单集标题 |
| `TYPE.code` | `JetBrains Mono` | 26 / 1.45 / 400 | 命令、变量、模型 ID |
| `TYPE.codeSmall` | `JetBrains Mono` | 21 / 1.40 / 400 | 终端标题、辅助代码 |
| `TYPE.subtitle` | `Noto Sans CJK SC` | 34 / 1.38 / 700 | 与旁白同步的字幕 |

规则：

- 大标题用衬线建立编辑感；scene 标题、正文和字幕全部使用无衬线，确保视频压缩后的中文清晰度。
- 代码、路径、模型 ID 和环境变量只用等宽字体；中文解释不得为了“工程感”改用等宽字体。
- 只使用 400 和 700 两种实际存在的字重，不伪造 500、600 或 900。
- 顶栏是定位信息而不是内容标题：课程名、章节序号和当前章节使用 400，仅右侧单集标题使用 700；不得回退成三个区域全部加粗。
- 不使用负字距。字幕最大宽度为 1480px，每条 cue 显式派生为一到两行；每行使用保守的 40 个混合脚本宽度单位，技术 token 不得从中间断开。渲染禁止再次自动换行，超过两行或宽度预算时 audit 必须失败，不能截断文字。
- episode 组件不得自定义新的 font-family；字号确有特殊版式需求时，先补充课程级语义 token。

## 布局与组件

- Claude Code Course 使用自己的 `CourseLayout`、`TerminalPanel` 和进度组件，不从 Git Course 借用颜色或品牌壳。
- 真实截图保持原始内容，只加 1px 中性描边和克制阴影，不叠加标注文字。
- 终端使用暖黑层级，只在真实操作或结果证据场景出现；终端底部必须保留足够空间显示完整输出。
- 字幕无黑色底框。浅色画布使用暖黑文字与轻文字阴影；深色画面使用暖白文字，但不得遮挡终端结果。
- 顶部课程栏只负责定位，不添加 `Takeaway`、`Overview` 等装饰性英文 eyebrow。

## Surface 与 Frame token

抽象教学信息默认使用编辑式排版，不模拟应用卡片：

| Token | 用途 |
|---|---|
| `SURFACE.editorial` | 关系、步骤、变量和结论；透明、无边框、无阴影 |
| `SURFACE.code` | JSON、命令和配置值形成的单一浅色代码平面 |
| `SURFACE.evidence` | 真实截图与终端证据；唯一允许完整描边和阴影的层级 |
| `FRAME.hairline` | 分组与对齐使用的低对比细线 |
| `FRAME.focusRail` | 当前焦点使用的 4px 局部语义短线，不围绕整个对象 |

每个 scene 最多保留一个完整证据容器和一个主要焦点。抽象对象禁止同时使用白底、完整描边、圆角和阴影；禁止卡片套卡片。语义色只用于短线、状态点、关键词或低透明度横向高亮，不沿整个轮廓铺开。
