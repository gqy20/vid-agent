export type CommitNodeData = {
  id: string;
  label?: string;
};

export type BranchLabelData = {
  name: string;
  target: string;
  active?: boolean;
  lane?: 'top' | 'bottom';
};

export type GitGraphState = {
  commits: readonly CommitNodeData[];
  branches: readonly BranchLabelData[];
  head?: {
    target: string;
    branch?: string;
  };
};
