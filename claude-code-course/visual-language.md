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
| `TYPE.code` | `JetBrains Mono` | 26 / 1.45 / 400 | 命令、变量、模型 ID |
| `TYPE.codeSmall` | `JetBrains Mono` | 21 / 1.40 / 400 | 终端标题、辅助代码 |
| `TYPE.subtitle` | `Noto Sans CJK SC` | 38 / 1.34 / 700 | 与旁白同步的字幕 |

规则：

- 大标题用衬线建立编辑感；scene 标题、正文和字幕全部使用无衬线，确保视频压缩后的中文清晰度。
- 代码、路径、模型 ID 和环境变量只用等宽字体；中文解释不得为了“工程感”改用等宽字体。
- 只使用 400 和 700 两种实际存在的字重，不伪造 500、600 或 900。
- 不使用负字距。字幕最大宽度为 1480px，允许按完整语义句换行，但技术 token 不得从中间断开。
- episode 组件不得自定义新的 font-family；字号确有特殊版式需求时，先补充课程级语义 token。

## 布局与组件

- Claude Code Course 使用自己的 `CourseLayout`、`TerminalPanel` 和进度组件，不从 Git Course 借用颜色或品牌壳。
- 真实截图保持原始内容，只加 1px 中性描边和克制阴影，不叠加标注文字。
- 终端使用暖黑层级，只在真实操作或结果证据场景出现；终端底部必须保留足够空间显示完整输出。
- 字幕无黑色底框。浅色画布使用暖黑文字与轻文字阴影；深色画面使用暖白文字，但不得遮挡终端结果。
- 顶部课程栏只负责定位，不添加 `Takeaway`、`Overview` 等装饰性英文 eyebrow。
