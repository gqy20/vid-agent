import {useEffect, useState} from 'react';
import {Audio, interpolate, Sequence, staticFile, useCurrentFrame, useDelayRender} from 'remotion';
import {COLOR, WEIGHT} from '../../../git-course/palette';
import {seconds} from '../../timeline';
import {FONT} from '../../typography';

type SyncedCaption = {
  segmentId: string;
  from: number;
  to: number;
  text: string;
};

type NarrationSegment = {
  segmentId: string;
  sceneId: string;
  voiceStart: number;
  voiceEnd: number;
  durationSeconds: number;
  audio: string;
  srt: string;
  fingerprint: string;
  sha256: string;
};

type CaptionManifest = {
  schemaVersion: 1;
  episodeId: string;
  subtitlePolicy: string;
  segments: NarrationSegment[];
  cues: SyncedCaption[];
};

export const SyncedNarrationTrack: React.FC<{
  manifest: string;
}> = ({manifest}) => {
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
        if (loaded.schemaVersion !== 1 || !Array.isArray(loaded.segments) || !Array.isArray(loaded.cues)) {
          throw new Error(`Narration manifest '${manifest}' has an invalid schema`);
        }
        setData(loaded);
        continueRender(handle);
      })
      .catch((error: unknown) => {
        cancelRender(error instanceof Error ? error : new Error(String(error)));
      });
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
      {data.segments.map((segment) => (
        <Sequence
          key={segment.segmentId}
          from={seconds(segment.voiceStart)}
          durationInFrames={seconds(segment.durationSeconds + 0.1)}
          layout="none"
        >
          <Audio src={staticFile(segment.audio)} />
        </Sequence>
      ))}
      {cue ? (
        <div
          data-audit-id={`ep01-synced-caption-${cue.segmentId}`}
          style={{
            position: 'absolute',
            zIndex: 90,
            left: '50%',
            bottom: 34,
            width: 'fit-content',
            maxWidth: 1500,
            translate: `-50% ${(1 - cueOpacity) * 8}px`,
            padding: '12px 24px 13px',
            boxSizing: 'border-box',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(20,23,41,0.88)',
            color: COLOR.text.inverse,
            fontFamily: FONT.sans,
            fontSize: 30,
            lineHeight: 1.42,
            fontWeight: WEIGHT.bold,
            textAlign: 'center',
            whiteSpace: 'pre-wrap',
            opacity: cueOpacity,
          }}
        >
          {cue.text}
        </div>
      ) : null}
    </>
  );
};
