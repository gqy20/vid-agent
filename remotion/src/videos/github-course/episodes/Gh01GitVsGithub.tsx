import {createContext, useContext} from 'react';
import {AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {GH01} from '../data/episodes';
import {
  BrowserEvidenceScene,
  BrowserFocusScene,
  GitHubCourseLayout,
  GitHubMark,
  GitHubNarrationSubtitle,
  GitHubPlatformGlyph,
  GitHubStateBridge,
  GitMark,
  PlatformStateLegend,
  type GitHubNarrationCue,
} from '../kit';
import {COLOR, FONT, WEIGHT} from '../palette';
import {RADIUS, SPACE} from '../spacing';
import {seconds} from '../timeline';
import {TYPE} from '../typography';

const SCENES = GH01.scenes.map((scene) => ({
  ...scene,
  from: seconds(scene.start),
  durationInFrames: seconds(scene.duration),
}));

export const GH01_DURATION_IN_FRAMES = seconds(GH01.durationSeconds);

const RECORDING_DECLARATION = GH01.browserRecordings[0];
const ITERATION_RECORDING = {
  id: RECORDING_DECLARATION.id,
  src: RECORDING_DECLARATION.src,
  poster: RECORDING_DECLARATION.poster,
  metadata: RECORDING_DECLARATION.metadata,
  url: 'github.com/github/docs',
  title: 'GITHUB-HOSTED REPOSITORY',
};

const DELIVERY_RECORDING = {
  ...ITERATION_RECORDING,
  src: RECORDING_DECLARATION.delivery.src,
  poster: RECORDING_DECLARATION.delivery.poster,
  metadata: RECORDING_DECLARATION.delivery.metadata,
};

type Gh01RenderProfile = 'hd30' | 'uhd30';

const BrowserRecordingContext = createContext(ITERATION_RECORDING);
const useGh01BrowserRecording = () => useContext(BrowserRecordingContext);

const BROWSER_DEMO_PLAYBACK_RATE = 1.15;
const BROWSER_DEMO_HOLD_SECONDS = 12;

const enter = (frame: number, start = 0, duration = 18) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

const GitHistoryRail: React.FC<{progress: number; width?: number}> = ({progress, width = 720}) => {
  const commits = [92, 360, 628] as const;
  return (
    <svg width={width} height={220} viewBox="0 0 720 220" aria-label="Git commit history" style={{display: 'block', maxWidth: '100%'}}>
      <line
        x1={92}
        y1={110}
        x2={628}
        y2={110}
        pathLength={1}
        stroke={COLOR.git.graphLine}
        strokeWidth={4}
        strokeDasharray={1}
        strokeDashoffset={1 - progress}
      />
      {commits.map((x, index) => {
        const nodeIn = interpolate(progress, [index * 0.28, index * 0.28 + 0.2], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <g key={x} opacity={nodeIn}>
            <circle cx={x} cy={110} r={34} fill={COLOR.canvas.raised} stroke={COLOR.git.commit} strokeWidth={4} />
            <text
              x={x}
              y={118}
              fill={COLOR.text.primary}
              textAnchor="middle"
              fontFamily={FONT.mono}
              fontSize={TYPE.uiSmall.fontSize}
              fontWeight={WEIGHT.medium}
            >
              C{index}
            </text>
            {index === 2 ? (
              <g>
                <rect x={x - 45} y={18} width={90} height={38} rx={RADIUS.small} fill={COLOR.git.main} />
                <text
                  x={x}
                  y={44}
                  fill={COLOR.text.inverse}
                  textAnchor="middle"
                  fontFamily={FONT.mono}
                  fontSize={TYPE.uiSmall.fontSize}
                  fontWeight={WEIGHT.medium}
                >
                  main
                </text>
                <line x1={x} y1={56} x2={x} y2={76} stroke={COLOR.git.main} strokeWidth={4} strokeLinecap="round" />
              </g>
            ) : null}
          </g>
        );
      })}
      <text x={92} y={188} fill={COLOR.text.tertiary} textAnchor="middle" fontFamily={FONT.mono} fontSize={TYPE.uiSmall.fontSize}>objects</text>
      <text x={360} y={188} fill={COLOR.text.tertiary} textAnchor="middle" fontFamily={FONT.mono} fontSize={TYPE.uiSmall.fontSize}>commits</text>
      <text x={628} y={188} fill={COLOR.text.tertiary} textAnchor="middle" fontFamily={FONT.mono} fontSize={TYPE.uiSmall.fontSize}>refs</text>
    </svg>
  );
};

const COLLABORATION_ITEMS = [
  {title: 'Repository', glyph: null},
  {title: 'Pull Request', glyph: 'pull-request' as const},
  {title: 'Review', glyph: 'review' as const},
  {title: 'Checks', glyph: 'actions' as const},
] as const;

const COLLABORATION_NODE_SIZE = 72;
const COLLABORATION_GLYPH_SIZE = 36;
const COLLABORATION_CONNECTOR_GAP = 12;
const COLLABORATION_CONNECTOR_OFFSET = COLLABORATION_NODE_SIZE / 2 + COLLABORATION_CONNECTOR_GAP;

const CollaborationRail: React.FC<{progress: number; width?: number}> = ({progress, width = 720}) => (
  <div style={{position: 'relative', width, maxWidth: '100%', height: 220}} aria-label="GitHub collaboration workflow">
    {[0, 1, 2].map((index) => {
      const connectorProgress = interpolate(progress, [index / 3, (index + 1) / 3], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      return (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: `calc(${12.5 + index * 25}% + ${COLLABORATION_CONNECTOR_OFFSET}px)`,
            top: 111,
            width: `calc(25% - ${COLLABORATION_CONNECTOR_OFFSET * 2}px)`,
            height: 3,
            borderRadius: 999,
            background: COLOR.stroke.soft,
            overflow: 'hidden',
          }}
        >
          <div style={{height: '100%', width: `${connectorProgress * 100}%`, borderRadius: 999, background: COLOR.github.action}} />
        </div>
      );
    })}
    <div style={{position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)'}}>
      {COLLABORATION_ITEMS.map((item, index) => {
        const itemIn = interpolate(progress, [index * 0.22, index * 0.22 + 0.2], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const isAction = index === 1;
        return (
          <div key={item.title} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: itemIn}}>
            <div style={{...TYPE.uiSmall, color: isAction ? COLOR.github.action : COLOR.text.secondary, textAlign: 'center', minHeight: 52}}>{item.title}</div>
            <div
              style={{
                width: COLLABORATION_NODE_SIZE,
                height: COLLABORATION_NODE_SIZE,
                boxSizing: 'border-box',
                marginTop: SPACE.lg,
                borderRadius: 999,
                display: 'grid',
                placeItems: 'center',
                flex: '0 0 auto',
                border: `3px solid ${isAction ? COLOR.github.action : COLOR.stroke.strong}`,
                background: isAction ? COLOR.effects.actionWash : COLOR.canvas.raised,
                color: isAction ? COLOR.github.action : COLOR.text.primary,
              }}
            >
              {item.glyph ? <GitHubPlatformGlyph name={item.glyph} size={COLLABORATION_GLYPH_SIZE} /> : <GitHubMark size={COLLABORATION_GLYPH_SIZE} />}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const gitIn = enter(frame, seconds(0.3), 16);
  const githubIn = enter(frame, seconds(0.7), 16);
  const assumedSameIn = enter(frame, seconds(1.45), 16);
  const browserHypothesisIn = enter(frame, seconds(3.35), 20);
  const offlineIn = enter(frame, seconds(5.45), 18);
  const commitIn = enter(frame, seconds(6.65), 18);
  const questionIn = enter(frame, seconds(7.65), 14);

  return (
    <AbsoluteFill style={{padding: '142px 168px 154px', boxSizing: 'border-box'}}>
      <div data-audit-id="gh01-hook-comparison" style={{position: 'relative', height: 710}}>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 180px 1fr', alignItems: 'center', height: 320}}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: SPACE.xl,
              opacity: gitIn,
              translate: `${(1 - gitIn) * -24}px 0`,
            }}
          >
            <GitMark size={82} />
            <div style={TYPE.display}>Git</div>
          </div>

          <div style={{position: 'relative', height: 130, display: 'grid', placeItems: 'center'}}>
            <div style={{...TYPE.display, position: 'absolute', color: COLOR.text.tertiary, opacity: assumedSameIn * (1 - questionIn)}}>=</div>
            <div style={{...TYPE.display, position: 'absolute', color: COLOR.text.primary, opacity: questionIn, scale: 0.94 + questionIn * 0.06}}>?</div>
          </div>

          <div
            style={{
              position: 'relative',
              height: 248,
              display: 'grid',
              placeItems: 'center',
              opacity: githubIn,
              translate: `${(1 - githubIn) * 24}px 0`,
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                border: `1px solid ${COLOR.stroke.default}`,
                borderRadius: RADIUS.panel,
                background: COLOR.canvas.raised,
                boxShadow: `0 16px 42px ${COLOR.effects.shadowSoft}`,
                opacity: browserHypothesisIn,
                scale: 0.97 + browserHypothesisIn * 0.03,
              }}
            >
              <div style={{height: 42, borderBottom: `1px solid ${COLOR.stroke.soft}`, display: 'flex', alignItems: 'center', gap: SPACE.sm, padding: `0 ${SPACE.lg}px`}}>
                {[0, 1, 2].map((dot) => <div key={dot} style={{width: 9, height: 9, borderRadius: 999, background: COLOR.stroke.strong}} />)}
              </div>
            </div>
            <div style={{position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: SPACE.xl}}>
              <GitHubMark size={82} />
              <div style={TYPE.display}>GitHub</div>
            </div>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            left: 430,
            right: 430,
            top: 372,
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            gap: SPACE.lg,
            opacity: offlineIn,
          }}
        >
          <div style={{height: 2, background: COLOR.stroke.strong, transformOrigin: 'right center', scale: `${offlineIn} 1`}} />
          <div style={{...TYPE.code, color: COLOR.text.secondary}}>offline</div>
          <div style={{height: 2, background: COLOR.stroke.strong, transformOrigin: 'left center', scale: `${offlineIn} 1`}} />
          <div style={{position: 'absolute', left: '50%', top: -4, width: 2, height: 50, background: COLOR.text.secondary, rotate: '38deg', opacity: offlineIn}} />
        </div>

        <div
          style={{
            position: 'absolute',
            left: 214,
            top: 492,
            display: 'flex',
            alignItems: 'center',
            gap: SPACE.lg,
            padding: `${SPACE.md}px ${SPACE.xl}px`,
            border: `1px solid ${COLOR.stroke.default}`,
            borderRadius: RADIUS.panel,
            background: COLOR.canvas.raised,
            boxShadow: `0 12px 32px ${COLOR.effects.shadowSoft}`,
            opacity: commitIn,
            translate: `0 ${(1 - commitIn) * 18}px`,
          }}
        >
          <div style={{...TYPE.code, color: COLOR.text.primary}}>git commit</div>
          <div style={{...TYPE.ui, color: COLOR.git.main}}>✓</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const LocalGitScene: React.FC = () => {
  const frame = useCurrentFrame();
  const questionIn = enter(frame, seconds(2.8), 18);
  const answerIn = enter(frame, seconds(17.35), 20);
  const repositoryShellIn = enter(frame, seconds(1.3), 20);
  const repositoryContentIn = enter(frame, seconds(4.95), 24);
  const graphIn = enter(frame, seconds(9.15), 70);
  const localCommandsIn = enter(frame, seconds(13.65), 22);
  const remoteCommandsIn = enter(frame, seconds(18.7), 22);

  return (
    <AbsoluteFill style={{padding: '122px 154px 150px', boxSizing: 'border-box'}}>
      <div style={{position: 'relative', height: 74}}>
        <div style={{...TYPE.hero, position: 'absolute', opacity: questionIn * (1 - answerIn), translate: `${(1 - questionIn) * -20}px 0`}}>
          <span style={{fontFamily: FONT.mono}}>git commit</span> → ?
        </div>
        <div style={{...TYPE.hero, position: 'absolute', opacity: answerIn, translate: `${(1 - answerIn) * -20}px 0`}}>完整历史就在本地</div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '450px 1fr', gap: 80, alignItems: 'center', marginTop: 70}}>
        <div
          data-audit-id="gh01-local-repository"
          style={{
            position: 'relative',
            minHeight: 390,
            padding: `${SPACE.xxl}px ${SPACE.xl}px`,
            boxSizing: 'border-box',
            border: `1px solid ${COLOR.stroke.default}`,
            borderRadius: RADIUS.panel,
            background: COLOR.canvas.raised,
            boxShadow: `0 16px 42px ${COLOR.effects.shadowSoft}`,
            overflow: 'hidden',
            opacity: repositoryShellIn,
            scale: 0.96 + repositoryShellIn * 0.04,
          }}
        >
          <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', opacity: repositoryShellIn * (1 - repositoryContentIn)}}>
            <div style={{display: 'flex', alignItems: 'center', gap: SPACE.lg}}>
              <GitMark size={54} />
              <div style={{...TYPE.title, color: COLOR.text.primary}}>本地仓库</div>
            </div>
          </div>
          <div style={{opacity: repositoryContentIn}}>
            <div style={{...TYPE.title, fontFamily: FONT.mono, color: COLOR.git.main}}>.git/</div>
          </div>
          <div style={{marginTop: SPACE.xl, opacity: repositoryContentIn}}>
            {[
              ['objects/', '内容与提交对象'],
              ['refs/', 'branch 与 tag 指针'],
              ['HEAD', '当前所在位置'],
              ['index', '下一次提交的内容'],
            ].map(([name, detail], index) => {
              const rowIn = enter(frame, seconds(5.2) + index * 16, 14);
              return (
                <div key={name} style={{display: 'grid', gridTemplateColumns: '118px 1fr', gap: SPACE.sm, padding: `${SPACE.md}px 0`, borderBottom: `1px solid ${COLOR.stroke.soft}`, opacity: rowIn, translate: `${(1 - rowIn) * -12}px 0`}}>
                  <div style={{...TYPE.code, color: COLOR.text.primary}}>{name}</div>
                  <div style={{...TYPE.ui, color: COLOR.text.secondary}}>{detail}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{opacity: graphIn}}>
          <GitHistoryRail progress={graphIn} width={1000} />
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '180px 1fr', rowGap: SPACE.lg, alignItems: 'center', marginTop: 60}}>
        <div style={{...TYPE.ui, color: COLOR.git.main, opacity: localCommandsIn}}>本地读写</div>
        <div style={{...TYPE.code, color: COLOR.text.primary, opacity: localCommandsIn}}>git commit　·　git branch　·　git log　·　git diff　　<span style={{color: COLOR.git.main}}>offline ✓</span></div>
        <div style={{...TYPE.ui, color: COLOR.github.action, opacity: remoteCommandsIn}}>连接远端</div>
        <div style={{...TYPE.code, color: COLOR.text.primary, opacity: remoteCommandsIn}}>git fetch　·　git pull　·　git push</div>
      </div>
    </AbsoluteFill>
  );
};

const BrowserRepositoryScene: React.FC = () => {
  const recording = useGh01BrowserRecording();
  // UHD delivery composites the native 4K browser video after the Remotion
  // pass. Rendering the 4K MP4 through OffthreadVideo caused long-running
  // per-frame seek stalls; the poster keeps chrome, subtitles and geometry
  // deterministic for the lossless orchestrated overlay step.
  const remotionRecording = recording.src?.includes('/uhd30/') ? {...recording, src: undefined} : recording;
  return (
    <BrowserFocusScene
      recording={remotionRecording}
      playbackRate={BROWSER_DEMO_PLAYBACK_RATE}
      holdFromFrame={seconds(BROWSER_DEMO_HOLD_SECONDS)}
    />
  );
};

const PlatformLayerScene: React.FC = () => {
  const frame = useCurrentFrame();
  const recording = useGh01BrowserRecording();
  const browserOpacity = interpolate(frame, [0, 118, 134], [1, 1, 0], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const browserSettle = interpolate(frame, [112, 134], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const modelIn = enter(frame, 140, 20);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: browserOpacity,
          scale: 1 - browserSettle * 0.015,
          translate: `0 ${browserSettle * -8}px`,
        }}
      >
        <BrowserEvidenceScene recording={recording} highlightIds={['collaboration-navigation']} />
      </div>

      <AbsoluteFill style={{padding: '118px 150px 150px', boxSizing: 'border-box', opacity: modelIn}}>
        <div style={{marginTop: 102}}>
          <PlatformStateLegend revealFromFrame={144} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const StateBridgeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const firstExampleIn = enter(frame, 24, 18);
  const firstExampleOut = interpolate(frame, [390, 420], [1, 0], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 146, right: 146, top: 304, opacity: firstExampleIn * firstExampleOut}}>
        <GitHubStateBridge
          browser={{title: '打开 Pull requests', accent: 'action'}}
          platform={{title: '展示 Pull Request 列表'}}
          git={{title: 'objects / refs 不变'}}
          auditId="gh01-state-bridge"
        />
      </div>
      <Sequence from={420} premountFor={seconds(1)}>
        <div style={{position: 'absolute', left: 146, right: 146, top: 304}}>
          <GitHubStateBridge
            browser={{title: '点击 Merge', accent: 'action'}}
            platform={{title: 'Pull Request 已合并', accent: 'merged'}}
            git={{title: 'GitHub 上 main 前进', accent: 'git'}}
            auditId="gh01-merge-state-bridge"
          />
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};

const TakeawayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const modelsIn = enter(frame, 34, 58);
  const connectionIn = enter(frame, 102, 26);

  return (
    <AbsoluteFill style={{padding: '126px 150px 150px', boxSizing: 'border-box'}}>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 92, marginTop: 146, opacity: modelsIn}}>
        <div style={{textAlign: 'center'}}>
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: SPACE.lg}}>
            <GitMark size={52} />
            <div style={TYPE.title}>Git</div>
          </div>
          <div style={{marginTop: SPACE.xxl}}><GitHistoryRail progress={modelsIn} width={680} /></div>
        </div>

        <div style={{textAlign: 'center'}}>
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: SPACE.lg}}>
            <GitHubMark size={52} />
            <div style={TYPE.title}>GitHub</div>
          </div>
          <div style={{marginTop: SPACE.xxl}}><CollaborationRail progress={modelsIn} width={680} /></div>
        </div>
      </div>

      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: SPACE.lg, marginTop: 48, opacity: connectionIn}}>
        <div style={{width: 280, height: 2, background: COLOR.stroke.default}} />
        <div style={{...TYPE.code, color: COLOR.text.secondary}}>remote　·　fetch　·　push</div>
        <div style={{width: 280, height: 2, background: COLOR.stroke.default}} />
      </div>
    </AbsoluteFill>
  );
};

const SCENE_COMPONENTS = [HookScene, LocalGitScene, BrowserRepositoryScene, PlatformLayerScene, StateBridgeScene, TakeawayScene] as const;

export const Gh01GitVsGithub: React.FC<{
  subtitleCues?: readonly GitHubNarrationCue[];
  renderProfile?: Gh01RenderProfile;
}> = ({subtitleCues = [], renderProfile = 'hd30'}) => {
  const frame = useCurrentFrame();
  const recording = renderProfile === 'uhd30' ? DELIVERY_RECORDING : ITERATION_RECORDING;
  return (
    <BrowserRecordingContext.Provider value={recording}>
      <GitHubCourseLayout
        episodeTitle={GH01.title}
        currentFrame={frame}
        durationInFrames={GH01_DURATION_IN_FRAMES}
        showHeader={false}
        showProgress={false}
      >
        {SCENES.map((scene, index) => {
          const Scene = SCENE_COMPONENTS[index];
          return (
            <Sequence key={scene.id} from={scene.from} durationInFrames={scene.durationInFrames} premountFor={seconds(1)}>
              <Scene />
            </Sequence>
          );
        })}
        <GitHubNarrationSubtitle frame={frame} cues={subtitleCues} />
      </GitHubCourseLayout>
    </BrowserRecordingContext.Provider>
  );
};
