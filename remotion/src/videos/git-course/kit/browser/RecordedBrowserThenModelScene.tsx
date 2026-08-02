import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {COLOR, FONT, WEIGHT} from '../../palette';
import {seconds} from '../../timeline';
import type {NarrationCaptionCue} from '../explain/NarrationSubtitle';
import {NarrationSubtitle} from '../explain/NarrationSubtitle';

export const RecordedBrowserThenModelScene: React.FC<{
  readonly src: string;
  readonly url: string;
  readonly title: string;
  readonly modelAtSeconds: number;
  readonly model: React.ReactNode;
  readonly captions: readonly NarrationCaptionCue[];
}> = ({src, url, title, modelAtSeconds, model, captions}) => {
  const frame = useCurrentFrame();
  const showModel = frame >= seconds(modelAtSeconds);
  return (
    <AbsoluteFill>
      {showModel ? <AbsoluteFill style={{background: COLOR.canvas.base}}>{model}</AbsoluteFill> : (
        <div data-audit-id="recorded-browser" style={{position: 'absolute', left: 180, right: 180, top: 104, height: 746, overflow: 'hidden', borderRadius: 14, border: `1px solid ${COLOR.stroke.default}`, background: COLOR.canvas.raised, boxShadow: `0 22px 64px ${COLOR.effects.shadowPanel}`}}>
          <div style={{height: 50, display: 'grid', gridTemplateColumns: '112px 1fr 210px', alignItems: 'center', padding: '0 20px', borderBottom: `1px solid ${COLOR.stroke.soft}`, background: COLOR.canvas.soft, fontFamily: FONT.ui}}>
            <div style={{display: 'flex', gap: 9}}>{['#ff5f57', '#febc2e', '#28c840'].map((color) => <span key={color} style={{width: 12, height: 12, borderRadius: '50%', background: color}} />)}</div>
            <div style={{justifySelf: 'center', maxWidth: 760, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: COLOR.text.secondary, fontFamily: FONT.mono, fontSize: 16}}>{url}</div>
            <div style={{justifySelf: 'end', color: COLOR.text.primary, fontSize: 17, fontWeight: WEIGHT.semibold}}>{title}</div>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 50, bottom: 0, overflow: 'hidden'}}>
            <OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top'}} />
          </div>
        </div>
      )}
      <NarrationSubtitle frame={frame} cues={captions} width={1320} bottom={64} />
    </AbsoluteFill>
  );
};
