# 课程大纲

当前规划共 72 集：EP01–EP56 为主线，EP57–EP72 为选修。学习路径分为四层：EP01–EP16 建立状态、历史与远端协作基础，EP17–EP40 进入精确修改、团队协作与规则边界，EP41–EP56 处理仓库边界和 Git 内部原理，EP57–EP72 面向服务端与迁移场景。

本文件只维护课程顺序、单集定位和尚未建档分集的规划。条目链接到 episode JSON 只表示该内容源已经存在，不代表当前生命周期状态；candidate、current、release 和 published 状态以 orchestrator state、verdict 与 manifest 为准。

## 第一季：Git 的状态与历史模型

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

## 第二季：读懂历史与远程协作

第二季从本地对象模型进入日常协作。前半段解决“正在比较、选择和命名哪个状态”，后半段解决“本地与远端引用如何同步、分叉和恢复”。

9. [`ep09-diff-compares-states`](episodes/ep09-diff-compares-states.json)
   diff 到底在比较什么：明确区分 Working Tree、Index、HEAD 和两个 commit 之间的比较。

10. [`ep10-selecting-revisions`](episodes/ep10-selecting-revisions.json)
    如何定位一个 commit：使用 log、短 hash、ref、祖先引用和提交区间选中历史。

11. [`ep11-tags`](episodes/ep11-tags.json)
    tag 与 branch 有什么不同：branch 是会移动的名字，tag 用来固定标记一个历史位置。

12. [`ep12-remote-tracking-branches`](episodes/ep12-remote-tracking-branches.json)
    `origin/main` 到底在哪里：区分远端 branch、本地 branch 和本地保存的 remote-tracking ref。

13. [`ep13-fetch-pull-push`](episodes/ep13-fetch-pull-push.json)
    fetch、pull、push 分别跨过哪条边界：区分取得对象并更新本地记录、把远端工作整合进当前分支，以及请求更新远端 ref。

14. [`ep14-ahead-behind-non-fast-forward`](episodes/ep14-ahead-behind-non-fast-forward.json)
    ahead、behind 是相对谁：从本地 branch 与已抓取的 upstream ref 的可达性差，解释协作分叉和 non-fast-forward push rejected。

15. [`ep15-unmerged-index`](episodes/ep15-unmerged-index.json)
    冲突的真实状态在 Index：从 stage 1/2/3 的 unmerged entries，到编辑 Working Tree、`git add` 收束为普通 stage 0，再继续或退出当前操作。

16. [`ep16-reflog-recovery`](episodes/ep16-reflog-recovery.json)
    reflog 如何把旧提交重新变成可达历史：从本地 ref 移动记录定位 reset 或 rebase 前的位置，先创建救援 branch，再决定如何整合。

## 第三季：精确修改与历史调试（规划）

第三季聚焦两类能力：前四集精确选择、暂存、搬运和整理修改，后四集从历史中搜索变化、定位问题并复用冲突解决经验。季编号只用于内部规划，不进入视频解说、总结或发布文案。

17. [`ep17-interactive-staging`](episodes/ep17-interactive-staging.json)
    一个文件怎样拆成两个提交：使用交互式暂存把同一文件中的不同修改分别放入 Index。

    - 主线：在 `app.js` 中同时制造一处 bug 修复和一处无关文案修改；先用 `git diff` 识别两个 hunk，再通过 `git add -p` 只选择其中一个。选中的内容进入 Index，未选中的内容继续留在 Working Tree，随后形成两个主题单一的 commit。
    - 真实演示：录制 `git diff -- app.js`、`git add -p app.js`、`git diff --cached` 和再次运行的 `git diff`；交互阶段至少真实展示一次 `y` 与一次 `n`，并在提交后用 `git show --patch --stat HEAD` / `git status --short` 验证两部分修改没有混在一起。
    - 本集边界：承接 EP02 的 Working Tree / Index / Repository 和 EP09 的比较关系，不重新讲三层基础；不把交互式暂存讲成自动理解业务意图，也不展开 `git add -e`、复杂 hunk 编辑或全部交互按键。
    - 官方依据：[git-add 的 patch mode](https://git-scm.com/docs/git-add#_interactive_mode)、[Pro Git：Interactive Staging](https://git-scm.com/book/en/v2/Git-Tools-Interactive-Staging)。

18. [`ep18-stashing-work`](episodes/ep18-stashing-work.json)
    stash 把工作放到了哪里：保存尚未准备提交的 Working Tree 与 Index 状态，暂时清理并恢复工作现场。

    - 主线：在 Working Tree 与 Index 同时存在未完成修改时临时切换任务；用 `git stash push -m` 保存现场，让文件状态回到 `HEAD`，再通过 `refs/stash`、stash reflog 和可检查的 entry 说明它不是抽象储物箱。确认内容后，用 `git stash apply --index` 恢复原来的文件与暂存状态。
    - 真实演示：录制 stash 前后的 `git status --short`，执行 `git stash push -m`、`git stash list`、`git stash show --stat`、`git stash apply --index stash@{0}`，最后再次核对 staged 与 unstaged 修改；默认路径只演示 tracked 修改，另用短对照证明 untracked 文件默认不会被保存。
    - 本集边界：不把 stash 当作 branch、远端备份或永久保险；明确普通 `apply` 与 `apply --index` 在恢复暂存状态上的差别，并只简要区分 `apply`、`pop`、`drop`，不展开 stash 的多 parent 内部拓扑或所有选项。
    - 官方依据：[git-stash](https://git-scm.com/docs/git-stash)、[Pro Git：Stashing and Cleaning](https://git-scm.com/book/en/v2/Git-Tools-Stashing-and-Cleaning)。

19. [`ep19-cherry-pick`](episodes/ep19-cherry-pick.json)
    怎样只搬一个 commit 的修改：提取选中 commit 引入的变化，在当前 `HEAD` 后创建新的 commit 身份。

    - 主线：feature 上已经有多个 commit，但 main 只需要其中一个独立修复；先用 `git show <oid>` 核对该 commit 引入的 patch，再在 main 上执行 `git cherry-pick <oid>`。原提交留在原历史中，main 得到内容效果相同、parent 和对象 ID 不同的新提交。
    - 真实演示：同时展示 cherry-pick 前后的 branch graph、`git show --stat <source-oid>`、真实命令输出与目标提交的完整对象 ID；完成后比较 source / picked commit 的 patch 与 parent，证明复制的是变化，不是把原 commit 移动到另一条 branch。
    - 本集边界：不重复 EP07 的整段 rebase，也不把 cherry-pick 讲成 merge；主流程使用无冲突案例，冲突时只提示复用 EP15 的 Index 状态和 `--continue` / `--abort`，不展开 merge commit 的 `-m` 选择。
    - 官方依据：[git-cherry-pick](https://git-scm.com/docs/git-cherry-pick)、[Pro Git：Rewriting History](https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History)。

20. [`ep20-rewriting-history`](episodes/ep20-rewriting-history.json)
    整理提交为什么会改 hash：用 amend 和 interactive rebase 重建尚未发布的本地提交。

    - 主线：从一段可以运行但包含临时说明和零碎 commit 的本地历史开始；先用 `git commit --amend` 重建最近一个提交，再用 `git rebase -i` 对短提交序列执行一次 `reword` 和一次 `squash`。前后对照说明 Git 没有原地编辑旧 commit，而是根据新的内容、说明或 parent 生成新对象。
    - 真实演示：录制 amend 前后的完整对象 ID、真实 interactive rebase todo 与完成后的 `git log --oneline --decorate --graph`；保留旧、新提交映射，让观众能核对哪些内容被合并、哪些 hash 发生变化，而不是只看到整齐的最终结果。
    - 本集边界：承接 EP03 的 commit 身份、EP07 的重放和 EP16 的恢复路径；不在一集内演示 edit、split、drop、reorder、fixup 等全部动作。主流程只整理尚未发布的本地历史；公开历史的协作成本与 `--force-with-lease` 只作为边界提示，不现场执行强制推送。
    - 官方依据：[git-commit 的 amend](https://git-scm.com/docs/git-commit#Documentation/git-commit.txt---amend)、[git-rebase 的 interactive mode](https://git-scm.com/docs/git-rebase#_interactive_mode)、[Pro Git：Rewriting History](https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History)。

21. [`ep21-searching-history`](episodes/ep21-searching-history.json)
    你在搜索内容、说明还是变化：区分当前文件、commit message 和历史 patch 中的不同搜索目标。

    - 主线：在同一仓库中让关键词同时出现在当前文件、某条 commit message 和历史 patch，但三者出现时间不同；依次用 `git grep`、`git log --grep`、`git log -S` 和 `git log -G` 得到不同答案，建立“先确定搜索对象，再选择命令”的判断路径。
    - 真实演示：使用一个可复现的 `app.js` 历史，先搜索当前内容与提交说明，再让 `-S` 找字符串出现次数发生变化的 commit，让 `-G` 找 added / removed patch 行匹配正则的 commit；每次结果都用 `git show` 打开验证，不能只展示命令返回的 hash。
    - 本集边界：不把 `-S` 简化成全文搜索，也不把 `-G` 说成只搜索当前文件；不扩展成所有 `git log` 筛选参数、shell `grep` 教程或代码搜索平台比较。EP10 负责选中 revision，本集只回答搜索目标与历史变化的关系。
    - 官方依据：[git-grep](https://git-scm.com/docs/git-grep)、[git-log 的 commit limiting 与 diff 选项](https://git-scm.com/docs/git-log)、[Pro Git：Searching](https://git-scm.com/book/en/v2/Git-Tools-Searching)。

22. [`ep22-blame`](episodes/ep22-blame.json)
    这一行从哪次修改来：从当前文件行定位最后修改它的 commit，再回到完整历史上下文。

    - 主线：从 `app.js` 中一行值得追问的代码开始，用 `git blame -L` 找到最后修改该行的 commit；随后打开完整 patch、commit message 和 parent 对照，判断这次修改当时解决了什么问题。结论收束为：blame 是进入上下文的入口，不是对责任或最初来源的最终判定。
    - 真实演示：录制指定行范围的 `git blame -L`、对应的 `git show <oid> -- app.js` 和 parent 前后的内容比较；增加一次纯格式化或代码移动对照，说明默认结果可能只指向最后触碰该行的 commit，并短暂展示 `-w`、`-M` 或 `-C` 如何改变调查线索。
    - 本集边界：与 EP21 区分——EP21 从关键词或 patch 搜索历史，本集从当前已知行向后追上下文；不把 author 等同于责任人，不保证找回已删除行，也不把启发式的移动 / 复制检测描述成绝对来源证明。
    - 官方依据：[git-blame](https://git-scm.com/docs/git-blame)、[Pro Git：Debugging with Git](https://git-scm.com/book/en/v2/Git-Tools-Debugging-with-Git)。

23. [`ep23-bisect`](episodes/ep23-bisect.json)
    哪个 commit 最先让测试失败：使用 good 与 bad 边界在提交历史中做二分查找。

    - 主线：准备一段旧 revision 测试通过、当前 revision 测试失败的线性历史；标记 good 与 bad 后，让 Git 选择中间 commit。每次运行同一测试并反馈结果，候选区间随之缩小，最终找到在当前测试条件下的 first bad commit。
    - 真实演示：先手动执行 `git bisect start`、`git bisect bad`、`git bisect good <oid>` 和两轮真实测试，画面同步展示当前 checkout 与剩余区间；再用 `git bisect run ./test.sh` 完成一个自动案例，核对退出码、最终 commit、`git show` 证据和 `git bisect reset` 后恢复的位置。
    - 本集边界：不把 first bad commit 直接等同于业务根因；测试必须稳定、能够用退出码表达结果，无法构建的 revision 使用 skip 但可能导致多个候选。主线保持线性历史，不同时引入 merge-aware bisect、性能基准或复杂 CI 环境。
    - 官方依据：[git-bisect](https://git-scm.com/docs/git-bisect)、[Pro Git：Debugging with Git](https://git-scm.com/book/en/v2/Git-Tools-Debugging-with-Git)。

24. [`ep24-rerere`](episodes/ep24-rerere.json)
    为什么同一个冲突不用从头解决：记录一次冲突的手工解决结果，并在相同冲突再次出现时复用。

    - 主线：让长期 topic branch 两次遇到形状相同的冲突；启用 `rerere.enabled` 后，第一次冲突记录 preimage，人工编辑、将路径标记为 resolved 并完成当前合并，让 Git 记录对应的 postimage。重新制造相同冲突时，Git 把已记录的解决内容应用到 Working Tree，再由人检查、测试和确认是否进入 Index。
    - 真实演示：录制第一次冲突的 `git status --short`、`git rerere status`、人工解决、`git rerere diff` 和完成操作；第二次冲突必须从真实 Git 状态重新产生，并展示自动复用前后的文件、Index 状态与测试结果。默认不启用 `rerere.autoupdate`，保留人工 `git add` 的确认动作。
    - 本集边界：承接 EP06、EP07 和 EP15，不重新解释三方合并或 unmerged stages；rerere 复用的是可匹配的冲突解决记录，不理解业务正确性，也不保证所有相似冲突都能复用。`forget`、`clear`、`gc` 只作为管理边界提示，不展开成命令清单。
    - 官方依据：[git-rerere](https://git-scm.com/docs/git-rerere)、[Pro Git：Rerere](https://git-scm.com/book/en/v2/Git-Tools-Rerere)。

## 第四季：分布式协作与项目维护（规划）

第四季把单人 Git 心智模型放进团队工作流：先比较 branch 与 repository 的协作拓扑，再跟随一项贡献完成准备、传递、评估、发布和后续维护。重点不是背诵 Git Flow 或某个平台按钮，而是看清对象与 refs 由谁持有、经过哪条边界，以及主线为什么接受这些变化。季编号只用于内部规划，不进入视频解说、总结或发布文案。

25. `ep25-long-lived-and-topic-branches`
    为什么有些 branch 长期存在：用不同寿命与职责的 ref 隔离稳定历史和单一主题工作。

    - 主线：从所有工作都直接落到 main 的混杂历史开始；为一项独立修改创建短期 topic branch，让它经历开发、检查、整合和删除，同时保留 main 作为长期稳定入口。再增加一个长期集成 branch，说明长短之分来自团队赋予 ref 的职责与寿命，不是 Git 中不同类型的对象。
    - 真实演示：录制 `git switch -c topic/login main`、topic 上的两次 commit、`git log --graph --all`、回到 main 后的真实整合与 `git branch -d topic/login`；删除前后核对 refs 和提交可达性，证明删除已整合的 branch 只是移除名字，不会删除仍被 main 引用的 commit。
    - 本集边界：承接 EP04 的 branch 指针模型，不重新解释创建 branch 为什么快；不把 main、develop、next、release 等名字说成 Git 强制规范，也不推广固定 Git Flow。长期 branch 表达稳定阶段，topic branch 表达工作主题，两者都只是普通 ref。
    - 官方依据：[Pro Git：Branching Workflows](https://git-scm.com/book/en/v2/Git-Branching-Branching-Workflows)、[gitworkflows](https://git-scm.com/docs/gitworkflows)。

26. `ep26-centralized-workflow`
    分布式 Git 为什么也能集中协作：多人把一个共享 repository 约定为写入主线的中心。

    - 主线：准备一个共享 bare repository 和 Alice、Bob 两个完整 clone；两人都能在本地独立 commit，但共享 main 只有一条可接受的更新顺序。Alice 先 push 后，Bob 必须取得并整合 Alice 的工作，才能把包含双方提交的新历史推回中心。
    - 真实演示：分别录制共享仓库 refs、两个 clone 的本地 `main` / `origin/main`、Alice 的正常 push、Bob 在旧位置上的 push rejected、Bob fetch 后的显式 merge 或 rebase，以及最终成功 push；服务端和两个 clone 的完整对象 ID 必须能相互核对。
    - 本集边界：承接 EP12–EP14，不重新讲 remote-tracking ref、ahead / behind 或 non-fast-forward 的算法；这里关注的是“谁被约定为共享入口”。集中式工作流不等于集中式版本控制，commit 与整合仍在本地完成；不引入 pull request、保护分支或平台权限界面。
    - 官方依据：[Pro Git：Centralized Workflow](https://git-scm.com/book/en/v2/Distributed-Git-Distributed-Workflows#_centralized_workflow)、[git-push](https://git-scm.com/docs/git-push)。

27. `ep27-integration-manager-workflow`
    没有主仓库写权限怎样贡献：贡献者发布自己的 topic branch，由 integration manager 决定如何接入主线。

    - 主线：把 canonical repository、贡献者的公开 repository 和维护者本地 clone 分成三个位置；贡献者从 canonical 取得基础，在自己的 repository 发布 topic branch，再把 branch 名与可验证的 commit 范围交给维护者。维护者 fetch 这条 ref，在本地检查和整合，最后只有维护者更新 canonical main。
    - 真实演示：使用两个独立 bare repository 模拟 canonical 与 contributor fork；录制贡献者 push 到自己的 remote、维护者 `git remote add contributor` / `git fetch contributor`、`git log main..contributor/topic`、本地测试与整合、最终 push canonical。每一步同步展示对象已经到达哪里、哪一个 ref 被更新。
    - 本集边界：fork 是另一份 repository，不是特殊 branch；请求维护者接收只是协作通信，Git 真正传递的是可取得的 refs 与对象。不把 GitHub Pull Request 当成 Git 协议本身，也不展开多级 lieutenant 模型、平台 review、权限审批或自动化检查。
    - 官方依据：[Pro Git：Integration-Manager Workflow](https://git-scm.com/book/en/v2/Distributed-Git-Distributed-Workflows#_integration_manager)、[git-fetch](https://git-scm.com/docs/git-fetch)。

28. `ep28-preparing-clean-contributions`
    什么样的提交容易被审查：让每个 commit 表达一个可验证的意图，并在交付前核对完整 patch 与历史范围。

    - 主线：从一项同时混入功能修改、调试输出和格式噪声的工作开始；先明确本次贡献要解决的问题，再复用 EP17 与 EP20 将变化拆成主题单一的 commit、补充说明“为什么”，最后从接收者视角检查 `upstream..HEAD` 中将要交付的全部内容。
    - 真实演示：录制 `git status --short`、`git diff --check`、`git diff --cached`、测试命令、`git log --reverse --stat upstream/main..HEAD` 和逐条 `git show`；必须真实移除一处调试噪声或空白错误，并证明最终 range 中没有遗漏文件、额外 commit 或未提交修改。
    - 本集边界：可审查不等于所有项目采用同一种 message 模板、行数限制或 squash 规则；不重复完整的交互式暂存和历史改写操作，也不把“测试通过”描述为业务一定正确。平台上的 PR 标题、模板和 reviewer 流程留给 GitHub Course。
    - 官方依据：[Pro Git：Commit Guidelines](https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project#_commit_guidelines)、[git-diff](https://git-scm.com/docs/git-diff)、[Git 项目的 SubmittingPatches](https://github.com/git/git/blob/master/Documentation/SubmittingPatches)。

29. `ep29-patch-series`
    没有共享 remote 怎样传递提交序列：用 format-patch 表达每个 commit，再用 am 在另一仓库重建历史。

    - 主线：准备三个有明确顺序的非 merge commit，在发送端运行 `git format-patch <base>..HEAD`；每个 patch message 同时携带作者信息、commit message 和 diff。把这些文件交给另一份 repository 后，接收者先检查序列，再用 `git am` 按顺序应用到当前 branch。
    - 真实演示：录制生成的 `0001-`、`0002-`、`0003-` 文件，打开其中一份核对 `From`、`Subject`、正文与 patch；接收端先检查文件顺序，再执行 `git am 000*.patch`，最后比较提交数量、顺序、作者、说明和 patch。完整对象 ID 也必须展示，避免暗示重建后必然与发送端相同；`--show-current-patch=diff` 只在 am 因问题停下时作为检查当前 patch 的边界提示。
    - 本集边界：`git format-patch` 默认面向非 merge commit；`git am` 从 mailbox 数据重建 commit，而 `git apply` 只把 patch 应用到 Working Tree、不会自动创建提交。不展开邮件客户端配置、签名、mailing list 礼仪、cover letter 或复杂冲突处理。
    - 官方依据：[git-format-patch](https://git-scm.com/docs/git-format-patch)、[git-am](https://git-scm.com/docs/git-am)、[Pro Git：Applying Patches from Email](https://git-scm.com/book/en/v2/Distributed-Git-Maintaining-a-Project#_patches_from_email)。

30. `ep30-maintaining-topic-branches`
    维护者怎样同时评估多个 topic：把外部贡献隔离、组合和测试，再决定哪些变化进入长期 branch。

    - 主线：维护者同时收到 Alice 与 Bob 的两个 topic；先把远端 refs fetch 到本地，再为每项贡献建立可丢弃的评估 branch，分别检查 patch 和测试。随后创建临时 integration branch 组合两个已通过的 topic，验证它们在一起仍然工作，最后只把确认过的结果整合进 main。
    - 真实演示：录制两个 contributor remotes 的 fetch、`main..alice/topic-a` / `main..bob/topic-b` 范围检查、独立 topic branch 上的测试、临时 integration branch 的合并和组合测试；让其中一个 topic 首次测试失败并保持未进入 main，修正版本到达后只更新对应评估路径。
    - 本集边界：与 EP25 区分——EP25 讲贡献者如何组织一项工作，本集讲维护者如何处理多个外部输入；remote-tracking refs 只是观察位置，不直接在其上开发。`seen`、`next` 等分层只作为可选规模化例子，不照搬 Git 项目的专用维护流程，也不引入 CI 平台。
    - 官方依据：[Pro Git：Maintaining a Project](https://git-scm.com/book/en/v2/Distributed-Git-Maintaining-a-Project)、[gitworkflows 的 topic branches](https://git-scm.com/docs/gitworkflows#_topic_branches)。

31. `ep31-release-and-maintenance-branches`
    已发布版本和新功能怎样同时前进：让维护 branch、主线与短期 hotfix 沿不同节奏演进。

    - 主线：从 `v1.0.0` 发布点开始，让 main 继续接收下一版本功能，同时从已发布位置保留 `maint/v1`；当 v1 用户遇到缺陷时，从最老仍需修复的维护线创建 hotfix topic，完成修复和测试后先进入 `maint/v1`，再把同一修复向上整合到 main。
    - 真实演示：录制发布 tag 与 branch graph、`git switch -c maint/v1 v1.0.0`、`git switch -c hotfix/login maint/v1`、修复提交、维护线测试、合并回 `maint/v1`、创建 `v1.0.1` tag，以及将修复 merge upward 后 main 的测试；前后完整对象 ID 与可达关系必须一致。
    - 本集边界：release、maintenance、hotfix 都是团队赋予普通 refs 的职责，不是 Git 内置 branch 类型；不要求固定命名或完整 Git Flow。修复优先落到最老仍受支持的 branch，再向上整合；若不得不向下 cherry-pick，只作为例外边界并复用 EP19，不展开多版本发布系统。
    - 官方依据：[gitworkflows 的 graduation 与 merge upwards](https://git-scm.com/docs/gitworkflows#_merging_upwards)、[gitworkflows 的 maintenance branch management](https://git-scm.com/docs/gitworkflows#_maintenance_branch_management_after_a_feature_release)、[git-tag](https://git-scm.com/docs/git-tag)。

32. `ep32-choosing-integration-strategy`
    一项贡献应该怎样进入主线：根据提交身份、历史形状、选择范围和协作边界选择 merge、rebase 或 cherry-pick。

    - 主线：对同一份 main 与 topic 历史建立三条隔离实验路径。merge 保留两条历史及原提交身份；rebase 把 topic commit 重建到新的 base，再以线性方式接入；cherry-pick 只选择需要的 commit 变化，在目标 branch 上创建新身份。最后从“是否保留拓扑、是否保留原 commit、接收全部还是部分变化、branch 是否已共享”四个问题做选择。
    - 真实演示：从同一组对象复制出 `demo/merge`、`demo/rebase`、`demo/pick` refs，分别执行真实 `git merge --no-ff`、在 topic 副本上 `git rebase main` 后让目标 ref fast-forward、以及在目标 branch 上 `git cherry-pick <oid-a> <oid-b>`；三组都接收同一组所需变化，并排展示完整对象 ID、parent、可达范围和最终文件内容，证明结果文件相同不代表历史语义相同。
    - 本集边界：不评选唯一“最佳”历史，也不把 rebase 描述成发生在服务器上的合并方式；已共享的 branch 不随意重写，cherry-pick 不建立来源历史的祖先关系。`merge --squash`、octopus merge、平台 squash button 与组织策略不进入主线。
    - 官方依据：[git-merge](https://git-scm.com/docs/git-merge)、[git-rebase](https://git-scm.com/docs/git-rebase)、[git-cherry-pick](https://git-scm.com/docs/git-cherry-pick)、[Pro Git：Distributed Workflows](https://git-scm.com/book/en/v2/Distributed-Git-Distributed-Workflows)。

## 第五季：配置、自动化与信任（规划）

第五季解释 Git 如何适应个人环境与项目规则：先区分配置、ignore 和 attributes 的作用范围，再观察客户端与服务端自动化的执行边界，最后拆开提交身份、对象签名、远端认证和服务器授权。重点不是堆配置项，而是回答“规则从哪里来、影响哪一层、由谁信任”。季编号只用于内部规划，不进入视频解说、总结或发布文案。

33. `ep33-configuration-scopes`
    同一个配置为什么得到不同结果：区分 system、global、local、worktree 与 command scope 的来源和覆盖关系。

    - 主线：在隔离的临时配置环境中，让同一个 `demo.label` 依次出现在 system、global、local 和 command scope；先只看最终值，再用 origin 与 scope 找到它从哪里生效。补充 linked worktree 的独立配置位置，建立“先定位来源，再决定改哪一层”的排查顺序。
    - 真实演示：录制 `git config list --show-origin --show-scope`、分别读取各 scope、仓库内外的最终结果，以及 `git -c demo.label=command config get demo.label`；所有实验使用 git-course-lab 创建的临时 system / global / repository 配置文件，禁止修改录制机器的真实全局配置。
    - 本集边界：通常后读取的更具体 scope 会覆盖单值配置，但 multi-valued key、include 与只在受保护 scope 生效的配置不能机械套用单一优先级；`--worktree` 依赖 `extensions.worktreeConfig=true`，这里只说明配置位置，linked worktree 的结构留到 EP44。不展开每一个配置变量，也不把 `user.name` 当作登录账号。
    - 官方依据：[git-config 的 scopes](https://git-scm.com/docs/git-config#SCOPES)、[git-config 的 origin 与 scope 输出](https://git-scm.com/docs/git-config#Documentation/git-config.txt---show-origin)。

34. `ep34-ignore-rules-and-excludes`
    为什么有些文件不出现在 status：区分共享 `.gitignore`、仓库私有 exclude、用户全局规则和已经被跟踪的路径。

    - 主线：在同一个 fixture 中准备应由团队共同忽略的 `build/`、仅当前 clone 使用的本地笔记、用户编辑器产生的临时文件，以及一个已经被跟踪的配置文件；分别把规则放入 `.gitignore`、`$GIT_DIR/info/exclude` 和临时 `core.excludesFile`，观察每种规则影响谁。最后给 tracked 文件增加匹配规则，证明 ignore 不会让它自动离开 Index。
    - 真实演示：录制规则加入前后的 `git status --short --untracked-files=all`、`git check-ignore -v <paths>`、`git ls-files --error-unmatch <tracked-path>`，并用根目录锚定、目录结尾 `/` 和一次 `!` negation 展示最小必要 pattern 语义；在 disposable fixture 中执行 `git rm --cached <tracked-path>`，证明停止跟踪与保留 Working Tree 文件是独立动作，再由 ignore 阻止它重新进入普通 add 候选。
    - 本集边界：ignore 只用于有意保持 untracked 的路径，不删除文件、不保护秘密，也不影响已经 tracked 的内容；规则来源依次区分命令行、路径层级中的 `.gitignore`、`info/exclude` 和 `core.excludesFile`，同一层最后匹配项生效，离目标路径更近的 `.gitignore` 可覆盖上层。如果父目录已经被排除，不能简单依赖子路径的 negation 重新包含；EP47 再讨论这些 ignored 文件的清理边界。
    - 官方依据：[gitignore](https://git-scm.com/docs/gitignore)、[git-check-ignore](https://git-scm.com/docs/git-check-ignore)、[git-rm 的 cached 模式](https://git-scm.com/docs/git-rm#Documentation/git-rm.txt---cached)。

35. `ep35-attributes-text-and-binary`
    Git 怎样确定文件的文本语义：用 `.gitattributes` 固定换行规范、Working Tree 输出和 binary diff 行为。

    - 主线：在不同平台可能产生 CRLF / LF 的脚本和一个不应显示文本 diff 的二进制 fixture 上，先观察 Git 的默认判断，再提交 `.gitattributes`：让脚本在 Index 中统一为 LF、按指定 `eol` 写回 Working Tree，并用 `-diff` 明确二进制路径。最后重新规范化已经入库的内容。
    - 真实演示：录制 `.gitattributes` 的 path rules、`git check-attr text eol diff -- <paths>`、`git add --renormalize .`、`git status` 和 `git diff --cached`；用字节级查看同时核对 Working Tree 与 `git show :script.sh` 中的换行，并让二进制 fixture 的 diff 从噪声文本变成明确的 binary 提示。
    - 本集边界：`text=auto` 仍包含 Git 的内容判断，关键路径需要显式规则；`text` 规范化的是写入 Index 的内容，`eol` 控制 checkout 到 Working Tree 的形式。attributes 不会自动改写既有 blob，必须重新 add / renormalize；与 EP34 区分，`.gitignore` 决定哪些 untracked 路径默认不进入候选，`.gitattributes` 定义已被 Git 处理路径的内容和 diff / merge 语义。
    - 官方依据：[gitattributes 的 text 与 eol](https://git-scm.com/docs/gitattributes#_checking_out_and_checking_in)、[gitattributes 的 binary diff](https://git-scm.com/docs/gitattributes#_marking_files_as_binary)。

36. `ep36-custom-diff-merge-and-filters`
    特殊文件怎样接入 Git：让 attributes 把路径路由给 diff driver、merge driver 或 clean / smudge filter，并看清每条管线改变什么。

    - 主线：使用同一种自定义文件格式做三次隔离实验。diff driver 只把 blob 转成更适合人阅读的比较视图；merge driver 接收 base、ours、theirs，并把结果写回指定临时文件；clean / smudge filter 在 Working Tree 与 Index 之间转换内容。三条路径最后汇总为不同输入、输出和失败语义。
    - 真实演示：先用 `git check-attr diff merge filter -- data.demo` 证明 path rule 命中了哪个 driver；录制 textconv 前后的 `git diff`，记录 merge driver 收到的 `%O` / `%A` / `%B` 与退出码，再用一个幂等的 clean / smudge fixture 对比 Working Tree 内容和 `git show :data.demo`。所有 driver 都使用仓库内可审查脚本，由 git-course-lab 临时写入 repository config。
    - 本集边界：`.gitattributes` 选择 driver 名称，实际命令通常来自 Git config；clone 得到 attributes 不代表本机已经安装对应 driver。diff driver 不改 blob，merge driver 的零 / 非零退出码表达成功或冲突，filter 才可能改变写入 Index 或 checkout 的内容；filter 不是天然的加密或安全边界，也不展开 long-running process protocol。
    - 官方依据：[gitattributes 的 diff](https://git-scm.com/docs/gitattributes#_generating_diff_text)、[gitattributes 的 merge](https://git-scm.com/docs/gitattributes#_performing_a_three_way_merge)、[gitattributes 的 filter](https://git-scm.com/docs/gitattributes#_filter)。

37. `ep37-client-hooks`
    本地 hook 在什么时候运行：在 Git 动作的明确阶段执行检查或后续通知，并用退出状态决定能否继续。

    - 主线：先提交一份会让测试失败的 staged 内容；没有 hook 时 commit 能被创建，启用可执行的 `pre-commit` 后，同样的提交在对象生成前被非零退出码阻止。修复测试后 commit 成功，再由 `post-commit` 记录一次只读通知，比较前置裁决与后置观察的差别。
    - 真实演示：录制 hook 文件位置、执行位、`git rev-parse --git-path hooks`、失败与成功的 commit、前后 `HEAD` 对象 ID 和 hook 日志；再执行一次 `git commit --no-verify` 证明它能绕过 `pre-commit`，最后 clone 到新目录核对默认 `.git/hooks` 中没有自动携带原仓库的自定义 hook。
    - 本集边界：不同 hook 的参数、stdin、可绕过性与工作目录各不相同，不能把 `pre-commit` 规则套到所有 hook；本地 hook 适合反馈和个人自动化，不是组织强制门禁。`core.hooksPath` 可以改变目录，但配置与可执行环境仍需显式部署；不枚举全部 hook，也不让 hook 偷偷修改业务文件。
    - 官方依据：[githooks](https://git-scm.com/docs/githooks)、[githooks 的 pre-commit](https://git-scm.com/docs/githooks#_pre_commit)。

38. `ep38-server-hooks-and-policy`
    服务端怎样拒绝不合规更新：在 receive-pack 写入 refs 前，用接收端 hook 检查整批更新与新对象。

    - 主线：在一个本地 bare remote 上安装 `pre-receive`，让它读取每条 `<old-oid> <new-oid> <ref-name>`；规则允许 topic branch，却拒绝直接更新 main。客户端先在一次 push 中同时请求更新 main 与 topic，观察一个非零退出码如何拒绝整批 receive；随后只 push topic，证明相同服务端仍能接受符合规则的 ref 更新。
    - 真实演示：录制首次整批 push 的两行 hook stdin、main 触发的拒绝、服务端 `show-ref` 与 quarantine 清理后的对象检查；再单独 push topic 并核对成功写入的 ref / object。最后用 `git push --no-verify` 重试 main，证明客户端选项只能绕过适用的本地 hook，不能绕过服务端 `pre-receive`。
    - 本集边界：`pre-receive` 每次 receive operation 执行一次，适合整批接受或拒绝；`update` 才按 ref 单独执行，`post-receive` 已不能撤销成功更新。服务端 hook 是自建 Git 服务的机制，不等同于托管平台的 branch protection，也不展开网络认证、集群部署或 GitHub Rulesets。
    - 官方依据：[githooks 的 pre-receive / update / post-receive](https://git-scm.com/docs/githooks#_pre_receive)、[git-receive-pack 的 quarantine](https://git-scm.com/docs/git-receive-pack#_quarantine_environment)。

39. `ep39-signing-commits-and-tags`
    commit 或 tag 的签名证明了什么：验证对象内容与某把受信任密钥的签署关系，而不是把仓库内容加密。

    - 主线：在完全临时的 SSH signing fixture 中生成测试密钥，配置 `gpg.format=ssh`、`user.signingKey` 和验证者自己的 allowed signers 文件；创建一个 signed commit 和一个 signed annotated tag。验证成功后移除信任映射再验证，区分“对象带有有效签名”和“当前验证者信任这把密钥代表谁”。
    - 真实演示：录制 `git commit -S`、`git cat-file commit HEAD` 中的 signature header、`git verify-commit HEAD`、`git tag -s v1.0.0 -m ...` 与 `git verify-tag v1.0.0`；所有 key 都在 git-course-lab 临时目录生成，完整展示 commit / tag 对象 ID，但不使用或读取操作者的真实私钥。
    - 本集边界：签名覆盖被签署对象，内容仍可被任何拥有对象的人读取；验证只说明签名与对象、密钥匹配，真实身份取决于 allowed signers、证书或其他信任链。`user.name` / `user.email` 不是密码，signed tag 与 lightweight tag 也不是同一种对象；OpenPGP、X.509 与 SSH 只选一种实演，不比较生态优劣。
    - 官方依据：[git-commit 的 signing](https://git-scm.com/docs/git-commit#Documentation/git-commit.txt---gpg-signltkey-idgt)、[git-tag 的 signed tag](https://git-scm.com/docs/git-tag#Documentation/git-tag.txt---sign)、[git-verify-commit](https://git-scm.com/docs/git-verify-commit)、[git-verify-tag](https://git-scm.com/docs/git-verify-tag)、[git-config 的 SSH allowed signers](https://git-scm.com/docs/git-config#Documentation/git-config.txt-gpgsshallowedSignersFile)。

40. `ep40-credentials-and-trust-boundaries`
    提交身份为什么不能用来登录：区分 commit 中的作者信息、远端认证凭证、服务器授权和 credential helper 的存储职责。

    - 主线：先用相同 `user.name` / `user.email` 创建 commit，证明它们只进入 author 与 committer 字段；随后访问一个 git-course-lab 控制的本地 HTTP Git endpoint，用两组临时测试凭证完成认证，但让服务器只授权其中一组更新目标 repository。最后把可用凭证交给临时 credential helper，观察 Git 如何按 protocol / host / path 查询和回收，而不把秘密写进 commit 或 remote ref。
    - 真实演示：录制 `git var GIT_AUTHOR_IDENT`、`git show --format=fuller`、remote URL、一次 401 认证失败、一次已认证但无 push 权限的拒绝和一次授权成功；再以虚构 endpoint 和测试 secret 执行 `git credential approve` / `fill` / `reject`，核对 helper 的输入输出字段。录制素材不得包含真实账号、token、SSH key 或操作者现有 credential 配置。
    - 本集边界：认证回答“你向服务器证明了哪组凭证”，授权回答“服务器允许这组身份操作哪个 repository / ref”，commit author 只是对象元数据；HTTP credential helper 与 SSH agent / key file 是不同传输路径。helper 可能只缓存内存、写入磁盘或连接系统钥匙串，不能笼统说成 Git 安全保存密码，也不在仓库 config 或 remote URL 中嵌入 secret。
    - 官方依据：[gitcredentials](https://git-scm.com/docs/gitcredentials)、[git-credential](https://git-scm.com/docs/git-credential)、[git-config 的 user identity](https://git-scm.com/docs/git-config#Documentation/git-config.txt-username)、[Pro Git：Credential Storage](https://git-scm.com/book/en/v2/Git-Tools-Credential-Storage)。

## 第六季：仓库边界与特殊工具（规划）

第六季处理普通单仓库工作流之外的状态边界：先看一个 repository 如何引用另一个 repository，再扩展到同仓库多 Working Tree、离线对象传输和大型仓库的按需呈现，最后收束到不可恢复清理与对象生命周期。subtree merge 与 replace objects 暂不进入主线；前者作为跨仓库整合选修，后者应在对象和 refs 原理之后再讨论。季编号只用于内部规划，不进入视频解说、总结或发布文案。

41. `ep41-submodule-pointer-model`
    submodule 保存的是什么：superproject 用 gitlink 记录子仓库的一个 commit，而不是把子仓库历史复制进来。

    - 主线：准备一个独立 library repository 和一个 superproject；添加 submodule 后，从普通目录外观进入真实 tree entry。superproject 的 tree 在对应路径保存 mode `160000` 与子仓库 commit OID，`.gitmodules` 保存名称、路径和取得位置的建议，而 library 继续拥有独立对象库、refs 与历史。
    - 真实演示：录制 `git submodule add`、superproject 的 `.gitmodules`、`git ls-files --stage` / `git ls-tree HEAD <path>`、`git -C <path> rev-parse HEAD` 和两个仓库各自的 `git log`；gitlink OID 必须与子仓库当前 commit 完整一致，并明确 superproject 的 tree 中没有逐个保存子仓库文件。
    - 本集边界：`.gitmodules` 中的 URL 是可版本化建议，本地 `$GIT_DIR/config` 可以覆盖；真正固定依赖版本的是 gitlink 中的 commit OID。这里只建立数据模型，不讲 clone 后如何初始化，也不讲如何发布子仓库更新，更不把 submodule 描述成普通目录、复制目录或特殊 branch。
    - 官方依据：[gitsubmodules](https://git-scm.com/docs/gitsubmodules)、[gitmodules](https://git-scm.com/docs/gitmodules)、[Pro Git：Submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules)。

42. `ep42-cloning-and-updating-submodules`
    clone 后为什么 submodule 目录是空的：初始化本地映射、取得子仓库对象，并检出 superproject 记录的 commit。

    - 主线：普通 clone 只取得并检出 superproject，gitlink 和 `.gitmodules` 已经存在，但 submodule Working Tree 尚未建立；`git submodule init` 把建议配置写入本地 config，`git submodule update` 再 clone / fetch 子仓库并检出 gitlink 指定位置。最后用 `clone --recurse-submodules` 重走一次组合路径。
    - 真实演示：录制普通 clone 后的目录与 `git submodule status`、`git submodule init` 前后的 `git config --local --get-regexp '^submodule\.'`、`git submodule update`、子仓库 `HEAD` / branch 状态，以及与 superproject `git ls-tree HEAD <path>` 的 OID 对照；另用短实验验证 `git clone --recurse-submodules` 等价完成初始化与递归 update。
    - 本集边界：普通 `submodule update` 以 superproject 记录的 OID 为目标，不等于取得并跟随子仓库远端 branch 的最新 tip；默认 checkout 常处于 detached HEAD，这是固定依赖位置的结果，不是 clone 失败。嵌套 submodule 需要 recursive 选项；不在本集修改或提交子仓库内容。
    - 官方依据：[git-submodule](https://git-scm.com/docs/git-submodule)、[git-clone 的 recurse-submodules](https://git-scm.com/docs/git-clone#Documentation/git-clone.txt---recurse-submodulesltpathspecgt)、[gitsubmodules 的 implementation details](https://git-scm.com/docs/gitsubmodules#_implementation_details)。

43. `ep43-collaborating-with-submodules`
    为什么别人拿不到我更新的 submodule：子仓库 commit 与 superproject gitlink 必须按可取得的顺序分别发布。

    - 主线：在 submodule 中创建工作 branch 并产生新 commit，superproject 随即显示 gitlink 从旧 OID 移到新 OID。先故意只提交并发布 superproject，让另一份 clone 取得父仓库更新却无法从子仓库取得目标对象；随后先 push 子仓库 commit，再发布父仓库 gitlink，消费者才能完整重现状态。
    - 真实演示：录制子仓库 branch / commit、superproject 的 `git status --short` 与 `git diff --submodule=log`、只发布父仓库后的真实 `git submodule update` 失败、子仓库 push、消费者重试成功及完整 OID 对照；增加 `git push --recurse-submodules=check` 作为发布前检查，证明它能发现 superproject 即将引用但远端尚不可取得的子仓库 commit。
    - 本集边界：一次依赖升级至少涉及子仓库 commit 与父仓库 gitlink 两个独立历史动作；父仓库不会替我们 push 子仓库 branch，子仓库 branch 也不会自动移动 superproject 的记录。`update --remote` 是主动选择远端跟踪位置的另一种策略，不等于消费者按锁定 OID 同步，也不展开 submodule merge 冲突。
    - 官方依据：[gitsubmodules 的 third-party workflow](https://git-scm.com/docs/gitsubmodules#_workflow_for_a_third_party_library)、[git-submodule](https://git-scm.com/docs/git-submodule)、[Pro Git：Working on a Project with Submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules#_working_on_a_project_with_submodules)。

44. `ep44-multiple-worktrees`
    一个 repository 怎样同时打开两个 branch：让多个 Working Tree 共享对象库与 refs，同时保留各自的 HEAD、Index 和文件状态。

    - 主线：feature Working Tree 中还有未完成修改，此时需要处理 main 上的紧急 hotfix；不 stash、不来回 switch，而是用 `git worktree add` 建立第二个目录和新的 hotfix branch。两个 worktree 能立即看到共享的 commits 与 refs，但各自拥有独立 checkout、Index 和未提交文件。
    - 真实演示：录制主 worktree 的 dirty 状态、`git worktree add <temp-path> -b hotfix main`、`git worktree list --porcelain`、第二个 worktree 中的 hotfix commit，以及主 worktree 无需切换就能看到新 branch / commit；再尝试让两个 worktree 检出同一 branch，真实展示默认拒绝，最后在干净状态下 `git worktree remove` 并核对 branch 仍然存在。
    - 本集边界：linked worktree 不是第二个 clone，不拥有独立对象库和 remotes；共享 refs 不代表共享 HEAD、Index、Working Tree 或未跟踪文件。同一 branch 默认不能同时被两个 worktree 检出，以避免两个目录竞争更新一个 ref；不使用 `--force` 绕过保护，也不把删除 worktree 说成删除 branch。
    - 官方依据：[git-worktree](https://git-scm.com/docs/git-worktree)。

45. `ep45-git-bundle`
    没有服务器怎样传递完整历史：把可达对象与 refs 写入可验证、可 clone / fetch 的 bundle。

    - 主线：在无法连接远端的两个目录之间，先从源 repository 创建包含 main 与 tag 的 self-contained bundle；接收端验证并直接从 bundle clone，得到相同对象 ID 与历史拓扑。源端继续产生提交后，再用双方共有的 tag 作为 prerequisite 创建增量 bundle，由接收端 fetch 更新。
    - 真实演示：录制 `git bundle create full.bundle --all`、`git bundle verify`、`git bundle list-heads`、从 bundle clone，以及源端新增 commit 后的 `git bundle create update.bundle <base>..main`；接收端先验证 prerequisite，再从增量 bundle fetch 并 fast-forward，完整核对 refs、对象 ID 和 merge topology。
    - 本集边界：bundle 保存命名 revision 可达的 Git 对象与 refs，不保存 Working Tree 未提交文件、hooks、任意本地配置或 credential；增量 bundle 只有在接收端具备 prerequisite 时才能应用。与 EP29 区分：patch series 重建非 merge commits，bundle 携带真实对象，可保留对象身份和完整拓扑；它不是普通 zip，也不直接等同于完整灾备方案。
    - 官方依据：[git-bundle](https://git-scm.com/docs/git-bundle)、[Pro Git：Bundling](https://git-scm.com/book/en/v2/Git-Tools-Bundling)。

46. `ep46-sparse-partial-and-shallow-clones`
    “只要一部分仓库”到底少了什么：区分 sparse checkout 的 Working Tree 路径、partial clone 的对象内容和 shallow clone 的历史深度。

    - 主线：在包含 `app/`、`docs/`、大体积 `assets/` 与较长提交历史的 fixture 中建立三份独立 clone。第一份完整取得对象，只用 sparse checkout 缩小可见路径；第二份通过 `blob:none` partial clone 延迟取得部分 blob；第三份用有限 depth 截断 commit ancestry。最后把三者放进 Working Tree、object database、commit history 三轴矩阵，回答“少显示、少下载、少历史”分别发生在哪里。
    - 真实演示：完整 clone 侧录制 `git sparse-checkout set app`、`git ls-files -t` 和对象统计；partial clone 侧从显式支持 filter 的测试服务执行 `git clone --filter=blob:none --sparse`，核对 promisor / filter config、缺失对象及读取 `assets/large.bin` 时的 lazy fetch；shallow 侧通过协议 URL 执行 `git clone --depth=2`，录制 `git rev-parse --is-shallow-repository`、`git log`、只读查看 `$GIT_DIR/shallow`，再用 `git fetch --deepen=2` 与 `git fetch --unshallow` 展示边界移动和消失。不能让普通本地路径 clone 的优化或忽略 depth 行为伪装成远端结果。
    - 本集边界：sparse checkout 通过 Index 的 `skip-worktree` 语义减少 Working Tree 内容，不会单独减少已取得对象；partial clone 通过 object filter 延迟取得部分对象，但保留 commit / ref 图并可按需取得缺失内容；shallow clone 让指定 commits 在本地被当作历史根，父对象边界之外的调查结果并不完整，且 `--depth` 默认还影响 initial branch 范围。三者可以组合但不是同一功能；不手工修改 skip-worktree bit 或 shallow 文件。
    - 官方依据：[git-sparse-checkout](https://git-scm.com/docs/git-sparse-checkout)、[git-clone 的 sparse、filter 与 depth](https://git-scm.com/docs/git-clone)、[partial clone](https://git-scm.com/docs/partial-clone)、[shallow repository](https://git-scm.com/docs/shallow)、[git-fetch 的 deepen / unshallow](https://git-scm.com/docs/git-fetch)。

47. `ep47-clean-and-destructive-boundaries`
    git clean 到底会删除什么：区分普通 untracked、ignored、目录和嵌套 repository，并在不可恢复操作前预览精确目标。

    - 主线：在同一临时 Working Tree 中准备 tracked 源文件、普通 untracked 笔记、ignored 构建目录、untracked 目录和嵌套 Git repository；先用 status 与 ignore 证据分类，再分别 dry-run 默认集合、ignored-only 集合和包含 ignored 的全集。最后只对明确的构建目录执行一次有 pathspec 的删除。
    - 真实演示：录制 `git status --short --ignored`、`git clean -nd`、`git clean -ndX`、`git clean -ndx` 和 scoped `git clean -fdX -- build/`，每一步都与文件树逐项核对；真实删除后证明 tracked 文件和手写 untracked 笔记仍存在。嵌套 repository 的双 force 只展示拒绝边界，不实际执行删除。
    - 本集边界：`git clean` 处理不受版本控制的 Working Tree 内容，不负责撤销 tracked 修改；普通 untracked 文件一旦删除，Git 通常没有对象可供恢复。`-x` 包含 ignored，`-X` 只选 ignored，`-d` 才进入普通 untracked 目录；所有实际删除都必须先 dry-run 并限制 pathspec。视频中始终使用完整名称 `git clean`，避免与仓库生产命令 `git-course clean` 混淆。
    - 官方依据：[git-clean](https://git-scm.com/docs/git-clean)、[gitignore](https://git-scm.com/docs/gitignore)。

48. `ep48-maintenance-and-data-recovery`
    commit 什么时候才真正消失：沿 branch、reflog、unreachable、fsck 与 prune 理解对象的保留和恢复窗口。

    - 主线：先让 branch 离开一个旧 commit，但保留 reflog，证明它仍被本地记录保护；随后在完全隔离的实验 repository 中显式过期 reflog，让对象进入 unreachable / dangling 状态。`git fsck` 仍能找到尚未被删除的对象，可以先创建 rescue ref；对另一份一次性对象执行实验室级 prune 后，再验证对象库已经无法读取它。
    - 真实演示：录制 ref 移动前后的完整 OID、`git reflog`、默认 fsck 与 `git fsck --unreachable --no-reflogs` 的差别、lab-only 的 `git reflog expire --expire=now --all`、`git fsck --lost-found` / `git branch rescue <oid>` 和恢复后的可达性；另建 disposable commit 演示 `git gc --prune=now` 前后 `git cat-file -e <oid>`，并用 `git maintenance run` / `git count-objects -v` 说明正常维护与立即 prune 不是同一动作。
    - 本集边界：EP16 讲 reflog 条目仍存在时怎样恢复，本集讲保护引用消失后的对象生命周期；`fsck` 只能发现当前对象库里仍存在的对象，不是 prune 后的魔法恢复。`--expire=now` 与 `--prune=now` 只允许在 git-course-lab 的无并发临时仓库演示，不能作为日常清理建议；正常 GC 有宽限期，维护与备份也不是同一概念。
    - 官方依据：[git-reflog](https://git-scm.com/docs/git-reflog)、[git-fsck](https://git-scm.com/docs/git-fsck)、[git-gc](https://git-scm.com/docs/git-gc)、[git-maintenance](https://git-scm.com/docs/git-maintenance)、[Pro Git：Maintenance and Data Recovery](https://git-scm.com/book/en/v2/Git-Internals-Maintenance-and-Data-Recovery)。

## 第七季：Git 内部原理（规划）

第七季是主线终章。它沿用同一个 git-course-lab repository 和一组连续 OID，从 porcelain 产生的结果进入 blob、tree、commit、tag 与 refs，再观察这些对象如何被打包和传输。重点是解释前六季已经见过的行为，不把 plumbing 命令包装成新的日常工作流；对象图需要精确几何关系时使用居中模型或 Manim，终端只负责提供可复核证据。季编号只用于内部规划，不进入视频解说、总结或发布文案。

49. `ep49-plumbing-and-porcelain`
    上层命令与底层命令是什么关系：porcelain 编排用户任务，plumbing 直接读写 Git 数据模型。

    - 主线：先用熟悉的 `git add` / `git commit` 产生一个真实提交，再从相同结果向下追踪：branch ref 指向 commit，commit 指向 tree，tree 用路径和模式指向 blob。porcelain 面向“提交、切换、同步”这类用户任务，plumbing 让我们直接查询或构造对象、Index 和 refs；两者看到的是同一 repository 状态，不是两套 Git。
    - 真实演示：录制一次普通 commit，然后依次使用 `git rev-parse HEAD`、`git cat-file -t HEAD`、`git cat-file -p HEAD`、`git ls-tree HEAD`、`git for-each-ref refs/heads/` 和 `git ls-files --stage`，把画面中的完整 OID 串成 `ref -> commit -> tree -> blob`。所有后续分集继续复用这里生成的 fixture 与 OID，不能每集换一套无法对照的数据。
    - 本集边界：plumbing 是稳定的数据模型入口，但 porcelain 不一定在实现上逐条启动同名 plumbing 进程，不能把概念分层讲成固定调用栈；这里只建立地图，不展开对象字节格式、手工创建对象、refs 存储或网络协议。真实工作仍优先使用 porcelain，plumbing 实验只在隔离的 git-course-lab repository 中进行。
    - 官方依据：[Git Glossary](https://git-scm.com/docs/gitglossary)、[git](https://git-scm.com/docs/git)、[Pro Git：Plumbing and Porcelain](https://git-scm.com/book/en/v2/Git-Internals-Plumbing-and-Porcelain)。

50. `ep50-blob-object-database`
    文件内容如何进入对象库：从内容计算对象 ID，并把 blob 写入 `.git/objects`。

    - 主线：取 EP49 的 `app.js` 内容，先只计算 OID，再真正写入对象库；相同字节在同一 object format 下得到相同 OID，改变一个换行或字节就得到另一个对象。随后拆开输入模型：Git 对 `blob <size>\0` 与原始内容组成的对象表示求 hash，文件名并不在 blob 中。
    - 真实演示：先录制 `git rev-parse --show-object-format`，再用 `git hash-object app.js`、`git hash-object -w app.js` 和 `git cat-file -t/-s/-p <oid>` 核对类型、字节长度与内容；展示 loose object 的 fan-out 路径 `$GIT_DIR/objects/<前两位>/<其余位>`，并对一份同内容不同文件名和一份只改变换行的文件重复计算。完整 OID 必须贯穿画面，不能用固定 40 位长度暗示所有仓库都只支持 SHA-1。
    - 本集边界：blob 保存字节内容，不保存文件名、目录、权限、修改时间或“它属于哪个 commit”；OID 依赖 repository 的 object format 与完整对象表示，不能笼统说成“对文件做 SHA-1”。`hash-object` 写入对象库不等于把文件加入 Index、创建 tree 或产生 commit，也不手工修改 `.git/objects` 内的压缩文件。
    - 官方依据：[git-hash-object](https://git-scm.com/docs/git-hash-object)、[git-cat-file](https://git-scm.com/docs/git-cat-file)、[gitrepository-layout](https://git-scm.com/docs/gitrepository-layout)、[Pro Git：Git Objects](https://git-scm.com/book/en/v2/Git-Internals-Git-Objects)。

51. `ep51-trees-and-snapshots`
    tree 如何组成项目快照：用名称、模式和对象 ID 把 blob 与子 tree 组织成目录结构。

    - 主线：复用 EP50 的 blob，但不依赖 Working Tree，使用一份临时 Index 把 blob 安排到 `app.js` 与子目录路径；`git write-tree` 先为子目录写 tree，再写根 tree。由此看到 snapshot 不是一张扁平文件表，而是 tree 通过名称、mode 和 OID 递归连接 blob 与子 tree。
    - 真实演示：设置仅供实验使用的 `GIT_INDEX_FILE`，录制 `git read-tree --empty`、`git update-index --add --cacheinfo <mode>,<oid>,<path>`、`git ls-files --stage`、`git write-tree`、`git cat-file -p <tree-oid>` 与 `git ls-tree -r <tree-oid>`；再改变一个路径名称而保持 blob 内容不变，证明 blob OID 没变、tree OID 已变化。命令产生的根 tree OID 直接交给 EP52。
    - 本集边界：Index 是 `write-tree` 的输入，不应说成它直接扫描当前 Working Tree；tree 保存路径组成、entry mode 与对象引用，但不保存空目录，也不等于文件系统全部 metadata。mode 只讲 Git 实际记录的文件类型与可执行位，不扩展成完整 Unix permission 教程；临时 Index 不得覆盖课程 fixture 的真实 Index。
    - 官方依据：[git-update-index](https://git-scm.com/docs/git-update-index)、[git-write-tree](https://git-scm.com/docs/git-write-tree)、[git-ls-tree](https://git-scm.com/docs/git-ls-tree)、[Pro Git：Tree Objects](https://git-scm.com/book/en/v2/Git-Internals-Git-Objects#_tree_objects)。

52. `ep52-commit-and-tag-objects`
    commit 与 tag 对象保存什么：沿 tree、parent 和 target 引用建立可追踪的对象图。

    - 主线：先把 EP51 的根 tree 交给 `git commit-tree`，创建一个尚未被 branch 引用的 commit；再基于它创建第二个 commit，观察 tree、parent、author、committer 与 message 如何共同决定新 OID。最后创建 annotated tag，对比 commit 指向项目 snapshot 与 parent，而 tag object 指向任意目标对象并携带 target type、tagger 和 message。
    - 真实演示：固定 git-course-lab 的测试身份与时间，录制 `git commit-tree <tree-oid>`、带 `-p <parent-oid>` 的第二次 `commit-tree`、`git cat-file -p <commit-oid>` 及 `git diff-tree`；随后用 `git tag -a` 为第二枚 commit 创建 annotated tag，并以 `git cat-file -t/-p <tag>`、`git rev-parse <tag>` 与 `git rev-parse <tag>^{}` 对照 tag object OID 和 peeled target OID。此时 commit 可由 tag 到达，但还没有 branch 指向它，交由 EP53 接管。
    - 本集边界：commit 保存一个 tree、零到多个 parent 和身份/时间/message，不保存“相对上一版的 diff”；`commit-tree` 只写对象，不移动 HEAD 或 branch。annotated tag 会创建 tag object，lightweight tag 只是 ref，放到 EP53 对比；签名是可选能力，不能把所有 annotated tag 都说成已经验证可信。
    - 官方依据：[git-commit-tree](https://git-scm.com/docs/git-commit-tree)、[git-cat-file](https://git-scm.com/docs/git-cat-file)、[git-tag](https://git-scm.com/docs/git-tag)、[gitrevisions 的 peel 语法](https://git-scm.com/docs/gitrevisions)。

53. `ep53-refs-head-and-packed-refs`
    名字如何落到对象上：理解 loose ref、symbolic HEAD 与 packed-refs 的存储关系。

    - 主线：EP52 的 commit 已经可以从 annotated tag 到达，但还没有 branch；先用 `git update-ref` 原子创建 `refs/heads/model`，再让 symbolic `HEAD` 指向该 branch。随后为同一目标补一个 lightweight tag，与已有 annotated tag 对照，最后运行 `pack-refs`，观察 ref 的逻辑名称保持不变、底层表示可以从 loose ref 转入 `packed-refs`。
    - 真实演示：录制对象创建后 `git show-ref` 只有 tag、尚无对应 branch，使用 `git update-ref refs/heads/model <new-oid> ''` 在确认 ref 不存在时创建它，再录制 `git symbolic-ref HEAD refs/heads/model`、`git rev-parse --symbolic-full-name HEAD` 和 guarded update 在旧值不匹配时的真实拒绝；随后对照 `$GIT_DIR/HEAD`、loose ref、`git show-ref --dereference`，运行 `git pack-refs --all` 后检查 `packed-refs` 与命令解析结果。文件内容只读展示，所有更新必须通过 Git 命令完成。
    - 本集边界：ref 是可移动名称，不包含 commit 历史或对象内容；symbolic HEAD 通常保存 branch 名，detached HEAD 才直接保存 OID。`packed-refs` 只是 refs 的存储优化，与 EP55 的 object packfile 不是同一种文件；annotated tag 的 ref 指向 tag object，lightweight tag 的 ref 通常直接指向目标对象。reflog 恢复已在 EP16 / EP48 处理，本集只讲 ref 表示与安全更新。
    - 官方依据：[git-update-ref](https://git-scm.com/docs/git-update-ref)、[git-symbolic-ref](https://git-scm.com/docs/git-symbolic-ref)、[git-pack-refs](https://git-scm.com/docs/git-pack-refs)、[git-show-ref](https://git-scm.com/docs/git-show-ref)。

54. `ep54-refspecs`
    fetch 和 push 如何映射 refs：用 refspec 明确来源、目标、命名空间和更新方向。

    - 主线：准备 local 与 bare remote 两端的 refs 面板，先读取 clone 默认的 `remote.origin.fetch`，把 remote 的 `refs/heads/*` 映射到 local 的 `refs/remotes/origin/*`；再用显式 refspec 只 fetch 一个 topic branch。方向反转后，以 push 把 local topic 发布成 remote 上名称不同的 `refs/heads/review`，让同一个 `<src>:<dst>` 语法在两种命令中落到不同仓库。
    - 真实演示：录制两端 `git for-each-ref`、`git config --get-all remote.origin.fetch`、`git fetch origin refs/heads/topic:refs/remotes/origin/topic` 和 `git push origin refs/heads/topic:refs/heads/review`，逐步高亮 source 与 destination 的解析位置；增加一次不带 destination 的 fetch，仅写 `FETCH_HEAD` 的对照，以及一次非 fast-forward 更新的默认拒绝，但不实际执行强制覆盖。
    - 本集边界：fetch 的 source 在 remote、destination 在 local；push 的 source 在 local、destination 在 remote。remote-tracking branch 是本地 ref，不是远端 branch 本体；refspec 控制 ref 映射，不负责 merge 或 rebase，也不等同于 branch upstream 配置。前导 `+` 允许特定非 fast-forward 映射，但仍可能受服务器策略拒绝，本集只解释语义，不把它当常规解法。
    - 官方依据：[git-fetch 的 configured remote-tracking branches](https://git-scm.com/docs/git-fetch#_configured_remote_tracking_branches)、[git-push 的 refspec](https://git-scm.com/docs/git-push#_description)、[gitremote-helpers 的 refspec](https://git-scm.com/docs/gitremote-helpers)。

55. `ep55-packfiles-and-deltas`
    Git 为什么不会无限复制完整文件：把松散对象压入 pack，并用 delta 降低相似对象的存储成本。

    - 主线：在受控 fixture 中连续提交多个相似的大文本版本，先看到 objects 以 loose form 分散存储；repack 后，同一批逻辑对象进入 `.pack`，`.idx` 提供按 OID 定位。再从实际 `verify-pack` 输出中挑出已经形成的 delta chain，说明 pack 可以用 base object 加 delta 表示相似对象，而读取时仍还原为原本的 blob、tree 或 commit。
    - 真实演示：录制 repack 前后的 `git count-objects -v`、pack 目录、`git repack -ad`、`git verify-pack -v <pack-index>` 和若干对象的 `git cat-file -t/-s/-p`；完整记录同一 OID 在 loose 与 packed 状态下保持不变。fixture 必须在录制前验证确实产生可读 delta，不能预设 Git 一定按文件版本或提交顺序选择某个 base，也不能为了画面编造压缩率。
    - 本集边界：packfile 是对象的物理压缩与传输表示，不改变对象内容、类型、OID 或 commit graph；delta 关系不是 Git 的版本历史，也不意味着 Git 在逻辑模型中只保存 diff。`.idx` 是 pack 索引，`packed-refs` 是 refs 存储，两者必须分开；repack / GC 只在隔离 fixture 中运行，不向用户推荐激进参数。
    - 官方依据：[git-pack-objects](https://git-scm.com/docs/git-pack-objects)、[git-repack](https://git-scm.com/docs/git-repack)、[git-verify-pack](https://git-scm.com/docs/git-verify-pack)、[Git pack format](https://git-scm.com/docs/gitformat-pack)、[Pro Git：Packfiles](https://git-scm.com/book/en/v2/Git-Internals-Packfiles)。

56. `ep56-transfer-protocols`
    两个仓库如何交换对象：从 ref advertisement、对象协商到 pack 传输解释 fetch 与 push。

    - 主线：让 client 比 bare remote 少一个 commit，用 protocol v2 的 fetch trace 观察 capability advertisement、`ls-refs`、fetch request、want / have、ACK 与 packfile；同步后再由 client 创建新 commit 并 push，观察 receive-pack 公布 refs / capabilities、client 提交 `<old-oid> <new-oid> <ref>` 更新命令并发送 pack，服务器验证后才移动 ref。
    - 真实演示：在无凭证的本地 Git 服务 fixture 上录制 `GIT_TRACE_PACKET=1 git -c protocol.version=2 fetch origin`，保留完整原始日志作为审查证据，画面只提取与当前阶段对应的 packet 行并与两端对象/refs 状态同步；push 使用独立的 `GIT_TRACE_PACKET=1 git push origin main` 证据，核对传输前缺失对象、传输后的完整 OID、服务端 ref 更新和 status report。不得在 React 中手写一段看似真实却无法对应命令结果的协议日志。
    - 本集边界：fetch 先协商需要的对象再更新本地目标 refs，push 发送更新请求与缺失对象后由服务端决定是否接受；协议传输的是对象与 ref 更新，不传 Working Tree、Index、hooks、credential 或任意本地配置。transport 负责怎样连接，pack protocol 负责怎样交换 Git 数据；SSH / HTTP / git protocol 的选择留给 EP57。protocol v2 的这段演示聚焦 fetch，不能把 push 伪装成同一套 v2 command 流程。
    - 官方依据：[Git wire protocol v2](https://git-scm.com/docs/protocol-v2)、[Pack protocol](https://git-scm.com/docs/gitprotocol-pack)、[HTTP transfer protocols](https://git-scm.com/docs/gitprotocol-http)、[git-fetch](https://git-scm.com/docs/git-fetch)、[git-push](https://git-scm.com/docs/git-push)。

## 第八季：Git 服务端基础设施（选修规划）

第八季面向需要管理代码托管基础设施的人，沿同一组 bare repository 与本地隔离服务，依次解释 transport、接收端、SSH、Smart HTTP、git daemon、GitWeb、部署选择和运行维护。所有地址、账号、key 和服务都由 git-course-lab 临时创建，浏览器与终端素材必须从仓库既有录制流程进入；Pull Request、Review、Rulesets、Actions 和平台 API 仍属于独立的 GitHub Course。季编号只用于内部规划，不进入视频解说、总结或发布文案。

57. `ep57-git-protocols-and-access`
    不同协议改变了什么：比较 local、SSH、HTTP 与 Git protocol 的访问和信任边界。

    - 主线：让同一个 bare repository 依次通过 local path、SSH、Smart HTTP 与 `git://` 暴露，先证明四种连接最终取得相同 refs、对象 OID 与历史，再比较它们如何定位服务、是否提供身份认证、是否加密传输，以及默认允许读还是写。transport 改变连接和访问边界，不改变 Git 的对象模型。
    - 真实演示：分别录制 local path 与 `file://` clone、`ssh://` 的 `git ls-remote`、HTTP clone / fetch 和 `git://` clone；使用 `GIT_TRACE=1` 与必要的 packet trace 核对实际调用的 `upload-pack`，并以完整 OID 对照四份结果。local path 的直接复制 / hardlink 优化与 `file://` 走传输协议的差别必须真实展示；SSH、HTTP 和 daemon 只使用临时测试服务，不出现真实域名或凭证。
    - 本集边界：EP56 已解释对象协商和 pack 传输，本集只回答“怎样连到提供这些服务的一端”；协议地址本身不等于权限模型。SSH 与 HTTPS 可以承载认证和加密，`git://` 通常不提供认证或加密并默认用于匿名读取；local protocol 继承本机文件访问边界。具体建 bare repo、配置 SSH / HTTP 和 daemon 分别留给后续分集。
    - 官方依据：[Pro Git：The Protocols](https://git-scm.com/book/en/v2/Git-on-the-Server-The-Protocols)、[Git transfer protocols](https://git-scm.com/book/en/v2/Git-Internals-Transfer-Protocols)、[git-clone](https://git-scm.com/docs/git-clone)。

58. `ep58-bare-repositories-and-receive-pack`
    一台服务器怎样接收 push：用 bare repository 保存对象与 refs，并由 receive-pack 校验更新请求。

    - 主线：先对比普通 repository 的 Working Tree、Index 和 `.git/` 与 bare repository 直接暴露的 Git directory；随后从 client 首次 push `main`，让 `receive-pack` 接收旧值、新值、目标 ref 和 pack，把传入对象暂放 quarantine，完成连通性、策略与 hook 检查后才移入主对象库并更新 branch。第二个 client clone 后应得到相同 OID，而服务器始终不产生 checkout。
    - 真实演示：录制 `git init --bare project.git`、`git rev-parse --is-bare-repository`、bare 目录中的 objects / refs / config、client 的 `git push -u <local-test-url> main` 和服务端 `git show-ref`；通过 packet / trace 证据显示 `git-receive-pack`，再制造一次 stale non-fast-forward push 的真实拒绝。传输先用本地受控 endpoint，避免在本集提前混入 SSH 身份问题。
    - 本集边界：bare 只表示没有 Working Tree，适合作为共享接收端；它本身不是网络服务器、用户系统、审查平台或备份方案。push 更新 refs，不会在服务器目录检出文件；普通 repository 也能被配置成接收 push，但向当前检出 branch 推送存在额外 Working Tree 一致性风险，不作为课程服务端默认结构。
    - 官方依据：[git-init 的 `--bare`](https://git-scm.com/docs/git-init#Documentation/git-init.txt---bare)、[git-receive-pack](https://git-scm.com/docs/git-receive-pack)、[Pro Git：Getting Git on a Server](https://git-scm.com/book/en/v2/Git-on-the-Server-Getting-Git-on-a-Server)。

59. `ep59-ssh-keys-and-server-access`
    SSH key 如何变成仓库权限：区分用户认证、服务器账户和仓库读写授权。

    - 主线：在隔离 SSH 服务中为两个测试身份各生成临时 key，把 public key 映射到服务端账号；先完成 host key 校验，再由 client 证明自己持有对应 private key。认证成功后，SSH 只负责启动受限的 Git 服务命令，repository 的文件权限、`git-shell` 或上层授权规则再决定它能访问哪个路径和执行 fetch 还是 push。
    - 真实演示：录制临时 `ssh-keygen` 生成结果的 fingerprint 与 public key，不展示 private key 内容；通过专用 `known_hosts` 和 `GIT_SSH_COMMAND` 执行 `ssh -T`、`git ls-remote`、一次允许的 fetch 和一次无写权限的 push。服务端使用 `git-shell` 或等价 forced-command 限制，真实证明交互 shell 被拒绝而 Git 命令仍可工作；两组 key 的身份与 repository 授权结果逐项对照。
    - 本集边界：host key 回答“连接的是哪台服务器”，user key 回答“client 能证明持有哪把私钥”，repository authorization 回答“该身份能操作什么”；commit author / committer 与 SSH 登录身份仍不是同一概念。把多把 public key 放进同一 Unix `git` 账号不会自动产生细粒度仓库身份，通常需要 forced command 或托管层映射；视频不得复制真实 key、agent 列表或用户现有 SSH 配置。
    - 官方依据：[git-shell](https://git-scm.com/docs/git-shell)、[Pro Git：Generating Your SSH Public Key](https://git-scm.com/book/en/v2/Git-on-the-Server-Generating-Your-SSH-Public-Key)、[Pro Git：Setting Up the Server](https://git-scm.com/book/en/v2/Git-on-the-Server-Setting-Up-the-Server)。

60. `ep60-smart-http`
    Smart HTTP 如何提供 Git 服务：把认证、ref advertisement 和对象传输接入 HTTP 基础设施。

    - 主线：让 Web server 把 `/git/` 请求交给 `git http-backend`，GET 的 info/refs advertisement 与后续 upload-pack / receive-pack RPC 共同完成 clone、fetch 和 push。先开放只读，再由 Web server 为测试身份完成认证并把身份传给 backend，最后仅对授权身份开放写路径。
    - 真实演示：在本地 HTTP fixture 中记录 `GIT_PROJECT_ROOT`、`PATH_INFO`、`QUERY_STRING` 与 `REMOTE_USER` 等受控 CGI 输入，录制匿名 `git ls-remote` / clone、一次 401 身份挑战、一次已认证但未授权的 push 拒绝和一次授权 push；client 侧使用 `GIT_TRACE_CURL=1` 与 packet trace，服务端保留访问日志，并对照 `info/refs?service=git-upload-pack` 与 `git-receive-pack` 请求。日志必须脱敏，不记录 Authorization 值。
    - 本集边界：HTTP server 负责 TLS、认证、路由和访问控制，`git http-backend` 提供 Git Smart HTTP 服务；backend 不是完整托管平台，也不会自动提供用户、Review 或细粒度组织权限。Smart HTTP 不等于网页仓库浏览，后者在 EP62；是否允许 receive-pack 必须显式受认证与策略控制，不能因为 clone 成功就推断 push 也开放。
    - 官方依据：[git-http-backend](https://git-scm.com/docs/git-http-backend)、[HTTP transfer protocols](https://git-scm.com/docs/gitprotocol-http)、[Pro Git：Smart HTTP](https://git-scm.com/book/en/v2/Git-on-the-Server-Smart-HTTP)。

61. `ep61-git-daemon`
    git daemon 适合什么场景：提供轻量高效的 Git protocol，并明确匿名访问和权限边界。

    - 主线：启动只绑定 loopback 的 `git daemon`，先让未导出的 repository 被拒绝，再通过 `git-daemon-export-ok` 或受控 `--export-all` 暴露一个公开 fixture；client 可以匿名 clone / fetch，但 push 所需的 receive-pack 仍保持禁用。由此把“高效公开读取”与“完整协作服务”分开。
    - 真实演示：录制 `git daemon --reuseaddr --base-path=<lab-root> --verbose` 的监听与请求日志、export marker 前后的 `git ls-remote git://...`、成功 clone 和 client / server 完整 OID 对照；最后执行一次 push 以真实拒绝收束。端口、根目录和进程生命周期由 git-course-lab 管理，审查完成后停止服务，不把 daemon 暴露到局域网或公网。
    - 本集边界：git daemon 通常没有传输加密和用户认证，适合明确允许匿名读取的受控网络或镜像，不适合承载私有写协作；receive-pack 默认关闭是重要保护，本集不为了演示成功而启用匿名写。export marker 控制 repository 是否可见，不代表其中每个 ref 都有独立权限。
    - 官方依据：[git-daemon](https://git-scm.com/docs/git-daemon)、[Pro Git：Git Daemon](https://git-scm.com/book/en/v2/Git-on-the-Server-Git-Daemon)。

62. `ep62-gitweb`
    仓库浏览与对象传输为什么是两层：用 GitWeb 查看 refs、commit、tree 和 diff，而不改变 Git 数据。

    - 主线：对 EP58 的 bare repository 启动临时 GitWeb，浏览 repository 列表、summary、shortlog、commit、tree、blob、diff 与 tag，并把页面中的 commit OID、parent 和 tree 与终端 `cat-file` / `ls-tree` 结果逐项对应。GitWeb 读取同一对象和 refs，但浏览页面不参与 clone / fetch / push 数据传输。
    - 真实演示：通过 `git instaweb` 或 git-course-lab 管理的本地 Web server 启动 GitWeb，使用仓库既有浏览器录制流程捕获真实页面导航；同时录制 `git show-ref`、`git cat-file -p` 与 URL 中 action / hash 参数，证明页面来自实际 repository。只展示课程 fixture，不使用外部项目截图，也不在 Remotion 中伪造 GitWeb UI。
    - 本集边界：GitWeb 是只读浏览前端，不提供 Pull Request、Issue、Review、Actions、用户权限管理或 repository 写入；`git instaweb` 适合临时查看，不是生产部署建议。网页访问控制仍由 Web server / 部署环境负责；对象传输继续由 SSH、Smart HTTP 或 Git protocol 完成。
    - 官方依据：[gitweb](https://git-scm.com/docs/gitweb)、[git-instaweb](https://git-scm.com/docs/git-instaweb)、[Pro Git：GitWeb](https://git-scm.com/book/en/v2/Git-on-the-Server-GitWeb)。

63. `ep63-hosted-vs-self-hosted`
    托管还是自建：从权限、可用性、维护成本和数据边界选择 Git 服务方式。

    - 主线：从一个十人团队和一个受监管内网团队两个具体场景出发，分别列出协议接入、身份源、repository 权限、Review / CI 集成、可用性、备份恢复、升级、监控与数据边界，再比较 bare SSH、完整自托管平台和第三方托管三种责任划分。结论不是“哪种更高级”，而是谁承担哪些长期工作。
    - 真实演示：复用 EP58–62 已经运行过的本地服务证据，形成 ownership matrix，并用同一个 `git ls-remote` / clone 结果说明 Git client 体验可以相似、后台责任完全不同；自托管列出实际存在的 service、repository storage、SSH / HTTP endpoint、backup 与 monitoring 资产，托管侧只引用公开能力与合同待确认项，不伪造平台 UI、价格、SLA 或合规结论。
    - 本集边界：Git transport 可用不等于已经具备代码审查、组织权限、CI、审计、灾备或高可用；“数据在自己机器上”也不自动意味着风险更低。平台功能细节进入 GitHub Course 或对应平台课程，本集只建立决策方法；最终选择必须基于团队约束和供应商当期文档，不能把课程示例当采购结论。
    - 官方依据：[Pro Git：The Protocols](https://git-scm.com/book/en/v2/Git-on-the-Server-The-Protocols)、[Pro Git：Setting Up the Server](https://git-scm.com/book/en/v2/Git-on-the-Server-Setting-Up-the-Server)、[Pro Git：Third Party Hosted Options](https://git-scm.com/book/en/v2/Git-on-the-Server-Third-Party-Hosted-Options)。

64. `ep64-operating-self-hosted-git`
    自托管 Git 要维护什么：把仓库存储、备份、访问控制、升级和恢复视为独立运维系统。

    - 主线：把一套自托管 Git 服务拆成 repository data、refs / reflogs、config / hooks、身份与授权配置、服务入口、日志监控和备份七类资产；先做一致性检查与正常维护，再制作可恢复备份，最后在隔离目录真正恢复、fsck、clone 和核对 refs。只有恢复演练成功，备份才算可用。
    - 真实演示：录制 `git fsck --full`、`git count-objects -v`、受控的 `git maintenance run`、完整 refs manifest 与服务配置清单；在暂停写入或一致性 snapshot 条件下备份整个 bare repository 及其外部配置，恢复到新的 lab root 后再次 `git fsck --full`、`git show-ref`、fresh clone，并逐项对照 branch / tag OID。另用 bundle 作为对象与 refs 的可移植副本，但明确补齐它不包含的 hooks、config 和服务身份数据。
    - 本集边界：在线文件复制可能跨越对象和 ref 更新，不能默认得到一致快照；GC / maintenance、备份、复制和高可用是不同问题。RPO、RTO、保留期、加密与异地策略由具体组织决定，本集不编造通用数字；所有故障注入和恢复只在 disposable fixture 中完成，不对真实服务执行 prune、删除或覆盖。
    - 官方依据：[git-fsck](https://git-scm.com/docs/git-fsck)、[git-maintenance](https://git-scm.com/docs/git-maintenance)、[git-gc](https://git-scm.com/docs/git-gc)、[git-bundle](https://git-scm.com/docs/git-bundle)。

## 第九季：迁移与其他版本控制系统（选修规划）

第九季面向迁移项目和过渡期混合工具链，使用可丢弃的本地 SVN、Perforce 与 legacy fixtures，依次完成迁移设计、双向过渡、完整导入、通用 stream、验收切换和自定义 importer。Mercurial 专属桥接依赖外部工具且语义与版本差异较大，不进入当前稳定主线；需要时应作为特定项目 adapter 单独评估。所有迁移结论必须来自源系统、转换日志和目标 Git 三方证据，季编号不进入视频解说或发布文案。

65. `ep65-choosing-a-migration-strategy`
    迁移前先决定什么：评估历史保真、停机窗口、作者映射、分支标签和回退方案。

    - 主线：面对一个包含多年历史、多个活动 branch、旧账号和二进制资产的虚构项目，先回答为什么迁移、哪些历史必须在线、是否允许只迁 tip、源系统何时冻结、谁负责 author mapping，以及失败后如何退回。最终产出 source inventory、mapping policy、acceptance checklist、cutover runbook 和 rollback boundary，而不是先运行转换命令。
    - 真实演示：从 git-course-lab 的 SVN / P4 fixtures 导出 revision / changelist 范围、路径布局、branch / tag / label、作者、时间、文件模式、encoding、externals 或 depot view 等事实，生成受版本控制的 migration manifest；再为 full-history、recent-history 与 tip-only 三种方案标出会保留和会丢失的内容。所有数字都来自 fixture 实测，不使用“通常能保留 100%”之类无依据承诺。
    - 本集边界：不同 VCS 的 revision、branch、tag、merge 和身份语义不一定一一对应，源 ID 与目标 Git OID 也不应相同；迁移成功标准必须定义内容、拓扑和元数据允许发生的转换。工具选择发生在需求与验收标准之后；备份源系统不等于回滚计划，试迁移通过也不等于已经授权 cutover。
    - 官方依据：[Pro Git：Migrating to Git](https://git-scm.com/book/en/v2/Git-and-Other-Systems-Migrating-to-Git)、[Pro Git：Git as a Client](https://git-scm.com/book/en/v2/Git-and-Other-Systems-Git-as-a-Client)。

66. `ep66-git-as-an-svn-client`
    Git 如何作为 SVN 客户端：在本地提交图与集中式 SVN revision 之间建立桥接。

    - 主线：从标准 `trunk/branches/tags` 布局的本地 SVN fixture 执行 `git svn clone --stdlayout`，在 Git 本地创建两个 commits；先 `git svn fetch` / `rebase` 接入其他 SVN revision，再用 `git svn dcommit` 把本地 commits 逐个提交为集中式 revisions，并观察 Git 侧 commit 如何因重新建立在 SVN 结果上而变化。
    - 真实演示：录制 `svn log`、`git svn info`、commit message 中的 `git-svn-id`、`git svn fetch`、`git svn rebase` 和 `git svn dcommit` 前后的完整 Git OID / SVN revision 对照；制造一次远端先行后直接 dcommit 的失败，再按正确顺序同步和提交。只使用测试账号与本地服务，不读取操作者现有 SVN 配置或凭证。
    - 本集边界：`git svn` 让 Git client 参与 SVN 中心化工作流，不会把 SVN 服务器变成 Git remote；本地 topic commits 在 dcommit 后可能被重写，不能把原 OID 当跨团队稳定标识。过渡 branch 应保持接近线性，避免把 Git merge history 直接 dcommit；保留 `git-svn-id`，不使用官方明确不推荐的 `--no-metadata`。
    - 官方依据：[git-svn](https://git-scm.com/docs/git-svn)、[Pro Git：Git and Subversion](https://git-scm.com/book/en/v2/Git-and-Other-Systems-Git-as-a-Client#_git_svn)。

67. `ep67-importing-from-subversion`
    SVN 历史如何进入 Git：映射作者、trunk、branches 和 tags，并校验迁移结果。

    - 主线：复用 EP66 的源 repository，先准备完整 author map，再以 standard layout 导入所有目标历史；把 `refs/remotes` 下的 trunk / branches 转成明确的 local branches，并在核对 SVN tag 目录没有后续变更后才创建 Git tags。完成一次增量 fetch 后冻结源端，执行最终同步并发布新的 Git refs。
    - 真实演示：录制 `svnlook youngest`、`svn log`、源路径列表、authors file 覆盖率、`git svn clone --stdlayout --authors-file=<file>` 与最终 `git svn fetch`；目标侧使用 `git for-each-ref`、`git log --all --graph`、`git cat-file` 和抽样 Working Tree checksum 验证作者、时间、branch tip、tag snapshot、copy ancestry、已批准的 merge mapping 与内容。无法映射的作者、非标准布局或发生过修改的 tag 必须让试迁移失败并回到 mapping policy。
    - 本集边界：SVN tag 通常是目录复制，不天然等于不可移动的 Git tag；按路径导入时，一次全局 SVN revision 也不一定对应目标中的一个 commit。保留 `git-svn-id` 作为源 revision 证据，直到迁移审计完成；分支 / tag 转换必须通过 Git refs 命令或导入脚本完成，不手工移动 `.git/refs` 文件。
    - 官方依据：[git-svn](https://git-scm.com/docs/git-svn)、[Pro Git：Subversion](https://git-scm.com/book/en/v2/Git-and-Other-Systems-Migrating-to-Git#_subversion)、[git-for-each-ref](https://git-scm.com/docs/git-for-each-ref)。

68. `ep68-git-as-a-perforce-client`
    Git 如何连接 Perforce：在本地 topic commits 与 Perforce changelist 之间同步工作。

    - 主线：从本地 Helix Core fixture 的一个 depot path 执行 `git p4 clone`，看到 `refs/remotes/p4/master` 与本地 branch；创建本地 commits 后，先用 `git p4 sync` / `rebase` 接入新的 changelist，再通过独立 P4 client workspace 执行 `git p4 submit`。Git 负责本地提交体验，Perforce 仍是最终的 depot 与 changelist 权威。
    - 真实演示：录制 `p4 changes`、`p4 client -o` 的非敏感 view、`git p4 clone`、`git p4 sync`、`git p4 rebase` 和 `git p4 submit`，逐个对照 `refs/remotes/p4/master`、Git commit、P4 changelist number 和文件内容；增加其他用户先提交后的真实冲突 / rebase 场景，但只在 disposable depot 中解决。密码、ticket、真实 P4PORT 和用户现有 client spec 不进入素材。
    - 本集边界：P4 branch 通常由 depot 路径和 branch mapping 表达，不等同于 Git branch；submit 把 Git commits 转为 P4 changelists，不能承诺保留相同身份、OID 或任意 merge topology。`git p4 clone` 默认只取 head snapshot，要取得全部历史需显式 `@all`，留给 EP69；大型文件系统配置可能不支持 submit，不能把导入能力等同于双向能力。
    - 官方依据：[git-p4](https://git-scm.com/docs/git-p4)、[Pro Git：Git and Perforce](https://git-scm.com/book/en/v2/Git-and-Other-Systems-Git-as-a-Client#_git_p4)。

69. `ep69-importing-from-perforce`
    Perforce 项目如何迁移：保留 changelist、路径和作者关系，并建立新的 Git refs。

    - 主线：先锁定 depot view、目标 changelist 范围、branchList、用户映射、path encoding、labels 和大文件策略，再用 `git p4 clone <depot-path>@all` 完整导入；对路径式 branches 分别验证自动 detection 与显式 branchList，以 manifest 选择可信结果。试迁移通过后执行 final sync、冻结 P4、重跑验收并发布 Git refs。
    - 真实演示：录制 `p4 changes -m`、branch / label / user 与 client view 证据、带 `@all` 的 `git p4 clone`、`--detect-branches`、`git-p4.branchList`、`--import-labels` 和 user mapping；目标侧检查 `refs/remotes/p4/*`、commit message 中的 changelist、作者、路径、二进制内容和抽样 snapshot。对一条 branch mapping 模糊的 fixture 展示自动检测差异，再以显式 mapping 修正。
    - 本集边界：branch detection 是根据 depot 布局与 P4 branch metadata 推断，不能保证还原 Git 式 merge ancestry；labels、空 changelists、excluded paths、file types、keyword expansion 和 encoding 都需要单独验收。导入后的 Git tags / branches 是迁移政策结果，不是 P4 概念的机械复制；源端保持只读回退窗口，直到 EP71 的 cutover 验收完成。
    - 官方依据：[git-p4](https://git-scm.com/docs/git-p4)、[git-p4 Branch Detection](https://git-scm.com/docs/git-p4#_branch_detection)、[Pro Git：Perforce](https://git-scm.com/book/en/v2/Git-and-Other-Systems-Migrating-to-Git#_perforce_importer)。

70. `ep70-fast-export-and-fast-import`
    迁移器怎样批量写入 Git：用 fast-export stream 描述 blobs、commits、tags 与 refs，再由 fast-import 重建目标历史。

    - 主线：先从一个受控 Git source 导出可读 stream，识别 `blob`、`commit`、`mark`、`from`、`merge`、file commands、`reset` 与 `tag`；在空 repository 中用 fast-import 重建，再通过 marks 对照源对象和目标对象。随后新增一次 source commit，复用 export / import marks 只传增量，展示迁移器如何安全续跑。
    - 真实演示：录制 `git fast-export --all --show-original-ids --export-marks=<file>`、stream 的脱敏片段、`git fast-import --export-marks=<file>`、首次导入结果，以及同时使用 import / export marks 的增量轮次；两端执行 `git for-each-ref`、`git rev-list --parents`、`git ls-tree -r` 与内容 checksum。签名 tag / commit 单独放入 fixture，真实展示选择 strip、verbatim 或 abort 的策略结果，不能静默丢失。
    - 本集边界：fast-export / fast-import stream 是迁移和批量导入接口，不是完整 repository backup；它不自动携带 hooks、config、reflogs、Working Tree、凭证或服务配置。转换可能改变 commit / tag OID，尤其是过滤、重映射和签名处理后；marks 是流内稳定引用与增量状态，不应被解释成 Git refs，也不能跨不兼容的导入策略盲目复用。
    - 官方依据：[git-fast-export](https://git-scm.com/docs/git-fast-export)、[git-fast-import](https://git-scm.com/docs/git-fast-import)、[Pro Git：A Custom Importer](https://git-scm.com/book/en/v2/Git-and-Other-Systems-Migrating-to-Git#_a_custom_importer)。

71. `ep71-validating-and-cutting-over`
    什么时候才算迁移完成：把源数据、目标对象、refs、权限和 fresh clone 纳入同一份验收与切换记录。

    - 主线：从 EP65 的 acceptance checklist 出发，对 SVN 或 P4 试迁移逐项检查 source revision coverage、作者、时间、branch / tag、merge parents、文件内容、可执行位、二进制、encoding 和忽略 / 属性策略；随后冻结源端写入，执行 final delta import，重新验收，发布目标 Git 服务并用全新 client 完成 clone、build / test 与 push smoke test。任何一项失败都停止切换。
    - 真实演示：生成 source / target manifests，录制 `git fsck --full`、`git for-each-ref`、分别运行 `git rev-list --all --count` 与 `git rev-list --all --parents`、`git ls-tree -r`、抽样 `git archive` / checksum 和 fresh clone；将源 revision / changelist 映射、目标 OID、转换规则与 verdict 写进 migration report。切换演示包含源端 read-only、最后同步、目标 endpoint 启用、测试 push 和回退到源端的演练时间线，但全部发生在 lab fixture。
    - 本集边界：commit 数量相等不是充分验收，OID 不同也不必然失败；必须按 EP65 事先批准的语义和允许转换判断。DNS、访问入口或默认 remote 切换不等于数据验证完成；rollback 应保留源系统与映射状态，不能靠目标 Git 上一次 `reset --hard` 代替。生产 cutover 需要组织授权，本集只提供可执行检查模型。
    - 官方依据：[git-fsck](https://git-scm.com/docs/git-fsck)、[git-for-each-ref](https://git-scm.com/docs/git-for-each-ref)、[git-rev-list](https://git-scm.com/docs/git-rev-list)、[Pro Git：Migrating to Git](https://git-scm.com/book/en/v2/Git-and-Other-Systems-Migrating-to-Git)。

72. `ep72-building-a-custom-importer`
    没有现成迁移器怎么办：把源系统记录转换成 blob、tree、commit 和 refs，并逐层验证。

    - 主线：准备只有 revisions、parents、authors、timestamps、paths 与 file contents 的小型 legacy JSONL fixture，先定义 branch、tag、merge、删除、重命名和身份的映射政策，再让 importer 输出 fast-import stream；用 marks 串接 parent 和 blob，按顺序创建 commits、merge parents、refs 与 tags。中途故意终止后，从 checkpoint / marks 恢复增量导入。
    - 真实演示：展示一条源 revision 如何转换为 `blob`、`commit`、`author` / `committer`、`from` / `merge`、`M` / `D`、`reset` 与 `tag` 指令，运行 `git fast-import --export-marks=<file>` 写入空 repository；随后录制 failure injection、resume、`git fsck --full`、refs / parent graph、tree / blob 内容和 source-to-target mapping report。转换脚本、fixture 与预期 manifest 必须版本化，不能把课程逻辑只埋在录屏命令中。
    - 本集边界：custom importer 不能猜出源系统没有表达的 merge ancestry、身份或 tag 语义，所有不可逆映射都必须显式记录；能生成合法 Git 对象只代表结构可读，不代表迁移正确。生产使用前还需幂等性、断点续跑、错误隔离、规模测试、完整审计和 cutover 授权；不直接向现有目标 repository 导入，始终先写全新的 candidate repository。
    - 官方依据：[git-fast-import](https://git-scm.com/docs/git-fast-import)、[git-fast-export](https://git-scm.com/docs/git-fast-export)、[Pro Git：A Custom Importer](https://git-scm.com/book/en/v2/Git-and-Other-Systems-Migrating-to-Git#_a_custom_importer)。

## 形式

主线单集通常 3–5 分钟；内部原理、服务端和迁移选修在无法继续删减而仍保持一个核心问题时，可以放宽到 5–8 分钟。时长放宽不用于堆命令：如果一集需要同时回答两个独立问题，应重新收窄或拆分。Remotion 统一负责课程节奏、终端、字幕、代码窗口、Git 抽象模型和章节包装。

第一至第七季是主线课程，第八、九季是选修规划；这些条目不表示对应 episode 已进入制作。尚未创建 episode JSON 时，大纲使用“主线、真实演示、本集边界、官方依据”四层结构保存规划；开始制作时先创建 `episodes/<episode-id>.json`，把教学目标、scene、旁白、来源、审查和发布数据迁入唯一内容源，并把大纲收缩为指向 JSON 的链接和一句定位。后续不得同时维护两份单集教学设计。
