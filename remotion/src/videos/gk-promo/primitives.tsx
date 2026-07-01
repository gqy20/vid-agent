import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Ck, EASE_OUT, FZ, SANS, SANS_BOLD, CLAMP} from './theme';

/* 暖奶油底 + 极淡光晕（仿 gk 首页 ink-wash-bg，但极淡不抢戏）。tone='ink' 给需要深底的场景 */
export const VBackdrop: React.FC<{
  tone?: 'cream' | 'soft' | 'ink';
  children?: React.ReactNode;
}> = ({tone = 'cream', children}) => {
  const bg = tone === 'ink' ? Ck.ink : tone === 'soft' ? Ck.bgSoft : Ck.bg0;
  return (
    <AbsoluteFill style={{background: bg}}>
      {tone !== 'ink' && (
        <AbsoluteFill
          style={{
            pointerEvents: 'none',
            background:
              'radial-gradient(circle at 18% 20%, rgba(63,143,155,0.10), transparent 26%),' +
              'radial-gradient(circle at 84% 80%, rgba(197,154,75,0.10), transparent 28%)',
          }}
        />
      )}
      {children}
    </AbsoluteFill>
  );
};

/* 安全边距容器：左右 80、上下 160（避让竖版顶部状态栏与底部字幕区）*/
export const VStage: React.FC<{
  align?: 'center' | 'start' | 'end';
  gap?: number;
  children?: React.ReactNode;
}> = ({align = 'center', gap = 0, children}) => (
  <AbsoluteFill
    style={{
      padding: '160px 80px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent:
        align === 'start' ? 'flex-start' : align === 'end' ? 'flex-end' : 'center',
      gap,
      textAlign: 'center',
    }}
  >
    {children}
  </AbsoluteFill>
);

/* 通用入场：fade + 轻微上移，套官方缓动。delay 以本场景帧计 */
export const Rise: React.FC<{
  delay?: number;
  y?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({delay = 0, y = 28, children, style}) => {
  const frame = useCurrentFrame();
  const dur = 18;
  const o = interpolate(frame - delay, [0, dur], [0, 1], CLAMP);
  const ty = interpolate(frame - delay, [0, dur], [y, 0], {
    ...CLAMP,
    easing: EASE_OUT,
  });
  return (
    <div style={{opacity: o, transform: `translateY(${ty}px)`, ...style}}>
      {children}
    </div>
  );
};

/* 底部句级字幕条（竖版社交字幕，避开手机底部 UI，bottom 190）*/
export const CaptionBar: React.FC<{text: string; delay?: number}> = ({
  text,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame - delay, [0, 12], [0, 1], CLAMP);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', justifyContent: 'flex-end'}}>
      <div
        style={{
          position: 'absolute',
          bottom: 190,
          left: 80,
          right: 80,
          display: 'flex',
          justifyContent: 'center',
          opacity: o,
        }}
      >
        <div
          style={{
            fontFamily: SANS_BOLD,
            fontSize: FZ.caption,
            lineHeight: 1.4,
            color: Ck.bg1,
            background: 'rgba(32,35,31,0.88)',
            padding: '18px 30px',
            borderRadius: 18,
            textAlign: 'center',
            maxWidth: 920,
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* 小标签 eyebrow */
export const Eyebrow: React.FC<{children?: React.ReactNode; color?: string}> = ({
  children,
  color = Ck.brand,
}) => (
  <div
    style={{
      fontFamily: SANS,
      fontSize: FZ.eyebrow,
      fontWeight: 600,
      letterSpacing: 4,
      color,
    }}
  >
    {children}
  </div>
);

/* 重绘的青绿版 logo（原 web/public/logo.svg 是深底方块，贴暖奶油底违和）*/
export const LogoMark: React.FC<{size?: number}> = ({size = 120}) => (
  <svg width={size} height={size} viewBox="0 0 32 32" role="img" aria-label="GK">
    <rect width="32" height="32" rx="8" fill={Ck.brand} />
    <path
      d="M16 5.5c-4 0-7.25 3.16-7.25 7.05 0 5.26 5.7 11.1 7.25 12.6 1.55-1.5 7.25-7.34 7.25-12.6 0-3.89-3.25-7.05-7.25-7.05Z"
      fill={Ck.bg1}
      opacity="0.96"
    />
    <path
      d="M11.55 13.15c1.45-.88 2.78-.88 4 0 1.18.85 2.54.85 4.08 0"
      fill="none"
      stroke={Ck.brandDeep}
      strokeWidth="1.85"
      strokeLinecap="round"
    />
    <path
      d="M11.55 16.45c1.45-.88 2.78-.88 4 0 1.18.85 2.54.85 4.08 0"
      fill="none"
      stroke={Ck.brandDeep}
      strokeWidth="1.85"
      strokeLinecap="round"
    />
    <circle cx="21.35" cy="10.65" r="2.05" fill={Ck.amberSoft} />
    <circle cx="21.35" cy="10.65" r="0.85" fill={Ck.brandDeep} />
  </svg>
);
