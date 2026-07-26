# 课程大纲

## 第一季：Git 的对象和指针

1. [`ep01-what-git-stores`](episodes/ep01-what-git-stores.json)
   Git 到底记录什么：版本控制不是文件夹复制，而是提交历史。

2. [`ep02-working-tree-index-repo`](episodes/ep02-working-tree-index-repo.json)
   工作区、暂存区、仓库：一次 commit 前，文件经过哪三层。

3. [`ep03-commit-snapshot`](episodes/ep03-commit-snapshot.json)
   commit 不是保存按钮：快照、parent、hash 和 message。

4. [`ep04-branch-is-pointer`](episodes/ep04-branch-is-pointer.json)
   branch 只是一个指针：创建分支为什么几乎瞬间完成。

5. [`ep05-head`](episodes/ep05-head.json)
   HEAD 是什么：你当前站在哪个 branch 或 commit 上。

6. [`ep06-merge`](episodes/ep06-merge.json)
   merge 做了什么：两条历史如何合成一个新提交。

7. [`ep07-rebase`](episodes/ep07-rebase.json)
   rebase 做了什么：把一组修改重放到新的 base 上。

8. [`ep08-reset-revert-restore`](episodes/ep08-reset-revert-restore.json)
   reset、revert、restore：分别改变指针、新提交还是文件状态。

## 第二季：读懂历史与远程协作（规划）

第二季从本地对象模型进入日常协作。前半段解决“正在比较、选择和命名哪个状态”，后半段解决“本地与远端引用如何同步、分叉和恢复”。

9. `ep09-diff-compares-states`
   diff 到底在比较什么：明确区分 Working Tree、Index、HEAD 和两个 commit 之间的比较。

10. [`ep10-selecting-revisions`](episodes/ep10-selecting-revisions.json)
    如何定位一个 commit：使用 log、短 hash、ref、祖先引用和提交区间选中历史。

11. [`ep11-tags`](episodes/ep11-tags.json)
    tag 与 branch 有什么不同：branch 是会移动的名字，tag 用来固定标记一个历史位置。

12. [`ep12-remote-tracking-branches`](episodes/ep12-remote-tracking-branches.json)
    `origin/main` 到底在哪里：区分远端 branch、本地 branch 和本地保存的 remote-tracking ref。

13. `ep13-fetch-pull-push`
    fetch、pull、push 做了什么：分别观察对象传输、本地整合和远端 ref 更新。

14. `ep14-ahead-behind-non-fast-forward`
    ahead、behind 与 non-fast-forward：从提交图理解 upstream、协作分叉和 push rejected。

15. `ep15-conflict-resolution`
    冲突解决是一套状态机：从 unmerged entries 到编辑、暂存，再完成 merge 或继续 rebase。

16. `ep16-reflog-recovery`
    reflog 如何找回旧位置：使用本地 ref 移动记录恢复 reset 或 rebase 后暂时不可达的 commit。

## 第三季：精确修改与历史调试（规划）

第三季聚焦两类能力：精确构造可读的提交，以及在较长历史中搜索变化、定位问题并复用解决经验。

17. `ep17-interactive-staging`
    只暂存这一次修改：使用交互式暂存把一个文件中的不同修改分别放入 Index。

18. `ep18-stashing-work`
    stash 把工作放到了哪里：保存尚未准备提交的 Working Tree 与 Index 状态，清理并恢复工作现场。

19. `ep19-cherry-pick`
    cherry-pick 做了什么：提取一个 commit 引入的修改，在当前 HEAD 后创建新的 commit 身份。

20. `ep20-rewriting-history`
    整理提交为什么会改 hash：用 amend 和 interactive rebase 重建、合并、排序或删除本地提交。

21. `ep21-searching-history`
    这段代码什么时候出现的：区分搜索当前内容、提交说明和历史 patch。

22. `ep22-blame`
    blame 不是追责工具：从文件行定位最后修改它的 commit，再回到完整历史上下文。

23. `ep23-bisect`
    哪个提交引入了 bug：使用 good 与 bad 边界在提交历史中做二分查找。

24. `ep24-rerere`
    为什么同一个冲突不用解决两次：记录冲突解决结果，并在相同冲突再次出现时复用。

## 第四季：分布式协作与项目维护（规划）

第四季把单人 Git 心智模型放进团队工作流。重点不是背诵 Git Flow，而是看清贡献如何从个人 topic branch 进入可维护的主线。

25. `ep25-long-lived-and-topic-branches`
    长期分支与 topic branch：用不同寿命的 ref 隔离稳定历史和短期工作。

26. `ep26-centralized-workflow`
    分布式 Git 如何模拟集中式协作：多人围绕一个共享仓库同步、整合并推送提交。

27. `ep27-integration-manager-workflow`
    fork 与 integration manager：贡献者发布 topic branch，维护者决定何时把它接入主线。

28. `ep28-preparing-clean-contributions`
    什么是可审查的提交：拆分独立变化、补充上下文，并在提交前核对 patch 与历史。

29. `ep29-patch-series`
    patch series 如何跨仓库传递：用 format-patch 表达提交序列，再用 am 重建提交。

30. `ep30-maintaining-topic-branches`
    维护者如何管理多个 topic：持续抓取、测试和组合贡献，同时保持主线可发布。

31. `ep31-release-and-maintenance-branches`
    发布分支、维护分支与 hotfix：让新功能和已发布版本沿不同节奏前进。

32. `ep32-choosing-integration-strategy`
    一项贡献如何进入主线：根据身份保留、历史形状和协作边界选择 merge、rebase 或 cherry-pick。

## 第五季：配置、自动化与信任（规划）

第五季解释 Git 如何适应项目规则，并把个人习惯、仓库属性、自动化检查和提交身份分成不同层次。

33. `ep33-configuration-scopes`
    配置到底写在哪里：区分 system、global、local 与命令级配置的覆盖关系。

34. `ep34-aliases-and-command-defaults`
    alias 能简化什么：把稳定的查询和组合命令命名化，同时避免隐藏危险状态变化。

35. `ep35-attributes-text-and-binary`
    Git 如何判断文本与二进制：用 `.gitattributes` 固定换行、diff 和文件类型语义。

36. `ep36-custom-diff-merge-and-filters`
    Git 如何处理特殊文件：配置 diff driver、merge driver 和 content filter 的输入输出边界。

37. `ep37-client-hooks`
    客户端 hook 在何时运行：在 commit、rebase 等本地动作前后执行检查或生成数据。

38. `ep38-server-hooks-and-policy`
    服务端如何拒绝不合规更新：用接收端 hook 检查即将写入的对象和 ref 变化。

39. `ep39-signing-commits-and-tags`
    签名证明了什么：验证 commit 或 tag 的签署身份，不把签名误解为内容加密。

40. `ep40-credentials-and-trust-boundaries`
    凭证应该保存在哪里：区分认证、授权、凭证 helper 与仓库中的提交身份。

## 第六季：大型仓库与特殊工具（规划）

第六季处理跨仓库依赖、离线传输、历史替换和数据维护。这些工具不属于默认日常流程，但需要明确的对象与可恢复性边界。

41. `ep41-submodule-pointer-model`
    submodule 保存的是什么：主仓库记录子仓库的一个 commit 位置，而不是复制其完整文件历史。

42. `ep42-cloning-and-updating-submodules`
    clone 后为什么子模块是空的：初始化、抓取并检出父仓库记录的子模块 commit。

43. `ep43-collaborating-with-submodules`
    子模块协作为什么容易错位：分别提交子仓库变化和主仓库中的 gitlink 更新。

44. `ep44-subtree-merges`
    subtree merge 如何组合项目：把另一个仓库的历史映射到当前仓库的一个目录中。

45. `ep45-git-bundle`
    没有服务器怎样传递历史：把可达对象和 refs 打包成可验证、可 fetch 的 bundle。

46. `ep46-replace-objects`
    replace 为什么能临时改写视图：让一个对象读取时被另一个对象替代，而不立即重写原历史。

47. `ep47-clean-and-destructive-boundaries`
    clean 会删除什么：区分未跟踪、忽略和已跟踪内容，并在不可恢复操作前预览目标。

48. `ep48-maintenance-and-data-recovery`
    Git 何时回收对象：从可达性、reflog、gc 和 fsck 理解维护窗口与数据恢复边界。

## 第七季：Git 内部原理（规划）

第七季是主线终章。它用 plumbing 命令和对象图重新解释前六季看到的 porcelain 行为，让对象、refs、压缩和网络传输形成一套完整系统。

49. `ep49-plumbing-and-porcelain`
    上层命令与底层命令是什么关系：porcelain 编排用户任务，plumbing 直接读写 Git 数据模型。

50. `ep50-blob-object-database`
    文件内容如何进入对象库：从内容计算对象 ID，并把 blob 写入 `.git/objects`。

51. `ep51-trees-and-snapshots`
    tree 如何组成项目快照：用名称、模式和对象 ID 把 blob 与子 tree 组织成目录结构。

52. `ep52-commit-and-tag-objects`
    commit 与 tag 对象保存什么：沿 tree、parent 和 target 引用建立可追踪的对象图。

53. `ep53-refs-head-and-packed-refs`
    名字如何落到对象上：理解 loose ref、symbolic HEAD 与 packed-refs 的存储关系。

54. `ep54-refspecs`
    fetch 和 push 如何映射 refs：用 refspec 明确来源、目标、命名空间和更新方向。

55. `ep55-packfiles-and-deltas`
    Git 为什么不会无限复制完整文件：把松散对象压入 pack，并用 delta 降低相似对象的存储成本。

56. `ep56-transfer-protocols`
    两个仓库如何交换对象：从 ref advertisement、对象协商到 pack 传输解释 fetch 与 push。

## 第八季：Git 服务端基础设施（选修规划）

第八季面向需要管理代码托管基础设施的人，只讲 Git 服务、协议和自托管边界。Pull Request、Review、Rulesets、Actions 和平台 API 已移入独立的 GitHub Course，不在 Git Course 中展开。

57. `ep57-git-protocols-and-access`
    不同协议改变了什么：比较 local、SSH、HTTP 与 Git protocol 的访问和信任边界。

58. `ep58-bare-repositories-and-ssh`
    一台服务器怎样接收 push：创建 bare repository，并用 SSH 与文件权限控制访问。

59. `ep59-ssh-keys-and-server-access`
    SSH key 如何变成仓库权限：区分用户认证、服务器账户和仓库读写授权。

60. `ep60-smart-http`
    Smart HTTP 如何提供 Git 服务：把认证、ref advertisement 和对象传输接入 HTTP 基础设施。

61. `ep61-git-daemon`
    git daemon 适合什么场景：提供轻量高效的 Git protocol，并明确匿名访问和权限边界。

62. `ep62-gitweb`
    仓库浏览与对象传输为什么是两层：用 GitWeb 查看 refs、commit、tree 和 diff，而不改变 Git 数据。

63. `ep63-hosted-vs-self-hosted`
    托管还是自建：从权限、可用性、维护成本和数据边界选择 Git 服务方式。

64. `ep64-operating-self-hosted-git`
    自托管 Git 要维护什么：把仓库存储、备份、访问控制、升级和恢复视为独立运维系统。

## 第九季：Git 与其他版本控制系统（选修规划）

第九季面向迁移项目和混合工具链。重点是把其他系统的历史、分支和身份映射到 Git，而不是把桥接命令当作长期默认工作流。

65. `ep65-choosing-a-migration-strategy`
    迁移前先决定什么：评估历史保真、停机窗口、作者映射、分支标签和回退方案。

66. `ep66-git-as-an-svn-client`
    Git 如何作为 SVN 客户端：在本地提交图与集中式 SVN revision 之间建立桥接。

67. `ep67-importing-from-subversion`
    SVN 历史如何进入 Git：映射作者、trunk、branches 和 tags，并校验迁移结果。

68. `ep68-git-as-a-perforce-client`
    Git 如何连接 Perforce：在本地 topic commits 与 Perforce changelist 之间同步工作。

69. `ep69-importing-from-perforce`
    Perforce 项目如何迁移：保留 changelist、路径和作者关系，并建立新的 Git refs。

70. `ep70-git-with-mercurial`
    Git 与 Mercurial 如何互操作：比较两种提交图和分支语义，并明确桥接限制。

71. `ep71-importing-from-mercurial`
    Mercurial 历史如何进入 Git：转换 changeset、branch、tag 与作者元数据。

72. `ep72-building-a-custom-importer`
    没有现成迁移器怎么办：把源系统记录转换成 blob、tree、commit 和 refs，并逐层验证。

## 形式

每集通常 3–5 分钟。Remotion 统一负责课程节奏、终端、字幕、代码窗口、Git 抽象模型和章节包装。

第二至第七季是主线课程规划，第八、九季是选修规划；这些条目不表示对应 episode 已进入制作。开始制作某一集时，应先创建 `episodes/<episode-id>.json`；教学目标、scene、旁白、审查和发布数据随后只在该 JSON 中维护。
