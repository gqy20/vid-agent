# EP07：Rebase 做了什么

## 核心句

rebase 不是把分支“挪过去”。它会找出当前分支独有的提交，把这些修改按顺序在新的 base 上重新播放，生成新的 commit 身份。

## 观众要带走的理解

- rebase 的主动作是 replay，不是 merge。
- 变基后快照结果可以和 merge 一样，但历史形状不同。
- 被 replay 的 commit 会变成新 commit，hash 会变。
- 已经共享给别人的提交不要随便 rebase。

## 镜头结构

1. 用分叉历史提出：为什么有人想要一条直线历史。
2. 对比 merge 和 rebase 的结果形状。
3. 用 Manim 展示 find base、提取 patch、逐个 replay。
4. 展示 `C4` 变成 `C4'`，强调身份改变。
5. 展示 rebase 后 main 可以 fast-forward。
6. 用公开历史风险做安全边界。

## 制作目录

可执行制作脚本位于 [`episodes/ep07-rebase/`](ep07-rebase/README.md)。
