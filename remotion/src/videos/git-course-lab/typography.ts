import {LAB_FONT} from './palette';

export const LAB_TYPE = {
  display: {fontFamily: LAB_FONT.sans, fontSize: 72, lineHeight: 1.08, fontWeight: 820, letterSpacing: 0},
  title: {fontFamily: LAB_FONT.sans, fontSize: 42, lineHeight: 1.16, fontWeight: 760, letterSpacing: 0},
  body: {fontFamily: LAB_FONT.sans, fontSize: 28, lineHeight: 1.44, fontWeight: 520, letterSpacing: 0},
  caption: {fontFamily: LAB_FONT.sans, fontSize: 30, lineHeight: 1.34, fontWeight: 620, letterSpacing: 0},
  mono: {fontFamily: LAB_FONT.mono, fontSize: 24, lineHeight: 1.42, fontWeight: 520, letterSpacing: 0},
  label: {fontFamily: LAB_FONT.mono, fontSize: 22, lineHeight: 1, fontWeight: 760, letterSpacing: 0},
} as const;

