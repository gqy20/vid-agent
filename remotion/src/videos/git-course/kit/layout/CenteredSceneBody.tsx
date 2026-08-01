import {COURSE_RECTS} from './CourseRects';
import {CenterInRect} from './CenterInRect';
import type {Point} from './geometry';

export const CenteredSceneBody: React.FC<{
  readonly children: React.ReactNode;
  readonly width?: number;
  readonly opticalOffset?: Point;
  readonly auditId?: string;
  readonly style?: React.CSSProperties;
}> = ({children, width = COURSE_RECTS.modelBody.width, opticalOffset, auditId, style}) => (
  <CenterInRect rect={COURSE_RECTS.modelBody} opticalOffset={opticalOffset} auditId={auditId}>
    <div style={{width, ...style}}>{children}</div>
  </CenterInRect>
);
