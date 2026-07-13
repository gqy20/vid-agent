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
  height = 76,
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
      background: 'rgba(255,255,255,0.68)',
      border: `1px solid ${COLOR.stroke.soft}`,
      borderRadius: 8,
      overflow: 'hidden',
      boxShadow: `0 12px 34px ${COLOR.effects.shadowSoft}`,
    }}
  >
    <div style={{height: '100%', width: `${progress * 100}%`, background: 'rgba(164,95,73,0.12)'}} />
    <div
      style={{
        position: 'absolute',
        left: `${progress * 100}%`,
        top: 10,
        bottom: 10,
        width: 2,
        background: accent,
        opacity: progress > 0 && progress < 1 ? 0.78 : 0,
      }}
    />
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
        fontFamily: FONT.mono,
        ...TYPE.code,
        fontSize: 28,
      }}
    >
      <span style={{color: accent}}>{refName}</span>
      <span style={{color: COLOR.text.secondary}}>-&gt;</span>
      <span style={{color: COLOR.text.primary}}>{target}</span>
    </div>
  </div>
);
