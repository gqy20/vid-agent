import {Img, interpolate, staticFile} from 'remotion';
import {CLAMP, MONO, SANS} from '../../../theme';
import {P, alpha} from '../palette';
import {directionFromDelta, type DirectionKey} from './directions';
import {ACTORS, type ActorId} from './manifests';
import {actorPoseAt, type ActorKeyframe} from './path';

export const CharacterActor: React.FC<{
  actor: ActorId;
  frame: number;
  path: ActorKeyframe[];
  width?: number;
  showDebugDirection?: boolean;
}> = ({actor, frame, path, width = 210, showDebugDirection = false}) => {
  const manifest = ACTORS[actor];
  const pose = actorPoseAt(frame, path);
  const available = Object.keys(manifest.directions) as DirectionKey[];
  const direction = directionFromDelta(pose.dx, pose.dy, available, manifest.fallbackDirection);
  const src = manifest.directions[direction] ?? manifest.directions[manifest.fallbackDirection];
  const step = pose.moving ? Math.sin(frame / 4) * 8 : Math.sin(frame / 18) * 3;
  const lean = pose.moving ? Math.max(-3, Math.min(3, pose.dx / 80)) : 0;
  const shadow = interpolate(pose.y, [360, 760], [0.18, 0.32], CLAMP);

  return (
    <div
      style={{
        position: 'absolute',
        left: pose.x,
        top: pose.y + step,
        width,
        height: width * 1.28,
        transform: `translate(-50%, -100%) scale(${pose.scale}) rotate(${lean}deg)`,
        transformOrigin: '50% 100%',
        zIndex: Math.round(pose.y),
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '17%',
          right: '17%',
          bottom: -14,
          height: 22,
          borderRadius: '50%',
          background: alpha(P.ink, shadow),
          filter: 'blur(10px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 10,
          overflow: 'hidden',
          border: `1px solid ${alpha(manifest.accent, 0.36)}`,
          background: P.porcelain,
          boxShadow: `0 18px 46px ${alpha(P.ink, 0.13)}`,
        }}
      >
        {src ? (
          <Img
            src={staticFile(src)}
            style={{
              width: '118%',
              height: '118%',
              objectFit: 'cover',
              objectPosition: 'center top',
              transform: 'translate(-9%, -6%)',
            }}
          />
        ) : null}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            padding: '34px 14px 12px',
            background: `linear-gradient(180deg, transparent, ${alpha(P.paper, 0.95)} 52%)`,
          }}
        >
          <div style={{fontFamily: MONO, color: manifest.accent, fontSize: 13}}>
            {manifest.role}
          </div>
          <div style={{fontFamily: SANS, color: P.ink, fontSize: 24, fontWeight: 700}}>
            {manifest.name}
          </div>
        </div>
      </div>
      {showDebugDirection ? (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: -34,
            transform: 'translateX(-50%)',
            padding: '5px 9px',
            borderRadius: 6,
            background: alpha(P.ink, 0.74),
            color: P.porcelain,
            fontFamily: MONO,
            fontSize: 16,
          }}
        >
          {direction}
        </div>
      ) : null}
    </div>
  );
};
