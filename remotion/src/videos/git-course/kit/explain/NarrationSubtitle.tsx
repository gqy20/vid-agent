import {Easing, interpolate} from 'remotion';
import {seconds} from '../../timeline';
import {CaptionLayer} from './CaptionLayer';

export type NarrationCaptionCue = {
  readonly from: number;
  readonly to: number;
  readonly text: string;
};

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

  return <CaptionLayer variant="narration" bottom={bottom} width={width} opacity={enter * exit} translateY={(1 - enter) * 10} auditId={auditId}>{cue.text}</CaptionLayer>;
};
