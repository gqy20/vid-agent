export const COLOR = {
  canvas: {
    base: '#f7f7f4',
    soft: '#eef1ec',
    raised: '#ffffff',
    overlay: 'rgba(255,255,255,0.86)',
  },
  text: {
    primary: '#182321',
    secondary: '#5f6b67',
    tertiary: '#89928d',
    inverse: '#f7f7f4',
  },
  stroke: {
    soft: '#dfe5dc',
    default: '#c7cec5',
    strong: '#89928d',
  },
  git: {
    main: '#1f6869',
    feature: '#a45f49',
    head: '#b98723',
    commit: '#182321',
    graphLine: '#c7cec5',
    workingTree: '#60766a',
    index: '#b98723',
    conflict: '#b64e45',
  },
  terminal: {
    bg: '#141729',
    bgTop: '#202536',
    border: 'rgba(174,184,198,0.16)',
    prompt: '#8bd49c',
    promptMuted: '#7f8a9a',
    output: '#d8dee9',
    comment: '#7f8a9a',
    title: '#aeb8c6',
    chromeRed: '#ff5f57',
    chromeYellow: '#febc2e',
    chromeGreen: '#28c840',
  },
  effects: {
    shadowSoft: 'rgba(24,35,33,0.06)',
    shadowPanel: 'rgba(24,35,33,0.09)',
    shadowTerminal: 'rgba(18,20,22,0.18)',
    mainWash: 'rgba(31,104,105,0.035)',
    featureWash: 'rgba(164,95,73,0.04)',
    headHighlight: 'rgba(185,135,35,0.18)',
  },
} as const;

export const FONT = {
  brand:
    '"GitCourseBrandLatin", "GitCourseBrand117", "GitCourseBrand118", "GitCourseBrand119", "GitCourseSans", "GitCourseLatin", sans-serif',
  sans: '"GitCourseSans", "GitCourseLatin", sans-serif',
  ui: '"GitCourseLatin", "GitCourseSans", sans-serif',
  mono: '"GitCourseMono", "SFMono-Regular", Consolas, monospace',
};

// Only expose weights backed by real local font files.
// GitCourseSans: 400 / 500 / 700, GitCourseLatin: 400 / 500 / 600 / 700 / 900,
// GitCourseMono (JetBrains Mono): 400 / 700, GitCourseBrand*: 900.
export const WEIGHT = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  black: 900,
} as const;
