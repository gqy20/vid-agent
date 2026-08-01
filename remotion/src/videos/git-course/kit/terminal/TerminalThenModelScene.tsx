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
  readonly terminalEvidenceHoldSeconds?: number;
}> = ({
  cues,
  modelAtSeconds,
  model,
  captions,
  auditIdPrefix,
  terminalRect = COURSE_RECTS.terminal,
  subtitleWidth = 1320,
  subtitleBottom = 64,
  terminalEvidenceHoldSeconds = 0,
}) => {
  const frame = useCurrentFrame();
  const requestedModelAtFrame = seconds(modelAtSeconds);
  const lastCueIndex = cues.reduce((latest, cue, index) => cue.from >= cues[latest].from ? index : latest, 0);
  const terminalEvidenceEndFrame = cues.reduce((latest, cue) => {
    const playbackRate = cue.playbackRate ?? 1;
    const startFromFrame = cue.startFromFrame ?? 0;
    const holdFrame = cue.from + Math.max(0, cue.holdFromFrame - startFromFrame) / playbackRate;
    return Math.max(latest, holdFrame + seconds(terminalEvidenceHoldSeconds));
  }, 0);
  const modelAtFrame = terminalEvidenceHoldSeconds > 0
    ? Math.max(requestedModelAtFrame, terminalEvidenceEndFrame)
    : requestedModelAtFrame;
  const effectiveCues = cues.map((cue, index) => index === lastCueIndex
    ? {...cue, durationInFrames: Math.max(cue.durationInFrames, Math.ceil(modelAtFrame - cue.from))}
    : cue);

  return (
    <AbsoluteFill>
      {frame < modelAtFrame ? (
        <RecordedTerminalCueSequence cues={effectiveCues} rect={terminalRect} auditIdPrefix={auditIdPrefix} />
      ) : (
        <AbsoluteFill style={{background: COLOR.canvas.base}}>{model}</AbsoluteFill>
      )}
      <NarrationSubtitle frame={frame} cues={captions} width={subtitleWidth} bottom={subtitleBottom} />
    </AbsoluteFill>
  );
};
