export type Ease = (value: number) => number;

export const introBeats = {
  boot: 0,
  scan: 4,
  field: 20,
  graph: 56,
  rail: 64,
  ecosystem: 88,
  focus: 108,
  morph: 124,
  brand: 140,
  title: 154,
  episode: 166,
  line: 174,
} as const;

export const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export const progress = (frame: number, start: number, end: number) => clamp01((frame - start) / (end - start));

export const eases = {
  none: (value: number) => clamp01(value),
  power4Out: (value: number) => 1 - Math.pow(1 - clamp01(value), 4),
  power4InOut: (value: number) => {
    const v = clamp01(value);
    return v < 0.5 ? 8 * v * v * v * v : 1 - Math.pow(-2 * v + 2, 4) / 2;
  },
  expoOut: (value: number) => {
    const v = clamp01(value);
    return v === 1 ? 1 : 1 - Math.pow(2, -10 * v);
  },
  circOut: (value: number) => Math.sqrt(1 - Math.pow(clamp01(value) - 1, 2)),
  sineInOut: (value: number) => -(Math.cos(Math.PI * clamp01(value)) - 1) / 2,
  backOut: (value: number) => {
    const v = clamp01(value) - 1;
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * v * v * v + c1 * v * v;
  },
} as const;

export const tween = (frame: number, start: number, end: number, ease: Ease = eases.power4Out) =>
  ease(progress(frame, start, end));

export const between = (
  frame: number,
  from: number,
  to: number,
  start: number,
  end: number,
  ease: Ease = eases.power4Out,
) => from + (to - from) * tween(frame, start, end, ease);

export const pulse = (frame: number, start: number, end: number) =>
  Math.sin(progress(frame, start, end) * Math.PI);

export const stagger = (start: number, index: number, step: number) => start + index * step;
