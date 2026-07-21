import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {
  CommitNode,
  CourseLayout,
  createEpisodeRuntime,
  EpisodeTitleCard,
  EpisodeTimeline,
  GitStatePanel,
  QuestionCaption,
  RecordedTerminalStage,
  SceneCaption,
  SvgArrowLine,
} from '../kit';
import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated';
import {COLOR, FONT, WEIGHT} from '../palette';
import {seconds, WIDTH} from '../timeline';
import {TYPE} from '../typography';
export {EP03_DURATION_IN_FRAMES, EP03_SCENES} from '../data/episodeTimelines.generated';
import {EP03_DURATION_IN_FRAMES, EP03_SCENES} from '../data/episodeTimelines.generated';

const EP03_RUNTIME = createEpisodeRuntime(EP03_SCENES);

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
  const saveOut = interpolate(frame, [seconds(5.15), seconds(5.75)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const commitIn = interpolate(frame, [seconds(5.55), seconds(6.35)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const question = interpolate(frame, [seconds(8), seconds(8.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

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
          left: 675,
          top: 356,
          width: 570,
          height: 228,
          borderRadius: 8,
          border: `2px solid ${COLOR.stroke.default}`,
          background: COLOR.canvas.raised,
          boxShadow: `0 24px 70px ${COLOR.effects.shadowPanel}`,
          display: 'grid',
          placeItems: 'center',
          opacity: buttonIn * saveOut,
        }}
      >
        <div style={{...TYPE.hero, fontSize: 70}}>保存</div>
      </div>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <line x1="724" y1="414" x2={interpolate(strike, [0, 1], [724, 1196])} y2={interpolate(strike, [0, 1], [414, 548])} stroke={COLOR.git.conflict} strokeWidth="9" strokeLinecap="round" opacity={0.82 * strike * saveOut} />
      </svg>
      <div style={{position: 'absolute', left: 680, top: 316, width: 560, opacity: commitIn}}>
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
  const recording = TERMINAL_RECORDINGS['ep03-commit'];
  const terminalWidth = 1240;
  const terminalHeight = 500;
  const terminalOut = interpolate(frame, [seconds(6.2), seconds(7)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const titleIn = interpolate(frame, [seconds(6.7), seconds(7.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const boardIn = interpolate(frame, [seconds(7.1), seconds(8.4)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const arrow = interpolate(frame, [seconds(10.8), seconds(15.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const snapshot = interpolate(frame, [seconds(14.9), seconds(18.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const caption = interpolate(frame, [seconds(19), seconds(20.6)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill>
      <RecordedTerminalStage
        auditId="ep03-commit-recording"
        rect={{x: 340, y: 166, width: terminalWidth, height: terminalHeight}}
        opacity={terminalOut}
        zIndex={9}
        src="git-course-lab/terminal/ep03-commit.mp4"
        holdFrameSrc="git-course-lab/terminal/ep03-commit-hold.png"
        holdFromFrame={recording.holdFromFrame}
        mediaFit="cover"
      />
      <div
        style={{
          position: 'absolute',
          left: 154,
          top: 132,
          ...TYPE.hero,
          fontSize: 60,
          opacity: titleIn,
          transform: `translateY(${interpolate(titleIn, [0, 1], [16, 0])}px)`,
        }}
      >
        commit 读取 Index
      </div>
      <div style={{position: 'absolute', left: 106, top: 316, width: 1450, opacity: boardIn}} data-audit-id="ep03-index-board">
        <GitStatePanel
          prominent
          areas={[
            {id: 'working-tree', title: 'Working Tree', files: ['app.js:v2', 'search.js:draft']},
            {id: 'index', title: 'Index', files: ['app.js:v1', 'search.js:v1'], active: true},
            {id: 'repository', title: 'Repository', files: ['C0', 'C1']},
          ]}
        />
      </div>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <SvgArrowLine x1={1035} y1={658} x2={1466} y2={658} progress={arrow} color={COLOR.git.head} width={8} opacity={0.78 * arrow} dash="none" />
        <g opacity={snapshot}>
          <circle cx="1560" cy="658" r="72" fill={COLOR.canvas.base} stroke={COLOR.git.main} strokeWidth="8" />
          <text x="1560" y="672" textAnchor="middle" fontFamily={FONT.mono} fontSize="40" fontWeight={WEIGHT.bold} fill={COLOR.text.primary}>
            C2
          </text>
        </g>
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 1410,
          top: 750,
          width: 330,
          opacity: snapshot,
          ...TYPE.ui,
          fontSize: 26,
          color: COLOR.text.secondary,
          textAlign: 'center',
        }}
      >
        来自 Index 的快照
      </div>
      <SceneCaption opacity={caption} width={1120} auditId="ep03-from-index-caption">
        commit 读取的是 Index，不是把 Working Tree 当前所有内容都打包进去
      </SceneCaption>
    </AbsoluteFill>
  );
};

const ObjectModelScene: React.FC = () => {
  const frame = useCurrentFrame();
  const blobs = interpolate(frame, [seconds(1.2), seconds(3.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const tree = interpolate(frame, [seconds(3), seconds(4.6)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const blobLinks = interpolate(frame, [seconds(4.2), seconds(6.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const commit = interpolate(frame, [seconds(8), seconds(9.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const commitLink = interpolate(frame, [seconds(9.5), seconds(12.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const caption = interpolate(frame, [seconds(13.2), seconds(14.4)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{padding: '118px 150px 112px', boxSizing: 'border-box'}} data-audit-id="ep03-object-model-remotion">
      <div style={{...TYPE.hero, fontSize: 60, textAlign: 'center'}}>commit → tree → blob</div>
      <ObjectBox title="blob" subtitle="app.js 内容" tone={COLOR.git.feature} x={170} y={330} width={330} height={170} opacity={blobs} scale={0.94 + blobs * 0.06} />
      <ObjectBox title="blob" subtitle="search.js 内容" tone={COLOR.git.feature} x={170} y={560} width={330} height={170} opacity={blobs} scale={0.94 + blobs * 0.06} />
      <ObjectBox title="tree T2" subtitle="名称 · 类型 · 对象 ID" tone={COLOR.git.head} x={770} y={430} width={390} height={190} opacity={tree} scale={0.94 + tree * 0.06} />
      <ObjectBox title="commit C2" subtitle="记录顶层 tree T2" tone={COLOR.git.main} x={1390} y={430} width={390} height={190} opacity={commit} scale={0.94 + commit * 0.06} />
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <SvgArrowLine x1={766} y1={490} x2={520} y2={420} progress={blobLinks} color={COLOR.git.head} width={7} opacity={0.72 * blobLinks} dash="none" />
        <SvgArrowLine x1={766} y1={560} x2={520} y2={645} progress={blobLinks} color={COLOR.git.head} width={7} opacity={0.72 * blobLinks} dash="none" />
        <SvgArrowLine x1={1390} y1={525} x2={1184} y2={525} progress={commitLink} color={COLOR.git.main} width={8} opacity={0.82 * commitLink} dash="none" />
      </svg>
      <SceneCaption opacity={caption} width={1080}>commit 指向 tree，tree 再按文件名找到 blob</SceneCaption>
    </AbsoluteFill>
  );
};

const CommitFieldsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const cardIn = interpolate(frame, [0, seconds(1.2)], [0, 1], {extrapolateRight: 'clamp'});
  const treeIn = interpolate(frame, [seconds(1.4), seconds(2.4)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const treeLink = interpolate(frame, [seconds(5.2), seconds(7.1)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const parentIn = interpolate(frame, [seconds(2.6), seconds(3.6)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const parentLink = interpolate(frame, [seconds(7), seconds(9)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const metadataIn = interpolate(frame, [seconds(3.6), seconds(4.6)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const timeIn = interpolate(frame, [seconds(4.2), seconds(4.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const messageIn = interpolate(frame, [seconds(4.8), seconds(5.4)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const caption = interpolate(frame, [seconds(9.4), seconds(10.4)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{padding: '118px 154px 112px', boxSizing: 'border-box'}}>
      <div style={{...TYPE.hero, fontSize: 58}}>一个 commit，三个层次</div>
      <div
        data-audit-id="ep03-commit-field-card"
        style={{
          position: 'absolute',
          left: 164,
          top: 286,
          width: 790,
          height: 520,
          borderRadius: 0,
          border: 'none',
          background: 'transparent',
          boxShadow: 'none',
          opacity: cardIn,
          padding: '34px 38px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{...TYPE.title, fontFamily: FONT.mono, fontSize: 36, color: COLOR.git.main, marginBottom: 26}}>commit C2</div>
        <div style={{display: 'grid', gap: 18}}>
          <div style={{display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center', minHeight: 94, padding: '0 24px', borderRadius: 8, background: COLOR.effects.mainWash, opacity: treeIn}}>
            <div style={{...TYPE.codeSmall, fontFamily: FONT.mono, color: COLOR.git.main, fontWeight: WEIGHT.bold}}>tree</div>
            <div style={{...TYPE.subtitle, fontFamily: FONT.mono, color: COLOR.text.primary}}>7b4d2e1</div>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center', minHeight: 94, padding: '0 24px', borderRadius: 8, background: COLOR.effects.featureWash, opacity: parentIn}}>
            <div style={{...TYPE.codeSmall, fontFamily: FONT.mono, color: COLOR.git.feature, fontWeight: WEIGHT.bold}}>parent</div>
            <div style={{...TYPE.subtitle, color: COLOR.text.primary}}>C1</div>
          </div>
          <div style={{padding: '18px 24px', borderTop: `1px solid ${COLOR.stroke.default}`, opacity: metadataIn}}>
            <div style={{...TYPE.uiSmall, fontSize: 22, color: COLOR.text.secondary, marginBottom: 10}}>metadata</div>
            <div style={{display: 'flex', gap: 12, alignItems: 'center', ...TYPE.codeSmall, fontSize: 23, fontFamily: FONT.mono, color: COLOR.text.primary}}>
              <span>author Lin</span><span style={{color: COLOR.stroke.strong}}>·</span>
              <span>committer Lin</span><span style={{color: COLOR.stroke.strong}}>·</span>
              <span style={{opacity: timeIn}}>10:20</span><span style={{color: COLOR.stroke.strong, opacity: timeIn}}>·</span>
              <span style={{opacity: messageIn, color: COLOR.git.head}}>add search</span>
            </div>
          </div>
        </div>
      </div>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <SvgArrowLine x1={954} y1={420} x2={1250} y2={390} progress={treeLink} color={COLOR.git.main} width={7} opacity={0.82 * treeLink} dash="none" />
        <SvgArrowLine x1={954} y1={534} x2={1250} y2={650} progress={parentLink} color={COLOR.git.feature} width={7} opacity={0.82 * parentLink} dash="none" />
      </svg>
      <div style={{position: 'absolute', left: 1260, top: 292, width: 470, height: 190, display: 'grid', placeItems: 'center', opacity: treeLink}}>
        <div style={{textAlign: 'center'}}><div style={{...TYPE.title, fontFamily: FONT.mono, color: COLOR.git.main}}>tree 7b4d2e1</div><div style={{...TYPE.ui, color: COLOR.text.secondary, marginTop: 8}}>这次项目快照</div></div>
      </div>
      <div style={{position: 'absolute', left: 1260, top: 562, width: 470, height: 190, display: 'grid', placeItems: 'center', opacity: parentLink}}>
        <div style={{textAlign: 'center'}}><div style={{...TYPE.title, fontFamily: FONT.mono, color: COLOR.git.feature}}>commit C1</div><div style={{...TYPE.ui, color: COLOR.text.secondary, marginTop: 8}}>上一个历史节点</div></div>
      </div>
      <SceneCaption opacity={caption} width={1120} auditId="ep03-fields-caption">
        tree 指向这次快照，parent 指向过去；其余字段说明谁、何时、为什么提交
      </SceneCaption>
    </AbsoluteFill>
  );
};

const ParentChainScene: React.FC = () => {
  const frame = useCurrentFrame();
  const c0 = interpolate(frame, [seconds(5.4), seconds(6.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const c1 = interpolate(frame, [seconds(6.4), seconds(7.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const link10 = interpolate(frame, [seconds(7.2), seconds(8.3)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const c2 = interpolate(frame, [seconds(8.5), seconds(9.3)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const link21 = interpolate(frame, [seconds(9.3), seconds(10.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const meta = interpolate(frame, [seconds(10.8), seconds(11.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const caption = interpolate(frame, [seconds(11.8), seconds(12.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill data-audit-id="ep03-parent-chain-remotion">
      <div style={{position: 'absolute', top: 132, width: '100%', ...TYPE.hero, fontSize: 60, textAlign: 'center'}}>parent → 过去</div>
      <div style={{position: 'absolute', top: 260, width: '100%', ...TYPE.ui, fontSize: 26, color: COLOR.text.secondary, textAlign: 'center'}}>首次提交 0 个 · 普通提交 1 个 · merge commit 可以有多个</div>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <CommitNode id="C0" x={470} y={500} progress={c0} radius={72} />
        <CommitNode id="C1" x={960} y={500} progress={c1} radius={72} />
        <CommitNode id="C2" x={1450} y={500} progress={c2} radius={78} strong />
        <SvgArrowLine x1={874} y1={500} x2={566} y2={500} progress={link10} color={COLOR.git.feature} width={8} opacity={0.82 * link10} dash="none" />
        <SvgArrowLine x1={1358} y1={500} x2={1056} y2={500} progress={link21} color={COLOR.git.feature} width={8} opacity={0.82 * link21} dash="none" />
        <text x="720" y="450" textAnchor="middle" fontFamily={FONT.mono} fontSize="31" fontWeight={WEIGHT.bold} fill={COLOR.git.feature} opacity={link10}>parent</text>
        <text x="1210" y="450" textAnchor="middle" fontFamily={FONT.mono} fontSize="31" fontWeight={WEIGHT.bold} fill={COLOR.git.feature} opacity={link21}>parent</text>
      </svg>
      <div style={{position: 'absolute', left: 1260, top: 650, width: 410, opacity: meta, padding: '22px 26px', borderTop: `2px solid ${COLOR.git.feature}`}}>
        <div style={{...TYPE.code, fontFamily: FONT.mono, color: COLOR.git.main}}>commit C2</div>
        <div style={{display: 'grid', gridTemplateColumns: '120px 1fr', marginTop: 16, ...TYPE.codeSmall, fontSize: 24, fontFamily: FONT.mono}}><span style={{color: COLOR.git.feature}}>parent</span><span>C1</span></div>
      </div>
      <SceneCaption opacity={caption} width={1040}>新的 commit 通过 parent 指向上一个 commit</SceneCaption>
    </AbsoluteFill>
  );
};

const HashIdentityScene: React.FC = () => {
  const frame = useCurrentFrame();
  const fields = interpolate(frame, [seconds(1), seconds(2.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const machine = interpolate(frame, [seconds(3.4), seconds(4.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const outputA = interpolate(frame, [seconds(4.2), seconds(5.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const mutation = interpolate(frame, [seconds(6.2), seconds(7.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const outputB = interpolate(frame, [seconds(8), seconds(10.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const caption = interpolate(frame, [seconds(11.2), seconds(12.4)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const rows = [['tree', '7b4d2e1'], ['parent', 'C1'], ['author', 'Lin'], ['committer', 'Lin'], ['time', '10:20']];
  return (
    <AbsoluteFill data-audit-id="ep03-hash-identity-remotion">
      <div style={{position: 'absolute', top: 128, width: '100%', ...TYPE.hero, fontSize: 60, textAlign: 'center'}}>字段变化 → 新 hash</div>
      <div style={{position: 'absolute', left: 150, top: 310, width: 500, opacity: fields, display: 'grid', gap: 12}}>
        {rows.map(([key, value]) => <div key={key} style={{display: 'grid', gridTemplateColumns: '170px 1fr', padding: '13px 18px', borderBottom: `1px solid ${COLOR.stroke.default}`, ...TYPE.codeSmall, fontSize: 25, fontFamily: FONT.mono}}><span style={{color: key === 'tree' ? COLOR.git.main : key === 'parent' ? COLOR.git.feature : COLOR.text.secondary}}>{key}</span><span>{value}</span></div>)}
        <div style={{display: 'grid', gridTemplateColumns: '170px 1fr', padding: '13px 18px', background: mutation ? 'rgba(192,87,74,0.07)' : 'transparent', ...TYPE.codeSmall, fontSize: 25, fontFamily: FONT.mono}}><span style={{color: mutation ? COLOR.git.conflict : COLOR.git.head}}>message</span><span>{mutation > 0.5 ? 'add Search' : 'add search'}</span></div>
      </div>
      <ObjectBox title="hash" subtitle="计算身份" tone={mutation ? COLOR.git.conflict : COLOR.git.main} x={800} y={420} width={280} height={180} opacity={machine} />
      <ObjectBox title="commit A" subtitle="9f31a2e" tone={COLOR.git.main} x={1350} y={305} width={360} height={165} opacity={outputA} />
      <ObjectBox title="commit B" subtitle="42c8d19" tone={COLOR.git.conflict} x={1350} y={610} width={360} height={165} opacity={outputB} />
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <SvgArrowLine x1={650} y1={510} x2={776} y2={510} progress={machine} color={COLOR.stroke.strong} width={7} opacity={0.7 * machine} dash="none" />
        <SvgArrowLine x1={1080} y1={475} x2={1326} y2={390} progress={outputA} color={COLOR.git.main} width={8} opacity={0.82 * outputA} dash="none" />
        <SvgArrowLine x1={1080} y1={545} x2={1326} y2={690} progress={outputB} color={COLOR.git.conflict} width={8} opacity={0.82 * outputB} dash="none" />
      </svg>
      <div style={{position: 'absolute', left: 170, top: 790, ...TYPE.subtitle, fontSize: 28, color: COLOR.git.conflict, opacity: mutation}}>只改一个字符</div>
      <SceneCaption opacity={caption} width={1080}>快照、parent 或 message 改变，commit 身份就会改变</SceneCaption>
    </AbsoluteFill>
  );
};

const TakeawayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const graphIn = interpolate(frame, [seconds(2.2), seconds(4)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const mainIn = interpolate(frame, [seconds(8.5), seconds(9.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const bullets = ['指向快照：tree', '指向过去：parent', '计算身份：object ID'];
  const question = interpolate(frame, [seconds(6.3), seconds(7.3)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{padding: '138px 150px 126px', boxSizing: 'border-box'}}>
      <div style={{...TYPE.hero, fontWeight: WEIGHT.bold, textAlign: 'center', width: '100%'}}>
        commit 是带身份的历史节点
      </div>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, opacity: graphIn}}>
        <line x1="620" y1="438" x2="900" y2="438" stroke={COLOR.stroke.default} strokeWidth="8" />
        <line x1="1020" y1="438" x2="1300" y2="438" stroke={COLOR.stroke.default} strokeWidth="8" />
        <CommitNode id="C0" x={560} y={438} progress={graphIn} radius={64} />
        <CommitNode id="C1" x={960} y={438} progress={graphIn} radius={64} />
        <CommitNode id="C2" x={1360} y={438} progress={graphIn} radius={76} strong />
      </svg>
      <div style={{position: 'absolute', left: 1300, top: 532, width: 120, padding: '9px 0', borderRadius: 6, background: COLOR.git.main, color: COLOR.canvas.base, ...TYPE.uiSmall, fontSize: 22, fontFamily: FONT.mono, fontWeight: WEIGHT.bold, textAlign: 'center', opacity: mainIn, transform: `translateY(${interpolate(mainIn, [0, 1], [12, 0])}px)`}}>main</div>
      <div style={{position: 'absolute', left: 220, right: 220, top: 650, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 34}}>
        {bullets.map((line, idx) => {
          const item = interpolate(frame, [seconds(1.2 + idx * 1.6), seconds(2.2 + idx * 1.6)], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <div key={line} style={{...TYPE.ui, fontSize: 34, fontWeight: WEIGHT.bold, color: COLOR.text.primary, opacity: item, transform: `translateY(${interpolate(item, [0, 1], [16, 0])}px)`, textAlign: 'center', padding: '12px 14px'}}>
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
      <QuestionCaption bottom={132} width={1040} opacity={question} translateY={interpolate(question, [0, 1], [18, 0])} auditId="ep03-takeaway-question">
        下一步：branch 为什么只需要指向某个 commit？
      </QuestionCaption>
    </AbsoluteFill>
  );
};

const EP03_SCENE_COMPONENTS = {
  hook: HookScene,
  'from-index': FromIndexScene,
  'object-model': ObjectModelScene,
  'commit-fields': CommitFieldsScene,
  'parent-chain': ParentChainScene,
  'hash-identity': HashIdentityScene,
  takeaway: TakeawayScene,
};

export const Ep03CommitSnapshot: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <CourseLayout
      seriesTitle="看得见的 Git"
      episodeTitle="Commit 不是保存按钮"
      scenes={EP03_SCENES}
      currentFrame={frame}
      showHeader={(current) => current >= EP03_RUNTIME.start('from-index')}
      showEpisodeTitle={(current) => current >= EP03_RUNTIME.start('from-index')}
    >
      <EpisodeTimeline runtime={EP03_RUNTIME} components={EP03_SCENE_COMPONENTS} />
    </CourseLayout>
  );
};
