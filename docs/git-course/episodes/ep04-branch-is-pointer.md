# EP04：Branch 只是一个指针

## 核心句

分支不是一份项目副本。分支只是一个名字，指向某个 commit。

## 观众要带走的理解

- `git branch feature` 创建的是一个指针。
- 新分支刚创建时，和当前分支指向同一个 commit。
- 切到 `feature` 后继续提交，移动的是 `feature` 指针。
- `main` 没有丢，也没有被复制；它只是停在原来的 commit。

## 镜头结构

1. 提问：为什么创建分支这么快？
2. 展示提交链：`C0 -> C1 -> C2`
3. `main` 指向 `C2`
4. 执行 `git branch feature`
5. `feature` 也指向 `C2`
6. 执行 `git switch feature` 和一次提交
7. `feature` 前进到 `C3`，`main` 停在 `C2`
8. 收束：branch 是可移动指针，不是项目副本。
