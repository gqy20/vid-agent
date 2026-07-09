# EP08：Reset、Revert、Restore

## 核心句

reset、revert、restore 都能“撤销”，但它们改的不是同一个东西：reset 移动引用并按模式更新三棵树，revert 新增反向提交，restore 恢复文件内容。

## 观众要带走的理解

- reset 主要是在移动 HEAD 所在的 branch，并可能更新 Index / Working Tree。
- `--soft`、默认 mixed、`--hard` 的差别是停在三棵树的不同位置。
- revert 不改旧历史，而是新增一个反向提交。
- restore 面向文件内容，常用于从 Index 或 HEAD 恢复文件。
- 共享历史里优先用 revert，本地整理时才考虑 reset。

## 镜头结构

1. 用同一个错误提交提出“撤销到底改什么”。
2. 复用 EP02 三栏状态板讲三棵树。
3. 分别展示 reset soft / mixed / hard 的停止点。
4. 展示 revert 生成新 commit，不移动旧历史。
5. 展示 restore 只影响文件层。
6. 用选择表总结三者边界。

## 制作目录

可执行制作脚本位于 [`episodes/ep08-reset-revert-restore/`](ep08-reset-revert-restore/README.md)。
