export const COLOR = {
  canvas: {
    base: '#f7f7f5',
    soft: '#f0f1ef',
    raised: '#ffffff',
    overlay: 'rgba(255,255,255,0.94)',
  },
  text: {
    primary: '#191c20',
    secondary: '#515963',
    tertiary: '#7a8490',
    inverse: '#ffffff',
  },
  stroke: {
    soft: '#e1e3e5',
    default: '#d1d5da',
    strong: '#77818d',
  },
  git: {
    logo: '#f05133',
    main: '#1f6869',
    feature: '#a45f49',
    head: '#b98723',
    commit: '#191c20',
    graphLine: '#b5bdc7',
  },
  github: {
    logo: '#181717',
    action: '#0969da',
    open: '#1a7f37',
    approved: '#1f883d',
    changesRequested: '#bc4c00',
    merged: '#8250df',
    pending: '#9a6700',
    failed: '#cf222e',
  },
  browser: {
    chrome: '#f6f8fa',
    viewport: '#ffffff',
    address: '#ffffff',
  },
  effects: {
    shadowSoft: 'rgba(25,28,32,0.055)',
    shadowPanel: 'rgba(25,28,32,0.11)',
    actionWash: 'rgba(9,105,218,0.065)',
    openWash: 'rgba(26,127,55,0.08)',
    approvedWash: 'rgba(31,136,61,0.08)',
    changesRequestedWash: 'rgba(188,76,0,0.08)',
    mergedWash: 'rgba(130,80,223,0.08)',
    pendingWash: 'rgba(154,103,0,0.08)',
    failedWash: 'rgba(207,34,46,0.08)',
  },
} as const;

export const FONT = {
  display: '"GitHubCourseDisplayLatin", "GitHubCourseCJK", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  sans: '"GitHubCourseTextLatin", "GitHubCourseCJK", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  mono: '"GitCourseMono", "SFMono-Regular", Consolas, monospace',
} as const;

export const WEIGHT = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;
