import {interpolate, useCurrentFrame} from 'remotion';
import {C, MONO, SANS, EASE_OUT, CLAMP} from '../../../theme';
import {Backdrop} from '../../../components/Backdrop';
import {Reveal} from '../../../components/Reveal';
import {Logo} from '../Logo';

/* S2 品牌亮相 */
export const SceneBrand: React.FC = () => {
  const f = useCurrentFrame();
  const draw = interpolate(f, [0, 42], [0, 1], {easing: EASE_OUT, ...CLAMP});
  const nameOp = interpolate(f, [24, 46], [0, 1], {easing: EASE_OUT, ...CLAMP});
  const nameSc = interpolate(f, [24, 50], [0.86, 1], {easing: EASE_OUT, ...CLAMP});
  const glow = interpolate(f, [30, 72], [0, 22], {easing: EASE_OUT, ...CLAMP});
  return (
    <Backdrop>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28}}>
        <div style={{filter: 'drop-shadow(0 0 22px rgba(129,140,248,0.5))'}}>
          <Logo p={draw} />
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 92,
            fontWeight: 700,
            color: C.white,
            opacity: nameOp,
            scale: nameSc,
            textShadow: `0 0 ${glow}px rgba(86,212,196,0.9)`,
          }}
        >
          cc-insights
        </div>
        <Reveal delay={52} style={{fontFamily: SANS, fontSize: 36, color: C.cyan, textAlign: 'center'}}>
          把使用历史变成可解释的<span style={{color: C.white, fontWeight: 600}}>证据 · 判断 · 改进方向</span>
        </Reveal>
      </div>
    </Backdrop>
  );
};
