export type GitCourseState = {
  readonly main: 'C2';
  readonly feature?: 'C2' | 'C3';
  readonly headBranch: 'main' | 'feature';
  readonly commits: readonly string[];
};
