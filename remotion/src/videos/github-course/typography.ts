import {FONT, WEIGHT} from './palette';

export const TYPE = {
  display: {fontFamily: FONT.display, fontSize: 96, lineHeight: 1.04, fontWeight: WEIGHT.semibold},
  hero: {fontFamily: FONT.display, fontSize: 64, lineHeight: 1.1, fontWeight: WEIGHT.semibold},
  title: {fontFamily: FONT.display, fontSize: 48, lineHeight: 1.16, fontWeight: WEIGHT.semibold},
  section: {fontFamily: FONT.display, fontSize: 36, lineHeight: 1.22, fontWeight: WEIGHT.semibold},
  subtitle: {fontFamily: FONT.sans, fontSize: 36, lineHeight: 1.4, fontWeight: WEIGHT.medium},
  body: {fontFamily: FONT.sans, fontSize: 30, lineHeight: 1.5, fontWeight: WEIGHT.regular},
  ui: {fontFamily: FONT.sans, fontSize: 24, lineHeight: 1.36, fontWeight: WEIGHT.medium},
  uiSmall: {fontFamily: FONT.sans, fontSize: 20, lineHeight: 1.32, fontWeight: WEIGHT.medium},
  code: {fontFamily: FONT.mono, fontSize: 24, lineHeight: 1.45, fontWeight: WEIGHT.regular},
} as const;
