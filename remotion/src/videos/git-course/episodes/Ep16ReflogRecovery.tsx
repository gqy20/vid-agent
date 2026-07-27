import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {EP16} from '../data/episodes';
import {EP16_DURATION_IN_FRAMES, EP16_SCENES} from '../data/episodeTimelines.generated';
import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated';
import {CourseBranchLabel, CourseCommitNode, CourseGraphEdge, CourseLayout, EpisodeTitleCard, EpisodeTimeline, NarrationSubtitle, RecordedTerminalCueSequence, createEpisodeRuntime, courseCommitAnchor, courseCommitOuterRadius} from '../kit';
import {COLOR, FONT, WEIGHT} from '../palette';
import {seconds} from '../timeline';
import {TYPE} from '../typography';

export {EP16_DURATION_IN_FRAMES, EP16_SCENES};
const RUNTIME=createEpisodeRuntime(EP16_SCENES);
const appear=(f:number,at:number,d=.7)=>interpolate(f,[seconds(at),seconds(at+d)],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const terminalCue=<T extends keyof typeof TERMINAL_RECORDINGS>(id:T,duration:number)=>({id,from:0,durationInFrames:seconds(duration),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id].holdFromFrame});
const R=courseCommitOuterRadius({scale:1.14,strong:true});
const History:React.FC<{frame:number;reset?:boolean;rescued?:boolean}>=({frame,reset=false,rescued=false})=>{const nodes=[{id:'C1',x:210},{id:'C2',x:520},{id:'C3',x:830}];return <svg width="1100" height="460" viewBox="0 0 1100 460" style={{overflow:'visible'}}><g data-graph-layer="edges"><CourseGraphEdge from={courseCommitAnchor(520,235,{scale:1.14})} to={courseCommitAnchor(210,235,{scale:1.14})}/><CourseGraphEdge from={courseCommitAnchor(830,235,{scale:1.14})} to={courseCommitAnchor(520,235,{scale:1.14})}/></g><g data-graph-layer="refs"><CourseBranchLabel name="main" x={reset?210:830} y={90} targetX={reset?210:830} targetY={235} targetRadius={R} color={COLOR.git.main}/>{rescued?<CourseBranchLabel name="rescue" x={830} y={380} targetX={830} targetY={235} targetRadius={R} color={COLOR.git.feature}/>:null}</g><g data-graph-layer="nodes">{nodes.map((n,i)=><CourseCommitNode key={n.id} id={n.id} x={n.x} y={235} scale={1.14} tone={i===2?'feature':'default'} opacity={reset&&i>0?.38:1}/>)}</g>{reset?<text x="465" y="44" style={{fontFamily:FONT.mono,fontSize:28,fontWeight:WEIGHT.bold,fill:COLOR.git.head,opacity:appear(frame,3)}}>HEAD@&#123;1&#125; → C3</text>:null}</svg>};
const Title:React.FC<{children:React.ReactNode}>=({children})=><div style={{...TYPE.hero,fontWeight:WEIGHT.bold,marginBottom:44}}>{children}</div>;
const TerminalThenHistory:React.FC<{scene:string;recording:keyof typeof TERMINAL_RECORDINGS;duration:number;reset?:boolean;rescued?:boolean}>=({scene,recording,duration,reset,rescued})=>{const f=useCurrentFrame();return <AbsoluteFill><RecordedTerminalCueSequence cues={[terminalCue(recording,duration)]} rect={{x:250,y:132,width:1420,height:720}} auditIdPrefix={`ep16-${scene}-terminal`}/><div style={{position:'absolute',left:410,right:410,top:220,opacity:appear(f,duration+.1)}}><History frame={Math.max(0,f-seconds(duration))} reset={reset} rescued={rescued}/></div><NarrationSubtitle frame={f} cues={RUNTIME.captions(scene as never)} width={1320} bottom={64}/></AbsoluteFill>};

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
const Limits:React.FC=()=>{const f=useCurrentFrame();const items=[['本地','reflog 不会从服务器同步回来'],['有期限','条目会按策略过期'],['对象仍需存在','不可达对象可能被回收']];return <AbsoluteFill style={{padding:'120px 220px',boxSizing:'border-box'}}><Title>Reflog 是安全网，不是永久备份</Title><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:38,marginTop:100}}>{items.map((x,i)=><div key={x[0]} style={{minHeight:300,padding:'38px 34px',borderRadius:26,background:COLOR.canvas.raised,opacity:appear(f,2+i*3.3)}}><div style={{...TYPE.title,fontWeight:WEIGHT.bold,color:[COLOR.git.main,COLOR.git.head,COLOR.git.conflict][i]}}>{x[0]}</div><div style={{...TYPE.body,lineHeight:1.55,color:COLOR.text.secondary,marginTop:34}}>{x[1]}</div></div>)}</div><NarrationSubtitle frame={f} cues={RUNTIME.captions('limits')} width={1320} bottom={64}/></AbsoluteFill>};
// @git-course-scene limits:end
// @git-course-scene takeaway:start
const Takeaway:React.FC=()=>{const f=useCurrentFrame();const steps=[['停','先停止继续改写 refs'],['找','reflog 定位旧位置'],['验','git show 验证对象'],['保','branch / tag 建立引用']];return <AbsoluteFill style={{padding:'132px 220px',boxSizing:'border-box'}}><Title>恢复不是回滚：先找到，再建立新引用</Title><div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:28,marginTop:100}}>{steps.map((x,i)=><div key={x[0]} style={{textAlign:'center',opacity:appear(f,2+i*2.5)}}><div style={{width:92,height:92,borderRadius:50,display:'grid',placeItems:'center',margin:'0 auto',background:i===3?COLOR.git.feature:COLOR.git.main,color:COLOR.canvas.raised,...TYPE.title,fontWeight:WEIGHT.bold}}>{x[0]}</div><div style={{...TYPE.body,fontWeight:WEIGHT.bold,marginTop:28}}>{x[1]}</div></div>)}</div><NarrationSubtitle frame={f} cues={RUNTIME.captions('takeaway')} width={1320} bottom={64}/></AbsoluteFill>};
// @git-course-scene takeaway:end
const COMPONENTS={hook:Hook,'lose-commit':LoseCommit,'read-reflog':ReadReflog,'verify-object':VerifyObject,'create-rescue':CreateRescue,limits:Limits,takeaway:Takeaway};
export const Ep16ReflogRecovery:React.FC=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP16.seriesTitle} episodeTitle={EP16.title} scenes={EP16_SCENES} currentFrame={f} showHeader={x=>x>=RUNTIME.start('lose-commit')} showEpisodeTitle={x=>x>=RUNTIME.start('lose-commit')}><EpisodeTimeline runtime={RUNTIME} components={COMPONENTS}/></CourseLayout>};
