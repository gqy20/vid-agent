# EP03 封面 Brief

## 目标

让观众在一秒内看懂本集问题：

```text
commit 不是保存按钮，它是 Git 历史里的一个对象：指向项目快照，也指向过去的 parent。
```

## 主视觉

画面采用强冲突左右对照：

- 左侧：一个经典软盘保存图标，下方放一个"保存"按钮，配一张便签"按一下就完？"——代表被否定的误解。
- 右侧：一张 commit 对象卡片，像 schema 一样列出字段 `tree`、`parent`、`author`、`time`、`message`，并在 `tree` / `parent` 后注明"指向项目快照" / "指向上一个 commit"。
- 中间用大号 `≠` 表达：保存按钮不等于 commit 对象。

## 文案层级

一级标题：

```text
Commit 不是保存按钮
```

二级标题：

```text
它指向快照，也指向过去
```

角标：

```text
看得见的 Git
EP.03 · commit object
```

## 视觉要求

- 软盘要明确是"保存"语义，一眼认出。
- 右侧对象卡片要有结构感：字段对齐、`tree` 用青绿、`parent` 用番茄红区分，传达"commit 是有字段的对象"。
- 标题大，移动端缩略图可读；不堆命令行截图，封面只讲一个冲突。

## 候选标题

```text
commit 里到底有什么
```

```text
为什么 commit 不是保存
```

```text
一个 commit 装了什么
```

## 推荐输出

```text
remotion/renders/git-course/ep03-commit-snapshot/renders/current/publishing/01_cover.png
```
