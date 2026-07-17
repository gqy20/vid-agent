import {interpolate, useCurrentFrame} from 'remotion';
import {COLOR, FONT} from '../../palette';
import {TYPE} from '../../typography';

type BridgeState = {
  eyebrow: string;
  title: string;
  detail: string;
  tone: 'browser' | 'platform' | 'git';
};

const stateColor = (tone: BridgeState['tone']) => {
  if (tone === 'platform') return COLOR.github.merged;
  if (tone === 'git') return COLOR.git.main;
  return COLOR.github.action;
};

export const GitHubStateBridge: React.FC<{
  browser: Omit<BridgeState, 'tone'>;
  platform: Omit<BridgeState, 'tone'>;
  git: Omit<BridgeState, 'tone'>;
  auditId?: string;
}> = ({browser, platform, git, auditId = 'github-state-bridge'}) => {
  const frame = useCurrentFrame();
  const states: BridgeState[] = [
    {...browser, tone: 'browser'},
    {...platform, tone: 'platform'},
    {...git, tone: 'git'},
  ];

  return (
    <div data-audit-id={auditId} style={{display: 'grid', gridTemplateColumns: '1fr 70px 1fr 70px 1fr', alignItems: 'stretch'}}>
      {states.map((state, index) => {
        const inProgress = interpolate(frame, [index * 12, index * 12 + 12], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const color = stateColor(state.tone);
        const card = (
          <div
            key={state.title}
            style={{
              minHeight: 190,
              padding: '24px 26px',
              border: `1px solid ${COLOR.stroke.soft}`,
              borderTop: `5px solid ${color}`,
              borderRadius: 10,
              background: COLOR.canvas.raised,
              boxShadow: `0 16px 40px ${COLOR.effects.shadowSoft}`,
              opacity: inProgress,
              translate: `0 ${(1 - inProgress) * 12}px`,
            }}
          >
            <div style={{...TYPE.uiSmall, color, fontFamily: FONT.mono}}>{state.eyebrow}</div>
            <div style={{...TYPE.title, fontSize: 31, marginTop: 14, color: COLOR.text.primary}}>{state.title}</div>
            <div style={{...TYPE.body, fontSize: 21, marginTop: 13, color: COLOR.text.secondary}}>{state.detail}</div>
          </div>
        );
        if (index === states.length - 1) return card;
        return [
          card,
          <div key={`${state.title}-arrow`} style={{display: 'grid', placeItems: 'center', color: COLOR.stroke.strong, ...TYPE.title}}>
            →
          </div>,
        ];
      })}
    </div>
  );
};
