import {WEIGHT} from '../git-course/palette';

// ponytail: 直接按 fc-list 字族名引用本地字体，绕开 git-course @font-face 间接层
// （headless Chrome 下 local() 解析不稳，曾导致 CJK fallback 到系统丑字体）。
export const FONT = {
  sans: '"Noto Sans CJK SC", "Inter", "Source Han Sans SC", sans-serif',
  mono: '"JetBrainsMono Nerd Font Mono", "JetBrains Mono", "SFMono-Regular", monospace',
};

export const TYPE = {
  hero: {fontFamily: FONT.sans, fontSize: 72, lineHeight: 1.16, fontWeight: WEIGHT.bold, letterSpacing: 0},
  title: {fontFamily: FONT.sans, fontSize: 44, lineHeight: 1.18, fontWeight: WEIGHT.bold, letterSpacing: 0},
  subtitle: {fontFamily: FONT.sans, fontSize: 31, lineHeight: 1.42, fontWeight: WEIGHT.bold, letterSpacing: 0},
  ui: {fontFamily: FONT.sans, fontSize: 22, lineHeight: 1.4, fontWeight: WEIGHT.bold, letterSpacing: 0},
  code: {fontFamily: FONT.mono, fontSize: 26, lineHeight: 1.45, fontWeight: WEIGHT.regular, letterSpacing: 0},
} as const;
