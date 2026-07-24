import {Easing, interpolate} from 'remotion';

// Motion is intentionally quiet: these tokens describe editorial hierarchy,
// not decorative interaction. All values are tuned for the course's 30fps
// timeline and remain frame-driven for deterministic rendering.
export const MOTION = {
  micro: 7,
  productive: 12,
  structural: 18,
  expressive: 26,
  exit: 10,
  stagger: 7,
  questionHold: 42,
  evidenceHandoff: 16,
  distance: {
    small: 10,
    medium: 20,
    large: 34,
  },
} as const;

export const EASE = {
  enter: Easing.bezier(0.16, 1, 0.3, 1),
  standard: Easing.bezier(0.2, 0, 0.38, 0.9),
  exit: Easing.bezier(0.2, 0, 1, 0.9),
  editorial: Easing.bezier(0.45, 0, 0.55, 1),
} as const;

export const motionProgress = (
  frame: number,
  start: number,
  duration: number = MOTION.productive,
  easing: (value: number) => number = EASE.enter,
) => interpolate(frame, [start, start + duration], [0, 1], {
  easing,
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});

export const focusWindow = (frame: number, start: number, end: number) => {
  const enter = motionProgress(frame, start, MOTION.productive, EASE.enter);
  const exit = motionProgress(frame, end, MOTION.exit, EASE.exit);
  return enter * (1 - exit);
};
