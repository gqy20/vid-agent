# EP03 B 站发布物料

## 标题

commit 不是保存按钮，它里面到底装了什么

## 封面文字

主标题：

```text
Commit 不是保存按钮
```

副标题：

```text
它指向快照，也指向过去
```

## 简介

很多人把 `git commit` 当成保存键，按一下就完事。

这一集把 commit 拆开给你看：它其实是 Git 里的一个对象——用 `tree` 指向项目快照，用 `parent` 指向上一个 commit，还记录作者、时间和 message。每个 commit 都有一个 hash 作为身份，内容或元数据一改，身份就变了。

理解了 commit 是对象，下一集讲 branch 指向某个 commit 时，就不会再把分支当成项目副本。

## 你会学到

- commit 指向一棵 tree（项目快照）
- commit 指向一个 parent（上一个 commit）
- blob / tree / commit 三种对象的关系
- hash 为什么是 commit 的身份
- 为什么改了 message，commit 的 hash 就变了

## 时间轴

```text
00:00 commit 不是保存按钮
00:12 commit 从暂存区读取
00:38 blob / tree / commit 的对象关系
01:14 tree / parent / author / time / message 字段
01:44 commit 通过 parent 连成历史
02:12 hash 是 commit 的身份
02:38 收束：branch 将指向某个 commit
```

## 适合谁

- 会 `git commit`，但不知道它里面有什么的人
- 听过 blob / tree / commit 但没串起来的人
- 想理解 hash 到底在校验什么的人

## 标签

```text
Git
Git教程
版本控制
编程基础
计算机基础
程序员
开发工具
源码管理
```

## 动态文案

上一集讲了三层状态，这一集拆开 commit 这个对象，看它到底装了什么。

把 tree、parent、hash 这些字段摆清楚，下一集讲 branch 就顺了。

## 置顶评论

这一集讲 commit 对象。下一集讲 branch 其实只是一个指向 commit 的指针。
