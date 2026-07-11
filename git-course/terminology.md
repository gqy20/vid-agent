# 术语表

| English | 中文课内用词 | 说明 |
| --- | --- | --- |
| working tree | 工作区 | 当前目录里真实可编辑的文件状态 |
| index / staging area | 暂存区 | 下一次 commit 的装配区 |
| repository | 仓库 | `.git` 中存储对象和引用的地方 |
| commit | 提交 | 指向一个快照，并记录父提交等元数据 |
| branch | 分支指针 | 一个名字，指向某个 commit |
| HEAD | HEAD | 当前所在位置；通常指向当前分支 |
| merge | 合并 | 把两条历史连接起来，常见结果是合并提交 |
| rebase | 变基 | 把一组提交复制到新的 base 上 |
| reset | 重置 | 移动当前分支指针，并可影响暂存区/工作区 |
| revert | 反做提交 | 新建一个提交来抵消旧提交 |
