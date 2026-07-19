import {Easing, interpolate} from 'remotion';

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

export const enter = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

export const settle = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.45, 0, 0.55, 1),
  });

export const exit = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });

export const segment = (value: number, start: number, end: number) =>
  interpolate(value, [start, end], [0, 1], clamp);
