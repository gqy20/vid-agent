import {
  AbsoluteFill,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {CourseLayout, SceneSequence, TERMINAL_HEADER_HEIGHT, TerminalPanel} from '../kit';
import {
  EP01_INSTALL_FIRST_START_DURATION_IN_FRAMES,
  EP01_INSTALL_FIRST_START_EPISODE,
  EP01_INSTALL_FIRST_START_SCENES,
  getEp01Scene,
} from '../data/ep01InstallFirstStart';
import {COLOR, FONT, LAYOUT, TYPE, WEIGHT} from '../designTokens';
import {seconds} from '../timeline';
import {OfficialDocPanel} from './ep01/OfficialDocPanel';
import {SyncedNarrationTrack} from './ep01/SyncedNarrationTrack';

export {EP01_INSTALL_FIRST_START_DURATION_IN_FRAMES};

const episode = EP01_INSTALL_FIRST_START_EPISODE;
const providers = episode.content.providerExamples;
const modelRule = episode.content.modelContextRule;

const scenePad = {
  padding: LAYOUT.scenePadding,
  boxSizing: 'border-box' as const,
};

const enterAt = (frame: number, start: number, duration = 14) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

const SceneHeading: React.FC<{title: string; align?: 'left' | 'center'}> = ({title, align = 'left'}) => (
  <div style={{textAlign: align, width: '100%'}}>
    <div style={{...TYPE.heading, color: COLOR.text.primary}}>{title}</div>
  </div>
);

const StepPill: React.FC<{index: string; title: string; detail: string; opacity: number}> = ({
  index,
  title,
  detail,
  opacity,
}) => (
  <div
    style={{
      minWidth: 0,
      padding: '24px 28px',
      borderRadius: 14,
      border: `1px solid ${COLOR.stroke.default}`,
      background: COLOR.canvas.raised,
      boxShadow: `0 18px 48px ${COLOR.effects.shadowSoft}`,
      opacity,
      translate: `0 ${(1 - opacity) * 18}px`,
    }}
  >
    <div style={{...TYPE.labelSmall, fontFamily: FONT.mono, color: COLOR.text.info}}>{index}</div>
    <div style={{...TYPE.body, marginTop: 10, fontWeight: WEIGHT.bold, color: COLOR.text.primary}}>{title}</div>
    <div style={{...TYPE.labelSmall, marginTop: 8, color: COLOR.text.secondary}}>{detail}</div>
  </div>
);

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const titleIn = enterAt(frame, 0, 18);
  const steps = [
    ['01', '安装', '命令入口与版本'],
    ['02', '配置', '渠道、凭据、模型'],
    ['03', '验证', '第一次真实请求'],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 146}}>
      <div
        style={{
          position: 'absolute',
          left: 150,
          right: 150,
          top: 180,
          textAlign: 'center',
          opacity: titleIn,
          translate: `0 ${(1 - titleIn) * 24}px`,
        }}
      >
        <div style={{...TYPE.display}}>从安装到第一次启动</div>
        <div style={{...TYPE.subheading, marginTop: 18, color: COLOR.text.secondary}}>装好命令，不等于已经可用</div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 220,
          right: 220,
          top: 560,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 24,
        }}
      >
        {steps.map(([index, title, detail], itemIndex) => (
          <StepPill
            key={index}
            index={index}
            title={title}
            detail={detail}
            opacity={enterAt(frame, 28 + itemIndex * 16)}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const RoleNode: React.FC<{
  label: string;
  title: string;
  detail: string;
  tone: string;
  opacity: number;
}> = ({label, title, detail, tone, opacity}) => (
  <div
    style={{
      position: 'relative',
      padding: '30px 30px 28px',
      minHeight: 210,
      borderRadius: 16,
      border: `2px solid ${tone}`,
      background: COLOR.canvas.raised,
      opacity,
      translate: `0 ${(1 - opacity) * 18}px`,
      boxShadow: `0 20px 54px ${COLOR.effects.shadowPanel}`,
    }}
  >
    <div style={{...TYPE.labelSmall, color: COLOR.text.secondary}}>{label}</div>
    <div style={{...TYPE.subheading, marginTop: 18}}>{title}</div>
    <div style={{...TYPE.label, fontWeight: WEIGHT.regular, color: COLOR.text.secondary, marginTop: 14}}>
      {detail}
    </div>
  </div>
);

const HorizontalArrow: React.FC<{opacity: number; label?: string}> = ({opacity, label}) => (
  <div style={{position: 'relative', height: 40, opacity}}>
    <div
      style={{
        position: 'absolute',
        left: 4,
        right: 12,
        top: 19,
        height: 2,
        background: COLOR.stroke.strong,
        transformOrigin: 'left center',
        scale: `${opacity} 1`,
      }}
    />
    <div
      style={{
        position: 'absolute',
        right: 2,
        top: 13,
        width: 0,
        height: 0,
        borderTop: '7px solid transparent',
        borderBottom: '7px solid transparent',
        borderLeft: `11px solid ${COLOR.stroke.strong}`,
      }}
    />
    {label ? (
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: -14,
          translate: '-50% 0',
          ...TYPE.labelSmall,
          color: COLOR.text.tertiary,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </div>
    ) : null}
  </div>
);

const ClientProviderModelScene: React.FC = () => {
  const frame = useCurrentFrame();
  const client = enterAt(frame, 12);
  const provider = enterAt(frame, 38);
  const model = enterAt(frame, 64);
  return (
    <AbsoluteFill style={scenePad}>
      <SceneHeading title="先分清：客户端、服务渠道、模型" align="center" />
      <div
        style={{
          position: 'absolute',
          left: 150,
          right: 150,
          top: 360,
          display: 'grid',
          gridTemplateColumns: '1fr 130px 1fr 130px 1fr',
          alignItems: 'center',
          gap: 18,
        }}
      >
        <RoleNode label="本地客户端" title="Claude Code" detail="读取配置、组织工具调用、展示结果" tone={COLOR.semantic.client} opacity={client} />
        <HorizontalArrow opacity={provider} label="兼容协议" />
        <RoleNode label="服务渠道" title="国内兼容服务" detail="接收 Anthropic 兼容请求并完成认证" tone={COLOR.semantic.provider} opacity={provider} />
        <HorizontalArrow opacity={model} label="模型路由" />
        <RoleNode label="推理模型" title="GLM / M3 / K3 / Qwen" detail="真正执行推理与代码任务" tone={COLOR.semantic.model} opacity={model} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 184,
          translate: '-50% 0',
          padding: '14px 22px',
          borderRadius: 10,
          background: COLOR.canvas.soft,
          border: `1px solid ${COLOR.stroke.soft}`,
          ...TYPE.label,
          color: COLOR.text.secondary,
          opacity: enterAt(frame, 94),
        }}
      >
        换渠道，不等于换客户端
      </div>
    </AbsoluteFill>
  );
};

const DomesticOptionsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const framesPerProvider = seconds(8.75);
  const providerIndex = Math.min(providers.length - 1, Math.floor(frame / framesPerProvider));
  const current = providers[providerIndex];
  return (
    <AbsoluteFill style={scenePad}>
      <div
        style={{
          position: 'absolute',
          left: LAYOUT.screenshot.left,
          right: LAYOUT.screenshot.right,
          top: LAYOUT.screenshot.top,
          height: LAYOUT.screenshot.height,
        }}
      >
        <OfficialDocPanel
          key={current.modelId}
          screenshot={current.screenshotAsset}
          auditId={`ep01-provider-${providerIndex}`}
        />
      </div>
    </AbsoluteFill>
  );
};

const VariableCard: React.FC<{
  name: string;
  value: string;
  role: string;
  tone: string;
  opacity: number;
}> = ({name, value, role, tone, opacity}) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '360px 1fr 300px',
      alignItems: 'center',
      gap: 28,
      padding: '22px 28px',
      borderRadius: 14,
      border: `1px solid ${COLOR.stroke.default}`,
      borderLeft: `6px solid ${tone}`,
      background: COLOR.canvas.raised,
      opacity,
      translate: `${(1 - opacity) * 28}px 0`,
    }}
  >
    <div style={{...TYPE.label, fontFamily: FONT.mono, color: COLOR.text.primary}}>{name}</div>
    <div
      style={{
        padding: '10px 14px',
        borderRadius: 8,
        background: COLOR.canvas.soft,
        ...TYPE.codeSmall,
        color: COLOR.text.primary,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {value}
    </div>
    <div style={{...TYPE.label, fontWeight: WEIGHT.regular, color: COLOR.text.secondary}}>{role}</div>
  </div>
);

const ConfigurationVariablesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const rows = [
    ['ANTHROPIC_BASE_URL', 'https://…/api/anthropic', '请求发到哪家服务', COLOR.semantic.client],
    ['ANTHROPIC_AUTH_TOKEN', 'sk-••••••••••••••••', '证明当前调用身份', COLOR.semantic.auth],
    ['ANTHROPIC_MODEL', 'glm-5.2[1m]', '选择模型与上下文模式', COLOR.semantic.model],
  ] as const;
  return (
    <AbsoluteFill style={scenePad}>
      <SceneHeading title="三个变量，各管一件事" align="center" />
      <div style={{position: 'absolute', left: 250, right: 250, top: 310, display: 'grid', gap: 20}}>
        {rows.map(([name, value, role, tone], index) => (
          <VariableCard key={name} name={name} value={value} role={role} tone={tone} opacity={enterAt(frame, 20 + index * 24)} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const FlowNode: React.FC<{label: string; detail: string; tone: string; active: number}> = ({label, detail, tone, active}) => (
  <div
    style={{
      position: 'relative',
      zIndex: 2,
      width: 250,
      minHeight: 122,
      display: 'grid',
      placeItems: 'center',
      padding: '18px',
      boxSizing: 'border-box',
      borderRadius: 14,
      border: `2px solid ${active > 0.4 ? tone : COLOR.stroke.default}`,
      background: COLOR.canvas.raised,
      boxShadow: active > 0.4 ? `0 18px 50px ${COLOR.effects.shadowPanel}` : 'none',
      opacity: 0.55 + active * 0.45,
    }}
  >
    <div style={{textAlign: 'center'}}>
      <div style={{...TYPE.label, color: COLOR.text.primary}}>{label}</div>
      <div style={{...TYPE.codeSmall, color: COLOR.text.secondary, marginTop: 10}}>{detail}</div>
    </div>
  </div>
);

const RequestFlowScene: React.FC = () => {
  const frame = useCurrentFrame();
  const stages = [0, 120, 270, 450, 630];
  const active = stages.map((start) => enterAt(frame, start, 24));
  const packet = interpolate(frame, [50, 660], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const response = enterAt(frame, 720, 30);
  return (
    <AbsoluteFill style={scenePad}>
      <SceneHeading title="一次请求，怎样从终端走到模型再回来" align="center" />
      <div
        style={{
          position: 'absolute',
          left: 130,
          right: 130,
          top: 360,
          display: 'grid',
          gridTemplateColumns: '250px 1fr 250px 1fr 250px 1fr 250px',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <FlowNode label="提示词" detail="修复这个测试" tone={COLOR.semantic.client} active={active[0]} />
        <HorizontalArrow opacity={active[1]} />
        <FlowNode label="Claude Code" detail="读取 env / settings" tone={COLOR.semantic.client} active={active[1]} />
        <HorizontalArrow opacity={active[2]} label="POST /v1/messages" />
        <FlowNode label="兼容服务" detail="BASE_URL + TOKEN" tone={COLOR.semantic.provider} active={active[2]} />
        <HorizontalArrow opacity={active[3]} label="model 路由" />
        <FlowNode label="国内模型" detail="glm-5.2" tone={COLOR.semantic.model} active={active[3]} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 145 + packet * 1450,
          top: 414,
          zIndex: 5,
          width: 18,
          height: 18,
          borderRadius: 99,
          background: COLOR.semantic.provider,
          boxShadow: `0 0 0 8px ${COLOR.effects.packetRing}`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 340,
          right: 340,
          top: 660,
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: 24,
          padding: '22px 28px',
          borderRadius: 14,
          border: `1px solid ${COLOR.stroke.default}`,
          background: COLOR.canvas.soft,
          opacity: response,
          translate: `0 ${(1 - response) * 18}px`,
        }}
      >
        <div style={{...TYPE.codeSmall, color: COLOR.text.brand}}>stream: content_block_delta</div>
        <div style={{color: COLOR.stroke.strong, fontSize: 28}}>→</div>
        <div style={{...TYPE.label, fontWeight: WEIGHT.regular, color: COLOR.text.primary}}>终端显示答案与工具调用</div>
      </div>
    </AbsoluteFill>
  );
};

const OneMillionContextScene: React.FC = () => {
  const frame = useCurrentFrame();
  const docOut = interpolate(frame, [seconds(13), seconds(15)], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const diagramIn = enterAt(frame, seconds(14), 24);
  const strip = enterAt(frame, seconds(21), 24);
  return (
    <AbsoluteFill style={scenePad}>
      <div
        style={{
          position: 'absolute',
          left: LAYOUT.screenshot.left,
          right: LAYOUT.screenshot.right,
          top: LAYOUT.screenshot.top,
          height: LAYOUT.screenshot.height,
          opacity: docOut,
        }}
      >
        <OfficialDocPanel
          screenshot={modelRule.evidenceAsset}
          auditId="ep01-1m-doc"
        />
      </div>
      <div
        style={{
          position: 'absolute',
          inset: '150px 170px 160px',
          opacity: diagramIn,
          display: 'grid',
          alignContent: 'center',
        }}
      >
        <SceneHeading title="Claude Code 识别后缀，服务商接收原始模型 ID" align="center" />
        <div
          style={{
            marginTop: 78,
            display: 'grid',
            gridTemplateColumns: '1fr 180px 1fr',
            gap: 38,
            alignItems: 'center',
          }}
        >
          <div style={{padding: '34px', borderRadius: 16, border: `2px solid ${COLOR.semantic.provider}`, background: COLOR.canvas.raised}}>
            <div style={{...TYPE.labelSmall, color: COLOR.text.secondary}}>Claude Code 配置</div>
            <div style={{...TYPE.subheading, fontFamily: FONT.mono, marginTop: 20}}>
              glm-5.2<span style={{color: COLOR.text.brand}}>[1m]</span>
            </div>
            <div style={{...TYPE.labelSmall, color: COLOR.text.secondary, marginTop: 16}}>选择 1M 上下文模式</div>
          </div>
          <div style={{textAlign: 'center'}}>
            <div style={{...TYPE.labelSmall, color: COLOR.text.tertiary}}>移除后缀</div>
            <div style={{fontSize: 48, color: COLOR.stroke.strong, marginTop: 8}}>→</div>
          </div>
          <div style={{padding: '34px', borderRadius: 16, border: `2px solid ${COLOR.semantic.client}`, background: COLOR.canvas.raised}}>
            <div style={{...TYPE.labelSmall, color: COLOR.text.secondary}}>发送给服务商</div>
            <div style={{...TYPE.code, fontSize: 30, fontWeight: WEIGHT.bold, marginTop: 20}}>{'{ "model": "glm-5.2" }'}</div>
            <div style={{...TYPE.labelSmall, color: COLOR.text.secondary, marginTop: 16}}>保留服务商原始模型 ID</div>
          </div>
        </div>
        <div
          style={{
            marginTop: 54,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 14,
            opacity: strip,
          }}
        >
          {modelRule.examples.map((model) => (
            <div
              key={model}
              style={{
                padding: '15px 12px',
                borderRadius: 9,
                background: COLOR.canvas.soft,
                border: `1px solid ${COLOR.stroke.soft}`,
                textAlign: 'center',
                ...TYPE.codeSmall,
                color: COLOR.text.primary,
              }}
            >
              {model}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const TerminalEvidenceScene: React.FC<{
  sourceStart: number;
  sourceEnd: number;
  playbackRate?: number;
  holdImage?: string;
  source?: string;
  callouts?: readonly string[];
}> = ({
  sourceStart,
  sourceEnd,
  playbackRate = 1,
  holdImage,
  source = 'claude-code-course/terminal/ep01-install-first-start.mp4',
  callouts = [],
}) => {
  const frame = useCurrentFrame();
  const clipDuration = seconds((sourceEnd - sourceStart) / playbackRate);
  const onHold = Boolean(holdImage) && frame >= clipDuration;
  const calloutIn = enterAt(frame, Math.min(clipDuration + 8, seconds(12)), 18);
  const mediaStyle = {
    width: '100%',
    height: `calc(100% - ${TERMINAL_HEADER_HEIGHT}px)`,
    objectFit: 'contain' as const,
    objectPosition: 'center bottom' as const,
    background: COLOR.terminal.bg,
    display: 'block' as const,
  };
  return (
    <AbsoluteFill style={{padding: LAYOUT.terminalPadding, boxSizing: 'border-box'}}>
      <div style={{position: 'relative', width: '100%', height: '100%'}}>
        <TerminalPanel title="claude-code-lab · ep01-install-first-start">
          {onHold && holdImage ? (
            <Img src={staticFile(holdImage)} style={mediaStyle} />
          ) : (
            <Sequence durationInFrames={clipDuration} layout="none">
              <OffthreadVideo
                src={staticFile(source)}
                muted
                trimBefore={seconds(sourceStart)}
                trimAfter={seconds(sourceEnd)}
                playbackRate={playbackRate}
                style={mediaStyle}
              />
            </Sequence>
          )}
        </TerminalPanel>
        {callouts.length > 0 ? (
          <div
            style={{
              position: 'absolute',
              right: 28,
              top: 88,
              width: 500,
              display: 'grid',
              gap: 10,
              opacity: calloutIn,
              translate: `${(1 - calloutIn) * 18}px 0`,
            }}
          >
            {callouts.map((callout, index) => (
              <div
                key={callout}
                style={{
                  padding: '13px 16px',
                  borderRadius: 9,
                  background: COLOR.canvas.overlay,
                  borderLeft: `4px solid ${index === 0 ? COLOR.semantic.client : index === 1 ? COLOR.semantic.provider : COLOR.semantic.model}`,
                  color: COLOR.text.primary,
                  ...TYPE.codeSmall,
                  fontWeight: WEIGHT.bold,
                  boxShadow: `0 12px 30px ${COLOR.effects.shadowTerminal}`,
                }}
              >
                {callout}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

const InstallScene: React.FC = () => (
  <TerminalEvidenceScene
    sourceStart={3.2}
    sourceEnd={26.5}
    holdImage="claude-code-course/terminal/ep01-install-first-start-install-hold.png"
    callouts={['命令入口可执行', '版本：2.1.215']}
  />
);

const ShellAuthScene: React.FC = () => (
  <TerminalEvidenceScene
    sourceStart={26.5}
    sourceEnd={34.7}
    holdImage="claude-code-course/terminal/ep01-install-first-start-shell-hold.png"
    callouts={['BASE_URL → 服务渠道', 'AUTH_TOKEN → 真实认证', 'MODEL → glm-5.2[1m]']}
  />
);

const SettingsScene: React.FC = () => (
  <TerminalEvidenceScene
    sourceStart={34.7}
    sourceEnd={45}
    holdImage="claude-code-course/terminal/ep01-install-first-start-settings-hold.png"
    callouts={['配置持久化', 'chmod 600', '真实 Token 不入库']}
  />
);

const FirstStartScene: React.FC = () => (
  <TerminalEvidenceScene
    source="claude-code-course/terminal/ep01-agentic-loop.mp4"
    sourceStart={45.58}
    sourceEnd={71.8}
    playbackRate={1.35}
  />
);

const TakeawayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const steps = ['安装看版本', '分清渠道、凭据、模型', '用 [1m] 声明长上下文', '真实请求验证'];
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 150}}>
      <SceneHeading title="第一次可用，按四步验收" align="center" />
      <div
        style={{
          position: 'absolute',
          left: 180,
          right: 180,
          top: 440,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 18,
        }}
      >
        {steps.map((step, index) => {
          const itemIn = enterAt(frame, 12 + index * 16);
          return (
            <div
              key={step}
              style={{
                minHeight: 150,
                display: 'grid',
                placeItems: 'center',
                padding: '22px',
                boxSizing: 'border-box',
                borderRadius: 14,
                border: `1px solid ${COLOR.stroke.default}`,
                background: COLOR.canvas.raised,
                opacity: itemIn,
                translate: `0 ${(1 - itemIn) * 16}px`,
                textAlign: 'center',
              }}
            >
              <div>
                <div style={{...TYPE.labelSmall, fontFamily: FONT.mono, color: COLOR.text.info}}>0{index + 1}</div>
                <div style={{...TYPE.body, fontWeight: WEIGHT.bold, marginTop: 12}}>{step}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const SCENE_COMPONENTS: Record<string, React.FC> = {
  hook: HookScene,
  'client-provider-model': ClientProviderModelScene,
  'domestic-options': DomesticOptionsScene,
  'configuration-variables': ConfigurationVariablesScene,
  'request-flow': RequestFlowScene,
  'one-million-context': OneMillionContextScene,
  install: InstallScene,
  'shell-auth': ShellAuthScene,
  settings: SettingsScene,
  'first-start': FirstStartScene,
  takeaway: TakeawayScene,
};

export const Ep01InstallFirstStart: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <CourseLayout
      seriesTitle="Claude Code 实操"
      episodeTitle={episode.title}
      scenes={EP01_INSTALL_FIRST_START_SCENES}
      currentFrame={frame}
      showHeader={(current) => current >= seconds(15)}
    >
      {episode.scenes.map((scene) => {
        const timing = getEp01Scene(scene.id);
        const Scene = SCENE_COMPONENTS[scene.id];
        if (!Scene) throw new Error(`Missing EP01 scene component: ${scene.id}`);
        return (
          <SceneSequence key={scene.id} from={timing.start} durationInFrames={timing.duration}>
            <Scene />
          </SceneSequence>
        );
      })}
      <SyncedNarrationTrack manifest="claude-code-course/audio/ep01-install-first-start/captions.json" />
    </CourseLayout>
  );
};
