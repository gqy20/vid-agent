import {AbsoluteFill} from 'remotion';
import {COLOR} from '../../palette';
import {TYPE} from '../../typography';
import {BrowserPanel} from './BrowserPanel';
import {BrowserStage} from './BrowserStage';
import type {BrowserFocusRegion, BrowserRecordingSource} from './types';

export const BrowserEvidenceScene: React.FC<{
  recording: BrowserRecordingSource;
  highlights?: readonly BrowserFocusRegion[];
  highlightIds?: readonly string[];
  conclusion?: string;
}> = ({recording, highlights, highlightIds, conclusion}) => (
  <AbsoluteFill>
    <BrowserStage>
      <BrowserPanel
        recording={recording}
        highlights={highlights}
        highlightIds={highlightIds}
        preferPoster
        auditId="browser-evidence"
      />
    </BrowserStage>
    {conclusion ? (
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
    ) : null}
  </AbsoluteFill>
);
