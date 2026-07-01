import {useEffect, useState, useCallback, useMemo} from 'react';
import {
  AbsoluteFill,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  useDelayRender,
} from 'remotion';
import {parseSrt} from '@remotion/captions';
import type {Caption} from '@remotion/captions';
import {C, SANS, FZ} from '../theme';

/* 一句 Caption → 逐字 Caption[]，时间在 [startMs,endMs] 按字数线性插值。 */
const splitToChars = (c: Caption): Caption[] => {
  const chars = Array.from(c.text.trim());
  const dur = c.endMs - c.startMs;
  return chars.map((ch, i) => ({
    text: ch,
    startMs: Math.round(c.startMs + (dur * i) / chars.length),
    endMs: Math.round(c.startMs + (dur * (i + 1)) / chars.length),
    timestampMs: Math.round(c.startMs + (dur * (i + 0.5)) / chars.length),
    confidence: 1,
  }));
};

/* 长句按中文标点切成 ~10-15 字短句(时间按字数比例分)。srt 块短则原样返回。 */
const splitLongLine = (c: Caption): Caption[] => {
  const parts = c.text.split(/(?<=[，。！？；])/).filter((s) => s.trim());
  if (parts.length <= 1) return [c];
  const total = Array.from(c.text).length;
  const dur = c.endMs - c.startMs;
  let acc = 0;
  return parts.map((p) => {
    const n = Array.from(p).length;
    const s = c.startMs + Math.round((dur * acc) / total);
    acc += n;
    const e = c.startMs + Math.round((dur * acc) / total);
    return {text: p, startMs: s, endMs: e, timestampMs: (s + e) / 2, confidence: 1};
  });
};

const CaptionLine: React.FC<{line: Caption}> = ({line}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tMs = line.startMs + (frame / fps) * 1000; // Sequence 内相对帧→绝对 ms
  const chars = useMemo(() => splitToChars(line), [line]);
  return (
    <AbsoluteFill style={{alignItems: 'center', padding: '44px 0 0'}}>
      <div
        style={{
          fontFamily: SANS,
          fontSize: FZ.karaoke,
          fontWeight: 600,
          color: C.white,
          maxWidth: 1320,
          textAlign: 'center',
          whiteSpace: 'pre-wrap',
          background: 'rgba(7,8,26,0.48)',
          borderRadius: 10,
          padding: '8px 22px',
          border: '1px solid rgba(139,148,158,0.18)',
          lineHeight: 1.28,
        }}
      >
        {chars.map((c, i) => {
          const active = c.startMs <= tMs && c.endMs > tMs;
          return (
            <span
              key={i}
              style={{
                color: active ? C.cyan : C.white,
                textShadow: active ? '0 0 8px rgba(86,212,196,0.36)' : 'none',
              }}
            >
              {c.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const KaraokeCaptions: React.FC = () => {
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const {delayRender, continueRender} = useDelayRender();
  const [handle] = useState(() => delayRender('load srt'));
  const {fps} = useVideoConfig();

  const load = useCallback(async () => {
    try {
      const res = await fetch(staticFile('voiceover.srt'));
      const {captions: caps} = parseSrt({input: await res.text()});
      setCaptions(caps.flatMap(splitLongLine)); // 长句二次切分
    } catch {
      // srt 加载/解析失败：降级为无字幕继续渲染，而非 cancelRender 整片崩溃
      setCaptions([]);
    } finally {
      continueRender(handle);
    }
  }, [continueRender, handle]);
  useEffect(() => {
    load();
  }, [load]);

  if (!captions) return null;
  return (
    <AbsoluteFill>
      {captions.map((line, i) => (
        <Sequence
          key={i}
          from={Math.round((line.startMs / 1000) * fps)}
          durationInFrames={Math.max(
            1,
            Math.round(((line.endMs - line.startMs) / 1000) * fps) + 1,
          )}
        >
          <CaptionLine line={line} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
