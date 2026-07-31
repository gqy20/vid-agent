import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {EP14} from '../data/episodes';
import {EP14_DURATION_IN_FRAMES, EP14_SCENES} from '../data/episodeTimelines.generated';
import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated';
import {COURSE_GRAPH_PRESETS, CourseBranchLabel, CourseCommitNode, CourseGraphEdge, CourseLayout, EpisodeTitleCard, EpisodeTimeline, NarrationSubtitle, RecordedTerminalCueSequence, SceneTitle, createEpisodeRuntime, courseCommitAnchor, courseCommitOuterRadius} from '../kit';
import {COLOR, FONT, WEIGHT} from '../palette';
import {seconds} from '../timeline';
import {TYPE} from '../typography';

export {EP14_DURATION_IN_FRAMES, EP14_SCENES};
const RUNTIME=createEpisodeRuntime(EP14_SCENES);
const appear=(frame:number,at:number,duration=.7)=>interpolate(frame,[seconds(at),seconds(at+duration)],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const terminalCue=<T extends keyof typeof TERMINAL_RECORDINGS>(id:T,duration:number)=>({id,from:0,durationInFrames:seconds(duration),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id].holdFromFrame});
const GRAPH_SIZE='hero' as const;
const GRAPH_PRESET=COURSE_GRAPH_PRESETS[GRAPH_SIZE];
const GRAPH_NODE_RADIUS=courseCommitOuterRadius({size:GRAPH_SIZE,strong:true});
const MODEL_FRAME_STYLE={position:'absolute',left:300,right:300,top:226,height:590,display:'flex',alignItems:'center',justifyContent:'center'} as const;

type DivergenceMode='diverged'|'rejected'|'resolved';
const DivergenceGraph:React.FC<{frame:number;mode?:DivergenceMode}>=({frame,mode='diverged'})=>{
  const resolved=mode==='resolved';
  const c1=resolved?{x:660-GRAPH_PRESET.commitGap,y:280}:{x:220,y:280};
  const remote=resolved?{x:660,y:280}:{x:620,y:160};
  const local=resolved?{x:660+GRAPH_PRESET.commitGap,y:280}:{x:620,y:400};
  const anchor=(node:{x:number;y:number})=>courseCommitAnchor(node.x,node.y,{size:GRAPH_SIZE,strong:true});
  return <svg width="1320" height="560" viewBox="0 0 1320 560" style={{overflow:'visible'}}>
    <g data-graph-layer="edges"><CourseGraphEdge size={GRAPH_SIZE} from={anchor(remote)} to={anchor(c1)}/><CourseGraphEdge size={GRAPH_SIZE} from={anchor(local)} to={anchor(resolved?remote:c1)}/></g>
    <g data-graph-layer="refs"><CourseBranchLabel name="origin/main" x={remote.x} placement="above" targetX={remote.x} targetY={remote.y} targetRadius={GRAPH_NODE_RADIUS} size={GRAPH_SIZE} color={COLOR.git.head}/><CourseBranchLabel name="main" x={local.x} placement={resolved?'above':'below'} targetX={local.x} targetY={local.y} targetRadius={GRAPH_NODE_RADIUS} size={GRAPH_SIZE} color={COLOR.git.main}/></g>
    <g data-graph-layer="nodes"><CourseCommitNode id="C1" {...c1} size={GRAPH_SIZE}/><CourseCommitNode id="R2" {...remote} size={GRAPH_SIZE} tone="feature"/><CourseCommitNode id={resolved?'L2′':'L2'} {...local} size={GRAPH_SIZE} tone="main"/></g>
    {mode==='diverged'?<g opacity={appear(frame,4)}><rect x="850" y="164" width="420" height="240" rx="22" fill={COLOR.canvas.raised}/><text x="900" y="236" style={{fontFamily:FONT.mono,fontSize:34,fontWeight:WEIGHT.bold,fill:COLOR.git.main}}>ahead</text><text x="1210" y="236" textAnchor="end" style={{fontFamily:FONT.mono,fontSize:46,fontWeight:WEIGHT.bold,fill:COLOR.git.main}}>1</text><line x1="900" y1="278" x2="1220" y2="278" stroke={COLOR.git.graphLine} strokeWidth="3" opacity="0.6"/><text x="900" y="352" style={{fontFamily:FONT.mono,fontSize:34,fontWeight:WEIGHT.bold,fill:COLOR.git.head}}>behind</text><text x="1210" y="352" textAnchor="end" style={{fontFamily:FONT.mono,fontSize:46,fontWeight:WEIGHT.bold,fill:COLOR.git.head}}>1</text></g>:null}
    {mode==='rejected'?<g opacity={appear(frame,1.2)}><rect x="850" y="198" width="420" height="166" rx="22" fill={COLOR.canvas.raised} stroke={COLOR.git.conflict} strokeWidth="3"/><text x="1060" y="258" textAnchor="middle" style={{fontFamily:FONT.mono,fontSize:30,fontWeight:WEIGHT.bold,fill:COLOR.git.conflict}}>server main：R2 → L2</text><text x="1060" y="320" textAnchor="middle" style={{fontFamily:FONT.sans,fontSize:30,fontWeight:WEIGHT.bold,fill:COLOR.text.primary}}>R2 不是 L2 的祖先</text></g>:null}
    {resolved?<text x="660" y="448" textAnchor="middle" style={{fontFamily:FONT.sans,fontSize:36,fontWeight:WEIGHT.bold,fill:COLOR.git.main,opacity:appear(frame,2.2)}}>R2 已经是 L2′ 的祖先</text>:null}
  </svg>;
};
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
const Diverged:React.FC=()=>{const f=useCurrentFrame();return <AbsoluteFill><SceneTitle marginBottom={0} style={{position:'absolute',left:180,right:180,top:112}}>Ahead / behind：比较两个本地 Ref</SceneTitle><div style={MODEL_FRAME_STYLE}><DivergenceGraph frame={f}/></div><NarrationSubtitle frame={f} cues={RUNTIME.captions('diverged')} width={1320} bottom={64}/></AbsoluteFill>};
// @git-course-scene diverged:end
// @git-course-scene push-rejected:start
const PushRejected:React.FC=()=>{const f=useCurrentFrame();const showModel=f>=seconds(12);return <AbsoluteFill><RecordedTerminalCueSequence cues={[terminalCue('ep14-push-rejected',12)]} rect={{x:250,y:132,width:1420,height:720}} auditIdPrefix="ep14-rejected-terminal"/>{showModel?<><SceneTitle marginBottom={0} style={{position:'absolute',left:180,right:180,top:112}}>被拒绝的是一次 Ref 更新</SceneTitle><div style={MODEL_FRAME_STYLE}><DivergenceGraph frame={f-seconds(12)} mode="rejected"/></div></>:null}<NarrationSubtitle frame={f} cues={RUNTIME.captions('push-rejected')} width={1320} bottom={64}/></AbsoluteFill>};
// @git-course-scene push-rejected:end
// @git-course-scene integrate-first:start
const IntegrateFirst:React.FC=()=>{const f=useCurrentFrame();const showModel=f>=seconds(11);return <AbsoluteFill><RecordedTerminalCueSequence cues={[terminalCue('ep14-pull-rebase',11)]} rect={{x:250,y:132,width:1420,height:720}} auditIdPrefix="ep14-rebase-terminal"/>{showModel?<><SceneTitle marginBottom={0} style={{position:'absolute',left:180,right:180,top:112}}>先整合，再让远端快进</SceneTitle><div style={MODEL_FRAME_STYLE}><DivergenceGraph frame={f-seconds(11)} mode="resolved"/></div></>:null}<NarrationSubtitle frame={f} cues={RUNTIME.captions('integrate-first')} width={1320} bottom={64}/></AbsoluteFill>};
// @git-course-scene integrate-first:end
// @git-course-scene takeaway:start
const Takeaway:React.FC=()=>{const f=useCurrentFrame();const steps=[['fetch','先刷新参照'],['inspect','看清分叉'],['integrate','选择 merge / rebase'],['push','再请求更新远端']];return <AbsoluteFill style={{padding:'140px 210px',boxSizing:'border-box'}}><SceneTitle>拒绝不是故障，而是在保护服务器历史</SceneTitle><div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:26,marginTop:100}}>{steps.map((s,i)=><div key={s[0]} style={{padding:'42px 24px',background:COLOR.canvas.raised,borderRadius:22,textAlign:'center',opacity:appear(f,2+i*2.6)}}><div style={{fontFamily:FONT.mono,...TYPE.title,fontWeight:WEIGHT.bold,color:i===3?COLOR.git.feature:COLOR.git.main,margin:'0 0 16px'}}>{s[0]}</div><div style={{...TYPE.body,color:COLOR.text.secondary}}>{s[1]}</div></div>)}</div><NarrationSubtitle frame={f} cues={RUNTIME.captions('takeaway')} width={1320} bottom={64}/></AbsoluteFill>};
// @git-course-scene takeaway:end
const COMPONENTS={hook:Hook,'stale-count':StaleCount,'fresh-count':FreshCount,diverged:Diverged,'push-rejected':PushRejected,'integrate-first':IntegrateFirst,takeaway:Takeaway};
export const Ep14AheadBehindNonFastForward:React.FC=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP14.seriesTitle} episodeTitle={EP14.title} scenes={EP14_SCENES} currentFrame={f} showHeader={x=>x>=RUNTIME.start('stale-count')} showEpisodeTitle={x=>x>=RUNTIME.start('stale-count')}><EpisodeTimeline runtime={RUNTIME} components={COMPONENTS}/></CourseLayout>};
