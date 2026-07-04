import {interpolate, useCurrentFrame} from 'remotion';
import {C, CLAMP, MONO} from '../../theme';
import {SCENES} from './timeline';

const WINDOWS = (() => {
  const items: Array<{at: number; label: string}> = [];
  let sceneStart = 0;

  for (const scene of SCENES) {
    const transition = 'transitionAfter' in scene ? scene.transitionAfter : null;
    if (!transition) {
      sceneStart += scene.durationInFrames;
      continue;
    }

    items.push({
      at: sceneStart + scene.durationInFrames - transition.durationInFrames,
      label: scene.label,
    });
    sceneStart += scene.durationInFrames - transition.durationInFrames;
  }

  return items;
})();

const getPulse = (frame: number) => {
  let strongest = 0;
  let label = '';
  for (const window of WINDOWS) {
    const local = frame - window.at;
    const pulse = interpolate(local, [-8, 0, 12, 26], [0, 1, 0.62, 0], CLAMP);
    if (pulse > strongest) {
      strongest = pulse;
      label = window.label;
    }
  }
  return {pulse: strongest, label};
};

const formatCutId = (label: string) =>
  label
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0)
    .toString(16)
    .padStart(4, '0')
    .slice(-4);

export const TransitionOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const {pulse, label} = getPulse(frame);

  if (pulse < 0.02) {
    return null;
  }

  const scanX = interpolate(pulse, [0, 1], [-12, 108], CLAMP);
  const flash = interpolate(pulse, [0, 1], [0, 0.08], CLAMP);
  const lineOpacity = interpolate(pulse, [0, 0.3, 1], [0.06, 0.12, 0.26], CLAMP);
  const labelOpacity = interpolate(pulse, [0, 0.35, 1], [0, 0.42, 0.64], CLAMP);
  const jitter = Math.sin(frame * 0.87) * 3 * pulse;

  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.03 + flash,
          background:
            'repeating-linear-gradient(0deg, rgba(250,249,245,0.04) 0px, rgba(250,249,245,0.04) 1px, transparent 1px, transparent 8px)',
          mixBlendMode: 'screen',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${scanX}%`,
          width: pulse > 0.04 ? 92 : 48,
          transform: `translateX(${jitter}px) skewX(-12deg)`,
          opacity: pulse > 0.04 ? 0.36 : 0.08,
          background: `linear-gradient(90deg, transparent, rgba(143,189,182,${lineOpacity}), transparent)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: flash,
          background: `linear-gradient(90deg, transparent 0%, ${C.cyan} 48%, transparent 100%)`,
          mixBlendMode: 'screen',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 76,
          bottom: 58,
          fontFamily: MONO,
          fontSize: 13,
          color: C.cyan,
          opacity: labelOpacity,
          transform: `translateX(${interpolate(pulse, [0, 1], [20, 0], CLAMP)}px)`,
          textTransform: 'uppercase',
          padding: '7px 9px',
          border: '1px solid rgba(143,189,182,0.22)',
          background: 'rgba(13,14,13,0.38)',
          borderRadius: 4,
        }}
      >
        cut:{formatCutId(label)} / {label}
      </div>
    </div>
  );
};
