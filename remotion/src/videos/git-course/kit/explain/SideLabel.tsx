import {interpolate, useCurrentFrame} from 'remotion';
import {COLOR, WEIGHT} from '../../palette';
import {seconds} from '../../timeline';
import {TYPE} from '../../typography';

const toneColor = (tone: 'main' | 'feature' | 'head') =>
  tone === 'main' ? COLOR.git.main : tone === 'feature' ? COLOR.git.feature : COLOR.git.head;

export const SideLabel: React.FC<{
  children: React.ReactNode;
  x: number;
  y: number;
  tone?: 'main' | 'feature' | 'head';
}> = ({children, x, y, tone = 'head'}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [seconds(0.4), seconds(0.93)], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity,
        maxWidth: 520,
        color: COLOR.text.primary,
        ...TYPE.subtitle,
        fontWeight: WEIGHT.bold,
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: 14,
          height: 14,
          borderRadius: 999,
          background: toneColor(tone),
          marginRight: 14,
        }}
      />
      {children}
    </div>
  );
};
