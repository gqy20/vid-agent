import {interpolate, useCurrentFrame} from 'remotion';
import {COLOR, LAYOUT, TYPE} from '../designTokens';
import {EASE} from '../motion';

export const TerminalFocus: React.FC<{
  title: string;
  children: React.ReactNode;
  terminalInAt?: number;
}> = ({title, children, terminalInAt = 38}) => {
  const frame = useCurrentFrame();
  const questionOpacity = interpolate(frame, [0, 10, terminalInAt - 6, terminalInAt + 10], [0, 1, 1, 0], {
    easing: EASE.editorial,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const terminalOpacity = interpolate(frame, [terminalInAt, terminalInAt + 16], [0, 1], {
    easing: EASE.enter,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: LAYOUT.safeX,
          right: LAYOUT.safeX,
          top: 128,
          textAlign: 'center',
          ...TYPE.heading,
          color: COLOR.text.primary,
          opacity: questionOpacity,
          translate: `0 ${(1 - questionOpacity) * 12}px`,
        }}
      >
        {title}
      </div>
      <div
        style={{
          position: 'absolute',
          ...LAYOUT.terminalEvidence.focus.frame,
          opacity: terminalOpacity,
          translate: `0 ${(1 - terminalOpacity) * 12}px`,
        }}
      >
        {children}
      </div>
    </>
  );
};
