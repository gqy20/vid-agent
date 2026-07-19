import {Easing, interpolate} from 'remotion';
import {seconds} from '../../timeline';
import {COLOR, WEIGHT} from '../../palette';
import {TYPE} from '../../typography';

export type NarrationCaptionCue = {
  readonly from: number;
  readonly to: number;
  readonly text: string;
};

const cleanCaptionText = (text: string) =>
  text.replace(/[。；;]+$/g, '').replace(/(?<=[\p{Script=Han}A-Za-z0-9])\.$/u, '');

export const NarrationSubtitle: React.FC<{
  frame: number;
  cues: readonly NarrationCaptionCue[];
  bottom?: number;
  width?: number;
  auditId?: string;
}> = ({frame, cues, bottom = 104, width = 1120, auditId}) => {
  const cue = cues.find((item) => frame >= seconds(item.from) && frame < seconds(item.to));
  if (!cue) return null;

  const localFrame = frame - seconds(cue.from);
  const remainingFrames = seconds(cue.to) - frame;
  const enter = interpolate(localFrame, [0, seconds(0.32)], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exit = interpolate(remainingFrames, [0, seconds(0.22)], [0, 1], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      data-audit-id={auditId}
      style={{
        position: 'absolute',
        left: '50%',
        bottom,
        width: 'fit-content',
        maxWidth: width,
        boxSizing: 'border-box',
        padding: '0 12px',
        translate: `-50% ${(1 - enter) * 10}px`,
        textAlign: 'center',
        ...TYPE.subtitle,
        fontSize: 32,
        lineHeight: 1.42,
        fontWeight: WEIGHT.bold,
        color: COLOR.text.primary,
        textShadow: '0 1px 0 rgba(247, 247, 244, 0.9)',
        opacity: enter * exit,
      }}
    >
      {cleanCaptionText(cue.text)}
    </div>
  );
};
