import type {Bounds, Point} from '../layout/geometry';

export type CircleAnchor = Point & {
  readonly radius: number;
};

export type LineSegment = {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
};

export const circleBounds = (anchor: CircleAnchor): Bounds => ({
  minX: anchor.x - anchor.radius,
  minY: anchor.y - anchor.radius,
  maxX: anchor.x + anchor.radius,
  maxY: anchor.y + anchor.radius,
});

export const connectCircleAnchors = (
  source: CircleAnchor,
  target: CircleAnchor,
  options: {readonly sourceGap?: number; readonly targetGap?: number} = {},
): LineSegment => {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const length = Math.hypot(dx, dy);
  if (length === 0) throw new Error('Cannot connect anchors at the same position');

  const unitX = dx / length;
  const unitY = dy / length;
  const sourceInset = source.radius + (options.sourceGap ?? 0);
  const targetInset = target.radius + (options.targetGap ?? 0);
  if (sourceInset + targetInset >= length) {
    throw new Error('Anchor bounds leave no room for a connector');
  }

  return {
    x1: source.x + unitX * sourceInset,
    y1: source.y + unitY * sourceInset,
    x2: target.x - unitX * targetInset,
    y2: target.y - unitY * targetInset,
  };
};
