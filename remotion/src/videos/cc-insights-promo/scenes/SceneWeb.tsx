import {interpolate, useCurrentFrame} from 'remotion';
import {C, EASE_OUT, CLAMP} from '../../../theme';
import {Backdrop} from '../../../components/Backdrop';
import {Reveal} from '../../../components/Reveal';
import {Terminal} from '../../../components/Terminal';
import {Typed} from '../../../components/Typed';
import {Caption} from '../../../components/Caption';

/* S3d web —— 启动 Dashboard */
export const SceneWeb: React.FC = () => {
  const f = useCurrentFrame();
  const lineDraw = interpolate(f, [92, 134], [700, 0], {easing: EASE_OUT, ...CLAMP});
  return (
    <Backdrop>
      <Terminal title="cc-insights — 启动 Dashboard" width={1280} appear={0}>
        <Typed text="cc-insights web --addr :8932" start={6} />
        <Reveal delay={36} style={{color: C.green, fontSize: 21}}>✓ Dashboard 已启动 → http://localhost:8932</Reveal>
        <div style={{height: 20}} />
        <Reveal delay={48}>
          <div style={{background: '#0a0e16', border: `1px solid ${C.border}`, borderRadius: 12, padding: 24}}>
            <div style={{display: 'flex', gap: 20, marginBottom: 20}}>
              {[
                {k: 'Token 30d', v: '12.4M', c: C.cyan},
                {k: '失败率', v: '6.2%', c: C.warn},
                {k: '会话数', v: '184', c: C.purple},
                {k: '诊断结论', v: '3', c: C.green},
              ].map((m, i) => (
                <Reveal key={m.k} delay={56 + i * 8} style={{flex: 1, background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 20px'}}>
                  <div style={{color: C.dim, fontSize: 18}}>{m.k}</div>
                  <div style={{color: m.c, fontSize: 36, fontWeight: 700}}>{m.v}</div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={92}>
              <svg width="100%" height={160} viewBox="0 0 600 160" preserveAspectRatio="none">
                <polyline points="0,128 80,96 160,106 240,64 320,80 400,42 480,58 600,26"
                  fill="none" stroke={C.cyan} strokeWidth="3"
                  strokeDasharray={700} strokeDashoffset={lineDraw} />
                <line x1="0" y1="159" x2="600" y2="159" stroke={C.border} />
              </svg>
            </Reveal>
          </div>
        </Reveal>
      </Terminal>
      <Caption delay={48} text="web —— 单二进制本地起 Dashboard，无数据库、无外部依赖" />
    </Backdrop>
  );
};
