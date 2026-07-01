import {Easing} from 'remotion';

/* 字体（本地专业字体，零联网） */
export const MONO = '"JetBrainsMono Nerd Font", "Noto Sans Mono CJK SC", ui-monospace, monospace';
export const SANS = '"Noto Sans CJK SC", "JetBrainsMono Nerd Font", system-ui, sans-serif';

/* 官方推荐缓动 */
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1); // 入场：快进慢停
export const EASE_IN = Easing.in(Easing.cubic); // 出场：慢起快离
export const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/* 调色板 */
export const C = {
  bg0: '#07081a',
  termBg: '#0d1117',
  termHead: '#161b22',
  border: '#21262d',
  text: '#c9d1d9',
  dim: '#8b949e',
  green: '#3fb950',
  cyan: '#56d4c4',
  purple: '#a5b4fc',
  warn: '#e3b341',
  red: '#f85149',
  white: '#f0f6fc',
};
