import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLOR} from '../../palette';
import {SPACE} from '../../spacing';
import {TYPE} from '../../typography';

type BridgeAccent = 'neutral' | 'action' | 'merged' | 'git';

type BridgeState = {
  title: string;
  detail?: string;
  accent?: BridgeAccent;
};

const stateColor = (accent: BridgeAccent = 'neutral') => {
  if (accent === 'action') return COLOR.github.action;
  if (accent === 'merged') return COLOR.github.merged;
  if (accent === 'git') return COLOR.git.main;
  return COLOR.stroke.strong;
};

const LAYERS = ['浏览器动作', 'GitHub 平台', 'Git 状态'] as const;
const NODE_SIZE = 58;
const CONNECTOR_GAP = 14;
const CONNECTOR_OFFSET = NODE_SIZE / 2 + CONNECTOR_GAP;

const Connector: React.FC<{progress: number; left: string}> = ({progress, left}) => (
  <div
    style={{
      position: 'absolute',
      left,
      top: 104,
      width: `calc(33.3333% - ${CONNECTOR_OFFSET * 2}px)`,
      height: 2,
      borderRadius: 999,
      background: COLOR.stroke.soft,
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        width: `${progress * 100}%`,
        height: '100%',
        borderRadius: 999,
        background: COLOR.github.action,
      }}
    />
  </div>
);

export const GitHubStateBridge: React.FC<{
  browser: BridgeState;
  platform: BridgeState;
  git: BridgeState;
  auditId?: string;
}> = ({browser, platform, git, auditId = 'github-state-bridge'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const states: BridgeState[] = [browser, platform, git];
  const travel = spring({
    frame,
    fps,
    delay: 8,
    durationInFrames: 52,
    config: {damping: 200, stiffness: 120, mass: 1, overshootClamping: true},
  });
  const trackIn = interpolate(frame, [0, 18], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const firstConnector = interpolate(travel, [0, 0.5], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const secondConnector = interpolate(travel, [0.5, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div data-audit-id={auditId} style={{position: 'relative', minHeight: 286}}>
      <div style={{opacity: trackIn}}>
        <Connector progress={firstConnector} left={`calc(16.6667% + ${CONNECTOR_OFFSET}px)`} />
        <Connector progress={secondConnector} left={`calc(50% + ${CONNECTOR_OFFSET}px)`} />
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)'}}>
        {states.map((state, index) => {
          const itemIn = interpolate(frame, [index * 18, index * 18 + 18], [0, 1], {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const color = stateColor(state.accent);
          return (
            <div key={state.title} style={{textAlign: 'center', opacity: itemIn}}>
              <div style={{...TYPE.uiSmall, color: COLOR.text.tertiary}}>{LAYERS[index]}</div>
              <div
                style={{
                  position: 'relative',
                  zIndex: 1,
                  width: NODE_SIZE,
                  height: NODE_SIZE,
                  boxSizing: 'border-box',
                  margin: `${SPACE.xxl}px auto ${SPACE.xl}px`,
                  borderRadius: 999,
                  display: 'grid',
                  placeItems: 'center',
                  background: COLOR.canvas.base,
                  border: `3px solid ${color}`,
                  color,
                  ...TYPE.ui,
                }}
              >
                {index + 1}
              </div>
              <div style={{...TYPE.section, color: COLOR.text.primary}}>{state.title}</div>
              {state.detail ? (
                <div style={{...TYPE.ui, margin: `${SPACE.md}px auto 0`, maxWidth: 420, color: COLOR.text.secondary}}>{state.detail}</div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
