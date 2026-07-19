import {AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {SceneCaption} from '../../git-course/kit';
import {GH01} from '../data/episodes';
import {BrowserEvidenceScene, BrowserFocusScene, GitHubCourseLayout, GitHubStateBridge} from '../kit';
import {COLOR, FONT, WEIGHT} from '../palette';
import {seconds} from '../timeline';
import {TYPE} from '../typography';

const SCENES = GH01.scenes.map((scene) => ({
  ...scene,
  from: seconds(scene.start),
  durationInFrames: seconds(scene.duration),
}));

const [HOOK_SCENE, LOCAL_GIT_SCENE, BROWSER_REPOSITORY_SCENE, PLATFORM_LAYER_SCENE, STATE_BRIDGE_SCENE, TAKEAWAY_SCENE] = GH01.scenes;

export const GH01_DURATION_IN_FRAMES = seconds(GH01.durationSeconds);

const RECORDING_DECLARATION = GH01.browserRecordings[0];
const RECORDING = {
  id: RECORDING_DECLARATION.id,
  src: RECORDING_DECLARATION.src,
  poster: RECORDING_DECLARATION.poster,
  metadata: RECORDING_DECLARATION.metadata,
  url: 'github.com/github/docs',
  title: 'PUBLIC REPOSITORY',
};

const BROWSER_DEMO_PLAYBACK_RATE = 1.15;
const BROWSER_DEMO_HOLD_SECONDS = 10.8;
const BROWSER_DEMO_CAPTION_SECONDS = 11.4;

const enter = (frame: number, start = 0, duration = 18) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

const Eyebrow: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = COLOR.github.action}) => (
  <div style={{...TYPE.uiSmall, color, fontFamily: FONT.mono, letterSpacing: 1.5}}>{children}</div>
);

const ResponsibilityCard: React.FC<{label: string; title: string; color: string}> = ({label, title, color}) => (
  <div
    style={{
      padding: '22px 26px',
      border: `1px solid ${COLOR.stroke.soft}`,
      borderTop: `5px solid ${color}`,
      borderRadius: 10,
      background: COLOR.canvas.raised,
      boxShadow: `0 16px 36px ${COLOR.effects.shadowSoft}`,
      textAlign: 'left',
    }}
  >
    <Eyebrow color={color}>{label}</Eyebrow>
    <div style={{...TYPE.body, fontWeight: WEIGHT.bold, marginTop: 10}}>{title}</div>
  </div>
);

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const titleIn = enter(frame, 4, 20);
  const cardsIn = enter(frame, 34, 20);
  const questionIn = enter(frame, 80, 16);

  return (
    <AbsoluteFill style={{display: 'grid', placeItems: 'center'}}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 196,
          textAlign: 'center',
          translate: `0 ${(1 - titleIn) * 18}px`,
          opacity: titleIn,
        }}
      >
        <Eyebrow>GH01 · RESPONSIBILITY BOUNDARY</Eyebrow>
        <div style={{...TYPE.display, fontSize: 92, marginTop: 22}}>
          <span style={{color: COLOR.git.main}}>Git</span>
          <span style={{color: COLOR.text.tertiary, margin: '0 32px'}}>≠</span>
          <span style={{color: COLOR.github.action}}>GitHub</span>
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 520,
          display: 'grid',
          gridTemplateColumns: '420px 420px',
          gap: 28,
          opacity: cardsIn,
          translate: `0 ${(1 - cardsIn) * 16}px`,
        }}
      >
        <ResponsibilityCard label="LOCAL HISTORY" title="objects · refs · commits" color={COLOR.git.main} />
        <ResponsibilityCard label="COLLABORATION" title="PR · review · checks" color={COLOR.github.action} />
      </div>
      <SceneCaption opacity={questionIn} bottom={118} width={1080} fontSize={36} auditId="gh01-hook-caption">
        {HOOK_SCENE.caption}
      </SceneCaption>
    </AbsoluteFill>
  );
};

const CommitLine: React.FC<{progress: number}> = ({progress}) => (
  <div style={{position: 'relative', height: 150, width: 540}}>
    <div
      style={{
        position: 'absolute',
        left: 54,
        top: 72,
        width: 420 * progress,
        height: 3,
        background: COLOR.git.graphLine,
      }}
    />
    {['C0', 'C1', 'C2'].map((commit, index) => {
      const nodeIn = interpolate(progress, [index * 0.28, index * 0.28 + 0.2], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      return (
        <div key={commit} style={{position: 'absolute', left: 28 + index * 210, top: 43, opacity: nodeIn}}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              border: `4px solid ${COLOR.git.commit}`,
              background: COLOR.canvas.raised,
              display: 'grid',
              placeItems: 'center',
              ...TYPE.uiSmall,
              fontFamily: FONT.mono,
            }}
          >
            {commit}
          </div>
          {index === 2 ? (
            <div style={{position: 'absolute', left: -6, top: -42, color: COLOR.git.main, ...TYPE.uiSmall}}>main</div>
          ) : null}
        </div>
      );
    })}
  </div>
);

const LocalGitScene: React.FC = () => {
  const frame = useCurrentFrame();
  const panelIn = enter(frame, 4, 22);
  const graphIn = enter(frame, 28, 40);
  const dataIn = enter(frame, 58, 20);
  const commandIn = enter(frame, 108, 20);
  const captionIn = enter(frame, 170, 18);

  return (
    <AbsoluteFill style={{padding: '142px 210px 150px', boxSizing: 'border-box'}}>
      <div style={{textAlign: 'center', opacity: panelIn, translate: `0 ${(1 - panelIn) * 14}px`}}>
        <Eyebrow color={COLOR.git.main}>LOCAL REPOSITORY</Eyebrow>
        <div style={{...TYPE.title, marginTop: 12}}>完整历史就在本地</div>
      </div>
      <div
        style={{
          margin: '34px auto 0',
          width: 1280,
          height: 480,
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          border: `1px solid ${COLOR.stroke.default}`,
          borderRadius: 14,
          background: COLOR.canvas.raised,
          boxShadow: `0 22px 58px ${COLOR.effects.shadowSoft}`,
          overflow: 'hidden',
          opacity: panelIn,
        }}
      >
        <div style={{padding: '56px 54px', borderRight: `1px solid ${COLOR.stroke.soft}`}}>
          <Eyebrow color={COLOR.git.main}>COMMIT HISTORY</Eyebrow>
          <div style={{opacity: graphIn}}><CommitLine progress={graphIn} /></div>
          <div style={{...TYPE.body, color: COLOR.text.secondary, marginTop: 18}}>branch、log、diff 直接读取本地仓库</div>
        </div>
        <div style={{padding: '48px 46px', opacity: dataIn}}>
          <Eyebrow color={COLOR.git.head}>.git/</Eyebrow>
          {[
            ['objects/', '内容与提交对象'],
            ['refs/', 'branch 与 tag 指针'],
            ['HEAD', '当前所在位置'],
            ['index', '下一次提交的内容'],
          ].map(([name, detail]) => (
            <div key={name} style={{display: 'grid', gridTemplateColumns: '150px 1fr', padding: '17px 0', borderBottom: `1px solid ${COLOR.stroke.soft}`}}>
              <div style={{...TYPE.code, color: COLOR.text.primary}}>{name}</div>
              <div style={{...TYPE.ui, color: COLOR.text.secondary}}>{detail}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{display: 'flex', justifyContent: 'center', gap: 14, marginTop: 26, opacity: commandIn}}>
        {['git commit', 'git branch', 'git log', 'git diff'].map((command) => (
          <div key={command} style={{padding: '10px 17px', borderRadius: 7, background: COLOR.canvas.soft, color: COLOR.git.main, ...TYPE.code}}>{command}</div>
        ))}
        <div style={{padding: '10px 17px', color: COLOR.text.secondary, ...TYPE.ui}}>offline ✓</div>
      </div>
      <SceneCaption opacity={captionIn} bottom={72} width={1120} fontSize={34} auditId="gh01-local-caption">
        {LOCAL_GIT_SCENE.caption}
      </SceneCaption>
    </AbsoluteFill>
  );
};

const BrowserRepositoryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const captionIn = enter(frame, seconds(BROWSER_DEMO_CAPTION_SECONDS), 18);
  return (
    <BrowserFocusScene
      recording={RECORDING}
      playbackRate={BROWSER_DEMO_PLAYBACK_RATE}
      holdFromFrame={seconds(BROWSER_DEMO_HOLD_SECONDS)}
    >
      <SceneCaption opacity={captionIn} bottom={40} width={1100} fontSize={32} auditId="gh01-browser-caption">
        {BROWSER_REPOSITORY_SCENE.caption}
      </SceneCaption>
    </BrowserFocusScene>
  );
};

const PlatformLayerScene: React.FC = () => (
  <BrowserEvidenceScene
    recording={RECORDING}
    highlightIds={['collaboration-navigation']}
    conclusion={PLATFORM_LAYER_SCENE.caption}
  />
);

const StateBridgeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const titleIn = enter(frame, 4, 20);
  const bridgeIn = enter(frame, 30, 18);
  const captionIn = enter(frame, 190, 18);
  return (
    <AbsoluteFill style={{padding: '162px 160px 150px', boxSizing: 'border-box'}}>
      <div style={{textAlign: 'center', opacity: titleIn}}>
        <Eyebrow>THREE-LAYER CHECK</Eyebrow>
        <div style={{...TYPE.title, marginTop: 12}}>每次操作，都问三层发生了什么</div>
      </div>
      <div style={{marginTop: 76, opacity: bridgeIn}}>
        <GitHubStateBridge
          browser={{eyebrow: 'BROWSER ACTION', title: '打开 Pull requests', detail: '一次只读的页面导航'}}
          platform={{eyebrow: 'PLATFORM STATE', title: '展示 Pull Request 列表', detail: '读取 GitHub 保存的协作信息'}}
          git={{eyebrow: 'GIT STATE', title: '本地 objects / refs 不变', detail: '没有创建 commit，也没有移动 branch'}}
          auditId="gh01-state-bridge"
        />
      </div>
      <SceneCaption opacity={captionIn} bottom={82} width={1180} fontSize={34} auditId="gh01-bridge-caption">
        {STATE_BRIDGE_SCENE.caption}
      </SceneCaption>
    </AbsoluteFill>
  );
};

const TakeawayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const titleIn = enter(frame, 4, 20);
  const cardsIn = enter(frame, 34, 22);
  const connectionIn = enter(frame, 88, 20);
  const captionIn = enter(frame, 150, 18);
  return (
    <AbsoluteFill style={{display: 'grid', placeItems: 'center'}}>
      <div style={{position: 'absolute', top: 164, textAlign: 'center', opacity: titleIn}}>
        <Eyebrow>ONE BOUNDARY TO REMEMBER</Eyebrow>
        <div style={{...TYPE.title, fontSize: 52, marginTop: 14}}>历史引擎，与协作平台</div>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '560px 560px', gap: 38, opacity: cardsIn}}>
        <div style={{padding: '46px 48px', borderRadius: 12, border: `1px solid ${COLOR.stroke.soft}`, borderTop: `6px solid ${COLOR.git.main}`, background: COLOR.canvas.raised}}>
          <Eyebrow color={COLOR.git.main}>GIT</Eyebrow>
          <div style={{...TYPE.title, marginTop: 16}}>管理版本历史</div>
          <div style={{...TYPE.body, color: COLOR.text.secondary, marginTop: 18}}>objects · refs · commits</div>
        </div>
        <div style={{padding: '46px 48px', borderRadius: 12, border: `1px solid ${COLOR.stroke.soft}`, borderTop: `6px solid ${COLOR.github.action}`, background: COLOR.canvas.raised}}>
          <Eyebrow>GITHUB</Eyebrow>
          <div style={{...TYPE.title, marginTop: 16}}>组织托管与协作</div>
          <div style={{...TYPE.body, color: COLOR.text.secondary, marginTop: 18}}>PR · review · checks</div>
        </div>
      </div>
      <div style={{position: 'absolute', top: 736, display: 'flex', alignItems: 'center', gap: 22, opacity: connectionIn}}>
        <div style={{width: 270, height: 2, background: COLOR.stroke.default}} />
        <div style={{padding: '11px 20px', borderRadius: 7, background: COLOR.canvas.soft, color: COLOR.text.secondary, ...TYPE.code}}>remote · fetch · push</div>
        <div style={{width: 270, height: 2, background: COLOR.stroke.default}} />
      </div>
      <SceneCaption opacity={captionIn} bottom={80} width={1160} fontSize={36} auditId="gh01-takeaway-caption">
        {TAKEAWAY_SCENE.caption}
      </SceneCaption>
    </AbsoluteFill>
  );
};

const SCENE_COMPONENTS = [HookScene, LocalGitScene, BrowserRepositoryScene, PlatformLayerScene, StateBridgeScene, TakeawayScene] as const;

export const Gh01GitVsGithub: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <GitHubCourseLayout episodeTitle={GH01.title} currentFrame={frame} durationInFrames={GH01_DURATION_IN_FRAMES}>
      {SCENES.map((scene, index) => {
        const Scene = SCENE_COMPONENTS[index];
        return (
          <Sequence
            key={scene.id}
            from={scene.from}
            durationInFrames={scene.durationInFrames}
            premountFor={seconds(1)}
          >
            <Scene />
          </Sequence>
        );
      })}
    </GitHubCourseLayout>
  );
};
