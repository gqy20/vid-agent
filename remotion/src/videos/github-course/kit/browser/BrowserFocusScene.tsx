import {AbsoluteFill} from 'remotion';
import type {BrowserRecordingSource} from './types';
import {BrowserPanel} from './BrowserPanel';
import {BrowserStage} from './BrowserStage';

export const BrowserFocusScene: React.FC<{
  recording: BrowserRecordingSource;
  holdFromFrame?: number;
  playbackRate?: number;
  children?: React.ReactNode;
}> = ({recording, holdFromFrame, playbackRate = 1, children}) => {
  return (
    <AbsoluteFill>
      <BrowserStage>
        <BrowserPanel recording={recording} holdFromFrame={holdFromFrame} playbackRate={playbackRate} auditId="browser-focus" />
      </BrowserStage>
      {children}
    </AbsoluteFill>
  );
};
