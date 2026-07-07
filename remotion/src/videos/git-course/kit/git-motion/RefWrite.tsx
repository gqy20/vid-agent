import {COLOR, FONT} from '../../palette';
import {TYPE} from '../../typography';
import {TypewriterText} from '../motion';

export const RefWrite: React.FC<{
  text: string;
  progress: number;
  opacity?: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  accentUntil?: number;
  auditId?: string;
}> = ({text, progress, opacity = 1, x, y, width = 640, height = 74, accentUntil = 0, auditId}) => (
  <div
    data-audit-id={auditId}
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width,
      height,
      opacity,
      background: COLOR.canvas.raised,
      border: `1px solid ${COLOR.stroke.soft}`,
      borderRadius: 8,
      display: 'flex',
      alignItems: 'center',
      padding: '0 30px',
      boxSizing: 'border-box',
      fontFamily: FONT.mono,
      ...TYPE.codeSmall,
      color: COLOR.text.primary,
    }}
  >
    <TypewriterText text={text} progress={progress} accentUntil={accentUntil} />
  </div>
);
