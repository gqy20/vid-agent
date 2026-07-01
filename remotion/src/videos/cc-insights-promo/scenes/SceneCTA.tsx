import {interpolate, useCurrentFrame} from 'remotion';
import {C, MONO, SANS, EASE_OUT, CLAMP, FZ} from '../../../theme';
import {Backdrop} from '../../../components/Backdrop';
import {Reveal} from '../../../components/Reveal';
import {Logo} from '../Logo';

/* S5 CTA */
export const SceneCTA: React.FC = () => {
  const f = useCurrentFrame();
  const sc = interpolate(f, [0, 20], [0.84, 1], {easing: EASE_OUT, ...CLAMP});
  return (
    <Backdrop>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 38}}>
        <div style={{scale: sc, filter: 'drop-shadow(0 0 22px rgba(129,140,248,0.55))'}}>
          <Logo p={Math.min(1, f / 18)} />
        </div>
        <div style={{fontFamily: MONO, fontSize: FZ.hero, fontWeight: 700, color: C.white, textShadow: '0 0 26px rgba(86,212,196,0.7)'}}>
          cc-insights
        </div>
        <Reveal delay={22} style={{background: C.termBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 34px', fontFamily: MONO, fontSize: FZ.body}}>
          <span style={{color: C.green}}>$ </span>
          <span style={{color: C.white}}>cc-insights rec -p 7d</span>
          <span style={{color: C.dim}}>   # 一条命令，给你根因和下一步</span>
        </Reveal>
        <Reveal delay={38} style={{fontFamily: MONO, fontSize: FZ.subtitle, color: C.cyan}}>
          github.com/gqy20/cc-insights
        </Reveal>
        <Reveal delay={54} style={{fontFamily: SANS, fontSize: FZ.body, color: C.dim}}>
          ⭐ Star 一下，让 Claude Code 的每一分钱都花得明白
        </Reveal>
      </div>
    </Backdrop>
  );
};
