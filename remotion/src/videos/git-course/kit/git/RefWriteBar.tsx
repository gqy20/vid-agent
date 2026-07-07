import {COLOR, FONT} from '../../palette';
import {TYPE} from '../../typography';

export const RefWriteBar: React.FC<{
  refName: string;
  target: string;
  progress: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  accent?: string;
  auditId?: string;
}> = ({
  refName,
  target,
  progress,
  x,
  y,
  width = 568,
  height = 66,
  accent = COLOR.git.feature,
  auditId = 'ref-write-bar',
}) => (
  <div
    data-audit-id={auditId}
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width,
      height,
      background: COLOR.canvas.raised,
      border: `1px solid ${COLOR.stroke.soft}`,
      borderRadius: 8,
      overflow: 'hidden',
    }}
  >
    <div style={{height: '100%', width: `${progress * 100}%`, background: 'rgba(164,95,73,0.12)'}} />
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
        fontFamily: FONT.mono,
        ...TYPE.codeSmall,
      }}
    >
      <span style={{color: accent}}>{refName}</span>
      <span style={{color: COLOR.text.secondary}}>-&gt;</span>
      <span style={{color: COLOR.text.primary}}>{target}</span>
    </div>
  </div>
);
