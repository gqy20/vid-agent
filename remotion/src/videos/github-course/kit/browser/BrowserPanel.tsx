import {useEffect, useState} from 'react';
import {Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useDelayRender} from 'remotion';
import {COLOR, FONT, WEIGHT} from '../../palette';
import {TYPE} from '../../typography';
import type {BrowserFocusRegion, BrowserRecordingMetadata, BrowserRecordingSource} from './types';

// The 1600x900 recording sits below this chrome inside a 1600x958 reference
// frame. At the 1456px lesson-stage width, 53px preserves the same 16:9
// viewport without object-fit cropping.
const HEADER_HEIGHT = 53;

const browserUrlParts = (rawUrl = 'github.com/course-lab') => {
  const normalized = rawUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const pathStart = normalized.indexOf('/');
  if (pathStart === -1) return {host: normalized, path: ''};
  return {host: normalized.slice(0, pathStart), path: normalized.slice(pathStart)};
};

const SecureConnectionIcon: React.FC = () => (
  <svg aria-hidden="true" width="15" height="15" viewBox="0 0 16 16" fill="none">
    <rect x="3.25" y="7" width="9.5" height="7" rx="2" stroke="currentColor" strokeWidth="1.35" />
    <path d="M5.25 7V5.25a2.75 2.75 0 0 1 5.5 0V7" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    <circle cx="8" cy="10.5" r="0.85" fill="currentColor" />
  </svg>
);

const RepositoryIcon: React.FC = () => (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3.25 2.5h7.25a2 2 0 0 1 2 2v9H5.25a2 2 0 0 1-2-2v-9Z" stroke="currentColor" strokeWidth="1.3" />
    <path d="M5.25 2.5v11M7.5 5.25h2.75" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const toneColor = (tone: BrowserFocusRegion['tone']) => {
  if (tone === 'approved') return COLOR.github.approved;
  if (tone === 'merged') return COLOR.github.merged;
  if (tone === 'warning') return COLOR.github.changesRequested;
  if (tone === 'failed') return COLOR.github.failed;
  return COLOR.github.action;
};

const useMetadataHighlights = (
  recording: BrowserRecordingSource,
  highlightIds: readonly string[] | undefined,
): readonly BrowserFocusRegion[] => {
  const shouldLoad = Boolean(recording.metadata && highlightIds?.length);
  const highlightIdsKey = highlightIds?.join('\u0000') ?? '';
  const {delayRender, continueRender, cancelRender} = useDelayRender();
  const [handle] = useState(() =>
    shouldLoad ? delayRender(`Loading browser metadata for ${recording.id}`) : null,
  );
  const [metadataHighlights, setMetadataHighlights] = useState<readonly BrowserFocusRegion[]>([]);

  useEffect(() => {
    if (!shouldLoad || handle === null || !recording.metadata || !highlightIds) return;

    fetch(staticFile(recording.metadata))
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Cannot load browser metadata '${recording.metadata}': HTTP ${response.status}`);
        }
        return response.json() as Promise<BrowserRecordingMetadata>;
      })
      .then((metadata) => {
        const regionsById = new Map((metadata.focusRegions ?? []).map((region) => [region.id, region]));
        const missing = highlightIds.filter((id) => !regionsById.has(id));
        if (missing.length > 0) {
          throw new Error(`Browser metadata '${recording.metadata}' is missing focus regions: ${missing.join(', ')}`);
        }
        setMetadataHighlights(highlightIds.map((id) => regionsById.get(id) as BrowserFocusRegion));
        continueRender(handle);
      })
      .catch((error: unknown) => {
        cancelRender(error instanceof Error ? error : new Error(String(error)));
      });
  }, [cancelRender, continueRender, handle, highlightIdsKey, recording.metadata, shouldLoad]);

  return metadataHighlights;
};

export const BrowserPanel: React.FC<{
  recording: BrowserRecordingSource;
  highlights?: readonly BrowserFocusRegion[];
  highlightIds?: readonly string[];
  preferPoster?: boolean;
  holdFromFrame?: number;
  playbackRate?: number;
  auditId?: string;
}> = ({recording, highlights, highlightIds, preferPoster = false, holdFromFrame, playbackRate = 1, auditId = 'browser-panel'}) => {
  const frame = useCurrentFrame();
  const metadataHighlights = useMetadataHighlights(recording, highlights ? undefined : highlightIds);
  const resolvedHighlights = highlights ?? metadataHighlights;
  const url = browserUrlParts(recording.url);
  // Browser scenes use hard cuts. Finish the panel entrance during premount so
  // the first visible frame does not flash an empty course canvas.
  const panelIn = interpolate(frame, [-10, 0], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const hasVideo = Boolean(recording.src) && !preferPoster && (holdFromFrame === undefined || frame < holdFromFrame);
  const hasPoster = Boolean(recording.poster);

  return (
    <div
      data-audit-id={auditId}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        borderRadius: 12,
        overflow: 'hidden',
        border: `1px solid ${COLOR.stroke.default}`,
        background: COLOR.browser.viewport,
        boxShadow: `0 24px 70px ${COLOR.effects.shadowPanel}`,
        opacity: panelIn,
        translate: `0 ${(1 - panelIn) * 12}px`,
        fontFamily: FONT.sans,
      }}
    >
      <div
        style={{
          height: HEADER_HEIGHT,
          display: 'grid',
          gridTemplateColumns: '124px minmax(320px, 1fr) 220px',
          alignItems: 'center',
          columnGap: 18,
          padding: '0 22px',
          background: COLOR.browser.chrome,
          borderBottom: `1px solid ${COLOR.stroke.soft}`,
        }}
      >
        <div style={{display: 'flex', gap: 8}}>
          {['#ff5f57', '#febc2e', '#28c840'].map((color) => (
            <span
              key={color}
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: color,
                boxShadow: 'inset 0 0 0 0.75px rgba(31,35,40,0.16)',
              }}
            />
          ))}
        </div>
        <div
          data-audit-id={`${auditId}-url`}
          style={{
            justifySelf: 'center',
            width: 'min(100%, 760px)',
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 9,
            padding: '0 18px',
            boxSizing: 'border-box',
            border: `1px solid ${COLOR.stroke.soft}`,
            borderRadius: 9,
            background: COLOR.browser.address,
            color: COLOR.text.secondary,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 2px ${COLOR.effects.shadowSoft}`,
            fontSize: 15,
            lineHeight: 1,
            fontFamily: FONT.mono,
            fontWeight: WEIGHT.regular,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          <span style={{display: 'flex', color: COLOR.text.tertiary, flex: '0 0 auto'}}>
            <SecureConnectionIcon />
          </span>
          <span style={{overflow: 'hidden', textOverflow: 'ellipsis'}}>
            <span style={{color: COLOR.text.primary, fontWeight: WEIGHT.bold}}>{url.host}</span>
            <span style={{color: COLOR.text.tertiary}}>{url.path}</span>
          </span>
        </div>
        <div
          data-audit-id={`${auditId}-repository-visibility`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 8,
            minWidth: 0,
            color: COLOR.text.tertiary,
            fontFamily: FONT.sans,
            fontSize: 13,
            lineHeight: 1,
            fontWeight: WEIGHT.medium,
            letterSpacing: 0.4,
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{display: 'flex', flex: '0 0 auto'}}>
            <RepositoryIcon />
          </span>
          <span style={{overflow: 'hidden', textOverflow: 'ellipsis'}}>{recording.title ?? recording.id}</span>
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: HEADER_HEIGHT, bottom: 0, overflow: 'hidden', background: COLOR.browser.viewport}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, aspectRatio: '1600 / 900'}}>
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
            <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: COLOR.browser.viewport}}>
              <div style={{textAlign: 'center'}}>
                <div style={{...TYPE.section, color: COLOR.text.primary}}>Browser recording slot</div>
                <div style={{...TYPE.code, marginTop: 14, color: COLOR.text.secondary}}>{recording.id}</div>
                <div style={{...TYPE.body, marginTop: 18, color: COLOR.text.tertiary}}>等待 github-course-lab 派生真实录制</div>
              </div>
            </div>
          )}
          {resolvedHighlights.map((highlight, index) => {
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
    </div>
  );
};
