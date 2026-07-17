import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import type {BrowserRecordingSource} from './types';
import {BrowserPanel} from './BrowserPanel';

export const BrowserFocusScene: React.FC<{
  recording: BrowserRecordingSource;
  holdFromFrame?: number;
  playbackRate?: number;
  children?: React.ReactNode;
}> = ({recording, holdFromFrame, playbackRate = 1, children}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 20], [0.985, 1], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{padding: '112px 118px 96px', boxSizing: 'border-box', display: 'grid', placeItems: 'center'}}>
      <div style={{height: '100%', aspectRatio: '1600 / 958', maxWidth: '100%', scale, transformOrigin: 'center'}}>
        <BrowserPanel recording={recording} holdFromFrame={holdFromFrame} playbackRate={playbackRate} auditId="browser-focus" />
      </div>
      {children}
    </AbsoluteFill>
  );
};
