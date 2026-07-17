import {AbsoluteFill, Audio, Img, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {
  CourseLayout,
  EpisodeTitleCard,
  SceneSequence,
  TerminalPanel,
} from '../../git-course/kit';
import {TERMINAL_HEADER_HEIGHT} from '../../git-course/kit/terminal/TerminalPanel';
import {COLOR, WEIGHT} from '../../git-course/palette';
import {FONT, TYPE} from '../typography';
import {seconds} from '../timeline';
import episode from '../../../../../claude-code-course/episodes/ep01-agentic-loop.json';
export {EP01_DURATION_IN_FRAMES, EP01_SCENES} from '../data/episodeTimelines.generated';
import {EP01_DURATION_IN_FRAMES, EP01_SCENES} from '../data/episodeTimelines.generated';

// ponytail: 录屏元数据直接内联（单集单文件，无生成器）；holdFromFrame 与 timeline FPS 一致(均 30)，可直接作本地帧阈值。
const RECORDING_HOLD_FROM_FRAME = 2818;
const RECORDING_FRAME_COUNT = 2878;

// ponytail: Remotion 4.0.484 native compositor 在 seek 本录屏 mp4 46s+ 时反复 SIGTERM
// （swiftshader headless 环境，非文件损坏——ffmpeg 全解码零错）。
// 绕过 <OffthreadVideo>/compositor：预抽 PNG 帧序列，按帧 <Img>。视觉效果等价 RecordedTerminalPanel。
const pad5 = (n: number) => String(n).padStart(5, '0');

type Ep01SceneId = (typeof EP01_SCENES)[number]['id'];

const getEp01SceneStart = (id: Ep01SceneId) => {
  let cursor = 0;
  for (const scene of EP01_SCENES) {
    if (scene.id === id) return cursor;
    cursor += scene.duration;
  }
  throw new Error(`Unknown EP01 scene: ${id}`);
};

const getEp01SceneDuration = (id: Ep01SceneId) => {
  const scene = EP01_SCENES.find((item) => item.id === id);
  if (!scene) throw new Error(`Unknown EP01 scene: ${id}`);
  return scene.duration;
};

// ponytail: 浅色字 + 半透明深底条，压在深色录屏/标题卡上都可读；去 textShadow（有底条不需要）。
const captionBar = {
  fontFamily: FONT.sans,
  fontSize: 32,
  fontWeight: WEIGHT.bold,
  color: COLOR.text.inverse,
  background: 'rgba(20,23,41,0.82)',
  padding: '12px 26px',
  borderRadius: 10,
  textAlign: 'center' as const,
  whiteSpace: 'nowrap' as const,
};

type NarrationCue = {
  segmentId: string;
  voiceStart: number;
  durationSeconds: number;
  text: string;
  subtitle: string;
};

const NARRATION_CUES = episode.scenes.flatMap((scene) => scene.narration) as NarrationCue[];

const NarrationTrack: React.FC = () => {
  const frame = useCurrentFrame();
  const now = frame / 30;
  const cue = NARRATION_CUES.find(
    (item) => now >= item.voiceStart && now < item.voiceStart + item.durationSeconds,
  );
  const cueOpacity = cue
    ? interpolate(
        now - cue.voiceStart,
        [0, 0.18, Math.max(0.2, cue.durationSeconds - 0.18), cue.durationSeconds],
        [0, 1, 1, 0],
        {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
      )
    : 0;
  const tokenSafetyCallout = cue?.segmentId === '04-real-token';
  return (
    <>
      {NARRATION_CUES.map((item) => (
        <Sequence
          key={item.segmentId}
          from={seconds(item.voiceStart)}
          durationInFrames={seconds(item.durationSeconds + 0.1)}
        >
          <Audio
            src={staticFile(`claude-code-course/audio/ep01-agentic-loop/${item.segmentId}_norm.mp3`)}
          />
        </Sequence>
      ))}
      {cue ? (
        <div
          data-audit-id={`ep01-subtitle-${cue.segmentId}`}
          style={{
            position: 'absolute',
            zIndex: 80,
            left: tokenSafetyCallout ? undefined : '50%',
            right: tokenSafetyCallout ? 64 : undefined,
            top: tokenSafetyCallout ? 570 : undefined,
            bottom: tokenSafetyCallout ? undefined : 30,
            width: tokenSafetyCallout ? 820 : 1420,
            transform: tokenSafetyCallout ? undefined : 'translateX(-50%)',
            opacity: cueOpacity,
            color: COLOR.text.inverse,
            background: 'rgba(20,23,41,0.88)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10,
            padding: '12px 24px 13px',
            boxSizing: 'border-box',
            textAlign: 'center',
            fontFamily: FONT.sans,
            fontSize: 30,
            lineHeight: 1.4,
            fontWeight: WEIGHT.bold,
          }}
        >
          {cue.subtitle}
        </div>
      ) : null}
    </>
  );
};

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const titleIn = interpolate(frame, [0, seconds(0.6)], [0, 1], {extrapolateRight: 'clamp'});
  const titleOut = interpolate(frame, [seconds(6), seconds(6.8)], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const question = interpolate(frame, [seconds(2.4), seconds(3.4)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{padding: '154px 154px 112px', boxSizing: 'border-box'}}>
      <EpisodeTitleCard
        index="1."
        keyword="Claude Code"
        suffix="从零安装"
        opacity={titleIn * titleOut}
        translateY={interpolate(titleIn, [0, 1], [18, -44], {extrapolateRight: 'clamp'})}
        keywordOpacity={0.5 + titleIn * 0.5}
        keywordTranslateY={interpolate(titleIn, [0, 1], [8, 0], {extrapolateRight: 'clamp'})}
        underlineScale={interpolate(frame, [seconds(0.6), seconds(1.3)], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })}
        underlineOpacity={titleOut * 0.82}
        auditId="ep01-hook-title"
      />
      <div
        data-audit-id="ep01-hook-question"
        style={{
          ...captionBar,
          position: 'absolute',
          left: '50%',
          bottom: 132,
          transform: `translate(-50%, ${interpolate(question, [0, 1], [16, 0])}px)`,
          opacity: question,
        }}
      >
        中国用户怎么装上、跑通？
      </div>
    </AbsoluteFill>
  );
};

const InstallScene: React.FC = () => {
  const frame = useCurrentFrame();
  // 本地帧 N → PNG 第 N+1 帧（录屏从 scene 起点播，帧号对齐）；超过 holdFromFrame 用 hold PNG。
  const recordingFrame = Math.min(frame, RECORDING_FRAME_COUNT - 1);
  const onHold = frame >= RECORDING_HOLD_FROM_FRAME;
  const frameSrc = onHold
    ? staticFile('claude-code-course/terminal/ep01-agentic-loop-hold.png')
    : staticFile(`claude-code-course/terminal/ep01-frames/f_${pad5(recordingFrame + 1)}.png`);
  const mediaStyle = {
    width: '100%',
    height: `calc(100% - ${TERMINAL_HEADER_HEIGHT}px)`,
    objectFit: 'cover' as const,
    objectPosition: 'top' as const,
    display: 'block' as const,
  };

  return (
    <AbsoluteFill data-audit-id="ep01-install-recording">
      <TerminalPanel title="claude-code">
        <Img src={frameSrc} style={mediaStyle} />
      </TerminalPanel>
    </AbsoluteFill>
  );
};

const TakeawayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const bullets = ['install.sh 一条命令', '智谱端点 BASE_URL + TOKEN', 'claude 启动即用'];
  const question = interpolate(frame, [seconds(4.4), seconds(5.4)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{padding: '138px 150px 126px', boxSizing: 'border-box'}}>
      <div style={{...TYPE.hero, fontWeight: WEIGHT.bold, textAlign: 'center', width: '100%'}}>
        装好 Claude Code 的三件事
      </div>
      <div
        style={{
          position: 'absolute',
          left: 220,
          right: 220,
          top: 360,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 34,
        }}
      >
        {bullets.map((line, idx) => {
          const item = interpolate(frame, [seconds(0.6 + idx * 1.4), seconds(1.6 + idx * 1.4)], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <div
              key={line}
              style={{
                ...TYPE.ui,
                fontSize: 34,
                fontWeight: WEIGHT.bold,
                color: COLOR.text.primary,
                opacity: item,
                transform: `translateY(${interpolate(item, [0, 1], [16, 0])}px)`,
                textAlign: 'center',
                padding: '28px 22px',
                borderRadius: 10,
                border: `2px solid ${COLOR.stroke.default}`,
                background: COLOR.canvas.raised,
                fontFamily: idx === 2 ? FONT.sans : FONT.mono,
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 12,
                  height: 12,
                  marginRight: 10,
                  borderRadius: 999,
                  background: idx === 0 ? COLOR.git.main : idx === 1 ? COLOR.git.feature : COLOR.git.head,
                  verticalAlign: 1,
                }}
              />
              {line}
            </div>
          );
        })}
      </div>
      <div
        data-audit-id="ep01-takeaway-question"
        style={{
          ...captionBar,
          position: 'absolute',
          left: '50%',
          bottom: 132,
          transform: `translate(-50%, ${interpolate(question, [0, 1], [18, 0])}px)`,
          opacity: question,
        }}
      >
        下一步：怎么让 Claude Code 真正替你干活？
      </div>
    </AbsoluteFill>
  );
};

export const Ep01Install: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <CourseLayout
      seriesTitle="Claude Code 实操"
      episodeTitle="从零装 Claude Code"
      scenes={EP01_SCENES}
      currentFrame={frame}
      showHeader={(current) => current >= getEp01SceneStart('takeaway')}
      showEpisodeTitle={(current) => current >= getEp01SceneStart('takeaway')}
    >
      <SceneSequence from={getEp01SceneStart('hook')} durationInFrames={getEp01SceneDuration('hook')}>
        <HookScene />
      </SceneSequence>
      <SceneSequence from={getEp01SceneStart('install')} durationInFrames={getEp01SceneDuration('install')}>
        <InstallScene />
      </SceneSequence>
      <SceneSequence from={getEp01SceneStart('takeaway')} durationInFrames={getEp01SceneDuration('takeaway')}>
        <TakeawayScene />
      </SceneSequence>
      <NarrationTrack />
    </CourseLayout>
  );
};
