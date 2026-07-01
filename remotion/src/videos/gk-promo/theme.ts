import {Easing} from 'remotion';

/* 字体：本地更纱黑体（基于思源黑体），零联网。标题用 SemiBold 变体族 */
export const SANS = '"Sarasa UI SC", "更纱黑体 UI SC", "Noto Sans CJK SC", system-ui, sans-serif';
export const SANS_BOLD =
  '"Sarasa UI SC SemiBold", "更纱黑体 UI SC SemiBold", "Sarasa UI SC", sans-serif';
export const MONO = '"Sarasa Mono SC", "等距更纱黑体 SC", ui-monospace, monospace';

/* 官方推荐缓动（与全局 theme.ts 一致） */
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1); // 入场：快进慢停
export const EASE_IN = Easing.in(Easing.cubic); // 出场
export const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/* gk 调色板（取自 web/src/app/globals.css：暖奶油底 + 青绿主色 + 琥珀点缀） */
export const Ck = {
  bg0: '#f3ecdf', // 暖奶油主底（surface）
  bg1: '#fffaf0', // 米白（卡片 / 亮底，neutral-0）
  bgSoft: '#eee4d2', // 次底（neutral-100）
  ink: '#20231f', // 主文字（neutral-900）
  ink2: '#5a5a50', // 次文字（neutral-600）
  ink3: '#8a8576', // 弱文字（neutral-500 偏暖）
  brand: '#3f8f9b', // 青绿主色（brand-500）
  brandDeep: '#2f737d', // 深青绿（brand-600）
  brandSofter: '#9fd2cc', // 浅青绿（brand-200）
  brandSoft: '#cfe8e4', // 极浅青绿（brand-100）
  amber: '#c59a4b', // 琥珀点缀（accent-400）
  amberSoft: '#d6b466', // 浅琥珀（accent-300）
  line: 'rgba(63,143,155,0.24)', // 青绿描边
  hairline: 'rgba(32,35,31,0.10)', // 中性分隔线
  danger: '#c94743', // 风险/红（danger-500）
};

/* 竖版字号层级（1080 宽，比横版更聚焦可放大）—— 主标题≥88 / 正文≥40 / 字幕 46 */
export const FZ = {
  hero: 136, // 品牌大字 GK / CTA 主标
  title: 88, // 场景主标题
  subtitle: 46, // 副标题 / slogan
  body: 40, // 正文 / 卡片描述
  label: 34, // 卡片标题 / 标签
  caption: 46, // 底部句级字幕条（社交字幕要够大）
  metric: 176, // 大数字（高考分数）
  eyebrow: 30, // 小标签
  micro: 26, // 辅助 / 注脚
};
