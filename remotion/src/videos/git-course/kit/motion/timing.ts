export const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export const mix = (from: number, to: number, progress: number) => from + (to - from) * clamp01(progress);

export const easeOutCubic = (value: number) => 1 - Math.pow(1 - clamp01(value), 3);

export const easeOutBack = (value: number) => {
  const v = clamp01(value) - 1;
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * v * v * v + c1 * v * v;
};
