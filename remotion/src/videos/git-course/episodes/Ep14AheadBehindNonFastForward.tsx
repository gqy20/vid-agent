import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {EP14} from '../data/episodes';
import {EP14_DURATION_IN_FRAMES, EP14_SCENES} from '../data/episodeTimelines.generated';
import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated';
import {CourseBranchLabel, CourseCommitNode, CourseGraphEdge, CourseLayout, EpisodeTitleCard, EpisodeTimeline, NarrationSubtitle, RecordedTerminalCueSequence, createEpisodeRuntime, courseCommitAnchor, courseCommitOuterRadius} from '../kit';
import {COLOR, FONT, WEIGHT} from '../palette';
import {seconds} from '../timeline';
import {TYPE} from '../typography';

export {EP14_DURATION_IN_FRAMES, EP14_SCENES};
const RUNTIME=createEpisodeRuntime(EP14_SCENES);
const appear=(frame:number,at:number,duration=.7)=>interpolate(frame,[seconds(at),seconds(at+duration)],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const terminalCue=<T extends keyof typeof TERMINAL_RECORDINGS>(id:T,duration:number)=>({id,from:0,durationInFrames:seconds(duration),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id].holdFromFrame});
const R=courseCommitOuterRadius({scale:1.12,strong:true});

const DivergenceGraph:React.FC<{frame:number;resolved?:boolean}>=({frame,resolved=false})=>{
  const c0={x:210,y:260}, r1={x:560,y:145}, l1={x:560,y:375}, l1r={x:900,y:145};
  const local=resolved?l1r:l1;
  return <svg width="1110" height="540" viewBox="0 0 1110 540" style={{overflow:'visible'}}>
    <g data-graph-layer="edges"><CourseGraphEdge from={courseCommitAnchor(r1.x,r1.y,{scale:1.12})} to={courseCommitAnchor(c0.x,c0.y,{scale:1.12})}/><CourseGraphEdge from={courseCommitAnchor(local.x,local.y,{scale:1.12})} to={courseCommitAnchor(resolved?r1.x:c0.x,resolved?r1.y:c0.y,{scale:1.12})}/></g>
    <g data-graph-layer="refs"><CourseBranchLabel name="origin/main" x={r1.x} y={35} targetX={r1.x} targetY={r1.y} targetRadius={R} color={COLOR.git.head}/><CourseBranchLabel name="main" x={local.x} y={resolved?35:475} targetX={local.x} targetY={local.y} targetRadius={R} color={COLOR.git.main}/></g>
    <g data-graph-layer="nodes"><CourseCommitNode id="C0" {...c0} scale={1.12}/><CourseCommitNode id="R1" {...r1} scale={1.12} tone="feature"/><CourseCommitNode id={resolved?'L1′':'L1'} {...local} scale={1.12} tone="main"/></g>
    <text x="760" y="280" style={{fontFamily:FONT.sans,fontSize:34,fontWeight:WEIGHT.bold,fill:COLOR.text.secondary,opacity:appear(frame,4)}}>{resolved?'线性历史恢复':'ahead 1 · behind 1'}</text>
  </svg>;
};
const Title:React.FC<{children:React.ReactNode}>=({children})=><div style={{...TYPE.hero,fontWeight:WEIGHT.bold,marginBottom:44}}>{children}</div>;
const TerminalScene:React.FC<{scene:string;recording:keyof typeof TERMINAL_RECORDINGS;duration:number;after?:React.ReactNode}>=({scene,recording,duration,after})=>{const frame=useCurrentFrame();return <AbsoluteFill><RecordedTerminalCueSequence cues={[terminalCue(recording,duration)]} rect={{x:250,y:132,width:1420,height:720}} auditIdPrefix={`ep14-${scene}-terminal`}/>{after?<div style={{position:'absolute',left:405,right:405,top:210,opacity:appear(frame,duration+.1)}}>{after}</div>:null}<NarrationSubtitle frame={frame} cues={RUNTIME.captions(scene as never)} width={1320} bottom={64}/></AbsoluteFill>};

// @git-course-scene hook:start
const Hook:React.FC=()=>{const f=useCurrentFrame();return <AbsoluteFill><EpisodeTitleCard index="14." keyword="ahead / behind" suffix="是谁的视角" opacity={1} underlineScale={appear(f,.4)} auditId="ep14-hook-title"/><NarrationSubtitle frame={f} cues={RUNTIME.captions('hook')} width={1320} bottom={64}/></AbsoluteFill>};
// @git-course-scene hook:end
// @git-course-scene stale-count:start
const StaleCount:React.FC=()=> <TerminalScene scene="stale-count" recording="ep14-status-before-fetch" duration={22}/>;
// @git-course-scene stale-count:end
// @git-course-scene fresh-count:start
const FreshCount:React.FC=()=> <TerminalScene scene="fresh-count" recording="ep14-status-after-fetch" duration={22}/>;
// @git-course-scene fresh-count:end
// @git-course-scene diverged:start
const Diverged:React.FC=()=>{const f=useCurrentFrame();return <AbsoluteFill style={{padding:'112px 220px',boxSizing:'border-box'}}><Title>Ahead / behind 是相对已知 upstream 的可达性计数</Title><div style={{display:'flex',justifyContent:'center',marginTop:22}}><DivergenceGraph frame={f}/></div><NarrationSubtitle frame={f} cues={RUNTIME.captions('diverged')} width={1320} bottom={64}/></AbsoluteFill>};
// @git-course-scene diverged:end
// @git-course-scene push-rejected:start
const PushRejected:React.FC=()=>{const f=useCurrentFrame();return <AbsoluteFill><RecordedTerminalCueSequence cues={[terminalCue('ep14-push-rejected',12)]} rect={{x:250,y:132,width:1420,height:720}} auditIdPrefix="ep14-rejected-terminal"/><div style={{position:'absolute',left:0,right:0,top:820,textAlign:'center',...TYPE.title,fontWeight:WEIGHT.bold,color:COLOR.git.conflict,opacity:appear(f,12.2)}}>服务器 main 不是本地 main 的祖先</div><NarrationSubtitle frame={f} cues={RUNTIME.captions('push-rejected')} width={1320} bottom={64}/></AbsoluteFill>};
// @git-course-scene push-rejected:end
// @git-course-scene integrate-first:start
const IntegrateFirst:React.FC=()=>{const f=useCurrentFrame();return <AbsoluteFill><RecordedTerminalCueSequence cues={[terminalCue('ep14-pull-rebase',11)]} rect={{x:250,y:132,width:1420,height:720}} auditIdPrefix="ep14-rebase-terminal"/><div style={{position:'absolute',left:405,right:405,top:190,opacity:appear(f,11.2)}}><DivergenceGraph frame={Math.max(0,f-seconds(11))} resolved/></div><NarrationSubtitle frame={f} cues={RUNTIME.captions('integrate-first')} width={1320} bottom={64}/></AbsoluteFill>};
// @git-course-scene integrate-first:end
// @git-course-scene takeaway:start
const Takeaway:React.FC=()=>{const f=useCurrentFrame();const steps=[['1','fetch','先刷新参照'],['2','inspect','看清分叉'],['3','integrate','选择 merge / rebase'],['4','push','再请求更新远端']];return <AbsoluteFill style={{padding:'140px 210px',boxSizing:'border-box'}}><Title>拒绝不是故障，而是在保护服务器历史</Title><div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:26,marginTop:100}}>{steps.map((s,i)=><div key={s[1]} style={{padding:'30px 24px',background:COLOR.canvas.raised,borderRadius:22,textAlign:'center',opacity:appear(f,2+i*2.6)}}><div style={{fontFamily:FONT.mono,...TYPE.label,color:COLOR.text.tertiary}}>{s[0]}</div><div style={{fontFamily:FONT.mono,...TYPE.title,fontWeight:WEIGHT.bold,color:i===3?COLOR.git.feature:COLOR.git.main,margin:'12px 0'}}>{s[1]}</div><div style={{...TYPE.body,color:COLOR.text.secondary}}>{s[2]}</div></div>)}</div><NarrationSubtitle frame={f} cues={RUNTIME.captions('takeaway')} width={1320} bottom={64}/></AbsoluteFill>};
// @git-course-scene takeaway:end
const COMPONENTS={hook:Hook,'stale-count':StaleCount,'fresh-count':FreshCount,diverged:Diverged,'push-rejected':PushRejected,'integrate-first':IntegrateFirst,takeaway:Takeaway};
export const Ep14AheadBehindNonFastForward:React.FC=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP14.seriesTitle} episodeTitle={EP14.title} scenes={EP14_SCENES} currentFrame={f} showHeader={x=>x>=RUNTIME.start('stale-count')} showEpisodeTitle={x=>x>=RUNTIME.start('stale-count')}><EpisodeTimeline runtime={RUNTIME} components={COMPONENTS}/></CourseLayout>};
