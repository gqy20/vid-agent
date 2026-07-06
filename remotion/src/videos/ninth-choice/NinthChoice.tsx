import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  Video,
  spring,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {CharacterRig, type Pose} from './actors/CharacterRig';
import {ChoiceCards} from './ui/ChoiceCards';
import {BrowserFrame, PersonaCard, SimulatorSetupUI} from './ui/GkSimulatorMock';
import {FONT, P} from './palette';
import {SCENES, getSceneStart} from './timeline';
import {narrationLines, secondRunChoices} from './story';

export const NinthChoice: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: P.paper, fontFamily: FONT.sans, color: P.ink, overflow: 'hidden'}}>
      <Audio src={staticFile('ninth-choice/audio/narration.mp3')} volume={0.92} />
      <Audio src={staticFile('bgm.mp3')} volume={0.12} loop />
      <SoftTexture />
      <Sequence from={getSceneStart('table')} durationInFrames={SCENES[0].duration}><RealityTable /></Sequence>
      <Sequence from={getSceneStart('setup')} durationInFrames={SCENES[1].duration}><SimulatorSetup /></Sequence>
      <Sequence from={getSceneStart('arrival')} durationInFrames={SCENES[2].duration}><ArrivalRound /></Sequence>
      <Sequence from={getSceneStart('club')} durationInFrames={SCENES[3].duration}><ClubRound /></Sequence>
      <Sequence from={getSceneStart('pattern')} durationInFrames={SCENES[4].duration}><PatternPause /></Sequence>
      <Sequence from={getSceneStart('restart')} durationInFrames={SCENES[5].duration}><RestartRun /></Sequence>
      <Sequence from={getSceneStart('montage')} durationInFrames={SCENES[6].duration}><ChoiceMontage /></Sequence>
      <Sequence from={getSceneStart('ending')} durationInFrames={SCENES[7].duration}><EndingCard /></Sequence>
      <Sequence from={getSceneStart('final')} durationInFrames={SCENES[8].duration}><FinalTable /></Sequence>
      <Caption text={captionAt(frame)} />
    </AbsoluteFill>
  );
};

const RealityTable: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = interpolate(Math.sin(frame / 22), [-1, 1], [0.35, 0.62]);
  return (
    <SceneStage mood="night">
      <div style={{position: 'absolute', left: 150, top: 120, width: 700}}>
        <Kicker>小城 · 深夜</Kicker>
        <Title light>志愿表前，所有答案都像选择题。</Title>
        <Dialogue x={0} y={300} speaker="妈妈" line="你别只看喜欢，得看四年以后。" />
        <Dialogue x={80} y={405} speaker="林澈" line="四年以后，谁看得见？" delay={20} />
      </div>
      <div style={{position: 'absolute', left: 910, top: 600, width: 740, height: 130, borderRadius: 26, background: '#7C604D', border: `4px solid ${P.ink}`, boxShadow: '0 28px 48px rgba(36,33,29,0.24)'}} />
      <VolunteerSheet x={990} y={315} progress={Math.min(frame / 90, 1)} />
      <div style={{position: 'absolute', left: 1220, top: 220, width: 360, height: 250, borderRadius: 28, background: `rgba(115,145,160,${glow})`, filter: 'blur(38px)'}} />
      <CharacterRig character="lin" pose="sit" facing="left" x={1120} y={435} scale={1.05} />
      <CharacterRig character="mother" pose="forward" facing="left" x={1430} y={250} scale={0.9} enterAt={15} />
    </SceneStage>
  );
};

const SimulatorSetup: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 55], [0.82, 1], {extrapolateRight: 'clamp'});
  return (
    <SceneStage>
      <div style={{position: 'absolute', left: 130, top: 132, width: 580}}>
        <Kicker>gk 模拟器</Kicker>
        <Title>他以为自己在查询答案，屏幕却问他怎么行动。</Title>
      </div>
      <div style={{position: 'absolute', left: 760, top: 155, width: 980, transform: `scale(${zoom})`, transformOrigin: 'center'}}>
        <SimulatorSetupUI />
      </div>
      <CharacterRig character="lin" pose="reach" facing="right" x={510} y={520} scale={0.78} enterAt={30} />
    </SceneStage>
  );
};

const ArrivalRound: React.FC = () => {
  const frame = useCurrentFrame();
  const linX = interpolate(frame, [0, 70, 135], [270, 520, 720], {extrapolateRight: 'clamp'});
  const linPose = frame < 115 ? 'walk' : frame < 205 ? 'greet' : 'think';
  return (
    <SceneStage>
      <CampusBackdrop label="武汉大学 · 新生报到" />
      <StepTrail x={linX + 66} y={815} active={frame < 130} />
      <CharacterRig character="lin" pose={linPose} facing="right" x={linX} y={430} scale={0.82} />
      <ActionPulse x={linX + 118} y={455} active={frame > 128 && frame < 205} label="你好" />
      <CharacterRig character="shadow" pose="stand" facing="left" x={865} y={450} scale={0.54} enterAt={35} opacity={0.72} />
      <CharacterRig character="shadow" pose="stand" facing="front" x={970} y={468} scale={0.5} enterAt={48} opacity={0.66} />
      <div style={{position: 'absolute', left: 1035, top: 185, width: 650}}>
        <RoundPanel round="第 1 轮" title="入学报到" body="宿舍门被推开，室友已经开始聊天。你拖着行李箱站在门口，班级群和社团群同时弹出消息。" />
        <div style={{marginTop: 20}}>
          <ChoiceCards selected="A-0" choices={[
            {key: 'A', label: '先整理床铺', tone: 'steady'},
            {key: 'B', label: '主动打招呼', tone: 'balanced'},
            {key: 'C', label: '拉室友逛校园', tone: 'bold'},
          ]} compact />
        </div>
      </div>
      <Outcome text="床铺整理好了，室友也已经熟悉起来。他坐在干净的桌前，像一个旁观者。" at={350} />
    </SceneStage>
  );
};

const ClubRound: React.FC = () => {
  const frame = useCurrentFrame();
  const posterOpacity = interpolate(frame, [250, 390], [1, 0.35], {extrapolateRight: 'clamp'});
  return (
    <SceneStage>
      <ClubBackdrop />
      <ActionCharacter
        character="lin"
        poses={[
          {until: 110, pose: 'think'},
          {until: 210, pose: 'reach'},
          {until: 360, pose: 'greet'},
          {until: 999, pose: 'think'},
        ]}
        facing="right"
        x={780}
        y={475}
        scale={0.84}
      />
      <ActionPulse x={990} y={510} active={frame > 118 && frame < 218} label="报名" />
      <Sign x={260} y={255} label="程序设计协会" color={P.sage} opacity={posterOpacity} />
      <Sign x={1250} y={280} label="东湖骑行" color={P.blue} opacity={0.75} />
      <div style={{position: 'absolute', left: 1160, top: 168, width: 540}}>
        <RoundPanel round="第 2 轮" title="社团招新" body="学长邀请你参加训练营，室友约你去东湖，辅导员提醒下周高数摸底。你继续选择最不会错的一项。" />
        <div style={{marginTop: 20}}>
          <ChoiceCards selected="A-0" choices={[
            {key: 'A', label: '回宿舍预习', tone: 'steady'},
            {key: 'B', label: '加技术社团', tone: 'balanced'},
            {key: 'C', label: '直接报名训练营', tone: 'bold'},
          ]} compact />
        </div>
      </div>
      <Outcome text="摸底成绩不错，可训练营合影里已经有同班同学。稳，也会留下安静的代价。" at={350} />
    </SceneStage>
  );
};

const PatternPause: React.FC = () => {
  return (
    <SceneStage>
      <div style={{position: 'absolute', left: 140, top: 120, width: 680}}>
        <Kicker>模拟器暂停</Kicker>
        <Title>系统看见的不是分数，而是行动模式。</Title>
        <Dialogue x={0} y={350} speaker="妈妈" line="这样不是挺好吗？至少不乱。" />
        <Dialogue x={60} y={455} speaker="林澈" line="可这不像我想过的大学。" delay={20} />
      </div>
      <div style={{position: 'absolute', left: 860, top: 165, width: 880, height: 640, borderRadius: 32, border: `2px solid ${P.line}`, background: P.white, padding: 44}}>
        <div style={{position: 'absolute', inset: 18, borderRadius: 24, overflow: 'hidden', background: P.paper}}>
          <Video
            src={staticFile('ninth-choice/manim/action-pattern.mp4')}
            muted
            playbackRate={0.56}
            style={{width: '100%', height: '100%', objectFit: 'cover'}}
          />
        </div>
      </div>
      <CharacterRig character="lin" pose="sit" facing="right" x={650} y={575} scale={0.66} enterAt={20} />
    </SceneStage>
  );
};

const RestartRun: React.FC = () => {
  const frame = useCurrentFrame();
  const risk = frame > 260 ? 6 : interpolate(frame, [120, 260], [5, 6], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <SceneStage>
      <div style={{position: 'absolute', left: 135, top: 160, width: 610}}>
        <Kicker>重开一次</Kicker>
        <Title>他没有换学校，只是换了一种回答问题的方式。</Title>
      </div>
      <div style={{position: 'absolute', left: 780, top: 160, width: 920}}>
        <SimulatorSetupUI risk={Math.round(risk)} />
      </div>
      <div style={{position: 'absolute', left: 1060, top: 675, width: 280, height: 76, borderRadius: 24, background: P.ink, color: P.white, display: 'grid', placeItems: 'center', fontSize: 28, fontWeight: 900, boxShadow: '0 18px 34px rgba(36,33,29,0.24)'}}>
        重新模拟
      </div>
      <CharacterRig character="lin" pose="reach" facing="right" x={565} y={528} scale={0.72} enterAt={30} />
      <ActionPulse x={1288} y={714} active={frame > 95 && frame < 245} label="click" compact />
    </SceneStage>
  );
};

const ChoiceMontage: React.FC = () => {
  const frame = useCurrentFrame();
  const index = Math.min(4, Math.floor(frame / 216));
  const item = secondRunChoices[index];
  const progress = frame % 216;
  const x = interpolate(progress, [0, 90, 180], [420, 610, 760], {extrapolateRight: 'clamp'});
  return (
    <SceneStage>
      <div style={{position: 'absolute', left: 125, top: 105, width: 600}}>
        <Kicker>新的选择轨迹</Kicker>
        <Title>{['主动向前一步', '留下来听不懂', '把电脑转过去', '复盘而不是退出', '保住主线'][index]}</Title>
      </div>
      <MontageSpace index={index} />
      <StepTrail x={x + 70} y={842} active={progress < 92} />
      <ActionCharacter
        character="lin"
        poses={[
          {until: 72, pose: 'walk'},
          {until: 132, pose: index === 0 ? 'greet' : index === 2 ? 'reach' : 'forward'},
          {until: 999, pose: 'think'},
        ]}
        facing="right"
        x={x}
        y={455}
        scale={0.82}
      />
      <ActionPulse x={x + 238} y={510} active={progress > 78 && progress < 150} label={item.key} compact />
      <div style={{position: 'absolute', left: 1120, top: 190, width: 600}}>
        <ChoiceCards selected={`${item.key}-0`} choices={[
          {key: item.key, label: item.label, tone: item.key === 'C' ? 'bold' : 'balanced'},
        ]} compact />
        <div style={{marginTop: 22, borderRadius: 22, background: P.white, border: `2px solid ${P.line}`, padding: 24, fontSize: 29, lineHeight: 1.45, color: P.ink, fontWeight: 800}}>
          {item.result}
        </div>
      </div>
      <PathRail active={index} />
    </SceneStage>
  );
};

const EndingCard: React.FC = () => (
  <SceneStage>
    <div style={{position: 'absolute', left: 120, top: 155, width: 540}}>
      <Kicker>结局不是预言</Kicker>
      <Title>它只是把选择留下的痕迹，整理成一张人设卡。</Title>
    </div>
    <div style={{position: 'absolute', left: 720, top: 155, width: 1040}}>
      <PersonaCard />
    </div>
    <CharacterRig character="lin" pose="stand" facing="right" x={500} y={585} scale={0.65} enterAt={20} />
  </SceneStage>
);

const FinalTable: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <SceneStage mood="dawn">
      <div style={{position: 'absolute', left: 165, top: 165, width: 770}}>
        <Kicker>天快亮了</Kicker>
        <Title>志愿表只能写学校和专业。真正开始的，是一次次选择自己的方式。</Title>
      </div>
      <VolunteerSheet x={1010} y={250} progress={1} noteProgress={interpolate(frame, [120, 300], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
      <ActionCharacter
        character="lin"
        poses={[
          {until: 120, pose: 'reach'},
          {until: 999, pose: 'write'},
        ]}
        facing="left"
        x={725}
        y={420}
        scale={0.46}
      />
      <CharacterRig character="mother" pose="stand" facing="left" x={1460} y={332} scale={0.76} enterAt={30} opacity={0.82} />
    </SceneStage>
  );
};

const ActionCharacter: React.FC<{
  character: 'lin' | 'mother';
  poses: Array<{until: number; pose: Pose}>;
  facing: 'front' | 'left' | 'right' | 'back';
  x: number;
  y: number;
  scale?: number;
  enterAt?: number;
  opacity?: number;
}> = ({character, poses, facing, x, y, scale = 1, enterAt = 0, opacity = 1}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const localPose = poses.find((item) => frame < item.until)?.pose ?? poses[poses.length - 1]?.pose ?? 'stand';
  const shift = spring({frame: frame % 72, fps, config: {damping: 20, stiffness: 70}});
  const intentNudge = localPose === 'reach' || localPose === 'forward' || localPose === 'greet' ? interpolate(shift, [0, 1], [-8, 0]) : 0;

  return (
    <CharacterRig
      character={character}
      pose={localPose}
      facing={facing}
      x={x + intentNudge}
      y={y}
      scale={scale}
      enterAt={enterAt}
      opacity={opacity}
    />
  );
};

const SceneStage: React.FC<{children: React.ReactNode; mood?: 'day' | 'night' | 'dawn'}> = ({children, mood = 'day'}) => (
  <AbsoluteFill style={{background: mood === 'night' ? `linear-gradient(135deg, ${P.night}, #4A4B48)` : mood === 'dawn' ? `linear-gradient(135deg, #F7EFE0, #DDE7DD)` : `linear-gradient(135deg, ${P.paper}, #ECE5D9)`}}>
    <SoftTexture />
    {children}
  </AbsoluteFill>
);

const StepTrail: React.FC<{x: number; y: number; active: boolean}> = ({x, y, active}) => {
  const frame = useCurrentFrame();
  if (!active) return null;
  return (
    <>
      {Array.from({length: 4}).map((_, i) => {
        const age = (frame + i * 7) % 34;
        const fade = interpolate(age, [0, 34], [0.42, 0], {extrapolateRight: 'clamp'});
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - i * 54,
              top: y + (i % 2) * 12,
              width: 52,
              height: 15,
              borderRadius: 99,
              background: P.ink,
              opacity: fade,
              transform: `rotate(${i % 2 ? -7 : 6}deg)`,
              filter: 'blur(0.3px)',
            }}
          />
        );
      })}
    </>
  );
};

const ActionPulse: React.FC<{x: number; y: number; active: boolean; label: string; compact?: boolean}> = ({x, y, active, label, compact = false}) => {
  const frame = useCurrentFrame();
  if (!active) return null;
  const loop = frame % 42;
  const scale = interpolate(loop, [0, 20, 42], [0.7, 1, 1.08], {extrapolateRight: 'clamp'});
  const opacity = interpolate(loop, [0, 22, 42], [0.9, 1, 0.25], {extrapolateRight: 'clamp'});
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: compact ? 76 : 112,
        height: compact ? 42 : 54,
        borderRadius: 99,
        background: P.gold,
        border: `3px solid ${P.ink}`,
        color: P.ink,
        display: 'grid',
        placeItems: 'center',
        fontFamily: compact ? FONT.mono : FONT.sans,
        fontSize: compact ? 18 : 24,
        fontWeight: 950,
        opacity,
        transform: `scale(${scale})`,
        boxShadow: '0 14px 28px rgba(36,33,29,0.16)',
      }}
    >
      {label}
    </div>
  );
};

const Caption: React.FC<{text: string}> = ({text}) => (
  <div style={{position: 'absolute', left: 300, right: 300, bottom: 46, minHeight: 70, borderRadius: 20, background: 'rgba(255,253,248,0.86)', border: `1px solid ${P.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 34px', fontSize: 32, lineHeight: 1.35, color: P.ink, fontWeight: 700, boxShadow: '0 16px 34px rgba(36,33,29,0.12)'}}>
    {text}
  </div>
);

const captionAt = (frame: number) => {
  const i = Math.min(narrationLines.length - 1, Math.floor(frame / 630));
  return narrationLines[i];
};

const Kicker: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{fontSize: 25, color: P.gold, fontWeight: 950, letterSpacing: 0, marginBottom: 18}}>{children}</div>
);

const Title: React.FC<{children: React.ReactNode; light?: boolean}> = ({children, light = false}) => (
  <div style={{fontFamily: FONT.serif, fontSize: 64, lineHeight: 1.1, fontWeight: 900, color: light ? P.paper : P.ink, textShadow: light ? '0 10px 28px rgba(0,0,0,0.22)' : undefined}}>{children}</div>
);

const Dialogue: React.FC<{x: number; y: number; speaker: string; line: string; delay?: number}> = ({x, y, speaker, line, delay = 0}) => {
  const frame = useCurrentFrame();
  const visible = interpolate(frame, [delay, delay + 24], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: visible, transform: `translateY(${(1 - visible) * 12}px)`, borderRadius: 20, background: P.white, border: `2px solid ${P.line}`, padding: '18px 22px', fontSize: 28, lineHeight: 1.35, boxShadow: '0 14px 26px rgba(36,33,29,0.12)'}}>
      <b style={{color: P.clayDark}}>{speaker}：</b>{line}
    </div>
  );
};

const RoundPanel: React.FC<{round: string; title: string; body: string}> = ({round, title, body}) => (
  <div style={{borderRadius: 26, background: 'rgba(255,253,248,0.92)', border: `2px solid ${P.line}`, padding: 28, boxShadow: '0 18px 36px rgba(36,33,29,0.12)'}}>
    <div style={{fontSize: 22, color: P.sageDark, fontWeight: 900}}>{round}</div>
    <div style={{marginTop: 8, fontSize: 46, color: P.ink, fontWeight: 950}}>{title}</div>
    <div style={{marginTop: 16, fontSize: 25, lineHeight: 1.5, color: P.muted}}>{body}</div>
  </div>
);

const Outcome: React.FC<{text: string; at: number}> = ({text, at}) => {
  const frame = useCurrentFrame();
  const show = interpolate(frame, [at, at + 35], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: 140, bottom: 166, width: 620, opacity: show, transform: `translateY(${(1 - show) * 18}px)`, borderRadius: 24, background: P.ink, color: P.white, padding: 28, fontSize: 28, lineHeight: 1.45, fontWeight: 800}}>
      {text}
    </div>
  );
};

const VolunteerSheet: React.FC<{x: number; y: number; progress: number; noteProgress?: number}> = ({x, y, progress, noteProgress = 0}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 460, height: 560, borderRadius: 18, background: P.white, border: `3px solid ${P.ink}`, padding: 30, transform: 'rotate(-2deg)', boxShadow: '0 28px 42px rgba(36,33,29,0.18)'}}>
    <div style={{fontSize: 32, fontWeight: 950, color: P.ink}}>志愿表</div>
    {Array.from({length: 8}).map((_, i) => (
      <div key={i} style={{marginTop: 18, height: 28, display: 'flex', gap: 12, alignItems: 'center', opacity: progress > i / 8 ? 1 : 0.25}}>
        <span style={{fontFamily: FONT.mono, color: P.muted, width: 28}}>{i + 1}</span>
        <span style={{height: 12, borderRadius: 99, background: i === 0 ? P.sage : P.line, flex: 1}} />
      </div>
    ))}
    <div style={{position: 'absolute', left: 32, right: 32, bottom: 34, color: P.clayDark, fontSize: 24, fontWeight: 900, opacity: noteProgress}}>
      第九个志愿：别只做稳的人。
    </div>
  </div>
);

const CampusBackdrop: React.FC<{label: string}> = ({label}) => (
  <>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 250, background: '#D7C8AD'}} />
    <div style={{position: 'absolute', left: 210, top: 230, width: 540, height: 360, borderRadius: '34px 34px 0 0', background: '#D8A65E', border: `4px solid ${P.ink}`}} />
    <div style={{position: 'absolute', left: 300, top: 310, width: 110, height: 160, borderRadius: '60px 60px 0 0', background: '#684D3C'}} />
    <div style={{position: 'absolute', left: 140, top: 120, fontSize: 26, color: P.sageDark, fontWeight: 900}}>{label}</div>
  </>
);

const ClubBackdrop: React.FC = () => (
  <>
    <div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg, #F6F0E4, #DCE4D7)`}} />
    {Array.from({length: 7}).map((_, i) => (
      <div key={i} style={{position: 'absolute', left: 120 + i * 250, top: 630 + (i % 2) * 32, width: 190, height: 110, borderRadius: 18, background: i % 2 ? P.sage : P.clay, opacity: 0.38}} />
    ))}
  </>
);

const Sign: React.FC<{x: number; y: number; label: string; color: string; opacity: number}> = ({x, y, label, color, opacity}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 310, height: 180, borderRadius: 22, background: color, border: `3px solid ${P.ink}`, color: P.white, display: 'grid', placeItems: 'center', fontSize: 34, fontWeight: 950, opacity, transform: 'rotate(-3deg)'}}>{label}</div>
);

const LineGraph: React.FC<{label: string; color: string; startY: number; endY: number; delay: number; frame: number}> = ({label, color, startY, endY, delay, frame}) => {
  const progress = interpolate(frame, [delay, delay + 80], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const x1 = 80;
  const x2 = 700 * progress;
  const y2 = startY + (endY - startY) * progress;
  return (
    <>
      <svg width="790" height="520" style={{position: 'absolute', left: 44, top: 60, overflow: 'visible'}}>
        <path d={`M ${x1} ${startY} C 260 ${startY - 40}, 420 ${y2 + 60}, ${x2} ${y2}`} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" />
        <circle cx={x2} cy={y2} r={13} fill={color} />
      </svg>
      <div style={{position: 'absolute', left: 70, top: startY + 30, fontSize: 26, color, fontWeight: 900, opacity: progress}}>{label}</div>
    </>
  );
};

const MontageSpace: React.FC<{index: number}> = ({index}) => {
  const labels = ['宿舍门口', '技术社团', '项目求助', '训练赛复盘', '大三岔路'];
  return (
    <>
      <div style={{position: 'absolute', left: 230, top: 332, width: 760, height: 350, borderRadius: 32, background: P.white, border: `2px solid ${P.line}`, boxShadow: '0 22px 44px rgba(36,33,29,0.12)'}} />
      <div style={{position: 'absolute', left: 280, top: 380, fontSize: 48, color: P.ink, fontWeight: 950}}>{labels[index]}</div>
      <div style={{position: 'absolute', left: 290, top: 510, width: 460, height: 10, borderRadius: 99, background: index % 2 ? P.gold : P.sage}} />
      <CharacterRig character="shadow" pose="stand" facing="left" x={860} y={460} scale={0.58} opacity={0.72} />
    </>
  );
};

const PathRail: React.FC<{active: number}> = ({active}) => (
  <div style={{position: 'absolute', left: 260, right: 260, bottom: 160, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
    {Array.from({length: 5}).map((_, i) => (
      <div key={i} style={{display: 'flex', alignItems: 'center', flex: 1}}>
        <div style={{width: 34, height: 34, borderRadius: 99, background: i <= active ? P.gold : P.line, border: `3px solid ${P.ink}`}} />
        {i < 4 && <div style={{height: 6, flex: 1, background: i < active ? P.gold : P.line}} />}
      </div>
    ))}
  </div>
);

const SoftTexture: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none', backgroundImage: 'radial-gradient(rgba(36,33,29,0.06) 1px, transparent 1px)', backgroundSize: '28px 28px', opacity: 0.45}} />
);
