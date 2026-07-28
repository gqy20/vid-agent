import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {EP13} from '../data/episodes';
import {EP13_DURATION_IN_FRAMES, EP13_SCENES} from '../data/episodeTimelines.generated';
import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated';
import {CourseLayout, EpisodeTitleCard, EpisodeTimeline, NarrationSubtitle, RecordedTerminalCueSequence, SceneTitle, createEpisodeRuntime} from '../kit';
import type {SceneId} from '../kit';
import {COLOR, FONT, WEIGHT} from '../palette';
import {seconds} from '../timeline';
import {TYPE} from '../typography';

export {EP13_DURATION_IN_FRAMES, EP13_SCENES};
const RUNTIME = createEpisodeRuntime(EP13_SCENES);
const appear = (frame: number, at: number, duration = 0.7) => interpolate(frame, [seconds(at), seconds(at + duration)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const terminalCue = <T extends keyof typeof TERMINAL_RECORDINGS>(id: T, duration: number) => ({id, from: 0, durationInFrames: seconds(duration), src: `git-course-lab/terminal/${id}.mp4`, holdFrameSrc: `git-course-lab/terminal/${id}-hold.png`, holdFromFrame: TERMINAL_RECORDINGS[id].holdFromFrame});

const Boundary: React.FC<{title: string; color: string; children: React.ReactNode}> = ({title, color, children}) => (
  <div style={{border: `3px solid ${color}`, borderRadius: 30, background: COLOR.canvas.raised, padding: '28px 34px', minHeight: 340, boxSizing: 'border-box'}}>
    <div style={{...TYPE.title, fontWeight: WEIGHT.bold, color}}>{title}</div>
    <div style={{marginTop: 34, display: 'grid', gap: 18}}>{children}</div>
  </div>
);
const RefRow: React.FC<{name: string; value: string; color: string; muted?: boolean}> = ({name, value, color, muted}) => (
  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 14, padding: '17px 20px', background: COLOR.canvas.base, opacity: muted ? 0.42 : 1}}>
    <span style={{fontFamily: FONT.mono, ...TYPE.ui, fontWeight: WEIGHT.bold, color}}>{name}</span><span style={{fontFamily: FONT.mono, ...TYPE.ui, fontWeight: WEIGHT.bold}}>{value}</span>
  </div>
);
const NetworkModel: React.FC<{mode: 'fetch' | 'pull' | 'push'; frame: number}> = ({mode, frame}) => {
  const changed = appear(frame, 4.2);
  const localMain = mode === 'pull' ? (changed > 0.5 ? 'C2' : 'C1') : mode === 'push' ? 'C3' : 'C1';
  const remoteMain = mode === 'push' ? (changed > 0.5 ? 'C3' : 'C2') : 'C2';
  return <div data-audit-id={`ep13-${mode}-model`} style={{display: 'grid', gridTemplateColumns: '1fr 250px 1fr', alignItems: 'center', gap: 34}}>
    <Boundary title="本地仓库" color={COLOR.git.main}>
      <RefRow name="main" value={localMain} color={COLOR.git.main} />
      <RefRow name="origin/main" value={mode === 'fetch' && changed < 0.5 ? 'C1' : remoteMain} color={COLOR.git.head} />
      <RefRow name="Working Tree" value={mode === 'pull' && changed > 0.5 ? 'C2' : mode === 'push' ? 'C3' : 'C1'} color={COLOR.git.workingTree} muted={mode === 'fetch'} />
    </Boundary>
    <div style={{textAlign: 'center', opacity: appear(frame, 2)}}>
      <div style={{fontFamily: FONT.mono, ...TYPE.subtitle, fontWeight: WEIGHT.bold, color: mode === 'push' ? COLOR.git.feature : COLOR.git.head}}>{mode}</div>
      <div style={{fontSize: 70, lineHeight: 1, color: COLOR.text.tertiary}}>{mode === 'push' ? '→' : '←'}</div>
      <div style={{...TYPE.label, color: COLOR.text.secondary}}>{mode === 'fetch' ? '对象 + 远端记录' : mode === 'pull' ? '取得后整合' : '对象 + ref 请求'}</div>
    </div>
    <Boundary title="服务器仓库" color={COLOR.git.feature}><RefRow name="refs/heads/main" value={remoteMain} color={COLOR.git.feature} /></Boundary>
  </div>;
};
const TerminalThenModel: React.FC<{scene: SceneId<typeof EP13_SCENES>; recording: keyof typeof TERMINAL_RECORDINGS; mode: 'fetch' | 'pull' | 'push'; terminalSeconds: number}> = ({scene, recording, mode, terminalSeconds}) => {
  const frame = useCurrentFrame();
  const modelIn = appear(frame, terminalSeconds + 0.1);
  return <AbsoluteFill>
    <RecordedTerminalCueSequence cues={[terminalCue(recording, terminalSeconds)]} rect={{x: 250, y: 132, width: 1420, height: 720}} auditIdPrefix={`ep13-${mode}-terminal`} />
    <div style={{position: 'absolute', left: 156, right: 156, top: 132, opacity: modelIn}}><NetworkModel mode={mode} frame={Math.max(0, frame - seconds(terminalSeconds))} /></div>
    <NarrationSubtitle frame={frame} cues={RUNTIME.captions(scene)} width={1320} bottom={64} auditId={`ep13-${mode}-caption`} />
  </AbsoluteFill>;
};

// @git-course-scene hook:start
const Hook: React.FC = () => { const frame = useCurrentFrame(); return <AbsoluteFill><EpisodeTitleCard index="13." keyword="fetch / pull / push" suffix="改了哪边" opacity={1} underlineScale={appear(frame, .4)} auditId="ep13-hook-title" /><div style={{position:'absolute',left:0,right:0,top:720,display:'flex',justifyContent:'center',gap:46}}>{['fetch','pull','push'].map((x,i)=><div key={x} style={{fontFamily:FONT.mono,...TYPE.title,fontWeight:WEIGHT.bold,color:[COLOR.git.head,COLOR.git.main,COLOR.git.feature][i],opacity:appear(frame,3+i*1.7)}}>{x}</div>)}</div><NarrationSubtitle frame={frame} cues={RUNTIME.captions('hook')} width={1320} bottom={64} /></AbsoluteFill>; };
// @git-course-scene hook:end
// @git-course-scene fetch-evidence:start
const FetchEvidence: React.FC = () => <TerminalThenModel scene="fetch-evidence" recording="ep13-fetch" mode="fetch" terminalSeconds={8} />;
// @git-course-scene fetch-evidence:end
// @git-course-scene fetch-boundary:start
const FetchBoundary: React.FC = () => { const frame=useCurrentFrame(); return <AbsoluteFill style={{padding:'112px 156px',boxSizing:'border-box'}}><SceneTitle marginBottom={54}>Fetch 更新知识，不替你整合</SceneTitle><NetworkModel mode="fetch" frame={frame}/><NarrationSubtitle frame={frame} cues={RUNTIME.captions('fetch-boundary')} width={1320} bottom={64}/></AbsoluteFill>; };
// @git-course-scene fetch-boundary:end
// @git-course-scene pull-evidence:start
const PullEvidence: React.FC = () => <TerminalThenModel scene="pull-evidence" recording="ep13-pull-ff-only" mode="pull" terminalSeconds={9} />;
// @git-course-scene pull-evidence:end
// @git-course-scene push-evidence:start
const PushEvidence: React.FC = () => <TerminalThenModel scene="push-evidence" recording="ep13-push" mode="push" terminalSeconds={9} />;
// @git-course-scene push-evidence:end
// @git-course-scene three-boundaries:start
const ThreeBoundaries: React.FC = () => { const frame=useCurrentFrame(); const rows=[['fetch','对象库 + origin/main','本地记录'],['pull','fetch + integration','当前分支'],['push','objects + ref update','服务器 ref']] as const; return <AbsoluteFill style={{padding:'112px 230px',boxSizing:'border-box'}}><SceneTitle marginBottom={54}>不要只看网络方向，要看直接写入哪里</SceneTitle><div style={{display:'grid',gap:26}}>{rows.map((r,i)=><div key={r[0]} style={{display:'grid',gridTemplateColumns:'240px 1fr 280px',alignItems:'center',gap:24,padding:'24px 30px',borderRadius:20,background:COLOR.canvas.raised,opacity:appear(frame,2+i*4)}}><b style={{fontFamily:FONT.mono,...TYPE.title,color:[COLOR.git.head,COLOR.git.main,COLOR.git.feature][i]}}>{r[0]}</b><span style={{fontFamily:FONT.mono,...TYPE.body}}>{r[1]}</span><span style={{...TYPE.subtitle,fontWeight:WEIGHT.bold,textAlign:'right'}}>{r[2]}</span></div>)}</div><NarrationSubtitle frame={frame} cues={RUNTIME.captions('three-boundaries')} width={1320} bottom={64}/></AbsoluteFill>; };
// @git-course-scene three-boundaries:end
// @git-course-scene takeaway:start
const Takeaway: React.FC = () => { const frame=useCurrentFrame(); return <AbsoluteFill style={{padding:'150px 240px',boxSizing:'border-box'}}><SceneTitle marginBottom={54}>三个动作，三个判断</SceneTitle><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:46,marginTop:100}}>{[['取得','fetch'],['整合','pull'],['发布','push']].map((r,i)=><div key={r[0]} style={{textAlign:'center',opacity:appear(frame,2+i*3)}}><div style={{...TYPE.hero,fontWeight:WEIGHT.bold,color:[COLOR.git.head,COLOR.git.main,COLOR.git.feature][i]}}>{r[0]}</div><div style={{fontFamily:FONT.mono,...TYPE.title,marginTop:18}}>{r[1]}</div></div>)}</div><NarrationSubtitle frame={frame} cues={RUNTIME.captions('takeaway')} width={1320} bottom={64}/></AbsoluteFill>; };
// @git-course-scene takeaway:end

const COMPONENTS={hook:Hook,'fetch-evidence':FetchEvidence,'fetch-boundary':FetchBoundary,'pull-evidence':PullEvidence,'push-evidence':PushEvidence,'three-boundaries':ThreeBoundaries,takeaway:Takeaway};
export const Ep13FetchPullPush:React.FC=()=>{const frame=useCurrentFrame();return <CourseLayout seriesTitle={EP13.seriesTitle} episodeTitle={EP13.title} scenes={EP13_SCENES} currentFrame={frame} showHeader={f=>f>=RUNTIME.start('fetch-evidence')} showEpisodeTitle={f=>f>=RUNTIME.start('fetch-evidence')}><EpisodeTimeline runtime={RUNTIME} components={COMPONENTS}/></CourseLayout>;};
