# EP05：HEAD 是什么

## 核心句

HEAD 不是一个神秘版本号。通常情况下，HEAD 是一个符号引用，指向你当前所在的本地分支；当前分支再指向某个 commit。

## 观众要带走的理解

- HEAD 表示“我现在站在哪里”。
- 大多数时候 HEAD 指向 branch，不直接指向 commit。
- `git switch` 改变 HEAD 指向哪个 branch。
- `git commit` 会让 HEAD 所在的 branch 前进。
- detached HEAD 是 HEAD 直接指向 commit 的特殊状态。

## 镜头结构

1. 用居中问题结构抛出 `HEAD -> main -> C2`。
2. 用 `.git/HEAD` 文件建立“符号引用”模型。
3. 用 `git switch feature` 展示 HEAD 改指向。
4. 用一次 commit 展示“当前分支前进”。
5. 用 detached HEAD 做边界说明，不展开救援流程。
6. 用极简总结收束：HEAD 是当前位置，不是另一个 branch。

## 制作目录

可执行制作脚本位于 [`episodes/ep05-head/`](ep05-head/README.md)。
