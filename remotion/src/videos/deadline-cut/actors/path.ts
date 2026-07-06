import {interpolate} from 'remotion';
import {CLAMP, EASE_OUT} from '../../../theme';

export type ActorKeyframe = {
  frame: number;
  x: number;
  y: number;
  scale?: number;
  holdDirection?: boolean;
};

export type ActorPose = {
  x: number;
  y: number;
  scale: number;
  dx: number;
  dy: number;
  moving: boolean;
};

export const actorPoseAt = (frame: number, points: ActorKeyframe[]): ActorPose => {
  const ordered = [...points].sort((a, b) => a.frame - b.frame);
  if (frame <= ordered[0].frame) {
    const next = ordered[1] ?? ordered[0];
    return {
      x: ordered[0].x,
      y: ordered[0].y,
      scale: ordered[0].scale ?? 1,
      dx: next.x - ordered[0].x,
      dy: next.y - ordered[0].y,
      moving: false,
    };
  }

  for (let i = 0; i < ordered.length - 1; i++) {
    const start = ordered[i];
    const end = ordered[i + 1];
    if (frame >= start.frame && frame <= end.frame) {
      const moving = !start.holdDirection && (Math.abs(end.x - start.x) + Math.abs(end.y - start.y) > 1);
      return {
        x: interpolate(frame, [start.frame, end.frame], [start.x, end.x], {...CLAMP, easing: EASE_OUT}),
        y: interpolate(frame, [start.frame, end.frame], [start.y, end.y], {...CLAMP, easing: EASE_OUT}),
        scale: interpolate(frame, [start.frame, end.frame], [start.scale ?? 1, end.scale ?? start.scale ?? 1], CLAMP),
        dx: end.x - start.x,
        dy: end.y - start.y,
        moving,
      };
    }
  }

  const last = ordered[ordered.length - 1];
  const prev = ordered[ordered.length - 2] ?? last;
  return {
    x: last.x,
    y: last.y,
    scale: last.scale ?? 1,
    dx: last.holdDirection ? 0 : last.x - prev.x,
    dy: last.holdDirection ? 0 : last.y - prev.y,
    moving: false,
  };
};
