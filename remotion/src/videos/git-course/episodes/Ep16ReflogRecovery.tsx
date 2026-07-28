import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {EP16} from '../data/episodes';
import {EP16_DURATION_IN_FRAMES, EP16_SCENES} from '../data/episodeTimelines.generated';
import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated';
import {COURSE_GRAPH_PRESETS, CourseBranchLabel, CourseCommitNode, CourseGraphEdge, CourseLayout, EpisodeTitleCard, EpisodeTimeline, NarrationSubtitle, RecordedTerminalCueSequence, SceneTitle, createEpisodeRuntime, courseCommitAnchor, courseCommitOuterRadius} from '../kit';
import {COLOR, FONT, WEIGHT} from '../palette';
import {seconds} from '../timeline';
import {TYPE} from '../typography';

export {EP16_DURATION_IN_FRAMES, EP16_SCENES};
const RUNTIME=createEpisodeRuntime(EP16_SCENES);
const appear=(f:number,at:number,d=.7)=>interpolate(f,[seconds(at),seconds(at+d)],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const terminalCue=<T extends keyof typeof TERMINAL_RECORDINGS>(id:T,duration:number)=>({id,from:0,durationInFrames:seconds(duration),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id].holdFromFrame});
const HISTORY_GRAPH_SIZE='hero' as const;
const HISTORY_GRAPH_PRESET=COURSE_GRAPH_PRESETS[HISTORY_GRAPH_SIZE];
const HISTORY_NODE_RADIUS=courseCommitOuterRadius({size:HISTORY_GRAPH_SIZE,strong:true});
const History:React.FC<{frame:number;reset?:boolean;rescued?:boolean}>=({frame,reset=false,rescued=false})=>{const centerX=660;const nodes=[{id:'C1',x:centerX-HISTORY_GRAPH_PRESET.commitGap},{id:'C2',x:centerX},{id:'C3',x:centerX+HISTORY_GRAPH_PRESET.commitGap}];const mainX=reset?nodes[0].x:nodes[2].x;const anchor=(x:number)=>courseCommitAnchor(x,260,{size:HISTORY_GRAPH_SIZE,strong:true});return <svg width="1320" height="500" viewBox="0 0 1320 500" style={{overflow:'visible'}}><g data-graph-layer="edges"><CourseGraphEdge size={HISTORY_GRAPH_SIZE} from={anchor(nodes[1].x)} to={anchor(nodes[0].x)}/><CourseGraphEdge size={HISTORY_GRAPH_SIZE} from={anchor(nodes[2].x)} to={anchor(nodes[1].x)}/></g><g data-graph-layer="refs"><CourseBranchLabel name="main" x={mainX} placement="above" targetX={mainX} targetY={260} targetRadius={HISTORY_NODE_RADIUS} size={HISTORY_GRAPH_SIZE} color={COLOR.git.main}/>{rescued?<CourseBranchLabel name="rescue" x={nodes[2].x} placement="below" targetX={nodes[2].x} targetY={260} targetRadius={HISTORY_NODE_RADIUS} size={HISTORY_GRAPH_SIZE} color={COLOR.git.feature}/>:null}</g><g data-graph-layer="nodes">{nodes.map((n,i)=><CourseCommitNode key={n.id} id={n.id} x={n.x} y={260} size={HISTORY_GRAPH_SIZE} tone={i===2?'feature':'default'} opacity={reset&&i>0?.38:1}/>)}</g>{reset?<text x={centerX} y="48" textAnchor="middle" style={{fontFamily:FONT.mono,fontSize:30,fontWeight:WEIGHT.bold,fill:COLOR.git.head,opacity:appear(frame,3)}}>HEAD@&#123;1&#125; → C3</text>:null}</svg>};
const TerminalThenHistory:React.FC<{scene:string;recording:keyof typeof TERMINAL_RECORDINGS;duration:number;reset?:boolean;rescued?:boolean}>=({scene,recording,duration,reset,rescued})=>{const f=useCurrentFrame();return <AbsoluteFill><RecordedTerminalCueSequence cues={[terminalCue(recording,duration)]} rect={{x:250,y:132,width:1420,height:720}} auditIdPrefix={`ep16-${scene}-terminal`}/><div style={{position:'absolute',left:300,right:300,top:200,opacity:appear(f,duration+.1)}}><History frame={Math.max(0,f-seconds(duration))} reset={reset} rescued={rescued}/></div><NarrationSubtitle frame={f} cues={RUNTIME.captions(scene as never)} width={1320} bottom={64}/></AbsoluteFill>};

// @git-course-scene hook:start
const Hook:React.FC=()=>{const f=useCurrentFrame();return <AbsoluteFill><EpisodeTitleCard index="16." keyword="commit 不见了" suffix="先别急" opacity={1} underlineScale={appear(f,.4)} auditId="ep16-hook-title"/><NarrationSubtitle frame={f} cues={RUNTIME.captions('hook')} width={1320} bottom={64}/></AbsoluteFill>};
// @git-course-scene hook:end
// @git-course-scene lose-commit:start
const LoseCommit:React.FC=()=> <TerminalThenHistory scene="lose-commit" recording="ep16-reset-hard" duration={9} reset/>;
// @git-course-scene lose-commit:end
// @git-course-scene read-reflog:start
const ReadReflog:React.FC=()=> <TerminalThenHistory scene="read-reflog" recording="ep16-reflog" duration={11} reset/>;
// @git-course-scene read-reflog:end
// @git-course-scene verify-object:start
const VerifyObject:React.FC=()=> <TerminalThenHistory scene="verify-object" recording="ep16-show-old" duration={11} reset/>;
// @git-course-scene verify-object:end
// @git-course-scene create-rescue:start
const CreateRescue:React.FC=()=> <TerminalThenHistory scene="create-rescue" recording="ep16-rescue" duration={9} reset rescued/>;
// @git-course-scene create-rescue:end
// @git-course-scene limits:start
const Limits:React.FC=()=>{const f=useCurrentFrame();const items=[['本地','reflog 不会从服务器同步回来'],['有期限','条目会按策略过期'],['对象仍需存在','不可达对象可能被回收']];return <AbsoluteFill style={{padding:'120px 220px',boxSizing:'border-box'}}><SceneTitle>Reflog 是安全网，不是永久备份</SceneTitle><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:38,marginTop:100}}>{items.map((x,i)=><div key={x[0]} style={{minHeight:300,padding:'38px 34px',borderRadius:26,background:COLOR.canvas.raised,opacity:appear(f,2+i*3.3)}}><div style={{...TYPE.title,fontWeight:WEIGHT.bold,color:[COLOR.git.main,COLOR.git.head,COLOR.git.conflict][i]}}>{x[0]}</div><div style={{...TYPE.body,lineHeight:1.55,color:COLOR.text.secondary,marginTop:34}}>{x[1]}</div></div>)}</div><NarrationSubtitle frame={f} cues={RUNTIME.captions('limits')} width={1320} bottom={64}/></AbsoluteFill>};
// @git-course-scene limits:end
// @git-course-scene takeaway:start
const Takeaway:React.FC=()=>{const f=useCurrentFrame();const steps=[['停','先停止继续改写 refs'],['找','reflog 定位旧位置'],['验','git show 验证对象'],['保','branch / tag 建立引用']];return <AbsoluteFill style={{padding:'132px 220px',boxSizing:'border-box'}}><SceneTitle>恢复不是回滚：先找到，再建立新引用</SceneTitle><div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:28,marginTop:100}}>{steps.map((x,i)=><div key={x[0]} style={{textAlign:'center',opacity:appear(f,2+i*2.5)}}><div style={{width:92,height:92,borderRadius:50,display:'grid',placeItems:'center',margin:'0 auto',background:i===3?COLOR.git.feature:COLOR.git.main,color:COLOR.canvas.raised,...TYPE.title,fontWeight:WEIGHT.bold}}>{x[0]}</div><div style={{...TYPE.body,fontWeight:WEIGHT.bold,marginTop:28}}>{x[1]}</div></div>)}</div><NarrationSubtitle frame={f} cues={RUNTIME.captions('takeaway')} width={1320} bottom={64}/></AbsoluteFill>};
// @git-course-scene takeaway:end
const COMPONENTS={hook:Hook,'lose-commit':LoseCommit,'read-reflog':ReadReflog,'verify-object':VerifyObject,'create-rescue':CreateRescue,limits:Limits,takeaway:Takeaway};
export const Ep16ReflogRecovery:React.FC=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP16.seriesTitle} episodeTitle={EP16.title} scenes={EP16_SCENES} currentFrame={f} showHeader={x=>x>=RUNTIME.start('lose-commit')} showEpisodeTitle={x=>x>=RUNTIME.start('lose-commit')}><EpisodeTimeline runtime={RUNTIME} components={COMPONENTS}/></CourseLayout>};
