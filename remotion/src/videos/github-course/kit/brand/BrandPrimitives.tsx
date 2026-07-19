import {interpolate} from 'remotion';
import {COLOR, FONT, WEIGHT} from '../../palette';

export const GitHubMark: React.FC<{
  size: number;
  color?: string;
  opacity?: number;
}> = ({size, color = COLOR.github.logo, opacity = 1}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{display: 'block', color, opacity}}>
    <path
      fill="currentColor"
      d="M12 .297C5.37.297 0 5.67 0 12.297c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.333-1.754-1.333-1.754-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297 24 5.67 18.627.297 12 .297z"
    />
  </svg>
);

export type GitHubPlatformGlyphName =
  | 'actions'
  | 'code'
  | 'fork'
  | 'issues'
  | 'merge'
  | 'person'
  | 'pull-request'
  | 'review'
  | 'star'
  | 'watch';

export const GitHubPlatformGlyph: React.FC<{
  name: GitHubPlatformGlyphName;
  size?: number;
}> = ({name, size = 24}) => {
  const common = {stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};

  if (name === 'watch') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M2.2 12s3.35-5.65 9.8-5.65S21.8 12 21.8 12 18.45 17.65 12 17.65 2.2 12 2.2 12Z" {...common} />
        <circle cx="12" cy="12" r="2.7" {...common} />
      </svg>
    );
  }

  if (name === 'fork') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="7" cy="5" r="2.25" {...common} />
        <circle cx="17" cy="5" r="2.25" {...common} />
        <circle cx="7" cy="19" r="2.25" {...common} />
        <path d="M7 7.3v9.4M17 7.3v1.9c0 2.05-1.65 3.7-3.7 3.7H7" {...common} />
      </svg>
    );
  }

  if (name === 'star') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="m12 2.8 2.75 5.57 6.15.9-4.45 4.33 1.05 6.12L12 16.83l-5.5 2.89 1.05-6.12L3.1 9.27l6.15-.9L12 2.8Z" {...common} />
      </svg>
    );
  }

  if (name === 'code') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="m9 6-6 6 6 6M15 6l6 6-6 6" {...common} />
      </svg>
    );
  }

  if (name === 'issues') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="8.5" {...common} />
        <path d="M12 7.8v5.1" {...common} />
        <circle cx="12" cy="16.4" r="1" fill="currentColor" />
      </svg>
    );
  }

  if (name === 'actions') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="8.5" {...common} />
        <path d="m10 8.7 5.1 3.3-5.1 3.3V8.7Z" {...common} />
      </svg>
    );
  }

  if (name === 'person') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="8" r="3.5" {...common} />
        <path d="M5.5 19c.8-3.3 3-5 6.5-5s5.7 1.7 6.5 5" {...common} />
      </svg>
    );
  }

  if (name === 'review') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="8.5" {...common} />
        <path d="m7.8 12.2 2.8 2.8 5.8-6" {...common} />
      </svg>
    );
  }

  if (name === 'merge') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="7" cy="5" r="2.2" {...common} />
        <circle cx="7" cy="19" r="2.2" {...common} />
        <circle cx="17" cy="5" r="2.2" {...common} />
        <path d="M7 7.3v9.4M17 7.3v1.9c0 2.05-1.65 3.7-3.7 3.7H7" {...common} />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="7" cy="5" r="2.1" {...common} />
      <circle cx="7" cy="19" r="2.1" {...common} />
      <path d="M7 7.2v9.6M17 17V8M17 8l-3.2 3.2M17 8l3.2 3.2" {...common} />
    </svg>
  );
};

export const BrandCanvas: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      background: `
        radial-gradient(circle at 18% 22%, rgba(9,105,218,0.075), transparent 31%),
        radial-gradient(circle at 82% 74%, rgba(130,80,223,0.06), transparent 29%),
        linear-gradient(135deg, #ffffff 0%, ${COLOR.canvas.base} 48%, #f3f5f7 100%)
      `,
      color: COLOR.text.primary,
      fontFamily: FONT.sans,
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `radial-gradient(${COLOR.stroke.soft} 0.9px, transparent 0.9px)`,
        backgroundSize: '34px 34px',
        opacity: 0.32,
        maskImage: 'radial-gradient(circle at 50% 46%, black 0%, black 52%, transparent 88%)',
      }}
    />
    {children}
  </div>
);

export const StatusBadge: React.FC<{
  label: string;
  color: string;
  background: string;
}> = ({label, color, background}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 9,
      padding: '8px 13px',
      borderRadius: 999,
      color,
      background,
      border: `1px solid ${color}44`,
      fontFamily: FONT.mono,
      fontSize: 18,
      lineHeight: 1,
      fontWeight: WEIGHT.bold,
      letterSpacing: 0.4,
      whiteSpace: 'nowrap',
    }}
  >
    <span style={{width: 8, height: 8, borderRadius: 999, background: color}} />
    {label}
  </div>
);

const GitHubBLetter: React.FC<{progress: number}> = ({progress}) => (
  <div
    aria-label="b"
    style={{
      position: 'relative',
      width: 56,
      height: 92,
      flex: '0 0 auto',
      marginLeft: 10,
      translate: '0 -2px',
    }}
  >
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 18,
        width: 13,
        height: 72,
        borderRadius: 2,
        background: COLOR.github.logo,
        opacity: interpolate(progress, [0.3, 0.58], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
        scale: `1 ${interpolate(progress, [0.3, 0.58], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })}`,
        transformOrigin: 'bottom center',
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: 4,
        top: 40,
        width: 50,
        height: 50,
        boxSizing: 'border-box',
        borderRadius: 999,
        display: 'grid',
        placeItems: 'center',
        background: COLOR.canvas.raised,
        border: `11px solid ${COLOR.github.logo}`,
        opacity: interpolate(progress, [0.34, 0.64], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
        scale: interpolate(progress, [0.34, 0.64], [0.64, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
      }}
    />
    <div
      style={{
        position: 'absolute',
        zIndex: 2,
        left: 20,
        top: 56,
        opacity: interpolate(progress, [0, 0.24], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
        scale: interpolate(progress, [0, 0.4], [1.8, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
        translate: `${interpolate(progress, [0, 0.36], [-295, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })}px 0`,
      }}
    >
      <GitHubMark size={18} />
    </div>
  </div>
);

export const GitHubBrandLockup: React.FC<{
  progress: number;
  auditId: string;
}> = ({progress, auditId}) => (
  <div
    data-audit-id={auditId}
    style={{
      position: 'absolute',
      inset: 0,
      display: 'grid',
      placeItems: 'center',
      opacity: progress,
      translate: `0 ${interpolate(progress, [0, 1], [12, 0])}px`,
      scale: interpolate(progress, [0, 1], [0.99, 1]),
    }}
  >
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', color: COLOR.github.logo}}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 646,
          height: 112,
        }}
      >
        <span
          style={{
            width: 304,
            marginRight: 28,
            textAlign: 'right',
            fontSize: 72,
            lineHeight: 1,
            fontWeight: 900,
            letterSpacing: 1.2,
            opacity: interpolate(progress, [0.36, 0.8], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            translate: `${interpolate(progress, [0.36, 0.8], [-30, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })}px 8px`,
          }}
        >
          看得见的
        </span>
        <span
          style={{
            width: 248,
            paddingRight: 4,
            boxSizing: 'border-box',
            textAlign: 'right',
            fontFamily: FONT.sans,
            fontSize: 92,
            lineHeight: 1,
            fontWeight: 900,
            opacity: interpolate(progress, [0.4, 0.78], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            translate: `${interpolate(progress, [0.4, 0.78], [22, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })}px 0`,
          }}
        >
          GitHu
        </span>
        <GitHubBLetter progress={progress} />
      </div>
      <div
        style={{
          marginTop: 18,
          width: interpolate(progress, [0.58, 1], [0, 646], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          height: 3,
          borderRadius: 999,
          background: COLOR.github.action,
        }}
      />
      <div
        style={{
          marginTop: 18,
          fontFamily: FONT.mono,
          fontSize: 27,
          fontWeight: 800,
          color: COLOR.text.secondary,
          letterSpacing: 1.2,
          opacity: interpolate(progress, [0.66, 1], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        repo · pr · actions
      </div>
    </div>
  </div>
);

type RepositoryAction = 'watch' | 'fork' | 'star';

export const RepositoryActionIcon: React.FC<{
  action: RepositoryAction;
  progress: number;
}> = ({action, progress}) => (
  <div
    data-audit-id={`github-intro-symbol-${action}`}
    aria-label={action}
    style={{
      width: 64,
      height: 64,
      borderRadius: 12,
      display: 'grid',
      placeItems: 'center',
      color: COLOR.text.secondary,
      background: COLOR.canvas.base,
      border: `1px solid ${COLOR.stroke.soft}`,
      opacity: progress,
      scale: interpolate(progress, [0, 1], [0.82, 1]),
      translate: `0 ${interpolate(progress, [0, 1], [8, 0])}px`,
    }}
  >
    <GitHubPlatformGlyph name={action} size={30} />
  </div>
);
