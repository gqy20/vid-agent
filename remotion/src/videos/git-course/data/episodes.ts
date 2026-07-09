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
