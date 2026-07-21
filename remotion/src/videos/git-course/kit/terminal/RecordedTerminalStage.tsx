import {COURSE_RECTS} from '../layout/CourseRects';
import {rectToStyle, type Rect} from '../layout/geometry';
import {RecordedTerminalPanel} from './RecordedTerminalPanel';

type RecordedTerminalPanelProps = React.ComponentProps<typeof RecordedTerminalPanel>;

export const RecordedTerminalStage: React.FC<RecordedTerminalPanelProps & {
  readonly rect?: Rect;
  readonly opacity?: number;
  readonly zIndex?: number;
  readonly auditId?: string;
  readonly style?: React.CSSProperties;
}> = ({rect = COURSE_RECTS.terminal, opacity = 1, zIndex, auditId, style, ...terminalProps}) => (
  <div
    data-audit-id={auditId}
    data-audit-safe-area="terminal"
    style={{
      ...rectToStyle(rect),
      opacity,
      zIndex,
      ...style,
    }}
  >
    <RecordedTerminalPanel {...terminalProps} />
  </div>
);
