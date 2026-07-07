import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {CodeWindow} from '../../components/CodeWindow';
import {COLOR} from '../../palette';
import type {TerminalStep} from '../../data/terminalScripts';
import {AnimatedTerminal} from '../../components/AnimatedTerminal';

export const TerminalSplitScene: React.FC<{
  steps: readonly TerminalStep[];
  refsTitle?: string;
  refsLines?: readonly string[];
  refsHighlight?: number;
  right: React.ReactNode;
  emphasis?: 'terminal' | 'refs' | 'balanced';
  animateIn?: boolean;
  frameOffset?: number;
}> = ({steps, refsTitle = '.git/refs/heads', refsLines, refsHighlight, right, emphasis = 'balanced', animateIn = true, frameOffset = 0}) => {
  const frame = useCurrentFrame();
  const progress = animateIn
    ? interpolate(frame, [0, 34], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : 1;
  return (
    <AbsoluteFill
      style={{
        padding: '162px 84px 132px',
        display: 'grid',
        gridTemplateColumns: '760px 1fr',
        gap: 72,
        boxSizing: 'border-box',
        alignItems: 'start',
      }}
    >
      <div
        style={{
          display: 'grid',
          gap: 22,
          transform: `translateX(${(1 - progress) * -42}px) scale(${0.96 + progress * 0.04})`,
          opacity: progress,
        }}
      >
        <div style={{height: 372}}>
          <AnimatedTerminal
            steps={steps}
            maxVisibleSteps={emphasis === 'terminal' ? undefined : 2}
            inactiveOpacity={emphasis === 'terminal' ? 0.48 : 0.44}
            frameOffset={frameOffset}
          />
        </div>
        {refsLines ? <CodeWindow title={refsTitle} highlight={refsHighlight} lines={refsLines} /> : null}
      </div>
      <div
        style={{
          minHeight: 520,
          transform: `translateY(${(1 - progress) * 24}px)`,
          opacity: progress,
          borderLeft: `1px solid ${COLOR.stroke.soft}`,
          paddingLeft: 24,
        }}
      >
        {right}
      </div>
    </AbsoluteFill>
  );
};
