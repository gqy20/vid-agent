import {Img, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {COLOR} from '../designTokens';
import {EvidenceSpotlight, type EvidenceSpotlightRect} from './EvidenceSpotlight';
import {TERMINAL_HEADER_HEIGHT, TerminalPanel} from './TerminalPanel';

export const RECORDED_TERMINAL_SOURCE = {
  width: 3514,
  height: 2018,
  contentHeight: 1911,
  cropBottom: 107,
  columns: 120,
  rows: 28,
  fontSize: 48,
} as const;

const RECORDED_TERMINAL_CROP_SCALE =
  RECORDED_TERMINAL_SOURCE.height / RECORDED_TERMINAL_SOURCE.contentHeight;
const RECORDED_TERMINAL_CROP_PERCENT =
  (RECORDED_TERMINAL_SOURCE.cropBottom / RECORDED_TERMINAL_SOURCE.height) * 100;

export const RecordedTerminal: React.FC<{
  src: string;
  title: string;
  zoom?: number;
  focus?: string;
  opacity?: number;
  spotlight?: EvidenceSpotlightRect;
  spotlightProgress?: number;
}> = ({
  src,
  title,
  zoom = 1.05,
  focus = '50% 50%',
  opacity = 1,
  spotlight,
  spotlightProgress = 1,
}) => {
  const [focusX = '50%'] = focus.trim().split(/\s+/);

  return (
    <TerminalPanel title={title}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: `calc(100% - ${TERMINAL_HEADER_HEIGHT}px)`,
          overflow: 'hidden',
          background: COLOR.terminal.bg,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transformOrigin: focus,
            scale: zoom,
            opacity,
          }}
        >
          <Img
            src={staticFile(src)}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: focus,
              transformOrigin: `${focusX} 0%`,
              scale: RECORDED_TERMINAL_CROP_SCALE,
              clipPath: `inset(0 0 ${RECORDED_TERMINAL_CROP_PERCENT}% 0)`,
              display: 'block',
            }}
          />
        </div>
        {spotlight ? <EvidenceSpotlight rect={spotlight} progress={spotlightProgress} /> : null}
      </div>
    </TerminalPanel>
  );
};

export const RecordedTerminalClip: React.FC<{
  src: string;
  title: string;
  sourceStartFrame: number;
  playbackRate?: number;
  zoom?: number;
  focus?: string;
  opacity?: number;
}> = ({
  src,
  title,
  sourceStartFrame,
  playbackRate = 1,
  zoom = 1.05,
  focus = '50% 50%',
  opacity = 1,
}) => {
  const [focusX = '50%'] = focus.trim().split(/\s+/);

  return (
    <TerminalPanel title={title}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: `calc(100% - ${TERMINAL_HEADER_HEIGHT}px)`,
          overflow: 'hidden',
          background: COLOR.terminal.bg,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transformOrigin: focus,
            scale: zoom,
            opacity,
          }}
        >
          <OffthreadVideo
            src={staticFile(src)}
            muted
            trimBefore={sourceStartFrame}
            playbackRate={playbackRate}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: focus,
              transformOrigin: `${focusX} 0%`,
              scale: RECORDED_TERMINAL_CROP_SCALE,
              clipPath: `inset(0 0 ${RECORDED_TERMINAL_CROP_PERCENT}% 0)`,
              display: 'block',
            }}
          />
        </div>
      </div>
    </TerminalPanel>
  );
};

export const RecordedTerminalFrames: React.FC<{
  frameDirectory: string;
  frameCount: number;
  title: string;
  playbackRate?: number;
  zoom?: number;
  focus?: string;
  opacity?: number;
}> = ({
  frameDirectory,
  frameCount,
  title,
  playbackRate = 1,
  zoom,
  focus,
  opacity,
}) => {
  const frame = useCurrentFrame();
  const sourceFrame = Math.min(frameCount - 1, Math.max(0, Math.floor(frame * playbackRate)));
  const src = `${frameDirectory}/f_${String(sourceFrame + 1).padStart(5, '0')}.png`;
  return <RecordedTerminal src={src} title={title} zoom={zoom} focus={focus} opacity={opacity} />;
};
