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
  const titleIn = enter(frame, 4, 18);
  const rolesIn = enter(frame, 34, 28);
  const modelsIn = enter(frame, 58, 54);

  return (
    <AbsoluteFill style={{padding: '126px 150px 154px', boxSizing: 'border-box'}}>
      <div
        data-audit-id="gh01-hook-comparison"
        style={{
          ...TYPE.display,
          textAlign: 'center',
          opacity: titleIn,
          translate: `0 ${(1 - titleIn) * 18}px`,
        }}
      >
        Git <span style={{color: COLOR.text.tertiary}}>≠</span> GitHub
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', marginTop: SPACE.huge, opacity: rolesIn}}>
        <div style={{paddingRight: 78}}>
          <div style={{display: 'flex', alignItems: 'center', gap: SPACE.lg}}>
            <GitMark size={58} />
            <div style={TYPE.title}>本地版本历史</div>
          </div>
          <div style={{...TYPE.body, color: COLOR.text.secondary, marginTop: SPACE.lg}}>对象、提交与分支引用</div>
          <div style={{marginTop: SPACE.xxl, opacity: modelsIn}}>
            <GitHistoryRail progress={modelsIn} width={690} />
          </div>
        </div>

        <div style={{paddingLeft: 78, borderLeft: `1px solid ${COLOR.stroke.default}`}}>
          <div style={{display: 'flex', alignItems: 'center', gap: SPACE.lg}}>
            <GitHubMark size={58} />
            <div style={TYPE.title}>托管与协作</div>
          </div>
          <div style={{...TYPE.body, color: COLOR.text.secondary, marginTop: SPACE.lg}}>仓库、讨论、审查与自动化</div>
          <div style={{marginTop: SPACE.xxl, opacity: modelsIn}}>
            <CollaborationRail progress={modelsIn} width={690} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const LocalGitScene: React.FC = () => {
  const frame = useCurrentFrame();
  const titleIn = enter(frame, -18, 18);
  const repositoryIn = enter(frame, 28, 24);
  const graphIn = enter(frame, 70, 70);
  const rowsIn = enter(frame, 142, 32);
  const localCommandsIn = enter(frame, 266, 22);
  const remoteCommandsIn = enter(frame, 430, 22);

  return (
    <AbsoluteFill style={{padding: '122px 154px 150px', boxSizing: 'border-box'}}>
      <div style={{...TYPE.hero, opacity: titleIn, translate: `${(1 - titleIn) * -20}px 0`}}>完整历史就在本地</div>

      <div style={{display: 'grid', gridTemplateColumns: '450px 1fr', gap: 80, alignItems: 'center', marginTop: 70}}>
        <div
          data-audit-id="gh01-local-repository"
          style={{
            minHeight: 390,
            padding: `${SPACE.xxl}px ${SPACE.xl}px`,
            boxSizing: 'border-box',
            border: `1px solid ${COLOR.stroke.default}`,
            borderRadius: RADIUS.panel,
            background: COLOR.canvas.raised,
            boxShadow: `0 16px 42px ${COLOR.effects.shadowSoft}`,
            opacity: repositoryIn,
            scale: 0.96 + repositoryIn * 0.04,
          }}
        >
          <div style={{...TYPE.title, fontFamily: FONT.mono, color: COLOR.git.main}}>.git/</div>
          <div style={{marginTop: SPACE.xl, opacity: rowsIn}}>
            {[
              ['objects/', '内容与提交对象'],
              ['refs/', 'branch 与 tag 指针'],
              ['HEAD', '当前所在位置'],
              ['index', '下一次提交的内容'],
            ].map(([name, detail]) => (
              <div key={name} style={{display: 'grid', gridTemplateColumns: '118px 1fr', gap: SPACE.sm, padding: `${SPACE.md}px 0`, borderBottom: `1px solid ${COLOR.stroke.soft}`}}>
                <div style={{...TYPE.code, color: COLOR.text.primary}}>{name}</div>
                <div style={{...TYPE.ui, color: COLOR.text.secondary}}>{detail}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <GitHistoryRail progress={graphIn} width={1000} />
          <div style={{...TYPE.body, color: COLOR.text.secondary, marginTop: SPACE.lg, opacity: graphIn}}>commit 在本地写入对象，并移动当前分支引用</div>
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
        <div style={{...TYPE.hero, translate: `${(1 - modelIn) * -20}px 0`}}>GitHub 在仓库周围保存什么</div>
        <div style={{marginTop: SPACE.xxl}}>
          <PlatformStateLegend revealFromFrame={144} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const StateBridgeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const titleIn = enter(frame, -18, 18);
  const firstExampleIn = enter(frame, 24, 18);
  const firstExampleOut = interpolate(frame, [390, 420], [1, 0], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{padding: '122px 146px 150px', boxSizing: 'border-box'}}>
      <div style={{...TYPE.hero, opacity: titleIn, translate: `${(1 - titleIn) * -20}px 0`}}>每次操作，都问三层发生了什么</div>
      <div style={{marginTop: 116, opacity: firstExampleIn * firstExampleOut}}>
        <GitHubStateBridge
          browser={{title: '打开 Pull requests', detail: '一次只读的浏览器导航', accent: 'action'}}
          platform={{title: '展示 Pull Request 列表', detail: '读取 GitHub 保存的协作信息'}}
          git={{title: 'objects / refs 不变', detail: '没有创建 commit，也没有移动 branch'}}
          auditId="gh01-state-bridge"
        />
      </div>
      <Sequence from={420} premountFor={seconds(1)}>
        <div style={{position: 'absolute', left: 146, right: 146, top: 304}}>
          <GitHubStateBridge
            browser={{title: '点击 Merge', detail: '在浏览器中确认合并', accent: 'action'}}
            platform={{title: 'Pull Request 已合并', detail: '讨论与审查记录继续保留', accent: 'merged'}}
            git={{title: 'GitHub 上 main 前进', detail: '本地 main 仍要 fetch 或 pull', accent: 'git'}}
            auditId="gh01-merge-state-bridge"
          />
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};

const TakeawayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const titleIn = enter(frame, -18, 18);
  const modelsIn = enter(frame, 34, 58);
  const connectionIn = enter(frame, 102, 26);

  return (
    <AbsoluteFill style={{padding: '126px 150px 150px', boxSizing: 'border-box'}}>
      <div style={{...TYPE.hero, textAlign: 'center', opacity: titleIn}}>历史引擎，与协作平台</div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 92, marginTop: 88, opacity: modelsIn}}>
        <div style={{textAlign: 'center'}}>
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: SPACE.lg}}>
            <GitMark size={52} />
            <div style={TYPE.title}>Git 管理版本历史</div>
          </div>
          <div style={{marginTop: SPACE.xxl}}><GitHistoryRail progress={modelsIn} width={680} /></div>
        </div>

        <div style={{textAlign: 'center'}}>
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: SPACE.lg}}>
            <GitHubMark size={52} />
            <div style={TYPE.title}>GitHub 组织托管与协作</div>
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
