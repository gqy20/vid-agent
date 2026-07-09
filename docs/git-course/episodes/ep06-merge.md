# EP06：Merge 做了什么

## 核心句

merge 不是把两个文件夹粗暴拼在一起。Git 会看分叉点、当前分支和目标分支；能快进就移动指针，不能快进就做三方合并并生成 merge commit。

## 观众要带走的理解

- fast-forward merge 只是把当前分支指针向前移动。
- 真正分叉后，Git 会找共同祖先、当前分支末端和目标分支末端。
- merge commit 有两个 parent。
- 冲突表示 Git 无法自动决定同一位置的不同修改。

## 镜头结构

1. 用问题结构区分“合并内容”和“合并历史”。
2. 先讲 fast-forward：没有分歧，只移动指针。
3. 再讲三方合并：base / ours / theirs。
4. 用 Manim 展示三个快照如何形成新快照。
5. 用 merge commit 展示两个 parent。
6. 用冲突标记做最小边界，不展开高级冲突工具。

## 制作目录

可执行制作脚本位于 [`episodes/ep06-merge/`](ep06-merge/README.md)。
