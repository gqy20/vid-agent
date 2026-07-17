# GitHub Course 课程大纲

## 第一季：从 Branch 到 Pull Request（规划）

第一季把 Git 的 branch、remote 和 merge 模型接到 GitHub 的协作流程。浏览器展示真实操作，状态模型解释 base、head、review、checks 和合并结果。

1. `gh01-git-vs-github`
   Git 与 GitHub 分别负责什么：区分本地对象模型和托管协作平台。

2. `gh02-account-auth-and-identity`
   平台账户、SSH key、token 和 commit identity 为什么不是同一个身份。

3. `gh03-repository-fork-and-clone`
   repository、fork 与 clone 分别创建了什么关系。

4. `gh04-remotes-and-publishing-branches`
   origin、upstream 与个人 fork 如何连接，以及 push branch 发布了什么。

5. `gh05-pull-request-model`
   Pull Request 是什么：围绕 base 与 head 的持续比较组织讨论、审查和检查状态。

6. `gh06-review-and-update-cycle`
   comment、review、request changes 和追加 commit 如何推进一个 PR。

7. `gh07-checks-conflicts-and-merge`
   Checks、冲突与 merge readiness 如何决定 PR 能否进入目标 branch。

8. `gh08-issue-to-merged-change`
   从 Issue 到 merged PR：串起 topic branch、review、checks、merge 和问题关闭。

## 第二季：团队治理与自动化（规划）

第二季从一次贡献扩展到组织级规则、自动化和发布。重点是平台状态与 Git refs 的边界，不把 GitHub 设置页讲成按钮清单。

9. `gh09-organizations-teams-and-roles`
   organization、team、repository role 与 outside collaborator 的权限层次。

10. `gh10-codeowners-and-review-responsibility`
    CODEOWNERS 如何把路径映射到审查责任，而不改变 Git 文件所有权。

11. `gh11-rulesets-and-protected-refs`
    Rulesets 如何约束 branch/tag 更新、Pull Request、状态检查、签名和 force push。

12. `gh12-actions-mental-model`
    event、workflow、job、step 与 runner 之间是什么关系。

13. `gh13-workflow-permissions-and-reuse`
    `GITHUB_TOKEN`、第三方 Action 和 reusable workflow 的权限与供应链边界。

14. `gh14-secrets-environments-and-deployments`
    repository、organization、environment secrets，以及部署审批和环境保护规则。

15. `gh15-dependency-and-code-security`
    依赖更新、secret scanning 与 code scanning 的结果如何进入 Pull Request。

16. `gh16-api-webhooks-and-github-apps`
    API、webhook 和 GitHub App 分别负责主动查询、事件通知和受控集成。

## 制作状态

所有条目目前都是规划，不表示 episode 已进入制作。开始制作时先创建 `episodes/<episode-id>.json`；教学、scene、旁白、浏览器 scenario、审查和发布数据随后只在该 JSON 中维护。
