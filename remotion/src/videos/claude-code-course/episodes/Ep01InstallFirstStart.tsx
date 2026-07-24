import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from 'remotion';
import {CourseLayout, EvidenceIcon, type EvidenceIconName, RecordedTerminal, SceneQuestion, SceneSequence, SemanticNode, SyncedNarrationTrack} from '../kit';
import {
  EP01_INSTALL_FIRST_START_DURATION_IN_FRAMES,
  EP01_INSTALL_FIRST_START_EPISODE,
  EP01_INSTALL_FIRST_START_SCENES,
  getEp01Scene,
} from '../data/ep01InstallFirstStart';
import {COLOR, FONT, FRAME, LAYOUT, SURFACE, TYPE, WEIGHT} from '../designTokens';
import {EASE, focusWindow, MOTION, motionProgress} from '../motion';
import {seconds} from '../timeline';
import {OfficialDocPanel} from './ep01/OfficialDocPanel';

export {EP01_INSTALL_FIRST_START_DURATION_IN_FRAMES};

const episode = EP01_INSTALL_FIRST_START_EPISODE;
const providers = episode.content.providerExamples;
const modelRule = episode.content.modelContextRule;

const scenePad = {
  padding: LAYOUT.scenePadding,
  boxSizing: 'border-box' as const,
};

const enterAt = (frame: number, start: number, duration: number = MOTION.productive) =>
  motionProgress(frame, start, duration, EASE.enter);

const SceneHeading: React.FC<{title: string; align?: 'left' | 'center'}> = ({title, align = 'left'}) => (
  <div style={{textAlign: align, width: '100%'}}>
    <div style={{...TYPE.heading, color: COLOR.text.primary}}>{title}</div>
  </div>
);

const StepItem: React.FC<{index: string; icon: EvidenceIconName; title: string; opacity: number}> = ({
  index,
  icon,
  title,
  opacity,
}) => (
  <div
    style={{
      ...SURFACE.editorial,
      position: 'relative',
      minWidth: 0,
      padding: '54px 18px 18px',
      textAlign: 'center',
      opacity,
      translate: `0 ${(1 - opacity) * 18}px`,
    }}
  >
    <div style={{position: 'absolute', left: '50%', top: 10, width: 16, height: 16, translate: '-50% 0', borderRadius: 99, background: COLOR.canvas.paper, boxShadow: `inset 0 0 0 4px ${COLOR.brand.orange}`}} />
    <EvidenceIcon name={icon} tone={COLOR.text.brand} size={38} />
    <div style={{...TYPE.labelSmall, fontFamily: FONT.mono, color: COLOR.text.brand, marginTop: 14}}>{index}</div>
    <div style={{...TYPE.body, marginTop: 8, fontWeight: WEIGHT.bold, color: COLOR.text.primary}}>{title}</div>
  </div>
);

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const proofIn = enterAt(frame, 0, MOTION.structural);
  const proofOut = interpolate(frame, [72, 92], [1, 0], {
    easing: EASE.exit,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const titleIn = enterAt(frame, 94, MOTION.structural);
  const routeIn = motionProgress(frame, 174, MOTION.expressive, EASE.editorial);
  const steps = [
    ['01', 'shell', '安装'],
    ['02', 'route', '配置'],
    ['03', 'check', '验证'],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 146}}>
      <div
        style={{
          position: 'absolute',
          left: 330,
          right: 330,
          top: 72,
          height: 780,
          opacity: proofIn * proofOut,
          translate: `0 ${(1 - proofIn) * 18 - (1 - proofOut) * 18}px`,
          scale: 0.985 + proofIn * 0.015,
        }}
      >
        <RecordedTerminal
          src="claude-code-course/terminal/ep01-install-first-start-first-start-clip-frames/f_00450.png"
          title="claude-code-lab · ep01-install-first-start"
          zoom={1.2}
          focus="50% 50%"
        />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 150,
          right: 150,
          top: 166,
          textAlign: 'center',
          opacity: titleIn,
          translate: `0 ${(1 - titleIn) * 24}px`,
        }}
      >
        <div style={{...TYPE.display}}>从安装到第一次启动</div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 220,
          right: 220,
          top: 568,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 24,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '14%',
            right: '14%',
            top: 18,
            height: 2,
            background: COLOR.stroke.default,
            transformOrigin: 'left center',
            scale: `${routeIn} 1`,
          }}
        />
        {steps.map(([index, icon, title], itemIndex) => (
          <StepItem
            key={index}
            index={index}
            icon={icon}
            title={title}
            opacity={enterAt(frame, 128 + itemIndex * 18)}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const RoleNode: React.FC<{
  icon: EvidenceIconName;
  label: string;
  title: string;
  tone: string;
  opacity: number;
}> = ({icon, label, title, tone, opacity}) => (
  <div
    style={{
      ...SURFACE.editorial,
      padding: '28px 20px 22px',
      minHeight: 210,
      opacity,
      translate: `0 ${(1 - opacity) * 18}px`,
    }}
  >
    <EvidenceIcon name={icon} size={42} tone={tone} />
    <div style={{...TYPE.labelSmall, color: COLOR.text.secondary, marginTop: 20}}>{label}</div>
    <div style={{...TYPE.subheading, marginTop: 18}}>{title}</div>
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
      <SceneHeading title="客户端、渠道和模型分别做什么？" align="center" />
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
        <RoleNode icon="shell" label="本地客户端" title="Claude Code" tone={COLOR.semantic.client} opacity={client} />
        <HorizontalArrow opacity={provider} label="兼容协议" />
        <RoleNode icon="route" label="服务渠道" title="国内兼容服务" tone={COLOR.semantic.provider} opacity={provider} />
        <HorizontalArrow opacity={model} label="模型路由" />
        <RoleNode icon="model" label="推理模型" title="GLM / M3 / K3 / Qwen" tone={COLOR.semantic.model} opacity={model} />
      </div>
    </AbsoluteFill>
  );
};

const DomesticOptionsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const scene = episode.scenes.find((item) => item.id === 'domestic-options');
  if (!scene?.visualTiming) throw new Error('domestic-options visualTiming is required');
  const providerStarts = scene.visualTiming.providerStarts.map(seconds);
  const summaryStart = seconds(scene.visualTiming.summaryStart);
  const providerIndex = providerStarts.reduce(
    (selected, start, index) => frame >= start ? index : selected,
    0,
  );
  const current = providers[providerIndex];
  const previous = providers[Math.max(0, providerIndex - 1)];
  const localFrame = frame - providerStarts[providerIndex];
  const providerEnd = providerStarts[providerIndex + 1] ?? summaryStart;
  const providerDuration = providerEnd - providerStarts[providerIndex];
  const wipe = providerIndex === 0 ? 1 : motionProgress(localFrame, 0, 10, EASE.editorial);
  const focusDelay = Math.min(seconds(1.8), providerDuration * 0.34);
  const focusProgress = motionProgress(localFrame, focusDelay, MOTION.expressive, EASE.editorial);
  const summaryWipe = motionProgress(frame, summaryStart, MOTION.structural, EASE.editorial);
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
        <div style={{position: 'absolute', inset: 0}}>
          <OfficialDocPanel
            screenshot={previous.screenshotAsset}
            auditId={`ep01-provider-${Math.max(0, providerIndex - 1)}`}
            focusRegion={previous.focusRegion}
            focusProgress={1}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0)`,
          }}
        >
          <OfficialDocPanel
            key={current.modelId}
            screenshot={current.screenshotAsset}
            auditId={`ep01-provider-${providerIndex}`}
            focusRegion={current.focusRegion}
            focusProgress={focusProgress}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            clipPath: `inset(0 ${(1 - summaryWipe) * 100}% 0 0)`,
            background: COLOR.canvas.base,
            padding: '66px 82px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.15fr 1fr 0.7fr',
              padding: '0 24px 20px',
              borderBottom: FRAME.hairline,
              ...TYPE.labelSmall,
              color: COLOR.text.tertiary,
            }}
          >
            <div>渠道</div>
            <div>模型 ID</div>
            <div>上下文</div>
          </div>
          {providers.map((provider, index) => {
            const rowIn = motionProgress(frame, summaryStart + 8 + index * MOTION.stagger, MOTION.productive, EASE.enter);
            return (
              <div
                key={provider.modelId}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.15fr 1fr 0.7fr',
                  alignItems: 'center',
                  minHeight: 130,
                  padding: '0 24px',
                  borderBottom: FRAME.hairline,
                  opacity: rowIn,
                  translate: `${(1 - rowIn) * 18}px 0`,
                }}
              >
                <div style={{...TYPE.body, fontWeight: WEIGHT.bold}}>{provider.provider}</div>
                <div style={{...TYPE.code, color: COLOR.text.brand}}>{provider.modelId}</div>
                <div style={{...TYPE.label, color: COLOR.text.secondary}}>{provider.context}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const VariableCard: React.FC<{
  name: string;
  value: string;
  tone: string;
  opacity: number;
  active: number;
}> = ({name, value, tone, opacity, active}) => (
  <div
    style={{
      ...SURFACE.editorial,
      position: 'relative',
      display: 'grid',
      gridTemplateColumns: '310px 1fr',
      alignItems: 'center',
      gap: 22,
      padding: '20px 24px',
      minHeight: 112,
      boxSizing: 'border-box',
      borderBottom: FRAME.hairline,
      background: active > 0.35 ? COLOR.canvas.soft : 'transparent',
      opacity,
      translate: `${(1 - opacity) * 28}px 0`,
    }}
  >
    <div style={{position: 'absolute', left: 0, top: 22, bottom: 22, width: FRAME.focusRail, background: tone, opacity: active}} />
    <div>
      <div style={{...TYPE.label, fontFamily: FONT.mono, color: COLOR.text.primary}}>{name}</div>
    </div>
    <div style={{...TYPE.codeSmall, color: COLOR.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{value}</div>
  </div>
);

const RequestField: React.FC<{label: string; value: string; tone: string; opacity: number; position: 'first' | 'middle' | 'last'}> = ({label, value, tone, opacity, position}) => (
  <div
    style={{
      ...SURFACE.code,
      position: 'relative',
      minHeight: 112,
      padding: '22px 22px 18px 26px',
      boxSizing: 'border-box',
      borderRadius: position === 'first' ? '10px 10px 0 0' : position === 'last' ? '0 0 10px 10px' : 0,
      borderBottom: position === 'last' ? 'none' : FRAME.hairline,
      opacity,
      translate: `${(1 - opacity) * -18}px 0`,
    }}
  >
    <div style={{position: 'absolute', left: 10, top: 28, width: 6, height: 6, borderRadius: 99, background: tone}} />
    <div style={{...TYPE.labelSmall, color: COLOR.text.secondary}}>{label}</div>
    <div style={{...TYPE.codeSmall, marginTop: 7, color: COLOR.text.primary}}>{value}</div>
  </div>
);

const ConfigurationVariablesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const rows = [
    ['ANTHROPIC_BASE_URL', 'https://…/api/anthropic', '请求地址', '…/v1/messages', COLOR.semantic.client],
    ['ANTHROPIC_AUTH_TOKEN', 'sk-••••••••••••••••', '认证请求头', 'Authorization: Bearer •••', COLOR.semantic.auth],
    ['ANTHROPIC_MODEL', 'glm-5.2[1m]', 'JSON 请求体', 'model: glm-5.2', COLOR.semantic.model],
  ] as const;
  return (
    <AbsoluteFill style={scenePad}>
      <SceneHeading title="三个变量分别影响哪里？" align="center" />
      <div style={{position: 'absolute', left: 150, right: 150, top: 280}}>
        <div style={{display: 'grid', gridTemplateColumns: '760px 100px 1fr', alignItems: 'end', marginBottom: 18}}>
          <div style={{...TYPE.labelSmall, color: COLOR.text.tertiary}}>Claude Code 配置</div>
          <div />
          <div style={{...TYPE.labelSmall, color: COLOR.text.tertiary}}>组装后的请求</div>
        </div>
        <div style={{display: 'grid', gap: 0}}>
          {rows.map(([name, value, target, targetValue, tone], index) => {
            const sourceIn = enterAt(frame, 24 + index * 54);
            const mapIn = motionProgress(frame, 58 + index * 54, MOTION.structural, EASE.editorial);
            return (
              <div key={name} style={{display: 'grid', gridTemplateColumns: '760px 100px 1fr', alignItems: 'center'}}>
                <VariableCard name={name} value={value} tone={tone} opacity={sourceIn} active={focusWindow(frame, 24 + index * 54, 92 + index * 54)} />
                <div style={{position: 'relative', height: 2, background: COLOR.stroke.soft, opacity: sourceIn}}>
                  <div style={{position: 'absolute', inset: 0, background: tone, transformOrigin: 'left center', scale: `${mapIn} 1`}} />
                  <div style={{position: 'absolute', right: -1, top: -5, width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: `9px solid ${tone}`, opacity: mapIn}} />
                </div>
                <RequestField label={target} value={targetValue} tone={tone} opacity={mapIn} position={index === 0 ? 'first' : index === rows.length - 1 ? 'last' : 'middle'} />
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const RequestFlowScene: React.FC = () => {
  const frame = useCurrentFrame();
  const centers = [250, 740, 1230, 1720] as const;
  const hop = (at: number, start: number, end: number, from: number, to: number) => interpolate(at, [start, end], [from, to], {
    easing: EASE.editorial,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const outboundX = frame < 145
    ? hop(frame, 92, 145, centers[0], centers[1])
    : frame < 285
      ? hop(frame, 232, 285, centers[1], centers[2])
      : hop(frame, 362, 415, centers[2], centers[3]);
  const returnX = (offset: number) => {
    const at = frame - offset;
    return at < 555
      ? hop(at, 510, 555, centers[3], centers[2])
      : hop(at, 570, 620, centers[2], centers[1]);
  };
  const packetClearance = (x: number) => interpolate(
    Math.min(...centers.map((center) => Math.abs(x - center))),
    [110, 170],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );
  const nodeFocus = [
    focusWindow(frame, 0, 105),
    focusWindow(frame, 100, 245) + focusWindow(frame, 590, 680),
    focusWindow(frame, 240, 375),
    focusWindow(frame, 370, 535),
  ];
  const connectorProgress = [enterAt(frame, 84), enterAt(frame, 224), enterAt(frame, 354)];
  const outboundVisible = focusWindow(frame, 78, 440);
  const requestIn = motionProgress(frame, 190, MOTION.structural, EASE.enter);
  const pathIn = motionProgress(frame, 190, MOTION.productive, EASE.enter);
  const authIn = motionProgress(frame, 210, MOTION.productive, EASE.enter);
  const modelIn = motionProgress(frame, 230, MOTION.productive, EASE.enter);
  const response = enterAt(frame, 610, MOTION.structural);
  return (
    <AbsoluteFill style={scenePad}>
      <SceneQuestion title="一次请求，怎样从终端走到模型再回来" handoffAt={72} />
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
        <SemanticNode icon="edit" label="提示词" detail="修复这个测试" tone={COLOR.semantic.client} active={nodeFocus[0]} />
        <HorizontalArrow opacity={connectorProgress[0]} />
        <SemanticNode icon="shell" label="Claude Code" detail="读取 env / settings" tone={COLOR.semantic.client} active={Math.min(1, nodeFocus[1])} />
        <HorizontalArrow opacity={connectorProgress[1]} label="POST /v1/messages" />
        <SemanticNode icon="route" label="兼容服务" detail="认证 + 路由" tone={COLOR.semantic.provider} active={nodeFocus[2]} />
        <HorizontalArrow opacity={connectorProgress[2]} label="model 路由" />
        <SemanticNode icon="model" label="国内模型" detail="glm-5.2" tone={COLOR.semantic.model} active={nodeFocus[3]} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: outboundX - 9,
          top: 412,
          zIndex: 1,
          width: 18,
          height: 18,
          borderRadius: 99,
          background: COLOR.semantic.provider,
          boxShadow: `0 0 0 8px ${COLOR.effects.packetRing}`,
          opacity: outboundVisible * packetClearance(outboundX),
        }}
      />
      <div
        style={{
          ...SURFACE.code,
          position: 'absolute',
          left: 455,
          right: 455,
          top: 590,
          padding: '18px 22px',
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr 0.8fr',
          gap: 18,
          opacity: requestIn * (1 - response * 0.55),
          translate: `0 ${(1 - requestIn) * 16}px`,
        }}
      >
        <div style={{...TYPE.codeSmall, color: COLOR.text.brand, opacity: pathIn, translate: `${(1 - pathIn) * -12}px 0`}}>/v1/messages</div>
        <div style={{...TYPE.codeSmall, color: COLOR.text.secondary, opacity: authIn, translate: `${(1 - authIn) * -12}px 0`}}>Authorization: •••</div>
        <div style={{...TYPE.codeSmall, color: COLOR.text.primary, opacity: modelIn, translate: `${(1 - modelIn) * -12}px 0`}}>model: glm-5.2</div>
      </div>
      {[0, 10, 20].map((offset) => (
        <div
          key={offset}
          style={{
            position: 'absolute',
            left: returnX(offset) - 14,
            top: 454 + offset / 2,
            zIndex: 1,
            width: 28,
            height: 8,
            borderRadius: 99,
            background: COLOR.semantic.success,
            opacity: focusWindow(frame - offset, 500, 632) * packetClearance(returnX(offset)),
          }}
        />
      ))}
      <div
        style={{
          ...SURFACE.code,
          position: 'absolute',
          left: 340,
          right: 340,
          top: 740,
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: 24,
          padding: '22px 28px',
          opacity: response,
          translate: `0 ${(1 - response) * 18}px`,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}><EvidenceIcon name="check" size={30} tone={COLOR.text.success} /><span style={{...TYPE.codeSmall, color: COLOR.text.brand}}>content_block_delta</span></div>
        <div style={{color: COLOR.stroke.strong, fontSize: 28}}>→</div>
        <div style={{...TYPE.label, fontWeight: WEIGHT.regular, color: COLOR.text.primary}}>终端显示答案与工具调用</div>
      </div>
    </AbsoluteFill>
  );
};

const OneMillionContextScene: React.FC = () => {
  const frame = useCurrentFrame();
  const docOut = interpolate(frame, [seconds(13), seconds(13.3)], [1, 0], {
    easing: EASE.exit,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const diagramIn = enterAt(frame, seconds(13.4), MOTION.structural);
  const recognize = motionProgress(frame, seconds(16), MOTION.structural, EASE.enter);
  const capacity = motionProgress(frame, seconds(17), MOTION.expressive, EASE.editorial);
  const peel = motionProgress(frame, seconds(18.4), MOTION.expressive, EASE.editorial);
  const suffixAbsorb = motionProgress(frame, seconds(19), MOTION.productive, EASE.exit);
  const requestIn = motionProgress(frame, seconds(20.2), MOTION.structural, EASE.enter);
  const strip = enterAt(frame, seconds(22), MOTION.structural);
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
      <SceneHeading title="中括号一 m 会被谁看到？" align="center" />
        <div
          style={{
            marginTop: 78,
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: '1fr 300px 1fr',
            gap: 30,
            alignItems: 'center',
          }}
        >
          <div style={{...SURFACE.editorial, position: 'relative', padding: '34px 26px', minHeight: 176, boxSizing: 'border-box'}}>
            <div style={{...TYPE.labelSmall, color: COLOR.text.secondary}}>Claude Code 配置</div>
            <div style={{...TYPE.subheading, fontFamily: FONT.mono, marginTop: 20, display: 'flex', alignItems: 'center'}}>
              <span>glm-5.2</span>
              <span
                style={{
                  color: COLOR.text.brand,
                  marginLeft: 2,
                  padding: recognize > 0 ? '2px 6px' : '2px 0',
                  borderRadius: 7,
                  background: `rgba(217,119,87,${recognize * 0.13})`,
                  opacity: 1 - peel,
                }}
              >
                [1m]
              </span>
            </div>
            <div style={{...TYPE.labelSmall, color: COLOR.text.secondary, marginTop: 16}}>选择 1M 上下文模式</div>
          </div>
          <div
            style={{
              ...SURFACE.editorial,
              position: 'relative',
              minHeight: 176,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '50%',
                bottom: 20,
                width: 72 * capacity,
                height: 3,
                translate: '-50% 0',
                background: COLOR.semantic.provider,
              }}
            />
            <div style={{textAlign: 'center'}}>
              <div style={{...TYPE.labelSmall, color: COLOR.text.tertiary}}>Claude Code 识别</div>
              <div style={{...TYPE.subheading, marginTop: 12, color: COLOR.text.brand, opacity: capacity}}>1M 上下文</div>
              <div style={{...TYPE.labelSmall, marginTop: 8, color: COLOR.text.secondary, opacity: requestIn}}>请求前移除后缀</div>
            </div>
          </div>
          <div style={{...SURFACE.code, position: 'relative', padding: '34px', minHeight: 176, boxSizing: 'border-box', opacity: 0.45 + requestIn * 0.55}}>
            <div style={{position: 'absolute', left: 0, top: 28, bottom: 28, width: FRAME.focusRail, background: COLOR.semantic.client, opacity: requestIn}} />
            <div style={{...TYPE.labelSmall, color: COLOR.text.secondary}}>发送给服务商</div>
            <div style={{...TYPE.code, fontSize: 30, fontWeight: WEIGHT.bold, marginTop: 20, opacity: requestIn, translate: `${(1 - requestIn) * -16}px 0`}}>{'{ "model": "glm-5.2" }'}</div>
            <div style={{...TYPE.labelSmall, color: COLOR.text.secondary, marginTop: 16}}>保留服务商原始模型 ID</div>
          </div>
          <div
            style={{
              position: 'absolute',
              left: 200 + peel * 550,
              top: 72 - Math.sin(peel * Math.PI) * 80 - peel * 25,
              zIndex: 5,
              padding: '5px 9px',
              borderRadius: 8,
              background: COLOR.surface.warning,
              ...TYPE.codeSmall,
              color: COLOR.text.brand,
              opacity: recognize * peel * (1 - suffixAbsorb),
              scale: 1 - peel * 0.08,
            }}
          >
            [1m]
          </div>
          <div style={{position: 'absolute', left: '60.8%', top: '50%', translate: '-50% -54%', color: COLOR.semantic.client, fontSize: 32, opacity: requestIn}}>→</div>
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
          {modelRule.examples.map((model, index) => (
            <div
              key={model}
              style={{
                padding: '15px 12px',
                borderTop: FRAME.hairline,
                textAlign: 'center',
                ...TYPE.codeSmall,
                color: COLOR.text.primary,
                opacity: motionProgress(frame, seconds(22) + index * MOTION.stagger, MOTION.productive, EASE.enter),
                translate: `0 ${(1 - motionProgress(frame, seconds(22) + index * MOTION.stagger, MOTION.productive, EASE.enter)) * 10}px`,
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
  frameDirectory: string;
  frameCount: number;
  sourceDuration: number;
  playbackRate?: number;
  holdImage?: string;
  callouts?: readonly string[];
}> = ({
  frameDirectory,
  frameCount,
  sourceDuration,
  playbackRate = 1,
  holdImage,
  callouts = [],
}) => {
  const frame = useCurrentFrame();
  const clipDuration = seconds(sourceDuration / playbackRate);
  const onHold = Boolean(holdImage) && frame >= clipDuration;
  const sourceFrame = Math.min(frameCount - 1, Math.floor(frame * playbackRate));
  const frameSource = `${frameDirectory}/f_${String(sourceFrame + 1).padStart(5, '0')}.png`;
  const calloutIn = enterAt(frame, clipDuration + 4, MOTION.structural);
  const terminalOpacity = 1 - calloutIn * 0.68;
  const calloutIcons: EvidenceIconName[] = ['check', 'route', 'permission'];
  return (
    <AbsoluteFill style={{padding: LAYOUT.terminalPadding, boxSizing: 'border-box'}}>
      <div style={{position: 'relative', width: '100%', height: '100%'}}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: terminalOpacity,
          }}
        >
          <RecordedTerminal
            src={onHold && holdImage ? holdImage : frameSource}
            title="claude-code-lab · ep01-install-first-start"
            zoom={LAYOUT.terminalEvidence.focus.zoom}
            focus="50% 50%"
          />
        </div>
        {callouts.length > 0 ? (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              translate: '-50% -50%',
              width: Math.min(1120, callouts.length * 340),
              display: 'grid',
              gridTemplateColumns: `repeat(${callouts.length}, 1fr)`,
              gap: 32,
              opacity: calloutIn,
            }}
          >
            {callouts.map((callout, index) => (
              <div
                key={callout}
                style={{
                  display: 'grid',
                  justifyItems: 'center',
                  gap: 20,
                  padding: '28px 20px',
                  background: COLOR.canvas.overlay,
                  color: COLOR.text.primary,
                  ...TYPE.label,
                  fontWeight: WEIGHT.bold,
                  textAlign: 'center',
                }}
              >
                <EvidenceIcon name={calloutIcons[index] ?? 'check'} size={42} tone={index === 0 ? COLOR.semantic.client : index === 1 ? COLOR.semantic.provider : COLOR.semantic.model} />
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
    frameDirectory="claude-code-course/terminal/ep01-install-first-start-install-clip-frames"
    frameCount={737}
    sourceDuration={24.56}
    holdImage="claude-code-course/terminal/ep01-install-first-start-install-hold.png"
    callouts={['命令入口可执行', '版本：2.1.215']}
  />
);

const ShellAuthScene: React.FC = () => (
  <TerminalEvidenceScene
    frameDirectory="claude-code-course/terminal/ep01-install-first-start-shell-clip-frames"
    frameCount={245}
    sourceDuration={8.16}
    holdImage="claude-code-course/terminal/ep01-install-first-start-shell-hold.png"
    callouts={['BASE_URL → 服务渠道', 'AUTH_TOKEN → 渠道令牌', 'MODEL → glm-5.2[1m]']}
  />
);

const SettingsScene: React.FC = () => (
  <TerminalEvidenceScene
    frameDirectory="claude-code-course/terminal/ep01-install-first-start-settings-clip-frames"
    frameCount={308}
    sourceDuration={10.26}
    holdImage="claude-code-course/terminal/ep01-install-first-start-settings-hold.png"
    callouts={['~/.claude/settings.json', '下次启动仍生效', 'chmod 600 → 仅当前用户读写']}
  />
);

const FirstStartScene: React.FC = () => (
  <TerminalEvidenceScene
    frameDirectory="claude-code-course/terminal/ep01-install-first-start-first-start-clip-frames"
    frameCount={785}
    sourceDuration={26.16}
    playbackRate={1.35}
  />
);

const TakeawayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const steps = [
    ['check', 'RESPONSE', '链路接通'],
    ['file', 'FILE', '明确对象'],
    ['shell', 'COMMAND', '现场结果'],
    ['permission', 'PERMISSION', '执行边界'],
  ] as const;
  const lineIn = motionProgress(frame, 20, 72, EASE.editorial);
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 150}}>
      <SceneHeading title={getEp01Scene('takeaway').title} align="center" />
      <div
        style={{
          position: 'absolute',
          left: 180,
          right: 180,
          top: 440,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 36,
        }}
      >
        <div style={{position: 'absolute', left: '11%', right: '11%', top: 38, height: 2, background: COLOR.stroke.soft, opacity: enterAt(frame, 16)}}>
          <div style={{position: 'absolute', inset: 0, background: COLOR.brand.blue, transformOrigin: 'left center', scale: `${lineIn} 1`}} />
        </div>
        {steps.map(([icon, label, detail], index) => {
          const itemIn = enterAt(frame, 16 + index * 18);
          const tone = index === 0 ? COLOR.text.success : COLOR.brand.blue;
          return (
            <div
              key={label}
              style={{
                position: 'relative',
                display: 'grid',
                justifyItems: 'center',
                gap: 14,
                opacity: itemIn,
                translate: `0 ${(1 - itemIn) * 16}px`,
                textAlign: 'center',
              }}
            >
              <div style={{position: 'relative', zIndex: 1, width: 76, height: 76, borderRadius: 76, background: COLOR.canvas.base, display: 'grid', placeItems: 'center'}}>
                <EvidenceIcon name={icon} size={44} tone={tone} />
              </div>
              <div style={{...TYPE.codeSmall, fontWeight: WEIGHT.bold, color: tone}}>{label}</div>
              <div style={{...TYPE.labelSmall, color: COLOR.text.secondary}}>{detail}</div>
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
      <SyncedNarrationTrack
        manifest="claude-code-course/audio/ep01-install-first-start/captions.json"
        auditPrefix="ep01-synced-caption"
      />
    </CourseLayout>
  );
};
