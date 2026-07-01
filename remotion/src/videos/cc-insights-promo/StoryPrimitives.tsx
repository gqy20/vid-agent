import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, MONO, SANS, SERIF, CLAMP, EASE_OUT, FZ} from '../../theme';

export const shot = (name: string) => `dashboard-shots/${name}.png`;

export const StoryStage: React.FC<{
  eyebrow?: string;
  title: React.ReactNode;
  body?: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'center';
}> = ({eyebrow, title, body, children, align = 'left'}) => (
  <div
    style={{
      width: 1680,
      height: 900,
      display: 'grid',
      gridTemplateColumns: align === 'center' ? '1fr' : '500px 1fr',
      gap: 44,
      alignItems: 'center',
    }}
  >
    <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
      {eyebrow ? (
        <div
          style={{
            fontFamily: MONO,
            fontSize: 22,
            color: C.terracotta,
            letterSpacing: 0,
          }}
        >
          {eyebrow}
        </div>
      ) : null}
      <div
        style={{
          fontFamily: SERIF,
          fontSize: align === 'center' ? 72 : 54,
          lineHeight: 1.14,
          color: C.white,
          fontWeight: 700,
        }}
      >
        {title}
      </div>
      {body ? (
        <div
          style={{
            fontFamily: SANS,
            fontSize: 28,
            lineHeight: 1.48,
            color: C.dim,
            maxWidth: align === 'center' ? 1120 : 480,
          }}
        >
          {body}
        </div>
      ) : null}
    </div>
    {children}
  </div>
);

export const DashboardShot: React.FC<{
  src: string;
  width?: number;
  cropY?: number;
  zoom?: number;
  delay?: number;
}> = ({src, width = 1120, cropY = 0, zoom = 1, delay = 0}) => {
  const f = useCurrentFrame();
  const op = interpolate(f, [delay, delay + 18], [0, 1], {easing: EASE_OUT, ...CLAMP});
  const y = interpolate(f, [delay, delay + 18], [22, 0], {easing: EASE_OUT, ...CLAMP});
  const scale = interpolate(f, [delay, delay + 120], [zoom, zoom + 0.025], CLAMP);
  return (
    <div
      style={{
        width,
        aspectRatio: '16 / 9',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(250,249,245,0.12)',
        boxShadow: '0 28px 70px rgba(0,0,0,0.38)',
        background: '#faf9f5',
        opacity: op,
        translate: `0 ${y}px`,
      }}
    >
      <Img
        src={staticFile(src)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: `center ${cropY}%`,
          scale,
        }}
      />
    </div>
  );
};

export const MetricRow: React.FC<{
  items: Array<{label: string; value: string; tone?: 'bad' | 'warn' | 'good' | 'neutral'}>;
}> = ({items}) => (
  <div style={{display: 'flex', gap: 12, flexWrap: 'wrap'}}>
    {items.map((item) => {
      const color =
        item.tone === 'bad'
          ? C.red
          : item.tone === 'warn'
            ? C.warn
            : item.tone === 'good'
              ? C.green
              : C.text;
      return (
        <div
          key={item.label}
          style={{
            minWidth: 132,
            padding: '14px 16px',
            borderRadius: 10,
            background: 'rgba(250,249,245,0.055)',
            border: '1px solid rgba(250,249,245,0.12)',
          }}
        >
          <div style={{fontFamily: MONO, fontSize: 16, color: C.dim, marginBottom: 5}}>
            {item.label}
          </div>
          <div style={{fontFamily: SANS, fontSize: 30, fontWeight: 700, color}}>{item.value}</div>
        </div>
      );
    })}
  </div>
);

export const CommandLine: React.FC<{children: React.ReactNode; delay?: number}> = ({
  children,
  delay = 0,
}) => {
  const f = useCurrentFrame();
  const op = interpolate(f, [delay, delay + 16], [0, 1], {easing: EASE_OUT, ...CLAMP});
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: FZ.body,
        color: C.text,
        background: 'rgba(0,0,0,0.28)',
        border: '1px solid rgba(250,249,245,0.12)',
        borderRadius: 12,
        padding: '18px 24px',
        opacity: op,
      }}
    >
      <span style={{color: C.green}}>$ </span>
      {children}
    </div>
  );
};
