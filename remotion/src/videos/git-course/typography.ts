import {FONT} from './palette';

export const TYPE = {
  family: FONT,
  display: {fontSize: 84, lineHeight: 1.05, fontWeight: 840, letterSpacing: 0},
  hero: {fontSize: 72, lineHeight: 1.16, fontWeight: 820, letterSpacing: 0},
  title: {fontSize: 44, lineHeight: 1.18, fontWeight: 780, letterSpacing: 0},
  subtitle: {fontSize: 31, lineHeight: 1.42, fontWeight: 650, letterSpacing: 0},
  body: {fontSize: 27, lineHeight: 1.48, fontWeight: 520, letterSpacing: 0},
  ui: {fontSize: 22, lineHeight: 1.4, fontWeight: 650, letterSpacing: 0},
  uiSmall: {fontSize: 18, lineHeight: 1.25, fontWeight: 650, letterSpacing: 0},
  code: {fontSize: 26, lineHeight: 1.45, fontWeight: 500, letterSpacing: 0},
  codeOutput: {fontSize: 23, lineHeight: 1.45, fontWeight: 500, letterSpacing: 0},
  codeSmall: {fontSize: 20, lineHeight: 1.4, fontWeight: 500, letterSpacing: 0},
  label: {fontSize: 18, lineHeight: 1.25, fontWeight: 760, letterSpacing: 0},
  graphNode: {fontSize: 23, lineHeight: 1, fontWeight: 700, letterSpacing: 0},
  graphPointer: {fontSize: 22, lineHeight: 1, fontWeight: 760, letterSpacing: 0},
} as const;

export const textStyle = (token: keyof typeof TYPE) => {
  if (token === 'family') {
    throw new Error('TYPE.family is not a text style token');
  }
  return TYPE[token];
};
