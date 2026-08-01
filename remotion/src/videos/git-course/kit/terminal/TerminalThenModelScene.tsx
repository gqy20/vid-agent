import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLOR} from '../../palette';
import {seconds} from '../../timeline';
import type {NarrationCaptionCue} from '../explain/NarrationSubtitle';
import {NarrationSubtitle} from '../explain/NarrationSubtitle';
import {COURSE_RECTS} from '../layout/CourseRects';
import type {Rect} from '../layout/geometry';
import {RecordedTerminalCueSequence, type RecordedTerminalCue} from './RecordedTerminalCueSequence';

export const TerminalThenModelScene: React.FC<{
  readonly cues: readonly RecordedTerminalCue[];
  readonly modelAtSeconds: number;
  readonly model: React.ReactNode;
  readonly captions: readonly NarrationCaptionCue[];
  readonly auditIdPrefix: string;
  readonly terminalRect?: Rect;
  readonly subtitleWidth?: number;
  readonly subtitleBottom?: number;
}> = ({
  cues,
  modelAtSeconds,
  model,
  captions,
  auditIdPrefix,
  terminalRect = COURSE_RECTS.terminal,
  subtitleWidth = 1320,
  subtitleBottom = 64,
}) => {
  const frame = useCurrentFrame();
  const modelAtFrame = seconds(modelAtSeconds);

  return (
    <AbsoluteFill>
      {frame < modelAtFrame ? (
        <RecordedTerminalCueSequence cues={cues} rect={terminalRect} auditIdPrefix={auditIdPrefix} />
      ) : (
        <AbsoluteFill style={{background: COLOR.canvas.base}}>{model}</AbsoluteFill>
      )}
      <NarrationSubtitle frame={frame} cues={captions} width={subtitleWidth} bottom={subtitleBottom} />
    </AbsoluteFill>
  );
};
