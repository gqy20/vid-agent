import {Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {COLOR, FONT, WEIGHT} from '../../palette';
import {TYPE} from '../../typography';
import type {BrowserFocusRegion, BrowserRecordingSource} from './types';

const HEADER_HEIGHT = 58;

const toneColor = (tone: BrowserFocusRegion['tone']) => {
  if (tone === 'approved') return COLOR.github.approved;
  if (tone === 'merged') return COLOR.github.merged;
  if (tone === 'warning') return COLOR.github.changesRequested;
  if (tone === 'failed') return COLOR.github.failed;
  return COLOR.github.action;
};

export const BrowserPanel: React.FC<{
  recording: BrowserRecordingSource;
  highlights?: readonly BrowserFocusRegion[];
  preferPoster?: boolean;
  playbackRate?: number;
  auditId?: string;
}> = ({recording, highlights = [], preferPoster = false, playbackRate = 1, auditId = 'browser-panel'}) => {
  const frame = useCurrentFrame();
  const panelIn = interpolate(frame, [0, 10], [0, 1], {extrapolateRight: 'clamp'});
  const hasVideo = Boolean(recording.src) && !preferPoster;
  const hasPoster = Boolean(recording.poster);

  return (
    <div
      data-audit-id={auditId}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        border: `1px solid ${COLOR.stroke.default}`,
        background: COLOR.browser.viewport,
        boxShadow: `0 24px 70px ${COLOR.effects.shadowPanel}`,
        opacity: panelIn,
        transform: `translateY(${(1 - panelIn) * 12}px)`,
        fontFamily: FONT.sans,
      }}
    >
      <div
        style={{
          height: HEADER_HEIGHT,
          display: 'grid',
          gridTemplateColumns: '132px 1fr 132px',
          alignItems: 'center',
          padding: '0 18px',
          background: COLOR.browser.chrome,
          borderBottom: `1px solid ${COLOR.stroke.soft}`,
        }}
      >
        <div style={{display: 'flex', gap: 9}}>
          {['#ff5f57', '#febc2e', '#28c840'].map((color) => (
            <span key={color} style={{width: 13, height: 13, borderRadius: '50%', background: color}} />
          ))}
        </div>
        <div
          style={{
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${COLOR.stroke.soft}`,
            borderRadius: 7,
            background: COLOR.browser.address,
            color: COLOR.text.secondary,
            ...TYPE.uiSmall,
            fontFamily: FONT.mono,
            fontWeight: WEIGHT.regular,
          }}
        >
          {recording.url ?? 'github.com/course-lab'}
        </div>
        <div style={{...TYPE.uiSmall, color: COLOR.text.tertiary, textAlign: 'right'}}>{recording.title ?? recording.id}</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: HEADER_HEIGHT, bottom: 0, background: COLOR.browser.viewport}}>
        {hasVideo && recording.src ? (
          <OffthreadVideo
            src={staticFile(recording.src)}
            muted
            playbackRate={playbackRate}
            style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
          />
        ) : hasPoster && recording.poster ? (
          <Img src={staticFile(recording.poster)} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />
        ) : (
          <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: '#ffffff'}}>
            <div style={{textAlign: 'center'}}>
              <div style={{...TYPE.title, fontSize: 34, color: COLOR.text.primary}}>Browser recording slot</div>
              <div style={{...TYPE.code, marginTop: 14, color: COLOR.text.secondary}}>{recording.id}</div>
              <div style={{...TYPE.body, marginTop: 18, color: COLOR.text.tertiary}}>等待 github-course-lab 派生真实录制</div>
            </div>
          </div>
        )}
        {highlights.map((highlight, index) => {
          const highlightIn = interpolate(frame, [14 + index * 8, 24 + index * 8], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const color = toneColor(highlight.tone);
          return (
            <div
              key={highlight.id}
              data-audit-id={`${auditId}-${highlight.id}`}
              style={{
                position: 'absolute',
                left: `${highlight.x * 100}%`,
                top: `${highlight.y * 100}%`,
                width: `${highlight.width * 100}%`,
                height: `${highlight.height * 100}%`,
                border: `3px solid ${color}`,
                borderRadius: 8,
                boxShadow: `0 0 0 9999px rgba(31,35,40,${0.12 * highlightIn})`,
                opacity: highlightIn,
                pointerEvents: 'none',
              }}
            >
              {highlight.label ? (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: -42,
                    padding: '7px 11px',
                    borderRadius: 6,
                    background: color,
                    color: COLOR.text.inverse,
                    ...TYPE.uiSmall,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {highlight.label}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
