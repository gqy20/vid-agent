import {AbsoluteFill} from 'remotion';
import {COLOR} from '../../palette';
import {TYPE} from '../../typography';
import {BrowserPanel} from './BrowserPanel';
import type {BrowserFocusRegion, BrowserRecordingSource} from './types';

export const BrowserEvidenceScene: React.FC<{
  recording: BrowserRecordingSource;
  highlights: readonly BrowserFocusRegion[];
  conclusion: string;
}> = ({recording, highlights, conclusion}) => (
  <AbsoluteFill style={{padding: '126px 150px 142px', boxSizing: 'border-box', display: 'grid', placeItems: 'center'}}>
    <div style={{height: '100%', aspectRatio: '1600 / 958', maxWidth: '100%'}}>
      <BrowserPanel recording={recording} highlights={highlights} preferPoster auditId="browser-evidence" />
    </div>
    <div
      style={{
        position: 'absolute',
        left: 420,
        right: 420,
        bottom: 70,
        padding: '14px 22px',
        border: `1px solid ${COLOR.stroke.soft}`,
        borderRadius: 9,
        background: COLOR.canvas.overlay,
        color: COLOR.text.primary,
        textAlign: 'center',
        ...TYPE.subtitle,
      }}
    >
      {conclusion}
    </div>
  </AbsoluteFill>
);
