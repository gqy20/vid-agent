import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {
  CenterGraph,
  CommitNode,
  CourseLayout,
  EpisodeTitleCard,
  GitStatePanel,
  ManimClip,
  QuestionCaption,
  SceneCaption,
  SceneSequence,
  SvgArrowLine,
  TypedCommandTerminal,
} from '../kit';
import {COLOR, FONT, WEIGHT} from '../palette';
import {seconds, WIDTH} from '../timeline';
import {TYPE} from '../typography';
export {EP03_DURATION_IN_FRAMES, EP03_SCENES} from '../data/episodeTimelines.generated';
import {EP03_DURATION_IN_FRAMES, EP03_SCENES} from '../data/episodeTimelines.generated';

type Ep03SceneId = (typeof EP03_SCENES)[number]['id'];

const getEp03SceneStart = (id: Ep03SceneId) => {
  let cursor = 0;
  for (const scene of EP03_SCENES) {
    if (scene.id === id) return cursor;
    cursor += scene.duration;
  }
  throw new Error(`Unknown EP03 scene: ${id}`);
};

const getEp03SceneDuration = (id: Ep03SceneId) => {
  const scene = EP03_SCENES.find((item) => item.id === id);
  if (!scene) throw new Error(`Unknown EP03 scene: ${id}`);
  return scene.duration;
};

const clamp = (value: number) => Math.max(0, Math.min(1, value));

const ObjectBox: React.FC<{
  title: string;
  subtitle: string;
  tone: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  opacity?: number;
  scale?: number;
  auditId?: string;
}> = ({title, subtitle, tone, x, y, width = 300, height = 160, opacity = 1, scale = 1, auditId}) => (
  <div
    data-audit-id={auditId}
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width,
      height,
      borderRadius: 8,
      border: `2px solid ${tone}`,
      background: COLOR.canvas.overlay,
      boxShadow: `0 20px 54px ${COLOR.effects.shadowSoft}`,
      padding: '26px 28px',
      boxSizing: 'border-box',
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: 'center',
    }}
  >
    <div style={{...TYPE.title, fontFamily: FONT.mono, fontSize: 34, color: COLOR.text.primary}}>{title}</div>
    <div style={{...TYPE.ui, color: tone, marginTop: 13}}>{subtitle}</div>
  </div>
);

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const titleIn = interpolate(frame, [0, seconds(0.55)], [0, 1], {extrapolateRight: 'clamp'});
  const titleOut = interpolate(frame, [seconds(1.8), seconds(2.3)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const buttonIn = interpolate(frame, [seconds(2.3), seconds(3.15)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const strike = interpolate(frame, [seconds(4.2), seconds(5.1)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const commitIn = interpolate(frame, [seconds(5.3), seconds(6.3)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const question = interpolate(frame, [seconds(9.2), seconds(10.1)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{padding: '154px 154px 112px', boxSizing: 'border-box'}}>
      <EpisodeTitleCard
        index="3."
        keyword="Commit"
        suffix="不是保存按钮"
        opacity={titleIn * titleOut}
        translateY={interpolate(titleIn, [0, 1], [18, -44], {extrapolateRight: 'clamp'})}
        keywordOpacity={0.5 + titleIn * 0.5}
        keywordTranslateY={interpolate(titleIn, [0, 1], [8, 0], {extrapolateRight: 'clamp'})}
        underlineScale={interpolate(frame, [seconds(0.55), seconds(1.15)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
        underlineOpacity={titleOut * 0.82}
        auditId="ep03-hook-title"
      />
      <div
        data-audit-id="ep03-save-button"
        style={{
          position: 'absolute',
          left: 284,
          top: 356,
          width: 570,
          height: 228,
          borderRadius: 8,
          border: `2px solid ${COLOR.stroke.default}`,
          background: COLOR.canvas.raised,
          boxShadow: `0 24px 70px ${COLOR.effects.shadowPanel}`,
          display: 'grid',
          placeItems: 'center',
          opacity: buttonIn * interpolate(commitIn, [0, 1], [1, 0.32]),
        }}
      >
        <div style={{...TYPE.hero, fontSize: 70}}>保存</div>
      </div>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <SvgArrowLine x1={330} y1={390} x2={790} y2={576} progress={strike} color={COLOR.git.conflict} width={8} opacity={0.78} dash="none" />
      </svg>
      <div style={{position: 'absolute', left: 1012, top: 316, width: 560, opacity: commitIn}}>
        <svg width="560" height="360" viewBox="0 0 560 360">
          <CommitNode id="C2" x={280} y={158} progress={commitIn} radius={108} strong />
          <text x="280" y="324" textAnchor="middle" fontFamily={FONT.sans} fontSize="37" fontWeight={WEIGHT.bold} fill={COLOR.text.secondary}>
            历史里的对象
          </text>
        </svg>
      </div>
      <QuestionCaption opacity={question} translateY={interpolate(question, [0, 1], [16, 0])} auditId="ep03-hook-question">
        commit 到底保存了什么？
      </QuestionCaption>
    </AbsoluteFill>
  );
};

const FromIndexScene: React.FC = () => {
  const frame = useCurrentFrame();
  const terminalOut = interpolate(frame, [seconds(5.4), seconds(7.1)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const boardIn = interpolate(frame, [seconds(5.8), seconds(7.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const arrow = interpolate(frame, [seconds(10), seconds(14.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const snapshot = interpolate(frame, [seconds(14.3), seconds(18.4)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const caption = interpolate(frame, [seconds(20), seconds(21.6)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: interpolate(terminalOut, [0, 1], [156, 250]),
          top: interpolate(terminalOut, [0, 1], [116, 218]),
          width: interpolate(terminalOut, [0, 1], [680, 1360]),
          height: interpolate(terminalOut, [0, 1], [118, 560]),
          opacity: interpolate(terminalOut, [0, 1], [0, 1]),
          zIndex: 8,
        }}
      >
        <TypedCommandTerminal
          command={'git commit -m "add search"'}
          output={['[main C2] add search', '2 files changed']}
          commandEndFrame={seconds(1.05)}
          outputStartFrame={seconds(1.4)}
        />
      </div>
      <div style={{position: 'absolute', left: 106, top: 254, width: 1450, opacity: boardIn}} data-audit-id="ep03-index-board">
        <GitStatePanel
          areas={[
            {id: 'working-tree', title: 'Working Tree', files: ['app.js:v2', 'search.js:draft']},
            {id: 'index', title: 'Index', files: ['app.js:v1', 'search.js:v1'], active: true},
            {id: 'repository', title: 'Repository', files: ['C0', 'C1']},
          ]}
        />
      </div>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <SvgArrowLine x1={1035} y1={596} x2={1485} y2={596} progress={arrow} color={COLOR.git.head} width={8} opacity={0.78} dash="none" />
        <g opacity={snapshot}>
          <circle cx="1560" cy="596" r="72" fill={COLOR.canvas.base} stroke={COLOR.git.main} strokeWidth="8" />
          <text x="1560" y="610" textAnchor="middle" fontFamily={FONT.mono} fontSize="40" fontWeight={WEIGHT.bold} fill={COLOR.text.primary}>
            C2
          </text>
        </g>
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 1410,
          top: 688,
          width: 330,
          opacity: snapshot,
          ...TYPE.ui,
          color: COLOR.text.secondary,
          textAlign: 'center',
        }}
      >
        snapshot from Index
      </div>
      <SceneCaption opacity={caption} width={1120} auditId="ep03-from-index-caption">
        commit 读取的是 Index，不是把 Working Tree 当前所有内容都打包进去。
      </SceneCaption>
    </AbsoluteFill>
  );
};

const ManimSceneFrame: React.FC<{src: string; auditId: string}> = ({src, auditId}) => (
  <AbsoluteFill>
    <div
      style={{
        position: 'absolute',
        left: 154,
        top: 104,
        width: 1612,
        aspectRatio: '16 / 9',
      }}
    >
      <ManimClip src={src} width="100%" height="100%" fit="contain" auditId={auditId} />
    </div>
  </AbsoluteFill>
);

const ObjectModelScene: React.FC = () => (
  <ManimSceneFrame
    src="git-course/manim/ep03/object-model.mp4"
    auditId="ep03-object-model-manim"
  />
);

const CommitFieldsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const rows = [
    {label: 'tree', value: 'a8f3c1...', note: '这次项目快照', tone: COLOR.git.main},
    {label: 'parent', value: 'C1', note: '上一次提交', tone: COLOR.git.feature},
    {label: 'author', value: 'Lin <lin@demo>', note: '谁提交', tone: COLOR.text.secondary},
    {label: 'time', value: '2026-07-07 10:20', note: '何时提交', tone: COLOR.text.secondary},
    {label: 'message', value: 'add search', note: '为什么提交', tone: COLOR.git.head},
  ];
  const cardIn = interpolate(frame, [0, seconds(1.2)], [0, 1], {extrapolateRight: 'clamp'});
  const active = Math.min(rows.length - 1, Math.max(0, Math.floor((frame - seconds(4)) / seconds(4.2))));
  const caption = interpolate(frame, [seconds(24), seconds(25.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{padding: '118px 154px 112px', boxSizing: 'border-box'}}>
      <div style={{...TYPE.hero, fontSize: 58}}>commit 不只是快照</div>
      <div
        data-audit-id="ep03-commit-field-card"
        style={{
          position: 'absolute',
          left: 224,
          top: 314,
          width: 1040,
          borderRadius: 8,
          border: `1px solid ${COLOR.stroke.default}`,
          background: COLOR.canvas.overlay,
          boxShadow: `0 24px 70px ${COLOR.effects.shadowPanel}`,
          opacity: cardIn,
          padding: '34px 42px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{...TYPE.title, fontFamily: FONT.mono, fontSize: 34, color: COLOR.git.main, marginBottom: 22}}>commit C2</div>
        {rows.map((row, index) => {
          const rowIn = interpolate(frame, [seconds(2.4 + index * 2.8), seconds(3.2 + index * 2.8)], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const isActive = index === active;
          return (
            <div
              key={row.label}
              style={{
                display: 'grid',
                gridTemplateColumns: '148px 1fr 250px',
                alignItems: 'center',
                gap: 22,
                minHeight: 64,
                borderTop: index === 0 ? 'none' : `1px solid ${COLOR.stroke.soft}`,
                opacity: rowIn,
                background: isActive ? COLOR.effects.headHighlight : 'transparent',
                margin: '0 -18px',
                padding: '0 18px',
                borderRadius: 8,
              }}
            >
              <div style={{...TYPE.codeSmall, fontFamily: FONT.mono, color: row.tone, fontWeight: WEIGHT.bold}}>{row.label}</div>
              <div style={{...TYPE.codeSmall, fontFamily: FONT.mono, color: COLOR.text.primary}}>{row.value}</div>
              <div style={{...TYPE.uiSmall, color: COLOR.text.secondary}}>{row.note}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', right: 230, top: 362, width: 360}}>
        <svg width="360" height="360" viewBox="0 0 360 360">
          <CommitNode id="C2" x={180} y={180} progress={cardIn} radius={106} strong />
        </svg>
      </div>
      <SceneCaption opacity={caption} width={1120} auditId="ep03-fields-caption">
        parent 让 commit 知道自己从哪里来；message 记录这次为什么提交。
      </SceneCaption>
    </AbsoluteFill>
  );
};

const ParentChainScene: React.FC = () => (
  <ManimSceneFrame
    src="git-course/manim/ep03/parent-chain.mp4"
    auditId="ep03-parent-chain-manim"
  />
);

const HashIdentityScene: React.FC = () => (
  <ManimSceneFrame
    src="git-course/manim/ep03/hash-identity.mp4"
    auditId="ep03-hash-identity-manim"
  />
);

const TakeawayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const state = {
    commits: [{id: 'C0'}, {id: 'C1'}, {id: 'C2'}],
    branches: [{name: 'main', target: 'C2', lane: 'bottom' as const}],
  };
  const graphIn = interpolate(frame, [seconds(2.2), seconds(4)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const bullets = ['指向快照：tree', '指向过去：parent', '拥有身份：hash'];
  const question = interpolate(frame, [seconds(15), seconds(17.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{padding: '150px 170px 130px', boxSizing: 'border-box'}}>
      <div style={{...TYPE.hero, fontWeight: WEIGHT.bold}}>
        commit 是一个
        <br />
        带身份的历史节点
      </div>
      <div style={{position: 'absolute', right: 160, top: 304, width: 960, opacity: graphIn}}>
        <CenterGraph state={state} top={0} width={960} showHeadMarker={false} />
      </div>
      <div style={{position: 'absolute', left: 176, bottom: 190, display: 'grid', gap: 16}}>
        {bullets.map((line, idx) => {
          const item = interpolate(frame, [seconds(5 + idx * 2.2), seconds(6.1 + idx * 2.2)], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <div key={line} style={{...TYPE.subtitle, color: COLOR.text.primary, opacity: item, transform: `translateY(${interpolate(item, [0, 1], [16, 0])}px)`}}>
              <span
                style={{
                  display: 'inline-block',
                  width: 28,
                  height: 28,
                  marginRight: 16,
                  borderRadius: 999,
                  background: idx === 0 ? COLOR.git.main : idx === 1 ? COLOR.git.feature : COLOR.git.head,
                  verticalAlign: -3,
                }}
              />
              {line}
            </div>
          );
        })}
      </div>
      <QuestionCaption bottom={132} width={1040} opacity={question} translateY={interpolate(question, [0, 1], [18, 0])} auditId="ep03-takeaway-question">
        下一步：branch 为什么只需要指向某个 commit？
      </QuestionCaption>
    </AbsoluteFill>
  );
};

export const Ep03CommitSnapshot: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <CourseLayout
      seriesTitle="看得见的 Git"
      episodeTitle="Commit 不是保存按钮"
      scenes={EP03_SCENES}
      currentFrame={frame}
      showHeader={(current) => current >= getEp03SceneStart('from-index')}
      showEpisodeTitle={(current) => current >= getEp03SceneStart('from-index')}
    >
      <SceneSequence from={getEp03SceneStart('hook')} durationInFrames={getEp03SceneDuration('hook')}>
        <HookScene />
      </SceneSequence>
      <SceneSequence from={getEp03SceneStart('from-index')} durationInFrames={getEp03SceneDuration('from-index')}>
        <FromIndexScene />
      </SceneSequence>
      <SceneSequence from={getEp03SceneStart('object-model')} durationInFrames={getEp03SceneDuration('object-model')}>
        <ObjectModelScene />
      </SceneSequence>
      <SceneSequence from={getEp03SceneStart('commit-fields')} durationInFrames={getEp03SceneDuration('commit-fields')}>
        <CommitFieldsScene />
      </SceneSequence>
      <SceneSequence from={getEp03SceneStart('parent-chain')} durationInFrames={getEp03SceneDuration('parent-chain')}>
        <ParentChainScene />
      </SceneSequence>
      <SceneSequence from={getEp03SceneStart('hash-identity')} durationInFrames={getEp03SceneDuration('hash-identity')}>
        <HashIdentityScene />
      </SceneSequence>
      <SceneSequence from={getEp03SceneStart('takeaway')} durationInFrames={getEp03SceneDuration('takeaway')}>
        <TakeawayScene />
      </SceneSequence>
    </CourseLayout>
  );
};
