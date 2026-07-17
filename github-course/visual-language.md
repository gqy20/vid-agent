# GitHub Course 视觉语言

## 总体气质

保持 Git Course 的浅色中性画布、工程感和克制运动。GitHub 页面本身已经具有较高信息密度，因此课程壳不增加装饰性噪声、强渐变或持续缩放。

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
