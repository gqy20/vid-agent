import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {COLOR, FONT, WEIGHT} from '../../palette';
import {RADIUS} from '../../spacing';
import {TYPE} from '../../typography';
import {
  BrandCanvas,
  GitHubBrandLockup,
  GitHubMark,
  GitHubPlatformGlyph,
  type GitHubPlatformGlyphName,
  RepositoryActionIcon,
  StatusBadge,
} from './BrandPrimitives';
import {enter, exit, settle} from './motion';

const INTRO_FRAMES = 210;

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

type CollaborationState = {
  eyebrow: string;
  label: string;
  title: string;
  detail: string;
  accent: string;
  background: string;
  icon: 'pull-request' | 'review' | 'actions' | 'merge';
};

const STATES: CollaborationState[] = [
  {
    eyebrow: 'PULL REQUEST',
    label: 'OPEN',
    title: 'Change proposed',
    detail: 'feature/auth-guide → main',
    accent: COLOR.github.open,
    background: COLOR.effects.openWash,
    icon: 'pull-request',
  },
  {
    eyebrow: 'REVIEW',
    label: 'APPROVED',
    title: 'Review complete',
    detail: 'review approved',
    accent: COLOR.github.approved,
    background: COLOR.effects.approvedWash,
    icon: 'review',
  },
  {
    eyebrow: 'CHECKS',
    label: 'PASSED',
    title: 'Checks complete',
    detail: 'required checks passed',
    accent: COLOR.github.approved,
    background: COLOR.effects.approvedWash,
    icon: 'actions',
  },
  {
    eyebrow: 'MERGE',
    label: 'MERGED',
    title: 'Change shared',
    detail: 'main updated',
    accent: COLOR.github.merged,
    background: COLOR.effects.mergedWash,
    icon: 'merge',
  },
];

const SIGNALS: ReadonlyArray<{
  name: GitHubPlatformGlyphName;
  label: string;
  x: number;
  y: number;
  color: string;
}> = [
  {name: 'issues', label: 'ISSUE', x: 220, y: 252, color: COLOR.github.action},
  {name: 'person', label: 'CONTRIBUTOR', x: 724, y: 138, color: COLOR.text.secondary},
  {name: 'review', label: 'REVIEW', x: 1544, y: 218, color: COLOR.github.approved},
  {name: 'fork', label: 'FORK', x: 284, y: 812, color: COLOR.text.secondary},
  {name: 'actions', label: 'ACTIONS', x: 1656, y: 752, color: COLOR.github.approved},
  {name: 'merge', label: 'MERGE', x: 1188, y: 914, color: COLOR.github.merged},
];

const IntroOpening: React.FC<{frame: number}> = ({frame}) => {
  const reveal = enter(frame, 0, 12);
  const scan = enter(frame, 2, 18);
  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 30,
          background: COLOR.github.logo,
          opacity: 1 - reveal,
        }}
      />
      <div
        style={{
          position: 'absolute',
          zIndex: 31,
          top: 0,
          bottom: 0,
          left: interpolate(scan, [0, 1], [-160, 2080]),
          width: 4,
          background: COLOR.github.action,
          boxShadow: `0 0 38px ${COLOR.github.action}88`,
          opacity: interpolate(scan, [0, 0.18, 0.82, 1], [0, 1, 0.54, 0]),
          transform: 'skewX(-11deg)',
        }}
      />
    </>
  );
};

const CollaborationSignalField: React.FC<{frame: number}> = ({frame}) => {
  const gather = settle(frame, 32, 64);
  const fieldOut = exit(frame, 50, 70);
  const coreIn = enter(frame, 16, 34);
  const coreOut = exit(frame, 54, 70);
  const center = {x: 960, y: 526};

  return (
    <div data-audit-id="github-intro-collaboration-field" style={{position: 'absolute', inset: 0, opacity: 1 - fieldOut}}>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        {SIGNALS.map((signal, index) => {
          const nodeIn = enter(frame, 8 + index * 4, 28 + index * 4);
          const x = interpolate(gather, [0, 1], [signal.x, center.x + (signal.x - center.x) * 0.08]);
          const y = interpolate(gather, [0, 1], [signal.y, center.y + (signal.y - center.y) * 0.08]);
          const flow = enter(frame, 22 + index * 3, 48 + index * 3);
          return (
            <g key={signal.label} opacity={nodeIn}>
              <line
                x1={x}
                y1={y}
                x2={center.x}
                y2={center.y}
                stroke={signal.color}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeDasharray="8 13"
                opacity={0.2 + flow * 0.28}
              />
              <circle
                cx={interpolate(flow, [0, 1], [x, center.x])}
                cy={interpolate(flow, [0, 1], [y, center.y])}
                r={interpolate(flow, [0, 0.5, 1], [0, 6, 2])}
                fill={signal.color}
                opacity={Math.sin(flow * Math.PI) * 0.86}
              />
            </g>
          );
        })}
        <circle cx={center.x} cy={center.y} r={42 + coreIn * 12} fill="none" stroke={COLOR.github.action} strokeWidth="2" opacity={coreIn * (1 - coreOut) * 0.2} />
        <circle cx={center.x} cy={center.y} r={68 + coreIn * 20} fill="none" stroke={COLOR.stroke.default} strokeWidth="1.5" strokeDasharray="7 12" opacity={coreIn * (1 - coreOut) * 0.38} />
      </svg>

      {SIGNALS.map((signal, index) => {
        const nodeIn = enter(frame, 8 + index * 4, 28 + index * 4);
        const x = interpolate(gather, [0, 1], [signal.x, center.x + (signal.x - center.x) * 0.08]);
        const y = interpolate(gather, [0, 1], [signal.y, center.y + (signal.y - center.y) * 0.08]);
        return (
          <div
            key={signal.label}
            data-audit-id={`github-intro-signal-${signal.label.toLowerCase()}`}
            style={{
              position: 'absolute',
              left: x - 48,
              top: y - 48,
              width: 96,
              height: 96,
              borderRadius: 20,
              display: 'grid',
              placeItems: 'center',
              color: signal.color,
              background: 'rgba(255,255,255,0.9)',
              border: `1px solid ${signal.color}42`,
              boxShadow: `0 18px 44px ${COLOR.effects.shadowPanel}`,
              opacity: nodeIn,
              scale: interpolate(nodeIn, [0, 1], [0.72, 1]) * interpolate(gather, [0, 1], [1, 0.7]),
            }}
          >
            <GitHubPlatformGlyph name={signal.name} size={40} />
            <div
              style={{
                position: 'absolute',
                top: 108,
                left: '50%',
                translate: '-50% 0',
                fontFamily: FONT.mono,
                fontSize: TYPE.uiSmall.fontSize,
                fontWeight: WEIGHT.medium,
                letterSpacing: 1.2,
                whiteSpace: 'nowrap',
                color: signal.color,
                opacity: 1 - gather,
              }}
            >
              {signal.label}
            </div>
          </div>
        );
      })}

      <div
        style={{
          position: 'absolute',
          left: center.x - 56,
          top: center.y - 56,
          width: 112,
          height: 112,
          borderRadius: 26,
          display: 'grid',
          placeItems: 'center',
          color: COLOR.github.action,
          background: COLOR.canvas.raised,
          border: `2px solid ${COLOR.github.action}`,
          boxShadow: `0 0 40px ${COLOR.effects.actionWash}`,
          opacity: coreIn * (1 - coreOut),
          scale: interpolate(coreIn, [0, 1], [0.7, 1]),
        }}
      >
        <GitHubPlatformGlyph name="pull-request" size={50} />
      </div>
    </div>
  );
};

const StateFace: React.FC<{state: CollaborationState; opacity: number}> = ({state, opacity}) => (
  <div
    data-audit-id={`github-intro-state-${state.label.toLowerCase()}`}
    style={{
      position: 'absolute',
      inset: '28px 0 0',
      display: 'grid',
      gridTemplateColumns: '98px 1fr auto',
      alignItems: 'center',
      gap: 30,
      opacity,
      translate: `0 ${interpolate(opacity, [0, 1], [14, 0])}px`,
    }}
  >
    <div
      style={{
        width: 88,
        height: 88,
        borderRadius: 22,
        display: 'grid',
        placeItems: 'center',
        color: state.accent,
        background: state.background,
        border: `1px solid ${state.accent}33`,
      }}
    >
      <GitHubPlatformGlyph name={state.icon} size={54} />
    </div>
    <div>
      <div style={{...TYPE.uiSmall, fontFamily: FONT.mono, color: state.accent, letterSpacing: 1.2}}>{state.eyebrow}</div>
      <div style={{...TYPE.title, marginTop: 12, color: COLOR.text.primary}}>{state.title}</div>
      <div style={{...TYPE.uiSmall, marginTop: 12, fontFamily: FONT.mono, color: COLOR.text.secondary}}>{state.detail}</div>
    </div>
    <StatusBadge label={state.label} color={state.accent} background={state.background} />
  </div>
);

type RepositoryNavItem = 'code' | 'issues' | 'pull-requests' | 'actions';

const RepositoryNavigation: React.FC<{progress: number}> = ({progress}) => {
  const items: RepositoryNavItem[] = ['code', 'issues', 'pull-requests', 'actions'];
  return (
    <div
      data-audit-id="github-intro-repository-navigation"
      style={{
        height: 64,
        padding: '0 38px',
        display: 'flex',
        alignItems: 'stretch',
        gap: 12,
        borderBottom: `1px solid ${COLOR.stroke.soft}`,
        opacity: progress,
      }}
    >
      {items.map((item) => {
        const active = item === 'pull-requests';
        const glyph: GitHubPlatformGlyphName = active ? 'pull-request' : item;
        return (
          <div
            key={item}
            aria-label={item}
            style={{
              position: 'relative',
              minWidth: active ? 190 : 50,
              padding: active ? '0 17px' : '0 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 11,
              color: active ? COLOR.text.primary : COLOR.text.tertiary,
              fontSize: TYPE.uiSmall.fontSize,
              fontWeight: active ? WEIGHT.medium : WEIGHT.regular,
            }}
          >
            <GitHubPlatformGlyph name={glyph} />
            {active ? <span>Pull requests</span> : null}
            {active ? (
              <span
                style={{
                  position: 'absolute',
                  left: 14,
                  right: 14,
                  bottom: 0,
                  height: 3,
                  borderRadius: 999,
                  background: COLOR.github.action,
                  scale: `${progress} 1`,
                  transformOrigin: 'left center',
                }}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

const WorkflowRail: React.FC<{progress: number}> = ({progress}) => {
  const colors = [COLOR.github.action, COLOR.github.approved, COLOR.github.approved, COLOR.github.merged];
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: -9, height: 26}}>
      <div style={{position: 'absolute', left: 10, right: 10, top: 9, height: 3, borderRadius: 999, background: COLOR.stroke.soft}} />
      <div
        style={{
          position: 'absolute',
          left: 10,
          top: 9,
          width: progress * 1308,
          height: 3,
          borderRadius: 999,
          background: progress > 0.82 ? COLOR.github.merged : COLOR.github.action,
        }}
      />
      {colors.map((color, index) => {
        const threshold = index / 3;
        const reached = index === 0 ? 1 : interpolate(progress, [threshold - 0.05, threshold], [0, 1], clamp);
        return (
          <div
            key={`${color}-${index}`}
            style={{
              position: 'absolute',
              left: `${threshold * 100}%`,
              top: 0,
              width: 20,
              height: 20,
              borderRadius: 999,
              background: COLOR.canvas.raised,
              border: `4px solid ${reached > 0.98 ? color : COLOR.stroke.default}`,
              translate: '-10px 0',
              boxShadow: reached > 0.98 ? `0 0 0 7px ${color}18` : undefined,
            }}
          />
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: `${progress * 100}%`,
          top: 3,
          width: 14,
          height: 14,
          borderRadius: 999,
          background: progress > 0.82 ? COLOR.github.merged : COLOR.github.action,
          translate: '-7px 0',
          boxShadow: `0 0 0 5px ${progress > 0.82 ? COLOR.effects.mergedWash : COLOR.effects.actionWash}`,
        }}
      />
    </div>
  );
};

const RepositorySurface: React.FC<{
  opacity: number;
  contentProgress: number;
  symbolProgress: readonly [number, number, number];
  stateOpacities: readonly [number, number, number, number];
  workflowProgress: number;
}> = ({opacity, contentProgress, symbolProgress, stateOpacities, workflowProgress}) => (
  <div
    data-audit-id="github-intro-repository"
    style={{
      position: 'absolute',
      left: 240,
      top: 176,
      width: 1440,
      height: 620,
      borderRadius: 16,
      background: COLOR.canvas.raised,
      border: `1px solid ${COLOR.stroke.default}`,
      boxShadow: `0 28px 76px ${COLOR.effects.shadowPanel}`,
      overflow: 'hidden',
      opacity,
      scale: interpolate(opacity, [0, 1], [0.82, 1]),
    }}
  >
    <div style={{height: 100, padding: '0 38px', display: 'flex', alignItems: 'center', gap: 18, borderBottom: `1px solid ${COLOR.stroke.soft}`}}>
      <GitHubMark size={42} />
      <div style={{...TYPE.ui, color: COLOR.text.secondary}}>
        github-course <span style={{color: COLOR.text.tertiary}}>/</span>{' '}
        <span style={{fontWeight: WEIGHT.medium, color: COLOR.text.primary}}>visible-collaboration</span>
      </div>
      <div style={{padding: '5px 11px', borderRadius: RADIUS.pill, border: `1px solid ${COLOR.stroke.default}`, fontFamily: FONT.mono, fontSize: 16, color: COLOR.text.secondary}}>Public</div>
      <div style={{marginLeft: 'auto', display: 'flex', gap: 10}}>
        <RepositoryActionIcon action="watch" progress={symbolProgress[0]} />
        <RepositoryActionIcon action="fork" progress={symbolProgress[1]} />
        <RepositoryActionIcon action="star" progress={symbolProgress[2]} />
      </div>
    </div>

    <RepositoryNavigation progress={contentProgress} />

    <div style={{padding: '32px 56px 0', opacity: contentProgress}}>
      <div style={{...TYPE.uiSmall, fontFamily: FONT.mono, color: COLOR.github.action, letterSpacing: 1.2}}>PULL REQUEST · #42</div>
      <div style={{...TYPE.title, marginTop: 14, color: COLOR.github.logo}}>Clarify the authentication guide</div>
    </div>

    <div style={{position: 'absolute', left: 56, right: 56, bottom: 38, height: 232, borderTop: `1px solid ${COLOR.stroke.soft}`, opacity: contentProgress}}>
      <WorkflowRail progress={workflowProgress} />
      {STATES.map((state, index) => (
        <StateFace key={state.label} state={state} opacity={stateOpacities[index]} />
      ))}
    </div>
  </div>
);

const MergeToMark: React.FC<{frame: number}> = ({frame}) => {
  const move = settle(frame, 144, 168);
  const coreIn = enter(frame, 134, 148);
  const markIn = enter(frame, 150, 162);
  const coreOut = exit(frame, 164, 172);
  const x = interpolate(move, [0, 1], [1624, 960]);
  const y = interpolate(move, [0, 1], [526, 540]);
  return (
    <div data-audit-id="github-intro-merge-to-mark" style={{position: 'absolute', inset: 0, opacity: coreIn * (1 - coreOut)}}>
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          translate: '-50% -50%',
          width: interpolate(move, [0, 1], [46, 104]),
          height: interpolate(move, [0, 1], [46, 104]),
          borderRadius: 999,
          display: 'grid',
          placeItems: 'center',
          color: COLOR.github.merged,
          background: COLOR.canvas.raised,
          border: `3px solid ${COLOR.github.merged}`,
          boxShadow: `0 0 ${interpolate(move, [0, 1], [18, 52])}px ${COLOR.github.merged}38`,
          opacity: 1 - markIn,
        }}
      >
        <GitHubPlatformGlyph name="merge" size={interpolate(move, [0, 1], [24, 48])} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          translate: '-50% -50%',
          opacity: markIn,
          scale: interpolate(markIn, [0, 1], [0.72, 1]),
        }}
      >
        <GitHubMark size={95} />
      </div>
      {[1, 2].map((ring) => (
        <div
          key={ring}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: 104 + ring * 46 * move,
            height: 104 + ring * 46 * move,
            borderRadius: 999,
            border: `1.5px solid ${markIn > 0.55 ? COLOR.stroke.default : COLOR.github.merged}`,
            translate: '-50% -50%',
            opacity: (1 - move) * 0.18 + move * (1 - markIn) * 0.22,
          }}
        />
      ))}
    </div>
  );
};

export const GitHubCourseIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const repositoryIn = enter(frame, 42, 66);
  const contentIn = enter(frame, 54, 72);
  const symbolProgress = [enter(frame, 48, 64), enter(frame, 53, 69), enter(frame, 58, 74)] as const;
  const stateOpacities = [
    enter(frame, 62, 72) * (1 - exit(frame, 80, 86)),
    enter(frame, 88, 96) * (1 - exit(frame, 100, 106)),
    enter(frame, 108, 116) * (1 - exit(frame, 122, 128)),
    enter(frame, 130, 140),
  ] as const;
  const workflowProgress = interpolate(frame, [62, 142], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.45, 0, 0.55, 1),
  });
  const systemOut = exit(frame, 146, 164);
  const systemOpacity = 1 - systemOut;
  const lockupIn = enter(frame, 168, 200);

  return (
    <AbsoluteFill>
      <BrandCanvas>
        <CollaborationSignalField frame={frame} />
        <RepositorySurface
          opacity={repositoryIn * systemOpacity}
          contentProgress={contentIn}
          symbolProgress={symbolProgress}
          stateOpacities={stateOpacities}
          workflowProgress={workflowProgress}
        />
        <MergeToMark frame={frame} />
        <GitHubBrandLockup progress={lockupIn} auditId="github-intro-lockup" />
        <IntroOpening frame={frame} />
      </BrandCanvas>
    </AbsoluteFill>
  );
};

export const GITHUB_COURSE_INTRO_DURATION = INTRO_FRAMES;
