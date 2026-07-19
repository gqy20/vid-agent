export const COLOR = {
  canvas: {
    base: '#f6f8fa',
    soft: '#eef1f4',
    raised: '#ffffff',
    overlay: 'rgba(255,255,255,0.92)',
  },
  text: {
    primary: '#1f2328',
    secondary: '#59636e',
    tertiary: '#818b98',
    inverse: '#ffffff',
  },
  stroke: {
    soft: '#d8dee4',
    default: '#b7c0ca',
    strong: '#818b98',
  },
  git: {
    main: '#1f6869',
    feature: '#a45f49',
    head: '#b98723',
    commit: '#1f2328',
    graphLine: '#b7c0ca',
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
    shadowSoft: 'rgba(31,35,40,0.08)',
    shadowPanel: 'rgba(31,35,40,0.14)',
    actionWash: 'rgba(9,105,218,0.08)',
    mergedWash: 'rgba(130,80,223,0.08)',
  },
} as const;

export const FONT = {
  sans: '"GitCourseSans", "GitCourseLatin", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  mono: '"GitCourseMono", "SFMono-Regular", Consolas, monospace',
} as const;

export const WEIGHT = {
  regular: 400,
  bold: 700,
} as const;
