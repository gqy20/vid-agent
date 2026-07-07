import {interpolate, useCurrentFrame} from 'remotion';
import {COLOR} from '../../palette';
import {TYPE} from '../../typography';

export const Intro: React.FC<{
  eyebrow: string;
  title: React.ReactNode;
  summary: string;
}> = ({eyebrow, title, summary}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 24], [0.96, 1], {extrapolateRight: 'clamp'});
  const opacity = interpolate(frame, [0, 18], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <div
      style={{
        position: 'absolute',
        left: 160,
        top: 210,
        width: 760,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: 'left center',
      }}
    >
      <div style={{...TYPE.subtitle, color: COLOR.git.feature, fontWeight: 760, marginBottom: 22}}>{eyebrow}</div>
      <div style={TYPE.display}>{title}</div>
      <div style={{...TYPE.body, color: COLOR.text.secondary, marginTop: 30}}>{summary}</div>
    </div>
  );
};
