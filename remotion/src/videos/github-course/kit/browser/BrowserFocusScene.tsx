import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import type {BrowserRecordingSource} from './types';
import {BrowserPanel} from './BrowserPanel';

export const BrowserFocusScene: React.FC<{
  recording: BrowserRecordingSource;
  playbackRate?: number;
  children?: React.ReactNode;
}> = ({recording, playbackRate = 1, children}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 20], [0.985, 1], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{padding: '112px 118px 96px', boxSizing: 'border-box'}}>
      <div style={{width: '100%', height: '100%', transform: `scale(${scale})`, transformOrigin: 'center'}}>
        <BrowserPanel recording={recording} playbackRate={playbackRate} auditId="browser-focus" />
      </div>
      {children}
    </AbsoluteFill>
  );
};
