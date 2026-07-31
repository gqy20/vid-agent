import {FONT, WEIGHT} from './palette';

export const TYPE = {
  family: FONT,
  display: {fontSize: 84, lineHeight: 1.05, fontWeight: WEIGHT.bold, letterSpacing: 0},
  hero: {fontSize: 72, lineHeight: 1.16, fontWeight: WEIGHT.bold, letterSpacing: 0},
  title: {fontSize: 44, lineHeight: 1.18, fontWeight: WEIGHT.bold, letterSpacing: 0},
  subtitle: {fontSize: 31, lineHeight: 1.42, fontWeight: WEIGHT.bold, letterSpacing: 0},
  body: {fontSize: 27, lineHeight: 1.48, fontWeight: WEIGHT.regular, letterSpacing: 0},
  ui: {fontSize: 22, lineHeight: 1.4, fontWeight: WEIGHT.bold, letterSpacing: 0},
  // Reserved for non-essential course chrome such as progress and metadata.
  uiSmall: {fontSize: 18, lineHeight: 1.25, fontWeight: WEIGHT.bold, letterSpacing: 0},
  code: {fontSize: 26, lineHeight: 1.45, fontWeight: WEIGHT.regular, letterSpacing: 0},
  codeOutput: {fontSize: 23, lineHeight: 1.45, fontWeight: WEIGHT.regular, letterSpacing: 0},
  codeSmall: {fontSize: 20, lineHeight: 1.4, fontWeight: WEIGHT.regular, letterSpacing: 0},
  // Instructional labels must remain readable in the 1920x1080 design space.
  label: {fontSize: 22, lineHeight: 1.25, fontWeight: WEIGHT.bold, letterSpacing: 0},
  graphNode: {fontSize: 23, lineHeight: 1, fontWeight: WEIGHT.bold, letterSpacing: 0},
  graphPointer: {fontSize: 22, lineHeight: 1, fontWeight: WEIGHT.bold, letterSpacing: 0},
} as const;

export const textStyle = (token: keyof typeof TYPE) => {
  if (token === 'family') {
    throw new Error('TYPE.family is not a text style token');
  }
  return TYPE[token];
};
