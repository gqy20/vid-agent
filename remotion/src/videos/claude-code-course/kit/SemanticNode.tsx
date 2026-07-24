import {COLOR, SCENE, TYPE, WEIGHT} from '../designTokens';
import {EvidenceIcon, type EvidenceIconName} from './EvidenceIcon';

export const SemanticNode: React.FC<{
  icon: EvidenceIconName;
  label: string;
  detail?: string;
  tone: string;
  active?: number;
  progress?: number;
  width?: number;
}> = ({icon, label, detail, tone, active = 1, progress = 1, width = 250}) => {
  const emphasis = Math.max(0, Math.min(1, active));
  return (
    <div
      style={{
        position: 'relative',
        zIndex: 2,
        width,
        minHeight: 132,
        display: 'grid',
        placeItems: 'center',
        padding: '18px 16px',
        boxSizing: 'border-box',
        opacity: progress * (SCENE.node.inactiveOpacity + emphasis * (1 - SCENE.node.inactiveOpacity)),
        translate: `0 ${(1 - progress) * 16}px`,
        scale: 1 + emphasis * (SCENE.node.activeScale - 1),
        transformOrigin: 'center center',
      }}
    >
      <EvidenceIcon name={icon} size={40} tone={emphasis > 0.35 ? tone : COLOR.text.tertiary} />
      <div style={{textAlign: 'center', marginTop: 14}}>
        <div style={{...TYPE.label, color: COLOR.text.primary, fontWeight: WEIGHT.bold}}>{label}</div>
        {detail ? <div style={{...TYPE.codeSmall, color: COLOR.text.secondary, marginTop: 8}}>{detail}</div> : null}
      </div>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 2,
          width: 44 * emphasis,
          height: 3,
          translate: '-50% 0',
          background: tone,
          opacity: emphasis,
        }}
      />
    </div>
  );
};
