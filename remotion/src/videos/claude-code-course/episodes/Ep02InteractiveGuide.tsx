import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {
  EP02_INTERACTIVE_GUIDE_DURATION_IN_FRAMES,
  EP02_INTERACTIVE_GUIDE_EPISODE,
  EP02_INTERACTIVE_GUIDE_SCENES,
  getEp02Scene,
} from '../data/ep02InteractiveGuide';
import {COLOR, FONT, FRAME, LAYOUT, SURFACE, TYPE, WEIGHT} from '../designTokens';
import {CourseLayout, SceneSequence, SyncedNarrationTrack, TERMINAL_HEADER_HEIGHT, TerminalPanel} from '../kit';
import {EASE, MOTION, motionProgress} from '../motion';
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

const RailItem: React.FC<{
  marker: string;
  title: string;
  detail: string;
  tone: string;
  progress: number;
}> = ({marker, title, detail, tone, progress}) => (
  <div
    style={{
      position: 'relative',
      padding: '16px 0 18px 28px',
      borderLeft: `${FRAME.focusRail}px solid ${tone}`,
      opacity: progress,
      translate: `${(1 - progress) * 18}px 0`,
    }}
  >
    <div style={{...TYPE.labelSmall, fontFamily: FONT.mono, color: tone}}>{marker}</div>
    <div style={{...TYPE.body, fontWeight: WEIGHT.bold, marginTop: 4}}>{title}</div>
    <div style={{...TYPE.labelSmall, color: COLOR.text.secondary, marginTop: 5}}>{detail}</div>
  </div>
);

const PermissionModeColumn: React.FC<{
  mode: string;
  label: string;
  display: {
    read: string;
    edit: string;
    run: string;
  };
  tone: string;
  progress: number;
}> = ({mode, label, display, tone, progress}) => (
  <div
    style={{
      borderTop: `${FRAME.focusRail}px solid ${tone}`,
      paddingTop: 18,
      opacity: progress,
      translate: `0 ${(1 - progress) * 18}px`,
    }}
  >
    <div style={{...TYPE.labelSmall, color: tone}}>{label}</div>
    <div style={{...TYPE.code, fontSize: 30, fontWeight: WEIGHT.bold, marginTop: 4}}>{mode}</div>
    <div style={{display: 'grid', gap: 10, marginTop: 22}}>
      {[
        ['READ', display.read],
        ['EDIT', display.edit],
        ['RUN', display.run],
      ].map(([action, value]) => (
        <div key={action} style={{display: 'grid', gridTemplateColumns: '64px 1fr', gap: 12, alignItems: 'baseline'}}>
          <span style={{...TYPE.labelSmall, fontFamily: FONT.mono, color: COLOR.text.tertiary}}>{action}</span>
          <span style={{...TYPE.label, color: COLOR.text.secondary}}>{value}</span>
        </div>
      ))}
    </div>
  </div>
);

const TerminalStill: React.FC<{
  file: string;
  title: string;
  opacity?: number;
  objectPosition?: string;
}> = ({file, title, opacity = 1, objectPosition = 'center center'}) => (
  <TerminalPanel title={title}>
    <Img
      src={staticFile(`${stillRoot}/${file}`)}
      style={{
        width: '100%',
        height: `calc(100% - ${TERMINAL_HEADER_HEIGHT}px)`,
        objectFit: 'contain',
        objectPosition,
        display: 'block',
        opacity,
      }}
    />
  </TerminalPanel>
);

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const titleIn = enter(frame, 42, MOTION.structural);
  const problems = [
    ['上下文', '“那个认证文件”'],
    ['命令', '来回切终端'],
    ['方向', '跑偏后等待'],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 142}}>
      <div style={{position: 'absolute', left: 150, right: 150, top: 150, textAlign: 'center', opacity: titleIn, translate: `0 ${(1 - titleIn) * 24}px`}}>
        <div style={{...TYPE.display}}>交互界面生存指南</div>
        <div style={{...TYPE.subheading, color: COLOR.text.secondary, marginTop: 18}}>能输入，不等于会控制</div>
      </div>
      <div style={{position: 'absolute', left: 220, right: 220, top: 555, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 56}}>
        {problems.map(([label, detail], index) => {
          const itemIn = enter(frame, 82 + index * 12);
          return (
            <div key={label} style={{paddingTop: 22, borderTop: `4px solid ${index === 2 ? COLOR.text.danger : COLOR.stroke.strong}`, opacity: itemIn, translate: `0 ${(1 - itemIn) * 16}px`}}>
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
    ['/', '发现', '能力入口'],
    ['@', '引用', '项目上下文'],
    ['!', '执行', '确定性命令'],
  ] as const;
  const controls = [
    ['Ctrl+O', '观察'],
    ['Esc', '中断'],
    ['Shift+Tab', '切换模式'],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 126}}>
      <SceneHeading title="把界面分成两组" detail="入口决定怎样输入，控制键决定怎样管理会话" align="center" />
      <div style={{position: 'absolute', left: 185, right: 185, top: 365}}>
        <div style={{display: 'grid', gridTemplateColumns: '150px repeat(3, 1fr)', alignItems: 'center', gap: 28}}>
          <div style={{...TYPE.label, color: COLOR.text.brand}}>输入入口</div>
          {entries.map(([token, role, detail], index) => {
            const itemIn = enter(frame, 22 + index * 10);
            return (
              <div key={token} style={{display: 'flex', alignItems: 'center', gap: 22, opacity: itemIn, translate: `0 ${(1 - itemIn) * 14}px`}}>
                <KeyCap tone={COLOR.text.brand}>{token}</KeyCap>
                <div><div style={{...TYPE.body, fontWeight: WEIGHT.bold}}>{role}</div><div style={{...TYPE.labelSmall, color: COLOR.text.secondary}}>{detail}</div></div>
              </div>
            );
          })}
        </div>
        <div style={{height: 1, background: COLOR.stroke.soft, margin: '64px 0'}} />
        <div style={{display: 'grid', gridTemplateColumns: '150px repeat(3, 1fr)', alignItems: 'center', gap: 28}}>
          <div style={{...TYPE.label, color: COLOR.text.info}}>会话控制</div>
          {controls.map(([key, role], index) => {
            const itemIn = enter(frame, 80 + index * 10);
            return <div key={key} style={{display: 'flex', alignItems: 'center', gap: 18, opacity: itemIn}}><KeyCap compact tone={COLOR.text.info}>{key}</KeyCap><div style={{...TYPE.body, fontWeight: WEIGHT.bold}}>{role}</div></div>;
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SlashScene: React.FC = () => {
  const frame = useCurrentFrame();
  const shift = enter(frame, 240, MOTION.structural);
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title="/ 不是一条命令，是发现入口" detail="不知道从哪里开始时，先打开菜单" />
      <div style={{position: 'absolute', left: 150, top: 270, width: 1120 - shift * 160, height: 610, transition: 'none'}}>
        <TerminalStill file="slash-menu.png" title="claude-code-lab · /" />
      </div>
      <div style={{position: 'absolute', right: 150, top: 310, width: 430, display: 'grid', gap: 22}}>
        <RailItem marker="01" title="内置命令" detail="会话、配置与诊断" tone={COLOR.brand.orange} progress={enter(frame, 268)} />
        <RailItem marker="02" title="Skills" detail="随环境提供的专门能力" tone={COLOR.brand.green} progress={enter(frame, 286)} />
        <RailItem marker="03" title="扩展入口" detail="项目 / 用户 / 插件 / MCP" tone={COLOR.brand.blue} progress={enter(frame, 304)} />
      </div>
    </AbsoluteFill>
  );
};

const FileMentionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const pathIn = enter(frame, 40, MOTION.structural);
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title="@ 把模糊指代变成明确对象" detail="键入部分路径，使用真实项目补全" />
      <div style={{position: 'absolute', left: 150, top: 305, width: 550}}>
        <div style={{...TYPE.label, color: COLOR.text.tertiary}}>从一句模糊描述</div>
        <div style={{...TYPE.subheading, marginTop: 20, color: COLOR.text.secondary}}>“检查那个认证文件”</div>
        <div style={{height: 74, marginLeft: 22, borderLeft: `2px solid ${COLOR.stroke.strong}`, transformOrigin: 'top', scale: `1 ${pathIn}`}} />
        <div style={{...TYPE.code, padding: '18px 22px', borderLeft: `${FRAME.focusRail}px solid ${COLOR.brand.orange}`, background: COLOR.canvas.soft, opacity: pathIn}}>
          @src/auth/<br />validate-token.js
        </div>
        <div style={{...TYPE.labelSmall, color: COLOR.text.secondary, marginTop: 22, opacity: enter(frame, 74)}}>文件成为当前任务的明确上下文</div>
      </div>
      <div style={{position: 'absolute', right: 150, top: 245, width: 990, height: 635, opacity: enter(frame, 18)}}>
        <TerminalStill file="file-mention.png" title="claude-code-lab · @ file mention" />
      </div>
    </AbsoluteFill>
  );
};

const ShellModeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const resultIn = enter(frame, 152, MOTION.structural);
  const evidenceIn = enter(frame, 245, MOTION.structural);
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title="! 直接获得确定性结果" detail="命令由 Shell 执行，真实输出进入当前会话" />
      <div style={{position: 'absolute', left: 150, top: 245, width: 1160, height: 635}}>
        <div style={{position: 'absolute', inset: 0, opacity: 1 - resultIn}}>
          <TerminalStill file="shell-running.png" title="claude-code-lab · !pnpm test" />
        </div>
        <div style={{position: 'absolute', inset: 0, opacity: resultIn}}>
          <TerminalStill file="shell-test.png" title="claude-code-lab · 1 failed" />
        </div>
      </div>
      <div style={{position: 'absolute', right: 150, top: 292, width: 390, display: 'grid', gap: 34}}>
        <RailItem marker="INPUT" title="pnpm test" detail="直接交给 Shell" tone={COLOR.brand.orange} progress={enter(frame, 30)} />
        <RailItem marker="RESULT" title="1 failed" detail="失败不是讲解模拟" tone={COLOR.text.danger} progress={enter(frame, 68)} />
        <RailItem marker="CONTEXT" title="保留证据" detail="下一步分析可引用" tone={COLOR.text.info} progress={evidenceIn} />
      </div>
    </AbsoluteFill>
  );
};

const MultilinePromptScene: React.FC = () => {
  const frame = useCurrentFrame();
  const lines = [
    ['目标', '解释空 Token 为什么没有被拒绝'],
    ['约束', '先不要修改代码'],
    ['证据', '指出判断分支和对应测试位置'],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title="复杂任务，用三行表达边界" detail="Ctrl+J 是跨终端更稳定的换行方式" align="center" />
      <div style={{position: 'absolute', left: 310, right: 310, top: 330, borderTop: `1px solid ${COLOR.stroke.default}`}}>
        {lines.map(([label, text], index) => {
          const itemIn = enter(frame, 28 + index * 20);
          return (
            <div key={label} style={{display: 'grid', gridTemplateColumns: '130px 1fr auto', gap: 28, alignItems: 'center', minHeight: 122, borderBottom: `1px solid ${COLOR.stroke.soft}`, opacity: itemIn, translate: `${(1 - itemIn) * -18}px 0`}}>
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
  const frame = useCurrentFrame();
  const reveal = enter(frame, 290, MOTION.structural);
  const steps = ['读取源码', '读取测试', '定位判断', '给出结论'];
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title="Ctrl+O：从答案回到证据链" detail="展开 transcript viewer，查看完整工具过程" />
      <div style={{position: 'absolute', left: 150, top: 245, width: 1120, height: 635, translate: `${reveal * -80}px 0`}}>
        <TerminalStill file="transcript.png" title="claude-code-lab · transcript viewer" />
      </div>
      <div style={{position: 'absolute', right: 150, top: 288, width: 470, opacity: reveal, translate: `${(1 - reveal) * 20}px 0`}}>
        <div style={{...TYPE.label, color: COLOR.text.info, marginBottom: 24}}>证据链</div>
        {steps.map((step, index) => (
          <div key={step} style={{position: 'relative', minHeight: 95, paddingLeft: 42, opacity: enter(frame, 305 + index * 14)}}>
            <div style={{position: 'absolute', left: 0, top: 8, width: 16, height: 16, borderRadius: 20, background: index === 3 ? COLOR.brand.orange : COLOR.brand.blue}} />
            {index < steps.length - 1 ? <div style={{position: 'absolute', left: 7, top: 30, width: 2, height: 58, background: COLOR.stroke.default}} /> : null}
            <div style={{...TYPE.body, fontWeight: WEIGHT.bold}}>{step}</div>
          </div>
        ))}
      </div>
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
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <div style={{position: 'absolute', left: LAYOUT.safeX, right: LAYOUT.safeX, top: 122, opacity: 1 - modeIn}}>
        <SceneHeading title="方向不对，先停；权限不对，再切模式" />
      </div>
      <div style={{position: 'absolute', left: LAYOUT.safeX, right: LAYOUT.safeX, top: 122, opacity: modeIn}}>
        <SceneHeading title="Shift+Tab：默认三种权限模式" detail="读、改、命令，自动放行的范围不同" />
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
          <div style={{...TYPE.codeSmall, color: COLOR.text.secondary}}>default&nbsp;&nbsp;→&nbsp;&nbsp;acceptEdits&nbsp;&nbsp;→&nbsp;&nbsp;plan</div>
          <div style={{...TYPE.labelSmall, color: COLOR.text.tertiary, marginLeft: 'auto'}}>默认循环</div>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 42, marginTop: 38}}>
          {permissionModes.map((mode, index) => (
            <PermissionModeColumn
              key={mode.mode}
              {...mode}
              tone={modeTones[index]}
              progress={enter(frame, 575 + index * 155, MOTION.structural)}
            />
          ))}
        </div>
        <div style={{display: 'grid', gridTemplateColumns: '210px 1fr', gap: 24, marginTop: 34, paddingTop: 20, borderTop: `1px solid ${COLOR.stroke.soft}`, opacity: enter(frame, 1000)}}>
          <div style={{...TYPE.labelSmall, color: COLOR.text.tertiary}}>不在默认循环</div>
          <div style={{...TYPE.codeSmall}}>{optionalModes}</div>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: '210px 1fr', gap: 24, marginTop: 16, opacity: enter(frame, 1260)}}>
          <div style={{...TYPE.labelSmall, color: COLOR.text.brand}}>精细规则</div>
          <div style={{...TYPE.labelSmall, color: COLOR.text.secondary}}>allow / ask / deny · deny 优先</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const TakeawayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const entry = [['/', '找入口'], ['@', '给上下文'], ['!', '跑命令']] as const;
  const control = [['Ctrl+O', '看过程'], ['Esc', '停方向'], ['Shift+Tab', '切模式']] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 140}}>
      <SceneHeading title="先控制，再委派" detail="三个入口，三个控制键" align="center" />
      <div style={{position: 'absolute', left: 210, right: 210, top: 390}}>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 50}}>
          {entry.map(([key, label], index) => <div key={key} style={{display: 'flex', alignItems: 'center', gap: 22, opacity: enter(frame, 24 + index * 12)}}><KeyCap tone={COLOR.text.brand}>{key}</KeyCap><div style={{...TYPE.body, fontWeight: WEIGHT.bold}}>{label}</div></div>)}
        </div>
        <div style={{height: 1, background: COLOR.stroke.soft, margin: '70px 0 54px'}} />
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 50}}>
          {control.map(([key, label], index) => <div key={key} style={{display: 'flex', alignItems: 'center', gap: 18, opacity: enter(frame, 82 + index * 12)}}><KeyCap compact tone={COLOR.text.info}>{key}</KeyCap><div style={{...TYPE.label, fontWeight: WEIGHT.bold}}>{label}</div></div>)}
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
