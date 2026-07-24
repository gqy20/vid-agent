import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from 'remotion';
import {
  EP02_INTERACTIVE_GUIDE_DURATION_IN_FRAMES,
  EP02_INTERACTIVE_GUIDE_EPISODE,
  EP02_INTERACTIVE_GUIDE_SCENES,
  getEp02Scene,
} from '../data/ep02InteractiveGuide';
import {COLOR, FONT, FRAME, LAYOUT, TYPE, WEIGHT} from '../designTokens';
import {
  CourseLayout,
  EvidenceIcon,
  type EvidenceIconName,
  RecordedTerminal,
  SceneSequence,
  SyncedNarrationTrack,
  TerminalFocus,
} from '../kit';
import {EASE, focusWindow, MOTION, motionProgress} from '../motion';
import {seconds} from '../timeline';

export {EP02_INTERACTIVE_GUIDE_DURATION_IN_FRAMES};

const episode = EP02_INTERACTIVE_GUIDE_EPISODE;
const scenePad = {padding: LAYOUT.scenePadding, boxSizing: 'border-box' as const};
const stillRoot = 'claude-code-course/terminal/ep02-interactive-guide-stills';

const enter = (frame: number, at = 0, duration: number = MOTION.productive) =>
  motionProgress(frame, at, duration, EASE.enter);

const SceneHeading: React.FC<{title: string; detail?: string; align?: 'left' | 'center'}> = ({
  title,
  detail,
  align = 'left',
}) => (
  <div style={{textAlign: align}}>
    <div style={{...TYPE.heading}}>{title}</div>
    {detail ? <div style={{...TYPE.body, color: COLOR.text.secondary, marginTop: 12}}>{detail}</div> : null}
  </div>
);

const KeyCap: React.FC<{children: React.ReactNode; tone?: string; compact?: boolean}> = ({
  children,
  tone = COLOR.text.primary,
  compact = false,
}) => (
  <span
    style={{
      display: 'inline-grid',
      placeItems: 'center',
      minWidth: compact ? 54 : 104,
      height: compact ? 48 : 72,
      padding: compact ? '0 13px' : '0 22px',
      boxSizing: 'border-box',
      border: `1px solid ${COLOR.stroke.default}`,
      borderBottomWidth: compact ? 3 : 5,
      borderRadius: FRAME.radius.code,
      background: COLOR.canvas.raised,
      color: tone,
      fontFamily: FONT.mono,
      fontSize: compact ? 24 : 38,
      fontWeight: WEIGHT.bold,
      lineHeight: 1,
      boxShadow: `0 10px 22px ${COLOR.effects.shadowSoft}`,
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </span>
);

const SignalItem: React.FC<{
  icon: EvidenceIconName;
  label: string;
  tone: string;
  progress: number;
}> = ({icon, label, tone, progress}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      padding: '14px 0 14px 22px',
      borderLeft: `${FRAME.focusRail}px solid ${tone}`,
      opacity: progress,
      translate: `${(1 - progress) * 18}px 0`,
    }}
  >
    <EvidenceIcon name={icon} tone={tone} size={32} />
    <div style={{...TYPE.label, fontWeight: WEIGHT.bold}}>{label}</div>
  </div>
);

const PermissionModeView: React.FC<{
  mode: string;
  label: string;
  display: {
    read: string;
    edit: string;
    run: string;
  };
  bestFor: string;
  tone: string;
  progress: number;
}> = ({mode, label, display, bestFor, tone, progress}) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      display: 'grid',
      gridTemplateColumns: '380px 1fr',
      gap: 70,
      alignItems: 'center',
      opacity: progress,
      translate: `${(1 - progress) * 22}px 0`,
    }}
  >
    <div>
      <EvidenceIcon name="permission" size={48} tone={tone} />
      <div style={{...TYPE.labelSmall, color: tone, marginTop: 20}}>{label}</div>
      <div style={{...TYPE.subheading, fontFamily: FONT.mono, marginTop: 6}}>{mode}</div>
      <div style={{...TYPE.body, color: COLOR.text.secondary, marginTop: 22}}>{bestFor}</div>
    </div>
    <div style={{display: 'grid', gap: 0}}>
      {[
        ['read', 'READ', display.read],
        ['edit', 'EDIT', display.edit],
        ['shell', 'RUN', display.run],
      ].map(([icon, action, value], index) => (
        <div key={action} style={{display: 'grid', gridTemplateColumns: '42px 78px 1fr', gap: 16, alignItems: 'center', minHeight: 82, borderBottom: index < 2 ? `1px solid ${COLOR.stroke.soft}` : 'none'}}>
          <EvidenceIcon name={icon as EvidenceIconName} size={30} tone={tone} />
          <span style={{...TYPE.labelSmall, fontFamily: FONT.mono, color: COLOR.text.tertiary}}>{action}</span>
          <span style={{...TYPE.subheading, fontSize: 32, color: COLOR.text.primary}}>{value}</span>
        </div>
      ))}
    </div>
  </div>
);

const TerminalStill: React.FC<{
  file: string;
  title: string;
  opacity?: number;
  focus?: string;
  zoom?: number;
}> = ({file, title, opacity = 1, focus = '50% 50%', zoom}) => (
  <RecordedTerminal
    src={`${stillRoot}/${file}`}
    title={title}
    opacity={opacity}
    focus={focus}
    zoom={zoom}
  />
);

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const titleIn = enter(frame, 42, MOTION.structural);
  const problems = [
    ['文件', '@ src/auth/...'],
    ['命令', '! pnpm test'],
    ['权限', 'default / plan'],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 142}}>
      <div style={{position: 'absolute', left: 150, right: 150, top: 150, textAlign: 'center', opacity: titleIn, translate: `0 ${(1 - titleIn) * 24}px`}}>
        <div style={{...TYPE.display}}>{getEp02Scene('hook').title}</div>
      </div>
      <div style={{position: 'absolute', left: 220, right: 220, top: 555, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 56}}>
        {problems.map(([label, detail], index) => {
          const itemIn = enter(frame, 82 + index * 12);
          return (
            <div key={label} style={{paddingTop: 22, opacity: itemIn, translate: `0 ${(1 - itemIn) * 16}px`}}>
              <div style={{...TYPE.label, color: COLOR.text.tertiary}}>{label}</div>
              <div style={{...TYPE.body, fontWeight: WEIGHT.bold, marginTop: 10}}>{detail}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const InteractionModelScene: React.FC = () => {
  const frame = useCurrentFrame();
  const entries = [
    ['/', 'menu', '发现'],
    ['@', 'file', '引用'],
    ['!', 'shell', '执行'],
  ] as const;
  const controls = [
    ['Ctrl+O', 'observe', '观察'],
    ['Esc', 'stop', '中断'],
    ['Shift+Tab', 'permission', '权限'],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 126}}>
      <SceneHeading title="这些入口可以怎样分组？" align="center" />
      <div style={{position: 'absolute', left: 185, right: 185, top: 365}}>
        <div style={{display: 'grid', gridTemplateColumns: '150px repeat(3, 1fr)', alignItems: 'center', gap: 28}}>
          <div style={{...TYPE.label, color: COLOR.text.brand}}>输入</div>
          {entries.map(([token, icon, role], index) => {
            const itemIn = enter(frame, 22 + index * 10);
            return (
              <div key={token} style={{display: 'flex', alignItems: 'center', gap: 18, opacity: itemIn, translate: `0 ${(1 - itemIn) * 14}px`}}>
                <EvidenceIcon name={icon} tone={COLOR.text.brand} size={34} />
                <KeyCap tone={COLOR.text.brand}>{token}</KeyCap>
                <div style={{...TYPE.label, fontWeight: WEIGHT.bold}}>{role}</div>
              </div>
            );
          })}
        </div>
        <div style={{height: 64}} />
        <div style={{display: 'grid', gridTemplateColumns: '150px repeat(3, 1fr)', alignItems: 'center', gap: 28}}>
          <div style={{...TYPE.label, color: COLOR.text.info}}>运行</div>
          {controls.map(([key, icon, role], index) => {
            const itemIn = enter(frame, 80 + index * 10);
            return <div key={key} style={{display: 'flex', alignItems: 'center', gap: 14, opacity: itemIn}}><EvidenceIcon name={icon} tone={COLOR.text.info} size={30} /><KeyCap compact tone={COLOR.text.info}>{key}</KeyCap><div style={{...TYPE.label, fontWeight: WEIGHT.bold}}>{role}</div></div>;
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SlashScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title="斜杠菜单里有什么？" />
      <div style={{position: 'absolute', ...LAYOUT.terminalEvidence.split.frame}}>
        <TerminalStill file="slash-menu.png" title="claude-code-lab · /" zoom={LAYOUT.terminalEvidence.split.zoom} focus="0% 45%" />
      </div>
      <div style={{position: 'absolute', right: 150, top: 342, width: 320, display: 'grid', gap: 26}}>
        <SignalItem icon="menu" label="内置" tone={COLOR.brand.orange} progress={enter(frame, 68)} />
        <SignalItem icon="file" label="Skills" tone={COLOR.brand.green} progress={enter(frame, 86)} />
        <SignalItem icon="graph" label="扩展" tone={COLOR.brand.blue} progress={enter(frame, 104)} />
      </div>
    </AbsoluteFill>
  );
};

const FileMentionScene: React.FC = () => {
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <TerminalFocus title="艾特能否消除模糊指代？">
        <TerminalStill file="file-mention.png" title="claude-code-lab · @ file mention" zoom={1.06} focus="50% 42%" />
      </TerminalFocus>
    </AbsoluteFill>
  );
};

const ShellModeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const resultIn = enter(frame, 152, MOTION.structural);
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <TerminalFocus title="感叹号把命令交给了谁？">
        <div style={{position: 'relative', width: '100%', height: '100%'}}>
        <div style={{position: 'absolute', inset: 0, opacity: 1 - resultIn}}>
          <TerminalStill file="shell-running.png" title="claude-code-lab · !pnpm test" zoom={1.06} focus="50% 52%" />
        </div>
        <div style={{position: 'absolute', inset: 0, opacity: resultIn}}>
          <TerminalStill file="shell-test.png" title="claude-code-lab · 1 failed" zoom={1.06} focus="50% 55%" />
        </div>
        </div>
      </TerminalFocus>
    </AbsoluteFill>
  );
};

const MultilinePromptScene: React.FC = () => {
  const frame = useCurrentFrame();
  const lines = [
    ['route', '目标', '空 Token 为什么通过？'],
    ['permission', '约束', '保持代码不变'],
    ['check', '证据', '判断分支 + 测试'],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title="一行输入为什么不够？" align="center" />
      <div style={{position: 'absolute', left: 310, right: 310, top: 330, borderTop: `1px solid ${COLOR.stroke.default}`}}>
        {lines.map(([icon, label, text], index) => {
          const itemIn = enter(frame, 28 + index * 20);
          return (
            <div key={label} style={{display: 'grid', gridTemplateColumns: '50px 120px 1fr auto', gap: 22, alignItems: 'center', minHeight: 122, borderBottom: `1px solid ${COLOR.stroke.soft}`, opacity: itemIn, translate: `${(1 - itemIn) * -18}px 0`}}>
              <EvidenceIcon name={icon} tone={index === 0 ? COLOR.text.brand : COLOR.text.tertiary} size={32} />
              <div style={{...TYPE.label, color: index === 0 ? COLOR.text.brand : COLOR.text.tertiary}}>{label}</div>
              <div style={{...TYPE.body, fontWeight: WEIGHT.bold}}>{text}</div>
              {index < 2 ? <KeyCap compact tone={COLOR.text.info}>Ctrl+J</KeyCap> : <div style={{width: 115}} />}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const ObserveProcessScene: React.FC = () => {
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <TerminalFocus title="Ctrl+O：结论从哪里来？">
        <TerminalStill file="transcript.png" title="claude-code-lab · transcript viewer" zoom={1.08} focus="50% 45%" />
      </TerminalFocus>
    </AbsoluteFill>
  );
};

const InterruptModeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const cut = enter(frame, 185, 8);
  const modeIn = enter(frame, 378, MOTION.structural);
  const permissionModes = episode.content.permissionModel.baselineModes;
  const modeTones = [COLOR.text.info, COLOR.text.success, COLOR.text.warning] as const;
  const optionalModes = episode.content.permissionModel.optionalModes.map(({mode, short}) => `${mode} ${short}`).join('  ·  ');
  const modeFocus = [
    focusWindow(frame, 560, 790),
    focusWindow(frame, 770, 1010),
    enter(frame, 990, MOTION.structural),
  ];
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <div style={{position: 'absolute', left: LAYOUT.safeX, right: LAYOUT.safeX, top: 122, opacity: 1 - modeIn}}>
        <SceneHeading title="方向偏了，还能停下来吗？" />
      </div>
      <div style={{position: 'absolute', left: LAYOUT.safeX, right: LAYOUT.safeX, top: 122, opacity: modeIn}}>
        <SceneHeading title="默认权限可以怎样切换？" />
      </div>
      <div style={{position: 'absolute', left: 150, right: 150, top: 285, height: 310, opacity: 1 - modeIn}}>
        <div style={{display: 'grid', gridTemplateColumns: '330px 160px 1fr', alignItems: 'center', gap: 42}}>
          <div>
            <div style={{...TYPE.label, color: COLOR.text.danger}}>范围过宽</div>
            <div style={{...TYPE.subheading, marginTop: 14, opacity: 1 - cut * 0.6}}>扫描整个项目</div>
            <div style={{height: 4, marginTop: 22, background: COLOR.surface.danger, overflow: 'hidden'}}><div style={{height: '100%', width: `${(1 - cut) * 100}%`, background: COLOR.text.danger}} /></div>
          </div>
          <div style={{textAlign: 'center', opacity: enter(frame, 150)}}><KeyCap tone={COLOR.text.danger}>Esc</KeyCap><div style={{...TYPE.labelSmall, marginTop: 12, color: COLOR.text.secondary}}>立即中断</div></div>
          <div style={{paddingLeft: 32, borderLeft: `${FRAME.focusRail}px solid ${COLOR.brand.green}`, opacity: cut, translate: `${(1 - cut) * 24}px 0`}}>
            <div style={{...TYPE.label, color: COLOR.text.success}}>重新定向</div>
            <div style={{...TYPE.subheading, marginTop: 14}}>只检查 src/auth<br />和对应测试</div>
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 190, right: 190, top: 282, opacity: modeIn, translate: `0 ${(1 - modeIn) * 20}px`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 26}}>
          <KeyCap compact tone={COLOR.text.info}>Shift+Tab</KeyCap>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, auto)', gap: 28}}>
            {permissionModes.map((mode, index) => (
              <div key={mode.mode} style={{display: 'flex', alignItems: 'center', gap: 10, opacity: 0.42 + modeFocus[index] * 0.58}}>
                <span style={{width: 9, height: 9, borderRadius: 9, background: modeTones[index], scale: 0.7 + modeFocus[index] * 0.3}} />
                <span style={{...TYPE.codeSmall, color: modeFocus[index] > 0.35 ? COLOR.text.primary : COLOR.text.tertiary}}>{mode.mode}</span>
              </div>
            ))}
          </div>
          <div style={{...TYPE.labelSmall, color: COLOR.text.tertiary, marginLeft: 'auto'}}>默认循环</div>
        </div>
        <div style={{position: 'relative', height: 350, marginTop: 30}}>
          {permissionModes.map((mode, index) => (
            <PermissionModeView
              key={mode.mode}
              {...mode}
              tone={modeTones[index]}
              progress={modeFocus[index]}
            />
          ))}
        </div>
        <div style={{display: 'grid', gridTemplateColumns: '210px 1fr', gap: 24, marginTop: 18, paddingTop: 20, borderTop: `1px solid ${COLOR.stroke.soft}`, opacity: enter(frame, 1120)}}>
          <div style={{...TYPE.labelSmall, color: COLOR.text.tertiary}}>不在默认循环</div>
          <div style={{...TYPE.codeSmall}}>{optionalModes}</div>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: '210px 1fr', gap: 24, marginTop: 16, opacity: enter(frame, 1320)}}>
          <div style={{...TYPE.labelSmall, color: COLOR.text.brand}}>精细规则</div>
          <div style={{...TYPE.labelSmall, color: COLOR.text.secondary}}>allow / ask / deny · deny 优先</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const TakeawayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const entry = [['/', 'menu'], ['@', 'file'], ['!', 'shell']] as const;
  const control = [['Ctrl+O', 'observe'], ['Esc', 'stop'], ['Shift+Tab', 'permission']] as const;
  const controlsOut = interpolate(frame, [126, 148], [1, 0], {
    easing: EASE.exit,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const contractIn = enter(frame, 148, MOTION.structural);
  const contract = [
    ['file', '@ src/auth/validate-token.js', '对象'],
    ['shell', '! pnpm test', '证据'],
    ['permission', 'default · ask', '边界'],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 140}}>
      <SceneHeading title={getEp02Scene('takeaway').title} align="center" />
      <div style={{position: 'absolute', left: 210, right: 210, top: 390, opacity: controlsOut, translate: `0 ${(1 - controlsOut) * -16}px`}}>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 50}}>
          {entry.map(([key, icon], index) => <div key={key} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, opacity: enter(frame, 24 + index * 12)}}><EvidenceIcon name={icon} size={40} tone={COLOR.text.brand} /><KeyCap tone={COLOR.text.brand}>{key}</KeyCap></div>)}
        </div>
        <div style={{height: 124}} />
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 50}}>
          {control.map(([key, icon], index) => <div key={key} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, opacity: enter(frame, 82 + index * 12)}}><EvidenceIcon name={icon} size={34} tone={COLOR.text.info} /><KeyCap compact tone={COLOR.text.info}>{key}</KeyCap></div>)}
        </div>
      </div>
      <div style={{position: 'absolute', left: 250, right: 250, top: 405, opacity: contractIn, translate: `0 ${(1 - contractIn) * 22}px`}}>
        <div style={{...TYPE.labelSmall, color: COLOR.text.brand, textAlign: 'center'}}>任务输入</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 70, marginTop: 64}}>
          {contract.map(([icon, value, role], index) => (
            <div key={role} style={{display: 'grid', justifyItems: 'center', gap: 16, opacity: enter(frame, 154 + index * 10)}}>
              <EvidenceIcon name={icon} size={42} tone={COLOR.text.brand} />
              <div style={{...TYPE.codeSmall, fontWeight: WEIGHT.bold}}>{value}</div>
              <div style={{...TYPE.labelSmall, color: COLOR.text.secondary}}>{role}</div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SCENE_COMPONENTS: Record<string, React.FC> = {
  hook: HookScene,
  'interaction-model': InteractionModelScene,
  'slash-entry': SlashScene,
  'file-mention': FileMentionScene,
  'shell-mode': ShellModeScene,
  'multiline-prompt': MultilinePromptScene,
  'observe-process': ObserveProcessScene,
  'interrupt-and-mode': InterruptModeScene,
  takeaway: TakeawayScene,
};

export const Ep02InteractiveGuide: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <CourseLayout
      seriesTitle="Claude Code 实操"
      episodeTitle={episode.title}
      scenes={EP02_INTERACTIVE_GUIDE_SCENES}
      currentFrame={frame}
      showHeader={(current) => current >= seconds(15)}
    >
      {episode.scenes.map((scene) => {
        const timing = getEp02Scene(scene.id);
        const Scene = SCENE_COMPONENTS[scene.id];
        if (!Scene) throw new Error(`Missing EP02 scene component: ${scene.id}`);
        return <SceneSequence key={scene.id} from={timing.start} durationInFrames={timing.duration}><Scene /></SceneSequence>;
      })}
      <SyncedNarrationTrack
        manifest="claude-code-course/audio/ep02-interactive-guide/captions.json"
        auditPrefix="ep02-synced-caption"
      />
    </CourseLayout>
  );
};
