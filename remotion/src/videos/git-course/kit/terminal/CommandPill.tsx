import {interpolate, useCurrentFrame} from 'remotion';
import {COLOR, FONT, WEIGHT} from '../../palette';
import {TYPE} from '../../typography';
import {seconds} from '../../timeline';

export const CommandPill: React.FC<{
  command: string;
  branch?: 'main' | 'feature' | string;
  top?: number;
  fontSize?: number;
}> = ({command, branch = 'main', top = 142, fontSize = 34}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, seconds(0.6)], [0, 1], {extrapolateRight: 'clamp'});
  const y = interpolate(frame, [0, seconds(0.6)], [-10, 0], {extrapolateRight: 'clamp'});
  const color = branch === 'feature' ? COLOR.git.feature : branch === 'main' ? COLOR.git.main : COLOR.git.workingTree;

  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: '50%',
        transform: `translate(-50%, ${y}px)`,
        opacity,
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        border: `1px solid ${COLOR.stroke.soft}`,
        background: COLOR.canvas.raised,
        borderRadius: 999,
        padding: '18px 32px',
        boxShadow: `0 8px 22px ${COLOR.effects.shadowSoft}`,
        fontFamily: FONT.mono,
        ...TYPE.code,
        fontSize,
      }}
    >
      <span style={{color, fontWeight: WEIGHT.bold}}>{branch}</span>
      <span style={{color: COLOR.text.tertiary}}>$</span>
      <span style={{color: COLOR.text.primary}}>{command}</span>
    </div>
  );
};
