import {Sequence} from 'remotion';
import type {Rect} from '../layout/geometry';
import {RecordedTerminalStage} from './RecordedTerminalStage';

export type RecordedTerminalCue = {
  readonly id: string;
  readonly from: number;
  readonly durationInFrames: number;
  readonly src: string;
  readonly holdFrameSrc: string;
  readonly holdFromFrame: number;
  readonly playbackRate?: number;
  readonly startFromFrame?: number;
};

export const RecordedTerminalCueSequence: React.FC<{
  readonly cues: readonly RecordedTerminalCue[];
  readonly rect?: Rect;
  readonly opacity?: number;
  readonly zIndex?: number;
  readonly title?: string;
  readonly mediaFit?: 'fill' | 'cover';
  readonly auditIdPrefix?: string;
  readonly style?: React.CSSProperties;
}> = ({
  cues,
  rect,
  opacity = 1,
  zIndex,
  title,
  mediaFit = 'cover',
  auditIdPrefix = 'recorded-terminal-cue',
  style,
}) => (
  <>
    {cues.map((cue) => (
      <Sequence key={cue.id} from={cue.from} durationInFrames={cue.durationInFrames} name={`terminal:${cue.id}`}>
        <RecordedTerminalStage
          auditId={`${auditIdPrefix}-${cue.id}`}
          rect={rect}
          opacity={opacity}
          zIndex={zIndex}
          title={title}
          mediaFit={mediaFit}
          style={style}
          src={cue.src}
          holdFrameSrc={cue.holdFrameSrc}
          holdFromFrame={cue.holdFromFrame}
          playbackRate={cue.playbackRate}
          startFromFrame={cue.startFromFrame}
        />
      </Sequence>
    ))}
  </>
);
