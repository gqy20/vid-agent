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
| remote-tracking ref | 远程跟踪引用 | 位于本地仓库、由 fetch 等网络操作更新的远端 branch 状态记录，例如 `origin/main` |
| upstream | 上游引用 | 与本地 branch 配置关联的另一个 ref，常见为 remote-tracking ref；关联本身不会自动同步内容 |
| fetch | 抓取 | 从另一仓库取得所需对象和 refs，并按映射更新本地 remote-tracking refs；不自动移动当前本地 branch 或改写 Working Tree |
| pull | 拉取并整合 | 先 fetch，再按明确策略把选中的远端工作整合进当前 branch；课程命令必须显式使用 `--ff-only`、`--rebase` 或 `--no-rebase` |
| push | 推送 | 发送远端缺少的对象，并请求用本地对象更新指定远端 ref；请求可能被拒绝 |
| ahead / behind | 领先 / 落后 | 当前 branch 与本地 upstream ref 的可达提交数之差；数值只反映最近一次 fetch 后的本地认知 |
| non-fast-forward | 非快进更新 | ref 的新目标不是旧目标的后代；对远端 branch 的普通 push 默认拒绝这种可能绕开已有历史的更新 |
| unmerged entries | 未合并条目 | 冲突期间 Index 为同一路径保存的多阶段记录；merge 语境中 stage 1/2/3 分别对应 base、ours、theirs |
| stage 0 | 普通暂存条目 | Index 中可直接写入下一次提交的单一结果；解决冲突后 `git add` 会用它替换多阶段未合并条目 |
| reflog | 引用日志 | 当前本地仓库中 ref 与 HEAD 旧位置的更新记录；可用于定位旧对象，但会过期，也不是永久备份 |
