import {FONT, WEIGHT} from './palette';

export const TYPE = {
  display: {fontFamily: FONT.sans, fontSize: 76, lineHeight: 1.08, fontWeight: WEIGHT.bold},
  title: {fontFamily: FONT.sans, fontSize: 44, lineHeight: 1.18, fontWeight: WEIGHT.bold},
  subtitle: {fontFamily: FONT.sans, fontSize: 31, lineHeight: 1.42, fontWeight: WEIGHT.bold},
  body: {fontFamily: FONT.sans, fontSize: 26, lineHeight: 1.46, fontWeight: WEIGHT.regular},
  ui: {fontFamily: FONT.sans, fontSize: 21, lineHeight: 1.35, fontWeight: WEIGHT.bold},
  uiSmall: {fontFamily: FONT.sans, fontSize: 17, lineHeight: 1.3, fontWeight: WEIGHT.bold},
  code: {fontFamily: FONT.mono, fontSize: 21, lineHeight: 1.4, fontWeight: WEIGHT.regular},
} as const;
