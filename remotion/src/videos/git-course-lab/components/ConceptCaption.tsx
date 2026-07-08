import {interpolate, useCurrentFrame} from 'remotion';
import {LAB_COLOR} from '../palette';
import {LAB_TYPE} from '../typography';

export const ConceptCaption: React.FC<{
  children: React.ReactNode;
  start?: number;
  end?: number;
}> = ({children, start = 0, end = 9999}) => {
  const frame = useCurrentFrame();
  const inOpacity = interpolate(frame, [start, start + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const outOpacity = interpolate(frame, [end - 12, end], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const opacity = Math.min(inOpacity, outOpacity);

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 74,
        transform: 'translateX(-50%)',
        width: 1060,
        textAlign: 'center',
        color: LAB_COLOR.text,
        opacity,
        ...LAB_TYPE.caption,
      }}
    >
      {children}
    </div>
  );
};

