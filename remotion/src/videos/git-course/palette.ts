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
    bg: '#17211f',
    bgTop: '#202a27',
    border: '#33403c',
    promptMuted: '#91a79f',
    output: '#cdd8d3',
    comment: '#91a79f',
    title: '#91a79f',
    chromeRed: '#b64e45',
    chromeYellow: '#b98723',
    chromeGreen: '#60766a',
  },
  effects: {
    shadowSoft: 'rgba(24,35,33,0.06)',
    shadowPanel: 'rgba(24,35,33,0.09)',
    shadowTerminal: 'rgba(23,33,31,0.12)',
    mainWash: 'rgba(31,104,105,0.035)',
    featureWash: 'rgba(164,95,73,0.04)',
    headHighlight: 'rgba(185,135,35,0.18)',
  },
} as const;

export const FONT = {
  brand:
    '"GitCourseBrandLatin", "GitCourseBrand117", "GitCourseBrand118", "GitCourseBrand119", "GitCourseSans", "GitCourseLatin", sans-serif',
  sans: '"GitCourseSans", "GitCourseLatin", sans-serif',
  mono: '"GitCourseMono", "SFMono-Regular", Consolas, monospace',
};
