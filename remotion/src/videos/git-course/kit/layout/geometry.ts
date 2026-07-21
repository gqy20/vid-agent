export type Point = {
  readonly x: number;
  readonly y: number;
};

export type Size = {
  readonly width: number;
  readonly height: number;
};

export type Rect = Point & Size;

export type Bounds = {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
};

export type FitTransform = {
  readonly scale: number;
  readonly translateX: number;
  readonly translateY: number;
};

export const rectCenter = (rect: Rect): Point => ({
  x: rect.x + rect.width / 2,
  y: rect.y + rect.height / 2,
});

export const boundsSize = (bounds: Bounds): Size => ({
  width: bounds.maxX - bounds.minX,
  height: bounds.maxY - bounds.minY,
});

export const insetRect = (rect: Rect, inset: number): Rect => ({
  x: rect.x + inset,
  y: rect.y + inset,
  width: Math.max(0, rect.width - inset * 2),
  height: Math.max(0, rect.height - inset * 2),
});

export const mergeBounds = (bounds: readonly Bounds[]): Bounds | null => {
  if (bounds.length === 0) return null;
  const [first, ...rest] = bounds;
  return rest.reduce<Bounds>((merged, current) => ({
    minX: Math.min(merged.minX, current.minX),
    minY: Math.min(merged.minY, current.minY),
    maxX: Math.max(merged.maxX, current.maxX),
    maxY: Math.max(merged.maxY, current.maxY),
  }), first);
};

export const fitBounds = (
  bounds: Bounds,
  target: Rect,
  options: {readonly padding?: number; readonly maxScale?: number} = {},
): FitTransform => {
  const available = insetRect(target, options.padding ?? 0);
  const size = boundsSize(bounds);
  if (size.width <= 0 || size.height <= 0) {
    throw new Error('Cannot fit empty bounds');
  }

  const scale = Math.min(
    available.width / size.width,
    available.height / size.height,
    options.maxScale ?? Number.POSITIVE_INFINITY,
  );
  const targetCenter = rectCenter(available);
  const boundsCenter = {
    x: (bounds.minX + bounds.maxX) / 2,
    y: (bounds.minY + bounds.maxY) / 2,
  };

  return {
    scale,
    translateX: targetCenter.x - boundsCenter.x * scale,
    translateY: targetCenter.y - boundsCenter.y * scale,
  };
};

export const rectsOverlap = (first: Rect, second: Rect): boolean =>
  first.x < second.x + second.width &&
  first.x + first.width > second.x &&
  first.y < second.y + second.height &&
  first.y + first.height > second.y;

export const rectToStyle = (rect: Rect): React.CSSProperties => ({
  position: 'absolute',
  left: rect.x,
  top: rect.y,
  width: rect.width,
  height: rect.height,
  boxSizing: 'border-box',
});
