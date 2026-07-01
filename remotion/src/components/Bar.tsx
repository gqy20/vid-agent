import {interpolate, useCurrentFrame} from 'remotion';
import {C, EASE_OUT, CLAMP} from '../theme';
import {Reveal} from './Reveal';

/* 动态横向条（数据可视化） */
export const Bar: React.FC<{label: string; io: string; pct: number; delay: number; color: string}> = ({label, io, pct, delay, color}) => {
  const f = useCurrentFrame();
  const w = interpolate(f, [delay, delay + 26], [0, pct], {easing: EASE_OUT, ...CLAMP});
  return (
    <Reveal delay={delay} y={8} style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 14}}>
      <span style={{width: 168, color: C.text}}>{label}</span>
      <span style={{width: 124, color: C.dim, fontSize: 20}}>{io}</span>
      <div style={{flex: 1, height: 24, background: '#161b22', borderRadius: 5, overflow: 'hidden'}}>
        <div style={{width: `${w}%`, height: '100%', background: color, borderRadius: 5}} />
      </div>
      <span style={{width: 62, textAlign: 'right', color: C.white}}>{pct}%</span>
    </Reveal>
  );
};
