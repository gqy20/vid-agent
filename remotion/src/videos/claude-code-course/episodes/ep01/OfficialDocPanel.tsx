import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {COLOR, WEIGHT} from '../../../git-course/palette';
import {FONT, TYPE} from '../../typography';

export type FocusRegion = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const LockIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="3.2" y="7" width="9.6" height="7" rx="2" stroke="currentColor" strokeWidth="1.35" />
    <path d="M5.3 7V5.2a2.7 2.7 0 0 1 5.4 0V7" stroke="currentColor" strokeWidth="1.35" />
  </svg>
);

export const OfficialDocPanel: React.FC<{
  title: string;
  url: string;
  screenshot: string;
  focusRegion?: FocusRegion;
  focusLabel?: string;
  auditId?: string;
}> = ({title, url, screenshot, focusRegion, focusLabel, auditId = 'official-doc'}) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const focusIn = interpolate(frame, [18, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const normalizedUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return (
    <div
      data-audit-id={auditId}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        border: `1px solid ${COLOR.stroke.default}`,
        borderRadius: 14,
        background: '#fff',
        boxShadow: `0 24px 70px ${COLOR.effects.shadowPanel}`,
        opacity: enter,
        translate: `0 ${(1 - enter) * 14}px`,
      }}
    >
      <div
        style={{
          height: 58,
          display: 'grid',
          gridTemplateColumns: '130px 1fr 250px',
          alignItems: 'center',
          padding: '0 22px',
          borderBottom: `1px solid ${COLOR.stroke.soft}`,
          background: '#f3f4f1',
          boxSizing: 'border-box',
        }}
      >
        <div style={{display: 'flex', gap: 8}}>
          {['#ff5f57', '#febc2e', '#28c840'].map((color) => (
            <span key={color} style={{width: 12, height: 12, borderRadius: 99, background: color}} />
          ))}
        </div>
        <div
          style={{
            justifySelf: 'center',
            width: 780,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 9,
            padding: '0 18px',
            border: `1px solid ${COLOR.stroke.soft}`,
            borderRadius: 9,
            background: '#fff',
            color: COLOR.text.secondary,
            boxSizing: 'border-box',
            fontFamily: FONT.mono,
            fontSize: 14,
          }}
        >
          <LockIcon />
          <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{normalizedUrl}</span>
        </div>
        <div style={{justifySelf: 'end', ...TYPE.ui, fontSize: 16, color: COLOR.text.secondary}}>{title}</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 58, bottom: 0}}>
        <Img src={staticFile(screenshot)} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />
        {focusRegion ? (
          <div
            data-audit-id={`${auditId}-focus`}
            style={{
              position: 'absolute',
              left: `${focusRegion.x * 100}%`,
              top: `${focusRegion.y * 100}%`,
              width: `${focusRegion.width * 100}%`,
              height: `${focusRegion.height * 100}%`,
              minHeight: 18,
              border: '3px solid #b98723',
              borderRadius: 7,
              boxShadow: `0 0 0 9999px rgba(24,35,33,${0.13 * focusIn})`,
              opacity: focusIn,
              boxSizing: 'border-box',
            }}
          >
            {focusLabel ? (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: -38,
                  padding: '6px 10px',
                  borderRadius: 6,
                  background: '#b98723',
                  color: COLOR.text.inverse,
                  fontFamily: FONT.sans,
                  fontSize: 16,
                  fontWeight: WEIGHT.bold,
                  whiteSpace: 'nowrap',
                }}
              >
                {focusLabel}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      <div
        style={{
          position: 'absolute',
          right: 18,
          bottom: 16,
          padding: '7px 11px',
          borderRadius: 7,
          background: 'rgba(24,35,33,0.82)',
          color: COLOR.text.inverse,
          fontFamily: FONT.sans,
          fontSize: 15,
          fontWeight: WEIGHT.bold,
        }}
      >
        官方文档快照 · 核验于 2026-07-20
      </div>
    </div>
  );
};
