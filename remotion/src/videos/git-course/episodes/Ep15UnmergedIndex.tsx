import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {EP15} from '../data/episodes';
import {EP15_DURATION_IN_FRAMES, EP15_SCENES} from '../data/episodeTimelines.generated';
import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated';
import {CourseLayout, EpisodeTitleCard, EpisodeTimeline, NarrationSubtitle, RecordedTerminalCueSequence, createEpisodeRuntime} from '../kit';
import {COLOR, FONT, WEIGHT} from '../palette';
import {seconds} from '../timeline';
import {TYPE} from '../typography';

export {EP15_DURATION_IN_FRAMES, EP15_SCENES};
const RUNTIME=createEpisodeRuntime(EP15_SCENES);
const appear=(frame:number,at:number,d=.7)=>interpolate(frame,[seconds(at),seconds(at+d)],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const terminalCue=<T extends keyof typeof TERMINAL_RECORDINGS>(id:T,from:number,duration:number)=>({id,from:seconds(from),durationInFrames:seconds(duration),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id].holdFromFrame});
const Title:React.FC<{children:React.ReactNode}>=({children})=><div style={{...TYPE.hero,fontWeight:WEIGHT.bold,marginBottom:44}}>{children}</div>;
const StageCard:React.FC<{stage:string;role:string;code:string;color:string;opacity?:number}>=({stage,role,code,color,opacity=1})=><div style={{opacity,border:`3px solid ${color}`,borderRadius:22,background:COLOR.canvas.raised,padding:'26px 28px',minHeight:230,boxSizing:'border-box'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontFamily:FONT.mono,...TYPE.title,fontWeight:WEIGHT.bold,color}}>stage {stage}</span><span style={{...TYPE.ui,fontWeight:WEIGHT.bold,color:COLOR.text.secondary}}>{role}</span></div><div style={{fontFamily:FONT.mono,...TYPE.body,marginTop:48,color:COLOR.text.primary}}>{code}</div></div>;
const ThreeStages:React.FC<{frame:number;stageZero?:boolean}>=({frame,stageZero=false})=>stageZero?<div style={{width:820}}><StageCard stage="0" role="resolved" code={'const title = "resolved";'} color={COLOR.git.index} opacity={appear(frame,2)}/></div>:<div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:28}}><StageCard stage="1" role="base" code={'const title = "base";'} color={COLOR.text.tertiary} opacity={appear(frame,2)}/><StageCard stage="2" role="ours" code={'const title = "main";'} color={COLOR.git.main} opacity={appear(frame,4.5)}/><StageCard stage="3" role="theirs" code={'const title = "feature";'} color={COLOR.git.feature} opacity={appear(frame,7)}/></div>;
const Terminal:React.FC<{scene:string;cues:readonly ReturnType<typeof terminalCue>[];note?:string}>=({scene,cues,note})=>{const f=useCurrentFrame();return <AbsoluteFill><RecordedTerminalCueSequence cues={cues} rect={{x:250,y:132,width:1420,height:720}} auditIdPrefix={`ep15-${scene}-terminal`}/>{note?<div style={{position:'absolute',left:0,right:0,top:820,textAlign:'center',...TYPE.title,fontWeight:WEIGHT.bold,color:COLOR.git.conflict,opacity:appear(f,10)}}>{note}</div>:null}<NarrationSubtitle frame={f} cues={RUNTIME.captions(scene as never)} width={1320} bottom={64}/></AbsoluteFill>};

// @git-course-scene hook:start
const Hook:React.FC=()=>{const f=useCurrentFrame();return <AbsoluteFill><EpisodeTitleCard index="15." keyword="conflict" suffix="不只在文件里" opacity={1} underlineScale={appear(f,.4)} auditId="ep15-hook-title"/><NarrationSubtitle frame={f} cues={RUNTIME.captions('hook')} width={1320} bottom={64}/></AbsoluteFill>};
// @git-course-scene hook:end
// @git-course-scene create-conflict:start
const CreateConflict:React.FC=()=> <Terminal scene="create-conflict" cues={[terminalCue('ep15-merge-conflict',0,27)]} note="Working Tree 有标记 · Index 有三组条目"/>;
// @git-course-scene create-conflict:end
// @git-course-scene index-stages:start
const IndexStages:React.FC=()=>{const f=useCurrentFrame();return <AbsoluteFill style={{padding:'112px 170px',boxSizing:'border-box'}}><Title>冲突时，Index 暂存三份输入</Title><ThreeStages frame={f}/><div style={{textAlign:'center',marginTop:42,...TYPE.subtitle,color:COLOR.text.secondary,opacity:appear(f,11)}}>它们是合并输入，不是三份 Working Tree 文件</div><NarrationSubtitle frame={f} cues={RUNTIME.captions('index-stages')} width={1320} bottom={64}/></AbsoluteFill>};
// @git-course-scene index-stages:end
// @git-course-scene inspect-stages:start
const InspectStages:React.FC=()=> <Terminal scene="inspect-stages" cues={[terminalCue('ep15-ls-files-unmerged',0,9),terminalCue('ep15-show-base',9,7),terminalCue('ep15-show-ours',16,7),terminalCue('ep15-show-theirs',23,8)]}/>;
// @git-course-scene inspect-stages:end
// @git-course-scene resolve-working-tree:start
const ResolveWorkingTree:React.FC=()=>{const f=useCurrentFrame();return <AbsoluteFill style={{padding:'112px 250px',boxSizing:'border-box'}}><Title>先在 Working Tree 写出你真正想保留的结果</Title><div style={{margin:'74px auto 0',maxWidth:1080,borderRadius:24,background:COLOR.canvas.raised,padding:'38px 46px'}}><div style={{fontFamily:FONT.mono,...TYPE.label,color:COLOR.text.tertiary}}>app.js</div><div style={{fontFamily:FONT.mono,fontSize:42,lineHeight:1.5,fontWeight:WEIGHT.bold,marginTop:26}}><span style={{color:COLOR.git.workingTree}}>const</span> title = <span style={{color:COLOR.git.feature}}>&quot;resolved&quot;</span>;</div></div><div style={{textAlign:'center',marginTop:48,...TYPE.title,fontWeight:WEIGHT.bold,color:COLOR.git.conflict,opacity:appear(f,8)}}>删掉标记 ≠ 已告诉 Index 冲突解决</div><NarrationSubtitle frame={f} cues={RUNTIME.captions('resolve-working-tree')} width={1320} bottom={64}/></AbsoluteFill>};
// @git-course-scene resolve-working-tree:end
// @git-course-scene stage-zero:start
const StageZero:React.FC=()=>{const f=useCurrentFrame();return <AbsoluteFill><RecordedTerminalCueSequence cues={[terminalCue('ep15-add-resolved',0,8),terminalCue('ep15-stage-zero',8,9)]} rect={{x:250,y:132,width:1420,height:720}} auditIdPrefix="ep15-stage-zero-terminal"/><div style={{position:'absolute',left:550,right:550,top:250,display:'flex',justifyContent:'center',opacity:appear(f,17.1)}}><ThreeStages frame={Math.max(0,f-seconds(17))} stageZero/></div><NarrationSubtitle frame={f} cues={RUNTIME.captions('stage-zero')} width={1320} bottom={64}/></AbsoluteFill>};
// @git-course-scene stage-zero:end
// @git-course-scene finish-or-abort:start
const FinishOrAbort:React.FC=()=>{const f=useCurrentFrame();return <AbsoluteFill><RecordedTerminalCueSequence cues={[terminalCue('ep15-merge-continue',0,10)]} rect={{x:250,y:132,width:1420,height:720}} auditIdPrefix="ep15-finish-terminal"/><div style={{position:'absolute',left:270,right:270,top:270,display:'grid',gridTemplateColumns:'1fr 1fr',gap:54,opacity:appear(f,10.2)}}>{[['continue','用 stage 0 完成整合'],['abort','回到操作开始前']].map((x,i)=><div key={x[0]} style={{padding:'40px',borderRadius:26,background:COLOR.canvas.raised,textAlign:'center'}}><div style={{fontFamily:FONT.mono,...TYPE.title,fontWeight:WEIGHT.bold,color:i?COLOR.git.conflict:COLOR.git.index}}>{x[0]}</div><div style={{...TYPE.body,marginTop:24,color:COLOR.text.secondary}}>{x[1]}</div></div>)}</div><NarrationSubtitle frame={f} cues={RUNTIME.captions('finish-or-abort')} width={1320} bottom={64}/></AbsoluteFill>};
// @git-course-scene finish-or-abort:end
// @git-course-scene takeaway:start
const Takeaway:React.FC=()=>{const f=useCurrentFrame();const rows=[['unmerged','stage 1 / 2 / 3'],['resolve','编辑 Working Tree'],['git add','写入 stage 0'],['continue','完成 merge / rebase']];return <AbsoluteFill style={{padding:'130px 280px',boxSizing:'border-box'}}><Title>把冲突看成 Index 状态机</Title><div style={{display:'grid',gap:20,marginTop:40}}>{rows.map((r,i)=><div key={r[0]} style={{display:'grid',gridTemplateColumns:'290px 1fr',padding:'22px 28px',borderRadius:18,background:COLOR.canvas.raised,opacity:appear(f,2+i*2.5)}}><span style={{fontFamily:FONT.mono,...TYPE.title,fontWeight:WEIGHT.bold,color:i<2?COLOR.git.conflict:COLOR.git.index}}>{r[0]}</span><span style={{...TYPE.subtitle,textAlign:'right'}}>{r[1]}</span></div>)}</div><NarrationSubtitle frame={f} cues={RUNTIME.captions('takeaway')} width={1320} bottom={64}/></AbsoluteFill>};
// @git-course-scene takeaway:end
const COMPONENTS={hook:Hook,'create-conflict':CreateConflict,'index-stages':IndexStages,'inspect-stages':InspectStages,'resolve-working-tree':ResolveWorkingTree,'stage-zero':StageZero,'finish-or-abort':FinishOrAbort,takeaway:Takeaway};
export const Ep15UnmergedIndex:React.FC=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP15.seriesTitle} episodeTitle={EP15.title} scenes={EP15_SCENES} currentFrame={f} showHeader={x=>x>=RUNTIME.start('create-conflict')} showEpisodeTitle={x=>x>=RUNTIME.start('create-conflict')}><EpisodeTimeline runtime={RUNTIME} components={COMPONENTS}/></CourseLayout>};
