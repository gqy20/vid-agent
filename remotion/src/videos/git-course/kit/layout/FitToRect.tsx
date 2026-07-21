import {fitBounds, type Bounds, type Point, type Rect} from './geometry';

export const FitToRect: React.FC<{
  readonly bounds: Bounds;
  readonly rect: Rect;
  readonly children: React.ReactNode;
  readonly padding?: number;
  readonly maxScale?: number;
  readonly opticalOffset?: Point;
  readonly auditId?: string;
}> = ({bounds, rect, children, padding = 0, maxScale, opticalOffset = {x: 0, y: 0}, auditId}) => {
  const transform = fitBounds(bounds, rect, {padding, maxScale});
  return (
    <div
      data-audit-id={auditId}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        transformOrigin: '0 0',
        transform: `translate(${transform.translateX + opticalOffset.x}px, ${transform.translateY + opticalOffset.y}px) scale(${transform.scale})`,
      }}
    >
      {children}
    </div>
  );
};
