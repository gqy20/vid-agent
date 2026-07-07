# EP03：Commit 不是保存按钮

## 核心句

commit 是 Git 历史里的对象：它指向项目快照，也指向过去的 parent。

## 观众要带走的理解

- commit 读取的是 Index，不是随手保存当前工作区。
- blob 保存文件内容，tree 保存目录结构，commit 指向 tree。
- commit 还记录 parent、作者、时间和 message。
- 普通 commit 通过 parent 指针连成历史。
- hash 是 commit 的身份，内容或元数据改变都会改变身份。

## 镜头结构

1. 提问：commit 为什么不是保存按钮？
2. 从 Index 收束成快照。
3. 展示 blob、tree、commit 的对象关系。
4. 展开 commit 字段：tree、parent、author、time、message。
5. 展示 C0、C1、C2 通过 parent 连成历史。
6. 用 hash 对比说明 commit 身份。
7. 收束：branch 将指向某个 commit。

## 制作目录

```text
docs/git-course/episodes/ep03-commit-snapshot/
```
