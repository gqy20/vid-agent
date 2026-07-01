import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// 一片飘落的羽毛（SVG 手绘，青羽 = qingyu）
const Feather: React.FC<{progress: number}> = ({progress}) => {
  return (
    <svg width={140} height={140} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="featherGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>
      {/* 羽毛外形 */}
      <path
        d="M50 6 C 30 28, 26 58, 40 92 C 54 58, 70 28, 50 6 Z"
        fill="url(#featherGrad)"
        opacity={0.92}
      />
      {/* 中轴 */}
      <path d="M50 10 L 42 90" stroke="#e0f2fe" strokeWidth={1.6} opacity={0.8} />
      {/* 羽枝 */}
      {[18, 28, 38, 48, 58, 68, 78].map((y, i) => {
        const spread = interpolate(progress, [0, 1], [0, 1]);
        const len = (10 - i) * 1.6 * spread;
        const cx = 50 - i * 1.1;
        return (
          <g key={y} stroke="#cffafe" strokeWidth={1} opacity={0.55}>
            <line x1={cx} y1={y} x2={cx - len} y2={y - len * 0.5} />
            <line x1={cx} y1={y} x2={cx + len} y2={y - len * 0.5} />
          </g>
        );
      })}
    </svg>
  );
};

const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames} = useVideoConfig();
  const count = 56;
  return (
    <AbsoluteFill>
      {new Array(count).fill(0).map((_, i) => {
        const baseX = random(`x-${i}`) * width;
        const baseY = random(`y-${i}`) * height;
        const size = 1 + random(`s-${i}`) * 3.5;
        const speed = 0.3 + random(`v-${i}`) * 0.8;
        // 缓慢上浮
        const drift = (frame * speed) % (height + 100);
        const y = (baseY - drift + height + 100) % (height + 100);
        // 闪烁
        const tw = Math.sin((frame / 18 + i) * 1.0) * 0.5 + 0.5;
        const appear = interpolate(frame, [0, 30], [0, 1], {
          extrapolateRight: 'clamp',
        });
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: baseX,
              top: y,
              width: size,
              height: size,
              borderRadius: '50%',
              background: i % 3 === 0 ? '#5eead4' : '#a5b4fc',
              opacity: tw * 0.7 * appear,
              boxShadow: `0 0 ${size * 3}px currentColor`,
              color: i % 3 === 0 ? '#5eead4' : '#a5b4fc',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const BrandIntro: React.FC<{
  name: string;
  tagline: string;
  sub: string;
}> = ({name, tagline, sub}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // 羽毛：从上方飘落 + 摆动 + 旋转
  const fall = spring({frame, fps, config: {damping: 18, mass: 1.4}});
  const featherY = interpolate(fall, [0, 1], [-260, 0]);
  const sway = Math.sin(frame / 14) * 10;
  const featherRot = interpolate(fall, [0, 1], [-35, -6]) + Math.sin(frame / 20) * 4;
  const featherSpread = interpolate(frame, [10, 45], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // 名称：辉光浮现
  const nameSpring = spring({frame: frame - 40, fps, config: {damping: 14}});
  const nameOpacity = interpolate(frame, [40, 65], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const glow = interpolate(frame, [45, 80], [0, 26], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // tagline：分词错峰淡入
  const words = tagline.split(' ');

  // 副标题
  const subOpacity = interpolate(frame, [95, 120], [0, 0.85], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(circle at 50% 38%, #1e2150 0%, #11132e 45%, #07081a 100%)',
        fontFamily: 'sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* 柔光辉 */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 50% 40%, rgba(94,234,212,0.18) 0%, rgba(99,102,241,0.10) 30%, transparent 60%)',
        }}
      />

      <Particles />

      {/* 羽毛 */}
      <AbsoluteFill
        style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: 230}}
      >
        <div
          style={{
            transform: `translate(${sway}px, ${featherY}px) rotate(${featherRot}deg)`,
            filter: 'drop-shadow(0 0 22px rgba(129,140,248,0.6))',
          }}
        >
          <Feather progress={featherSpread} />
        </div>
      </AbsoluteFill>

      {/* 文案 */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          paddingTop: 120,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 96,
            fontWeight: 700,
            letterSpacing: 4,
            color: '#f8fafc',
            opacity: nameOpacity,
            transform: `scale(${interpolate(nameSpring, [0, 1], [0.8, 1])})`,
            textShadow: `0 0 ${glow}px rgba(94,234,212,0.9), 0 0 ${glow * 2}px rgba(129,140,248,0.7)`,
          }}
        >
          {name}
        </h1>

        <div style={{display: 'flex', gap: 22, marginTop: 28}}>
          {words.map((w, i) => {
            const start = 72 + i * 12;
            const op = interpolate(frame, [start, start + 18], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const ty = interpolate(frame, [start, start + 18], [14, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            return (
              <span
                key={i}
                style={{
                  fontSize: 34,
                  letterSpacing: 6,
                  color: '#a5f3fc',
                  opacity: op,
                  transform: `translateY(${ty}px)`,
                }}
              >
                {w}
              </span>
            );
          })}
        </div>

        <p
          style={{
            marginTop: 34,
            fontSize: 22,
            letterSpacing: 3,
            color: '#cbd5e1',
            opacity: subOpacity,
          }}
        >
          {sub}
        </p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
