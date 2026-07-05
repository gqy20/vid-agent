import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, CLAMP, EASE_OUT, MONO, SANS, SERIF} from '../../theme';
import {BEATS, GUIDE_DIRECTIONS, TEAM, type TeamMember} from './assets';
import {DURATION_IN_FRAMES, SCENE_DURATION, SCENES, type SceneId} from './timeline';

const sceneOpacity = (frame: number, start: number, duration: number) => {
  const end = start + duration;
  return Math.min(
    interpolate(frame, [start, start + 16], [0, 1], CLAMP),
    interpolate(frame, [end - 18, end], [1, 0], CLAMP),
  );
};

const localFrame = (frame: number, id: SceneId) => frame - SCENES.find((scene) => scene.id === id)!.start;

const Layout: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: C.bg0, color: C.white}}>
    <AbsoluteFill
      style={{
        background:
          'linear-gradient(90deg, rgba(250,249,245,0.035) 1px, transparent 1px),' +
          'linear-gradient(0deg, rgba(250,249,245,0.035) 1px, transparent 1px)',
        backgroundSize: '64px 64px',
      }}
    />
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(circle at 22% 22%, rgba(143,189,182,0.12), transparent 32%),' +
          'radial-gradient(circle at 78% 72%, rgba(224,133,96,0.10), transparent 34%)',
      }}
    />
    {children}
  </AbsoluteFill>
);

const SceneShell: React.FC<{
  frame: number;
  id: SceneId;
  children: React.ReactNode;
}> = ({frame, id, children}) => {
  const scene = SCENES.find((item) => item.id === id)!;
  return (
    <AbsoluteFill
      style={{
        opacity: sceneOpacity(frame, scene.start, scene.durationInFrames),
        pointerEvents: 'none',
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const Kicker: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{fontFamily: MONO, fontSize: 23, color: C.terracotta, letterSpacing: 0}}>
    {children}
  </div>
);

const BigTitle: React.FC<{children: React.ReactNode; size?: number}> = ({children, size = 86}) => (
  <div
    style={{
      fontFamily: SERIF,
      fontSize: size,
      lineHeight: 1.04,
      fontWeight: 700,
      color: C.white,
    }}
  >
    {children}
  </div>
);

const Body: React.FC<{children: React.ReactNode; width?: number}> = ({children, width = 680}) => (
  <div
    style={{
      width,
      fontFamily: SANS,
      fontSize: 29,
      lineHeight: 1.48,
      color: C.dim,
    }}
  >
    {children}
  </div>
);

const CharacterPanel: React.FC<{
  member: TeamMember;
  x?: number;
  y?: number;
  scale?: number;
  delay?: number;
  frame: number;
  large?: boolean;
}> = ({member, x = 0, y = 0, scale = 1, delay = 0, frame, large = false}) => {
  const enter = interpolate(frame - delay, [0, 20], [0, 1], {...CLAMP, easing: EASE_OUT});
  const bob = Math.sin((frame + delay) / 10) * 6;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y + bob,
        width: large ? 420 : 340,
        height: large ? 520 : 430,
        borderRadius: 12,
        border: `1px solid ${member.accent}66`,
        background: 'rgba(250,249,245,0.075)',
        boxShadow: '0 30px 90px rgba(0,0,0,0.36)',
        overflow: 'hidden',
        opacity: enter,
        transform: `translateY(${interpolate(enter, [0, 1], [34, 0], CLAMP)}px) scale(${scale})`,
      }}
    >
      <Img
        src={staticFile(member.src)}
        style={{
          width: '110%',
          height: '110%',
          objectFit: 'cover',
          objectPosition: 'center top',
          transform: 'translate(-5%, -2%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: '18px 20px 20px',
          background: 'linear-gradient(180deg, transparent, rgba(12,12,12,0.88) 34%)',
        }}
      >
        <div style={{fontFamily: MONO, fontSize: 17, color: member.accent}}>{member.role}</div>
        <div style={{fontFamily: SANS, fontSize: 31, fontWeight: 700, color: C.white}}>
          {member.name}
        </div>
        <div style={{fontFamily: SANS, fontSize: 19, color: C.dim, marginTop: 4}}>
          {member.short}
        </div>
      </div>
    </div>
  );
};

const TimelineRail: React.FC<{frame: number}> = ({frame}) => {
  const progress = interpolate(frame, [0, DURATION_IN_FRAMES - 1], [0, 1], CLAMP);
  return (
    <div
      style={{
        position: 'absolute',
        left: 104,
        right: 104,
        bottom: 62,
        height: 8,
        borderRadius: 999,
        background: 'rgba(250,249,245,0.1)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${progress * 100}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${C.cyan}, ${C.terracotta})`,
        }}
      />
    </div>
  );
};

const OpenScene: React.FC<{frame: number}> = ({frame}) => {
  const lf = localFrame(frame, 'open');
  const scan = interpolate(lf, [0, SCENE_DURATION], [-18, 116], CLAMP);
  return (
    <>
      <div style={{position: 'absolute', left: 104, top: 112, width: 720}}>
        <Kicker>30S CHARACTER VIDEO</Kicker>
        <div style={{height: 30}} />
        <BigTitle>从八向图到一条完整成片</BigTitle>
        <div style={{height: 26}} />
        <Body>三个人物、五个场景、Remotion 时间线。先证明角色资产能进入真实视频结构。</Body>
      </div>
      <CharacterPanel member={TEAM[0]} x={1180} y={240} frame={lf} large />
      <div
        style={{
          position: 'absolute',
          left: 920,
          top: 254,
          width: 220,
          height: 420,
          border: `1px solid rgba(143,189,182,0.3)`,
          borderRadius: 8,
          overflow: 'hidden',
          opacity: 0.75,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: `${scan}%`,
            top: 0,
            width: 4,
            height: '100%',
            background: C.cyan,
            boxShadow: `0 0 34px ${C.cyan}`,
          }}
        />
      </div>
    </>
  );
};

const TeamScene: React.FC<{frame: number}> = ({frame}) => {
  const lf = localFrame(frame, 'team');
  return (
    <>
      <div style={{position: 'absolute', left: 104, top: 92, width: 900}}>
        <Kicker>SCENE 02 / CAST</Kicker>
        <div style={{height: 20}} />
        <BigTitle size={72}>三个人物承担三段工作</BigTitle>
      </div>
      {TEAM.map((member, index) => (
        <CharacterPanel
          key={member.id}
          member={member}
          x={220 + index * 520}
          y={294}
          frame={lf}
          delay={index * 13}
        />
      ))}
    </>
  );
};

const WorkflowScene: React.FC<{frame: number}> = ({frame}) => {
  const lf = localFrame(frame, 'workflow');
  return (
    <>
      <div style={{position: 'absolute', left: 104, top: 96}}>
        <Kicker>SCENE 03 / PIPELINE</Kicker>
        <div style={{height: 20}} />
        <BigTitle size={68}>资产进入生产线</BigTitle>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 160,
          right: 160,
          top: 360,
          display: 'grid',
          gridTemplateColumns: `repeat(${BEATS.length}, 1fr)`,
          gap: 18,
        }}
      >
        {BEATS.map((beat, index) => {
          const p = interpolate(lf - index * 16, [0, 18], [0, 1], {...CLAMP, easing: EASE_OUT});
          return (
            <div
              key={beat}
              style={{
                minHeight: 210,
                borderRadius: 10,
                padding: '24px 22px',
                background: 'rgba(250,249,245,0.075)',
                border: `1px solid ${index % 2 === 0 ? 'rgba(143,189,182,0.38)' : 'rgba(224,133,96,0.34)'}`,
                opacity: p,
                transform: `translateY(${interpolate(p, [0, 1], [22, 0], CLAMP)}px)`,
              }}
            >
              <div style={{fontFamily: MONO, fontSize: 20, color: C.dim}}>0{index + 1}</div>
              <div style={{height: 24}} />
              <div style={{fontFamily: SANS, fontSize: 34, fontWeight: 700, color: C.white}}>
                {beat}
              </div>
              <div style={{marginTop: 18, height: 6, borderRadius: 999, background: C.border}}>
                <div
                  style={{
                    width: `${Math.min(1, p * 1.1) * 100}%`,
                    height: '100%',
                    borderRadius: 999,
                    background: index < 2 ? C.cyan : index < 4 ? C.terracotta : C.warn,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <CharacterPanel member={TEAM[1]} x={118} y={650} frame={lf} scale={0.72} delay={30} />
      <CharacterPanel member={TEAM[2]} x={1450} y={650} frame={lf} scale={0.72} delay={42} />
    </>
  );
};

const DirectionScene: React.FC<{frame: number}> = ({frame}) => {
  const lf = localFrame(frame, 'direction');
  const active = Math.min(GUIDE_DIRECTIONS.length - 1, Math.floor(lf / (SCENE_DURATION / GUIDE_DIRECTIONS.length)));
  return (
    <>
      <div style={{position: 'absolute', left: 104, top: 90, width: 740}}>
        <Kicker>SCENE 04 / 8-WAY PROBE</Kicker>
        <div style={{height: 22}} />
        <BigTitle size={66}>八方向素材可以被时间线驱动</BigTitle>
        <div style={{height: 22}} />
        <Body width={600}>当前版本保留原图背景，作为生产缺口暴露：后续要加自动抠图、裁切和坏帧重生。</Body>
      </div>
      <div
        style={{
          position: 'absolute',
          right: 112,
          top: 116,
          width: 930,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
        }}
      >
        {GUIDE_DIRECTIONS.map((item, index) => (
          <div
            key={item.id}
            style={{
              height: 210,
              borderRadius: 9,
              overflow: 'hidden',
              border: index === active ? `3px solid ${C.terracotta}` : '1px solid rgba(250,249,245,0.14)',
              background: 'rgba(250,249,245,0.07)',
              opacity: index === active ? 1 : 0.56,
              transform: `scale(${index === active ? 1.04 : 1})`,
            }}
          >
            <Img
              src={staticFile(item.src)}
              style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top'}}
            />
            <div
              style={{
                position: 'absolute',
                margin: 12,
                padding: '4px 10px',
                borderRadius: 6,
                background: 'rgba(0,0,0,0.58)',
                fontFamily: MONO,
                fontSize: 18,
                color: C.white,
              }}
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

const DeliveryScene: React.FC<{frame: number}> = ({frame}) => {
  const lf = localFrame(frame, 'delivery');
  const checks = ['5 scenes', '3 characters', '30 seconds', 'Remotion render'];
  return (
    <>
      <div style={{position: 'absolute', left: 104, top: 110, width: 760}}>
        <Kicker>SCENE 05 / OUTPUT</Kicker>
        <div style={{height: 24}} />
        <BigTitle>可以继续打磨的真实底片</BigTitle>
        <div style={{height: 26}} />
        <Body>这条片已经从“角色素材实验”升级成可渲染的 30 秒多场景视频。</Body>
      </div>
      {TEAM.map((member, index) => (
        <CharacterPanel
          key={member.id}
          member={member}
          x={800 + index * 270}
          y={338 + (index === 1 ? -44 : 18)}
          frame={lf}
          delay={index * 8}
          scale={0.72}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          left: 112,
          bottom: 150,
          display: 'flex',
          gap: 16,
        }}
      >
        {checks.map((check, index) => {
          const p = interpolate(lf - 40 - index * 10, [0, 14], [0, 1], CLAMP);
          return (
            <div
              key={check}
              style={{
                padding: '18px 22px',
                borderRadius: 8,
                border: '1px solid rgba(143,189,182,0.32)',
                background: 'rgba(143,189,182,0.10)',
                opacity: p,
                fontFamily: MONO,
                fontSize: 24,
                color: C.white,
              }}
            >
              ✓ {check}
            </div>
          );
        })}
      </div>
    </>
  );
};

export const CharacterStory30: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Layout>
      <SceneShell frame={frame} id="open">
        <OpenScene frame={frame} />
      </SceneShell>
      <SceneShell frame={frame} id="team">
        <TeamScene frame={frame} />
      </SceneShell>
      <SceneShell frame={frame} id="workflow">
        <WorkflowScene frame={frame} />
      </SceneShell>
      <SceneShell frame={frame} id="direction">
        <DirectionScene frame={frame} />
      </SceneShell>
      <SceneShell frame={frame} id="delivery">
        <DeliveryScene frame={frame} />
      </SceneShell>
      <TimelineRail frame={frame} />
    </Layout>
  );
};
