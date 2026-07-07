import {interpolate, useCurrentFrame} from 'remotion';
import {CodeBlock} from '../code/CodeBlock';
import {seconds} from '../../timeline';

export const MiniRefLine: React.FC<{
  title?: string;
  line: string;
  top?: number;
  left?: number;
}> = ({title = '.git/refs/heads', line, top = 702, left = 700}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [seconds(0.67), seconds(1.33)], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <div style={{position: 'absolute', top, left, width: 520, opacity}}>
      <CodeBlock title={title} lines={[line]} highlight={[0]} />
    </div>
  );
};
