# EP02：工作区、暂存区、仓库

## 核心句

文件不是直接进入 commit；一次提交前，内容会经历工作区、暂存区和仓库三层。

## 观众要带走的理解

- Working Tree 是你正在编辑的文件。
- Index / Staging Area 保存下一次准备提交的内容。
- Repository 保存已经提交的历史。
- `git add` 更准确的意思是：把当前内容加入下一次提交。
- add 之后继续修改，同一个文件可能同时有已暂存和未暂存的变化。

## 镜头结构

1. 提问：`git add` 到底做了什么？
2. 建立 Working Tree / Index / Repository 三层。
3. 修改文件，只改变 Working Tree。
4. 执行 `git add`，当前内容进入 Index。
5. add 后继续修改，对比 Index v1 与 Working Tree v2。
6. 执行 `git commit`，Repository 得到新快照。
7. 收束：修改、暂存、提交。

## 制作目录

```text
docs/git-course/episodes/ep02-working-tree-index-repo/
```
