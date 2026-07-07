import {COLOR} from '../../palette';
import {TYPE} from '../../typography';
import {Scene} from '../layout/Scene';

export const Outro: React.FC<{
  title: React.ReactNode;
  points: readonly string[];
  visual?: React.ReactNode;
}> = ({title, points, visual}) => {
  return (
    <Scene padding="170px 170px 150px">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: visual ? '620px 1fr' : '1fr',
          gap: 88,
          alignItems: 'center',
          height: '100%',
        }}
      >
        <div>
          <div style={{...TYPE.hero, fontWeight: 850, marginBottom: 36}}>{title}</div>
          <div style={{display: 'grid', gap: 14}}>
            {points.map((point, idx) => (
              <div
                key={point}
                style={{
                  ...TYPE.subtitle,
                  color: idx === points.length - 1 ? COLOR.text.primary : COLOR.text.secondary,
                  fontWeight: idx === points.length - 1 ? 760 : 560,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    background: idx === points.length - 1 ? COLOR.git.head : COLOR.stroke.default,
                    display: 'inline-block',
                  }}
                />
                {idx + 1}. {point}
              </div>
            ))}
          </div>
        </div>
        {visual ? <div style={{transform: 'scale(1.28)', transformOrigin: 'center'}}>{visual}</div> : null}
      </div>
    </Scene>
  );
};
