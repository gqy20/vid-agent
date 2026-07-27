export const EP04 = {
  id: 'ep04-branch-is-pointer',
  title: 'Branch 只是一个指针',
  seriesTitle: '看得见的 Git',
  compositionId: 'GitCourseEp04BranchIsPointer',
  sourceReferences: [
    'docs/references/progit2-zh/ch03-git-branching.asc',
    'docs/references/progit2/ch03-git-branching.asc',
  ],
};

export const EP05 = {
  id: 'ep05-head',
  title: 'HEAD 是什么',
  seriesTitle: '看得见的 Git',
  compositionId: 'GitCourseEp05Head',
  sourceReferences: [
    'docs/references/progit2-zh/book/03-git-branching/sections/nutshell.asc',
    'docs/references/progit2-zh/book/10-git-internals/sections/refs.asc',
  ],
};

export const EP06 = {
  id: 'ep06-merge',
  title: 'Merge 做了什么',
  seriesTitle: '看得见的 Git',
  compositionId: 'GitCourseEp06Merge',
  sourceReferences: [
    'docs/references/progit2-zh/book/03-git-branching/sections/basic-branching-and-merging.asc',
    'docs/references/progit2-zh/book/07-git-tools/sections/advanced-merging.asc',
  ],
};

export const EP07 = {
  id: 'ep07-rebase',
  title: 'Rebase 做了什么',
  seriesTitle: '看得见的 Git',
  compositionId: 'GitCourseEp07Rebase',
  sourceReferences: [
    'docs/references/progit2-zh/book/03-git-branching/sections/rebasing.asc',
    'docs/references/progit2-zh/book/07-git-tools/sections/rewriting-history.asc',
  ],
};

export const EP08 = {
  id: 'ep08-reset-revert-restore',
  title: 'Reset、Revert、Restore',
  seriesTitle: '看得见的 Git',
  compositionId: 'GitCourseEp08ResetRevertRestore',
  sourceReferences: [
    'docs/references/progit2-zh/book/07-git-tools/sections/reset.asc',
    'docs/references/progit2-zh/book/07-git-tools/sections/advanced-merging.asc',
    'docs/references/progit2-zh/book/02-git-basics/sections/undoing.asc',
  ],
};

export const EP09 = {
  id: 'ep09-diff-compares-states',
  title: 'Diff 到底在比较什么',
  seriesTitle: '看得见的 Git',
  compositionId: 'GitCourseEp09DiffComparesStates',
  sourceReferences: [
    'docs/references/progit2-zh/book/02-git-basics/sections/recording-changes.asc',
    'https://git-scm.com/docs/git-diff',
  ],
};

export const EP10 = {
  id: 'ep10-selecting-revisions',
  title: '怎样选中一个 Commit',
  seriesTitle: '看得见的 Git',
  compositionId: 'GitCourseEp10SelectingRevisions',
  sourceReferences: [
    'docs/references/progit2-zh/book/07-git-tools/sections/revision-selection.asc',
    'https://git-scm.com/docs/gitrevisions',
  ],
};

export const EP11 = {
  id: 'ep11-tags',
  title: 'Tag 与 Branch 有什么不同',
  seriesTitle: '看得见的 Git',
  compositionId: 'GitCourseEp11Tags',
  sourceReferences: [
    'docs/references/progit2-zh/book/02-git-basics/sections/tagging.asc',
    'docs/references/progit2-zh/book/10-git-internals/sections/refs.asc',
  ],
};

export const EP12 = {
  id: 'ep12-remote-tracking-branches',
  title: 'origin/main 到底在哪里',
  seriesTitle: '看得见的 Git',
  compositionId: 'GitCourseEp12RemoteTrackingBranches',
  sourceReferences: [
    'docs/references/progit2-zh/book/03-git-branching/sections/remote-branches.asc',
    'docs/references/progit2-zh/book/10-git-internals/sections/refs.asc',
    'docs/references/progit2-zh/book/10-git-internals/sections/refspec.asc',
  ],
};

export const EP13 = {
  id: 'ep13-fetch-pull-push',
  title: 'Fetch、Pull、Push 分别做了什么',
  seriesTitle: '看得见的 Git',
  compositionId: 'GitCourseEp13FetchPullPush',
  sourceReferences: [
    'docs/references/progit2-zh/book/02-git-basics/sections/remotes.asc',
    'https://git-scm.com/docs/git-fetch',
    'https://git-scm.com/docs/git-pull',
    'https://git-scm.com/docs/git-push',
  ],
};

export const EP14 = {
  id: 'ep14-ahead-behind-non-fast-forward',
  title: 'Ahead、Behind 与拒绝推送',
  seriesTitle: '看得见的 Git',
  compositionId: 'GitCourseEp14AheadBehindNonFastForward',
  sourceReferences: [
    'docs/references/progit2-zh/book/03-git-branching/sections/remote-branches.asc',
    'https://git-scm.com/docs/git-status',
    'https://git-scm.com/docs/git-push',
  ],
};

export const EP15 = {
  id: 'ep15-unmerged-index',
  title: '冲突时 Index 里有什么',
  seriesTitle: '看得见的 Git',
  compositionId: 'GitCourseEp15UnmergedIndex',
  sourceReferences: [
    'docs/references/progit2-zh/book/07-git-tools/sections/advanced-merging.asc',
    'https://git-scm.com/docs/git-merge',
    'https://git-scm.com/docs/git-ls-files',
  ],
};

export const EP16 = {
  id: 'ep16-reflog-recovery',
  title: 'Reflog 如何找回提交',
  seriesTitle: '看得见的 Git',
  compositionId: 'GitCourseEp16ReflogRecovery',
  sourceReferences: [
    'docs/references/progit2-zh/book/10-git-internals/sections/maintenance.asc',
    'https://git-scm.com/docs/git-reflog',
  ],
};

export const COMMAND_STEPS = [
  {
    command: 'git log --oneline --graph',
    output: ['* C2 add login form', '* C1 create app shell', '* C0 initial commit'],
  },
  {
    command: 'git branch feature',
    output: ['# 新增 feature 指针，文件没有被复制'],
  },
  {
    command: 'git switch feature',
    output: ['Switched to branch feature'],
  },
  {
    command: 'git commit -m "try new header"',
    output: ['[feature C3] try new header', ' feature 指针向前移动'],
  },
] as const;
