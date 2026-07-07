import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {AnimatedTerminal} from '../../components/AnimatedTerminal';
import type {TerminalStep} from '../../data/terminalScripts';

export const TerminalFocusScene: React.FC<{
  steps: readonly TerminalStep[];
  children?: React.ReactNode;
  frameOffset?: number;
}> = ({steps, children, frameOffset = 0}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 26], [0.98, 1], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{padding: '172px 190px 160px', boxSizing: 'border-box'}}>
      <div style={{width: '100%', height: '100%', transform: `scale(${scale})`, transformOrigin: 'center'}}>
        <AnimatedTerminal steps={steps} inactiveOpacity={0.42} frameOffset={frameOffset} />
      </div>
      {children}
    </AbsoluteFill>
  );
};
