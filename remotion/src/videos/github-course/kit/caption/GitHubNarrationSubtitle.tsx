import {COLOR} from '../../palette';
import {FRAME} from '../../spacing';
import {seconds} from '../../timeline';
import {TYPE} from '../../typography';

export type GitHubNarrationCue = {
  readonly from: number;
  readonly to: number;
  readonly text: string;
};

const cleanCaptionText = (text: string) =>
  text.replace(/[。；;]+$/g, '').replace(/(?<=[\p{Script=Han}A-Za-z0-9])\.$/u, '');

export const GitHubNarrationSubtitle: React.FC<{
  frame: number;
  cues: readonly GitHubNarrationCue[];
  bottom?: number;
  width?: number;
  auditId?: string;
}> = ({frame, cues, bottom = FRAME.subtitleBottom, width = FRAME.subtitleMaxWidth, auditId = 'github-narration-subtitle'}) => {
  const cue = cues.find((item) => frame >= seconds(item.from) && frame < seconds(item.to));
  if (!cue) return null;

  return (
    <div
      data-audit-id={auditId}
      style={{
        position: 'absolute',
        left: '50%',
        bottom,
        width: 'fit-content',
        maxWidth: width,
        boxSizing: 'border-box',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        whiteSpace: 'normal',
        ...TYPE.subtitle,
        color: COLOR.text.primary,
        zIndex: 60,
      }}
    >
      {cleanCaptionText(cue.text)}
    </div>
  );
};
