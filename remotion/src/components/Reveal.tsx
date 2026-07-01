import {interpolate, useCurrentFrame} from 'remotion';
import {EASE_OUT, CLAMP} from '../theme';

/* 揭示动画（官方缓动 + 独立 transform 属性） */
export const Reveal: React.FC<{
  delay: number;
  dur?: number;
  y?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({delay, dur = 14, y = 12, children, style}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [delay, delay + dur], [0, 1], {easing: EASE_OUT, ...CLAMP});
  const ty = interpolate(f, [delay, delay + dur], [y, 0], {easing: EASE_OUT, ...CLAMP});
  return (
    <div style={{opacity: o, translate: `0px ${ty}px`, ...style}}>{children}</div>
  );
};
