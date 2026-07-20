// Claude Code Course owns its visual tokens. Do not import Git Course palette
// values here: both courses share production gates, not brand semantics.
export const WEIGHT = {
  regular: 400,
  bold: 700,
} as const;

// Open/local alternatives only. Anthropic's commercial typefaces are not
// referenced, downloaded, or required by the render pipeline.
export const FONT = {
  display: '"Noto Serif CJK SC", "Source Han Serif SC", "Songti SC", serif',
  sans: '"Noto Sans CJK SC", "Source Han Sans SC", "Microsoft YaHei", sans-serif',
  mono: '"JetBrainsMono Nerd Font Mono", "JetBrains Mono", "SFMono-Regular", monospace',
} as const;

export const COLOR = {
  canvas: {
    base: '#FAF9F5',
    paper: '#FAF9F5',
    soft: '#F5F4ED',
    raised: '#FFFFFF',
    inverse: '#141413',
    darkPanel: '#262624',
    darkRaised: '#30302E',
    overlay: 'rgba(250,249,245,0.94)',
  },
  text: {
    primary: '#141413',
    secondary: '#3D3D3A',
    tertiary: '#73726C',
    inverse: '#FAF9F5',
    inverseMuted: '#C2C0B6',
    brand: '#9C4F37',
    info: '#3266AD',
    success: '#265B19',
    warning: '#5A4815',
    danger: '#7F2C28',
  },
  stroke: {
    soft: 'rgba(31,30,29,0.15)',
    default: 'rgba(31,30,29,0.30)',
    strong: 'rgba(31,30,29,0.40)',
  },
  surface: {
    info: '#D6E4F6',
    success: '#E9F1DC',
    warning: '#F6EEDF',
    danger: '#F7ECEC',
  },
  brand: {
    orange: '#D97757',
    blue: '#6A9BCC',
    green: '#788C5D',
  },
  semantic: {
    client: '#D97757',
    provider: '#3266AD',
    auth: '#5A4815',
    model: '#D97757',
    success: '#265B19',
    danger: '#7F2C28',
  },
  terminal: {
    bg: '#141413',
    bgTop: '#30302E',
    border: 'rgba(250,249,245,0.15)',
    prompt: '#7AB948',
    promptMuted: '#9C9A92',
    output: '#FAF9F5',
    comment: '#9C9A92',
    title: '#C2C0B6',
    info: '#80AADD',
    success: '#7AB948',
    warning: '#D1A041',
    danger: '#EE8884',
  },
  effects: {
    shadowSoft: 'rgba(20,20,19,0.055)',
    shadowPanel: 'rgba(20,20,19,0.10)',
    shadowTerminal: 'rgba(20,20,19,0.22)',
    packetRing: 'rgba(106,155,204,0.22)',
  },
} as const;

// Semantic type roles for a 1920x1080 course frame. Components should use
// these roles instead of inventing per-scene font families or weights.
export const TYPE = {
  display: {fontFamily: FONT.display, fontSize: 82, lineHeight: 1.1, fontWeight: WEIGHT.bold, letterSpacing: 0},
  heading: {fontFamily: FONT.sans, fontSize: 52, lineHeight: 1.18, fontWeight: WEIGHT.bold, letterSpacing: 0},
  subheading: {fontFamily: FONT.sans, fontSize: 38, lineHeight: 1.34, fontWeight: WEIGHT.bold, letterSpacing: 0},
  body: {fontFamily: FONT.sans, fontSize: 28, lineHeight: 1.48, fontWeight: WEIGHT.regular, letterSpacing: 0},
  label: {fontFamily: FONT.sans, fontSize: 24, lineHeight: 1.4, fontWeight: WEIGHT.bold, letterSpacing: 0},
  labelSmall: {fontFamily: FONT.sans, fontSize: 20, lineHeight: 1.32, fontWeight: WEIGHT.bold, letterSpacing: 0},
  code: {fontFamily: FONT.mono, fontSize: 26, lineHeight: 1.45, fontWeight: WEIGHT.regular, letterSpacing: 0},
  codeSmall: {fontFamily: FONT.mono, fontSize: 21, lineHeight: 1.4, fontWeight: WEIGHT.regular, letterSpacing: 0},
  subtitle: {fontFamily: FONT.sans, fontSize: 38, lineHeight: 1.34, fontWeight: WEIGHT.bold, letterSpacing: 0},

  // Compatibility aliases while legacy compositions are still registered.
  hero: {fontFamily: FONT.display, fontSize: 82, lineHeight: 1.1, fontWeight: WEIGHT.bold, letterSpacing: 0},
  title: {fontFamily: FONT.sans, fontSize: 52, lineHeight: 1.18, fontWeight: WEIGHT.bold, letterSpacing: 0},
  ui: {fontFamily: FONT.sans, fontSize: 24, lineHeight: 1.4, fontWeight: WEIGHT.bold, letterSpacing: 0},
  uiSmall: {fontFamily: FONT.sans, fontSize: 20, lineHeight: 1.32, fontWeight: WEIGHT.bold, letterSpacing: 0},
} as const;

export const LAYOUT = {
  safeX: 150,
  sceneTop: 112,
  sceneBottom: 150,
  scenePadding: '112px 150px 150px',
  screenshot: {
    left: 240,
    right: 240,
    top: 90,
    height: 810,
  },
  terminalPadding: '84px 250px 176px',
} as const;

export const SUBTITLE = {
  bottom: 30,
  maxWidth: 1480,
  ...TYPE.subtitle,
  lightText: COLOR.text.primary,
  lightShadow: '0 1px 0 rgba(255,255,255,0.98), 0 0 12px rgba(250,249,245,0.98)',
  darkText: COLOR.text.inverse,
  darkShadow: '0 2px 8px rgba(20,20,19,0.96), 0 0 3px rgba(20,20,19,1)',
} as const;
