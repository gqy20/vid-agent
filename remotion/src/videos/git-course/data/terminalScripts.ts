import {FPS, seconds} from '../timeline';

export type TerminalEffect =
  | 'inspect-history'
  | 'create-feature-pointer'
  | 'move-head-to-feature'
  | 'advance-feature-pointer'
  | 'inspect-head'
  | 'switch-head-to-feature'
  | 'commit-on-current-branch';

export type TerminalStep = {
  at: number;
  promptBranch: 'main' | 'feature';
  command: string;
  output: readonly string[];
  effect: TerminalEffect;
  typeFrames?: number;
};

const typeDuration = (command: string) =>
  Math.max(24, Math.min(54, Math.round(command.length * 1.35)));

const EP04_SCENE_START_SECONDS = {
  terminal: 30,
  branchWrite: 48,
  switch: 70 + 28,
  commit: 98 + 24,
} as const;

const EP04_RAW_TERMINAL = [
  {
    at: seconds(EP04_SCENE_START_SECONDS.terminal + 22 / FPS),
    promptBranch: 'main',
    command: 'git log --oneline --graph',
    output: ['* C2 add login form', '* C1 create app shell', '* C0 initial commit'],
    effect: 'inspect-history',
  },
  {
    at: seconds(EP04_SCENE_START_SECONDS.branchWrite + 36 / FPS),
    promptBranch: 'main',
    command: 'git branch feature',
    output: ['# feature now points to C2'],
    effect: 'create-feature-pointer',
  },
  {
    at: seconds(EP04_SCENE_START_SECONDS.switch + 34 / FPS),
    promptBranch: 'main',
    command: 'git switch feature',
    output: ["Switched to branch 'feature'"],
    effect: 'move-head-to-feature',
  },
  {
    at: seconds(EP04_SCENE_START_SECONDS.commit + 38 / FPS),
    promptBranch: 'feature',
    command: 'git commit -m "try new header"',
    output: ['[feature C3] try new header', '1 file changed, 3 insertions(+)'],
    effect: 'advance-feature-pointer',
  },
] as const;

export const EP04_TERMINAL: readonly TerminalStep[] = EP04_RAW_TERMINAL.map(
  (step): TerminalStep => ({...step, typeFrames: typeDuration(step.command)}),
);

export type GitCourseState = {
  main: 'C2';
  feature?: 'C2' | 'C3';
  headBranch: 'main' | 'feature';
  commits: readonly string[];
  lastEffect?: TerminalEffect;
};

const effectFrame = (step: TerminalStep) => step.at + (step.typeFrames ?? 36) + 18;

export const deriveEp04GitState = (frame: number): GitCourseState => {
  const featureCreated = frame >= effectFrame(EP04_TERMINAL[1]);
  const switched = frame >= effectFrame(EP04_TERMINAL[2]);
  const featureAdvanced = frame >= effectFrame(EP04_TERMINAL[3]);
  const lastStep = [...EP04_TERMINAL].reverse().find((step) => frame >= effectFrame(step));

  return {
    main: 'C2',
    feature: featureAdvanced ? 'C3' : featureCreated ? 'C2' : undefined,
    headBranch: switched ? 'feature' : 'main',
    commits: featureAdvanced ? ['C0', 'C1', 'C2', 'C3'] : ['C0', 'C1', 'C2'],
    lastEffect: lastStep?.effect,
  };
};

export const getEp04RefsLines = (state: GitCourseState) => [
  'main    -> C2',
  state.feature ? `feature -> ${state.feature}` : 'feature -> ?',
  `HEAD    -> ${state.headBranch}`,
];

export const getEp04RefHighlight = (state: GitCourseState) => {
  if (state.lastEffect === 'advance-feature-pointer') return 1;
  if (state.lastEffect === 'move-head-to-feature') return 2;
  if (state.lastEffect === 'create-feature-pointer') return 1;
  return 0;
};

const EP05_SCENE_START_SECONDS = {
  terminal: 34,
} as const;

const EP05_RAW_TERMINAL = [
  {
    at: seconds(EP05_SCENE_START_SECONDS.terminal + 26 / FPS),
    promptBranch: 'main',
    command: 'cat .git/HEAD',
    output: ['ref: refs/heads/main'],
    effect: 'inspect-head',
  },
  {
    at: seconds(EP05_SCENE_START_SECONDS.terminal + 4),
    promptBranch: 'main',
    command: 'git switch feature',
    output: ["Switched to branch 'feature'"],
    effect: 'switch-head-to-feature',
  },
  {
    at: seconds(EP05_SCENE_START_SECONDS.terminal + 12),
    promptBranch: 'feature',
    command: 'git commit -m "work"',
    output: ['[feature C3] work', '1 file changed, 1 insertion(+)'],
    effect: 'commit-on-current-branch',
  },
] as const;

export const EP05_TERMINAL: readonly TerminalStep[] = EP05_RAW_TERMINAL.map(
  (step): TerminalStep => ({...step, typeFrames: typeDuration(step.command)}),
);
