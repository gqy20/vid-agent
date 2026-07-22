import {useEffect, useState} from 'react';
import {Audio, interpolate, staticFile, useCurrentFrame, useDelayRender} from 'remotion';
import {SUBTITLE} from '../designTokens';

type SyncedCaption = {
  segmentId: string;
  from: number;
  to: number;
  text: string;
  lines: string[];
};

type CaptionManifest = {
  schemaVersion: 3;
  episodeId: string;
  durationSeconds: number;
  subtitlePolicy: string;
  segments: unknown[];
  cues: SyncedCaption[];
  mix: {audio: string; sha256: string; durationSeconds: number; fingerprint: string};
};

const cleanCaptionText = (value: string) => value
  .replace(/[。；;]+$/u, '')
  .replace(/(?<=[\p{Script=Han}A-Za-z0-9\]])\.$/u, '');

export const SyncedNarrationTrack: React.FC<{
  manifest: string;
  auditPrefix?: string;
}> = ({manifest, auditPrefix = 'synced-caption'}) => {
  const frame = useCurrentFrame();
  const {delayRender, continueRender, cancelRender} = useDelayRender();
  const [handle] = useState(() => delayRender(`Loading narration manifest ${manifest}`));
  const [data, setData] = useState<CaptionManifest | null>(null);

  useEffect(() => {
    fetch(staticFile(manifest))
      .then((response) => {
        if (!response.ok) throw new Error(`Narration manifest '${manifest}' returned HTTP ${response.status}`);
        return response.json() as Promise<CaptionManifest>;
      })
      .then((loaded) => {
        if (loaded.schemaVersion !== 3 || !loaded.mix?.audio || !Array.isArray(loaded.segments) || !Array.isArray(loaded.cues)) {
          throw new Error(`Narration manifest '${manifest}' has an invalid schema`);
        }
        for (const cue of loaded.cues) {
          if (!Array.isArray(cue.lines) || cue.lines.length < 1 || cue.lines.length > 2) {
            throw new Error(`Narration manifest '${manifest}' has an invalid two-line caption cue`);
          }
        }
        setData(loaded);
        continueRender(handle);
      })
      .catch((error: unknown) => cancelRender(error instanceof Error ? error : new Error(String(error))));
  }, [cancelRender, continueRender, handle, manifest]);

  if (!data) return null;
  const now = frame / 30;
  const cue = data.cues.find((item) => now >= item.from && now < item.to);
  const cueOpacity = cue
    ? interpolate(
        now,
        [cue.from, Math.min(cue.from + 0.12, cue.to), Math.max(cue.from, cue.to - 0.12), cue.to],
        [0, 1, 1, 0],
        {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
      )
    : 0;

  return (
    <>
      <Audio src={staticFile(data.mix.audio)} />
      {cue ? (
        <div
          data-audit-id={`${auditPrefix}-${cue.segmentId}`}
          style={{
            position: 'absolute',
            zIndex: 90,
            left: '50%',
            bottom: SUBTITLE.bottom,
            width: 'fit-content',
            maxWidth: SUBTITLE.maxWidth,
            translate: `-50% ${(1 - cueOpacity) * 8}px`,
            padding: '0 16px',
            boxSizing: 'border-box',
            color: SUBTITLE.lightText,
            fontFamily: SUBTITLE.fontFamily,
            fontSize: SUBTITLE.fontSize,
            lineHeight: SUBTITLE.lineHeight,
            fontWeight: SUBTITLE.fontWeight,
            textAlign: 'center',
            whiteSpace: 'pre',
            textShadow: SUBTITLE.lightShadow,
            opacity: cueOpacity,
          }}
        >
          {cue.lines.map(cleanCaptionText).join('\n')}
        </div>
      ) : null}
    </>
  );
};
