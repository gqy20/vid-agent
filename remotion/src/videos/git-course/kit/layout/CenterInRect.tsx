import {COURSE_RECTS} from './CourseRects';
import {rectToStyle, type Point, type Rect} from './geometry';

export const CenterInRect: React.FC<{
  readonly children: React.ReactNode;
  readonly rect?: Rect;
  readonly opticalOffset?: Point;
  readonly auditId?: string;
}> = ({children, rect = COURSE_RECTS.centerModel, opticalOffset = {x: 0, y: 0}, auditId}) => (
  <div
    data-audit-id={auditId}
    style={{
      ...rectToStyle(rect),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      translate: `${opticalOffset.x}px ${opticalOffset.y}px`,
    }}
  >
    {children}
  </div>
);
