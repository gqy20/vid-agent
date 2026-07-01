import {Easing} from 'remotion';

/* 字体（本地专业字体，零联网） */
export const MONO =
  '"JetBrains Mono", "Sarasa Mono SC", "Noto Sans Mono CJK SC", ui-monospace, monospace';
export const SANS =
  '"Inter Display", "Inter", "Sarasa UI SC", "Noto Sans CJK SC", system-ui, sans-serif';
export const SERIF = '"Noto Serif CJK SC", "Noto Serif CJK SC SemiBold", Georgia, serif';

/* 官方推荐缓动 */
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1); // 入场：快进慢停
export const EASE_IN = Easing.in(Easing.cubic); // 出场：慢起快离
export const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/* 调色板 */
export const C = {
  bg0: '#1a1917',
  bg1: '#211f1c',
  panel: '#26241f',
  termBg: '#151515',
  termHead: '#22201d',
  border: '#3a3833',
  text: '#f5f3ee',
  dim: '#a8a39a',
  green: '#6a9e79',
  cyan: '#8fbdb6',
  purple: '#9d95c7',
  warn: '#ce9646',
  red: '#cd5c5c',
  terracotta: '#e08560',
  white: '#faf9f5',
};

/* 字号层级（1080p）—— 主标题≥84 / 正文≥44 / 标签≥32 / 终端正文 24，消除魔法数字 */
export const FZ = {
  hero: 86, // 产品名大字（Brand/CTA）
  title: 76, // 场景主标题（Hook 三问、Features 标题）
  subtitle: 36, // 副标题 / tagline / 链接 / KPI 数值
  body: 28, // 非终端正文（CTA 命令框、slogan）
  label: 32, // 卡片标题、辅助命令
  term: 24, // 终端正文（Typed、诊断行、表格行、卡片描述）
  termDim: 20, // 终端次要（severity、表头、标签行、KPI key、io）
  caption: 28, // 场景整句字幕条
  karaoke: 38, // 顶部逐字字幕
  micro: 18, // 终端标题栏、背景噪点
};
