import {COLOR} from '../../palette';
import {TYPE} from '../../typography';

export const Callout: React.FC<{
  title: string;
  body?: React.ReactNode;
  tone?: 'default' | 'warning' | 'tip';
}> = ({title, body, tone = 'default'}) => {
  const accent = tone === 'warning' ? COLOR.git.conflict : tone === 'tip' ? COLOR.git.workingTree : COLOR.git.head;

  return (
    <div
      style={{
        borderRadius: 14,
        border: `1px solid ${COLOR.stroke.default}`,
        background: COLOR.canvas.raised,
        boxShadow: `0 18px 44px ${COLOR.effects.shadowSoft}`,
        padding: '26px 30px',
        display: 'grid',
        gap: 12,
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
        <span style={{width: 12, height: 38, borderRadius: 999, background: accent, display: 'inline-block'}} />
        <div style={{...TYPE.title, fontSize: 34}}>{title}</div>
      </div>
      {body ? <div style={{...TYPE.body, color: COLOR.text.secondary}}>{body}</div> : null}
    </div>
  );
};
