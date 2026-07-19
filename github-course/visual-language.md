# GitHub Course 视觉语言

## 总体气质

保持 Git Course 的浅色中性画布、工程感和克制运动。GitHub 页面本身已经具有较高信息密度，因此课程壳不增加装饰性噪声、强渐变或持续缩放。

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

- 真实操作：`BrowserFocusScene`，浏览器独占或近似独占。
- 观察结果：`BrowserEvidenceScene`，停止操作，只强调一个区域。
- 解释机制：`GitHubStateBridge`，按浏览器动作、平台状态、Git 状态三步展开。
- 设置说明：优先静态 poster 或截图，不用长时间录制鼠标寻找菜单。
- Git 状态变化：回到 GitGraph 或 Manim，不在 GitHub 页面上用装饰箭头代替提交图。

## 录制裁切

- 默认录制 viewport 为 1600×900，课程合成为 1920×1080、30fps。
- 裁切必须保留页面标题、当前仓库或关键导航上下文。
- 地址栏可以由课程壳稳定重建，不录制操作系统桌面、浏览器标签栏或个人书签。
- focus ring 一次只标记一个教学对象，并在模型接管前退出。

## 运动

- 鼠标先移动到目标，再点击，点击后等待页面反馈稳定。
- 页面加载、Checks 状态和合并结果按真实因果出现，不用假进度条替代。
- 高亮只进入一次，不循环 pulse。
- 从浏览器转到模型时保持对象对应，例如 `base: main`、`head: feature` 的标签位置和颜色连续。
