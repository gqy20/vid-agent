# EP04 B 站发布物料

## 标题

为什么 git branch 瞬间完成？因为它根本没复制

## 封面文字

主标题：

```text
Branch 不是项目副本
```

副标题：

```text
它只是一个指针
```

## 简介

很多人以为创建分支是复制一份项目，所以才不理解为什么 `git branch` 瞬间完成。

这一集用 `main` 和 `feature` 两个指针演示：创建分支只是写入一个名字，指向当前所在的 commit；切到 `feature` 后再提交，移动的是 `feature` 指针，`main` 停在原来的 commit，没有被复制，也没有丢。

理解了分支是指针，`switch`、`merge`、`rebase` 后面就都顺了。

## 你会学到

- `git branch` 创建的是一个指针，不是项目副本
- 新分支刚创建时，和当前分支指向同一个 commit
- 切到新分支后继续提交，移动的是哪个指针
- `main` 为什么停在原地，没有丢也没有被复制
- 为什么分支这么轻、这么快

## 时间轴

```text
00:00 branch 是什么
00:12 不是复制目录，是写入一个名字
00:30 命令顺序：branch / switch / commit
00:48 git branch feature = 写入 refs/heads/feature → C2
01:10 feature 出现，main 没有移动
01:38 HEAD 从 main 切到 feature
02:02 提交后 feature 前进到 C3，main 停在 C2
02:34 对比：刚创建 vs 提交后
02:48 收束：branch 是名字，名字会移动
```

## 适合谁

- 会用 `git branch`，但以为它是项目副本的人
- 不理解 `git switch` 到底改了什么的人
- 想搞清楚 main 会不会因为建分支而受影响的人

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

前三集讲了对象、三层状态和 commit，这一集讲分支其实只是一个指针。

把 main / feature / HEAD 这几个名字的关系理清，后面 merge 和 rebase 就有基础了。

## 置顶评论

这一集讲 branch 指针。前四集把 Git 的核心心智模型建立起来了：对象、三层状态、commit、分支指针。后面的集数会在这个模型上继续。
