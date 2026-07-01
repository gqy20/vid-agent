import {interpolate, useCurrentFrame} from 'remotion';
import {C, MONO, EASE_OUT, CLAMP} from '../theme';

/* 终端窗口外壳（eased 入场，独立 scale 属性） */
export const Terminal: React.FC<{
  title: string;
  width: number;
  appear: number;
  children: React.ReactNode;
}> = ({title, width, appear, children}) => {
  const f = useCurrentFrame();
  const sc = interpolate(f, [appear, appear + 16], [0.94, 1], {easing: EASE_OUT, ...CLAMP});
  const op = interpolate(f, [appear, appear + 14], [0, 1], {easing: EASE_OUT, ...CLAMP});
  const ty = interpolate(f, [appear, appear + 16], [24, 0], {easing: EASE_OUT, ...CLAMP});
  return (
    <div
      style={{
        width,
        background: C.termBg,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: '0 40px 90px rgba(0,0,0,0.6), 0 0 70px rgba(86,212,196,0.07)',
        opacity: op,
        scale: sc,
        translate: `0px ${ty}px`,
        fontFamily: MONO,
      }}
    >
      <div
        style={{
          height: 44,
          background: C.termHead,
          display: 'flex',
          alignItems: 'center',
          padding: '0 18px',
          gap: 9,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <span style={{width: 13, height: 13, borderRadius: 7, background: '#ff5f56'}} />
        <span style={{width: 13, height: 13, borderRadius: 7, background: '#ffbd2e'}} />
        <span style={{width: 13, height: 13, borderRadius: 7, background: '#27c93f'}} />
        <span style={{marginLeft: 16, color: C.dim, fontSize: 17}}>{title}</span>
      </div>
      <div style={{padding: '28px 36px', fontSize: 24, lineHeight: 1.62}}>{children}</div>
    </div>
  );
};
