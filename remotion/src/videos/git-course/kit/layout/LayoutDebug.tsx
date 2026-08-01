import {COLOR, FONT, WEIGHT} from '../../palette';
import {TYPE} from '../../typography';
import {COURSE_RECTS} from './CourseRects';
import {rectToStyle} from './geometry';

type CourseRectName = keyof typeof COURSE_RECTS;

const DEBUG_COLORS: Record<CourseRectName, string> = {
  frame: COLOR.text.tertiary,
  header: COLOR.git.main,
  question: COLOR.git.feature,
  centerModel: COLOR.git.main,
  modelBody: COLOR.git.main,
  terminal: COLOR.git.head,
  stateTransition: COLOR.git.index,
  takeaway: COLOR.git.feature,
  subtitle: COLOR.git.conflict,
};

export const LayoutDebug: React.FC<{
  readonly rects?: readonly CourseRectName[];
  readonly opacity?: number;
}> = ({rects = Object.keys(COURSE_RECTS) as CourseRectName[], opacity = 0.58}) => (
  <div data-audit-ignore="layout-debug" style={{position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 40, opacity}}>
    {rects.map((name) => {
      const rect = COURSE_RECTS[name];
      const color = DEBUG_COLORS[name];
      return (
        <div key={name} style={{...rectToStyle(rect), border: `2px dashed ${color}`}}>
          <span
            style={{
              position: 'absolute',
              left: 8,
              top: 7,
              padding: '3px 7px',
              background: COLOR.canvas.base,
              color,
              fontFamily: FONT.mono,
              ...TYPE.label,
              fontWeight: WEIGHT.bold,
            }}
          >
            {name} · {rect.width}×{rect.height}
          </span>
        </div>
      );
    })}
  </div>
);
