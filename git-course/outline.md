# 课程大纲

## 第一季：Git 的对象和指针

1. [`ep01-what-git-stores`](episodes/ep01-what-git-stores.json)
   Git 到底记录什么：版本控制不是文件夹复制，而是提交历史。

2. [`ep02-working-tree-index-repo`](episodes/ep02-working-tree-index-repo.json)
   工作区、暂存区、仓库：一次 commit 前，文件经过哪三层。

3. [`ep03-commit-snapshot`](episodes/ep03-commit-snapshot.json)
   commit 不是保存按钮：快照、parent、hash 和 message。

4. [`ep04-branch-is-pointer`](episodes/ep04-branch-is-pointer.json)
   branch 只是一个指针：创建分支为什么几乎瞬间完成。

5. [`ep05-head`](episodes/ep05-head.json)
   HEAD 是什么：你当前站在哪个 branch 或 commit 上。

6. [`ep06-merge`](episodes/ep06-merge.json)
   merge 做了什么：两条历史如何合成一个新提交。

7. [`ep07-rebase`](episodes/ep07-rebase.json)
   rebase 做了什么：把一组修改重放到新的 base 上。

8. [`ep08-reset-revert-restore`](episodes/ep08-reset-revert-restore.json)
   reset、revert、restore：分别改变指针、新提交还是文件状态。

## 形式

每集通常 3–5 分钟。Remotion 负责课程节奏、终端、字幕、代码窗口和章节包装；Manim 只做抽象 Git 图形动画。
