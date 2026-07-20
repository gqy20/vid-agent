import {COLOR, FONT} from '../../palette';
import {TYPE} from '../../typography';

export const SnapshotCard: React.FC<{
  title: string;
  subtitle: string;
  lines: readonly string[];
  tone: 'base' | 'main' | 'feature' | 'result';
  x: number;
  y: number;
  opacity: number;
  scale?: number;
  auditId: string;
}> = ({title, subtitle, lines, tone, x, y, opacity, scale = 1, auditId}) => {
  const accent = tone === 'main' ? COLOR.git.main : tone === 'feature' ? COLOR.git.feature : tone === 'result' ? COLOR.git.commit : COLOR.text.secondary;
  return (
    <div
      data-audit-id={auditId}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 360,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: '50% 50%',
        border: `2px solid ${accent}`,
        borderRadius: 14,
        background: COLOR.canvas.overlay,
        boxShadow: `0 18px 44px ${COLOR.effects.shadowSoft}`,
        overflow: 'hidden',
      }}
    >
      <div style={{padding: '18px 22px 14px', borderBottom: `1px solid ${COLOR.stroke.soft}`}}>
        <div style={{...TYPE.uiSmall, color: accent, fontFamily: FONT.mono, marginBottom: 4}}>{title}</div>
        <div style={{...TYPE.ui, color: COLOR.text.primary}}>{subtitle}</div>
      </div>
      <div style={{padding: '14px 22px 18px', display: 'grid', gap: 7}}>
        {lines.map((line, index) => (
          <div key={line} style={{...TYPE.codeSmall, color: index === 1 && tone !== 'base' ? accent : COLOR.text.secondary, fontFamily: FONT.mono}}>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};

