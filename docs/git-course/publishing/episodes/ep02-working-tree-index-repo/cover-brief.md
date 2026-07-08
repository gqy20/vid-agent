# EP02 封面 Brief

## 目标

让观众在一秒内看懂本集问题：

```text
文件不是直接进入 commit；一次提交前，内容会经历工作区、暂存区、仓库三层。
```

## 主视觉

画面采用横向三层流程，对应 `git add` 和 `git commit` 两次移动：

- 左侧：工作区（Working Tree）—— 一个正在编辑的文件（README.md），其中一行用芥末黄高亮表示"刚改的一行"。
- 中间：暂存区（Index）—— 一个虚线 snapshot 盒，装着下次准备提交的内容。
- 右侧：仓库（Repository）—— C0 → C1 → C2 的提交链，main 指向最新的 C2，比左侧更稳定、更有秩序。
- 层与层之间用粗箭头连接，分别标注 `git add` 与 `git commit`。

## 文案层级

一级标题：

```text
文件不会直接进 commit
```

二级标题：

```text
先 add，再 commit
```

角标：

```text
看得见的 Git
EP.02 · three areas
```

## 视觉要求

- 三层容器用三种主题色区分：工作区墨绿、暂存区芥末黄、仓库青绿。
- 箭头必须标注 `git add` 与 `git commit`，把"两次移动"讲清楚。
- 右侧仓库的提交链要比左侧更稳定、更有秩序，传达"提交后状态被固定下来"。
- 标题大，移动端缩略图可读；不堆命令行截图，封面只讲一个流程。

## 候选标题

```text
Git 不是一步到位
```

```text
提交要过三道门
```

```text
add 和 commit 中间差了什么
```

## 推荐输出

```text
remotion/renders/git-course/ep02-working-tree-index-repo/renders/current/publishing/01_cover.png
```
