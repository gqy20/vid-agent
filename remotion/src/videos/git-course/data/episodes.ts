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
