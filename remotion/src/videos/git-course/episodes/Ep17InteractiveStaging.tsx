import {AbsoluteFill,interpolate,useCurrentFrame} from 'remotion';
import {EP17} from '../data/episodes';
import {EP17_DURATION_IN_FRAMES,EP17_SCENES} from '../data/episodeTimelines.generated';
import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated';
import {CenteredSceneBody,CourseCommitNode,CourseGraphEdge,CourseLayout,EpisodeTitleCard,EpisodeTimeline,GitStatePanel,NarrationSubtitle,SceneTitle,TerminalThenModelScene,createEpisodeRuntime,courseCommitAnchor} from '../kit';
import {COLOR,FONT,WEIGHT} from '../palette';
import {seconds} from '../timeline';
import {TYPE} from '../typography';

export {EP17_DURATION_IN_FRAMES,EP17_SCENES};
const R=createEpisodeRuntime(EP17_SCENES);
const appear=(f:number,at:number,d=.7)=>interpolate(f,[seconds(at),seconds(at+d)],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const cue=(id:keyof typeof TERMINAL_RECORDINGS,duration:number)=>({id,from:0,durationInFrames:seconds(duration+.7),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id].holdFromFrame});
const Terminal:React.FC<{scene:string;id:keyof typeof TERMINAL_RECORDINGS;duration:number;children:React.ReactNode}>=({scene,id,duration,children})=><TerminalThenModelScene cues={[cue(id,duration)]} modelAtSeconds={duration} model={children} captions={R.captions(scene as never)} auditIdPrefix={`ep17-${scene}-terminal`}/>;
const SplitModel:React.FC=()=> <CenteredSceneBody width={1280} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:44}}>{[['bug fix','Math.max(total, 1)',COLOR.git.workingTree],['copy edit','checkout ready',COLOR.git.feature]].map(x=><div key={x[0]} style={{padding:38,borderRadius:24,background:COLOR.canvas.raised,border:`3px solid ${x[2]}`}}><div style={{...TYPE.label,fontFamily:FONT.mono,color:x[2]}}>{x[0]}</div><div style={{...TYPE.title,fontFamily:FONT.mono,fontWeight:WEIGHT.bold,marginTop:28}}>{x[1]}</div></div>)}</CenteredSceneBody>;
// @git-course-scene hook:start
const Hook=()=>{const f=useCurrentFrame();return <AbsoluteFill><EpisodeTitleCard index="17." keyword="一个文件" suffix="两个提交？" opacity={1} underlineScale={appear(f,.4)} auditId="ep17-hook"/><NarrationSubtitle frame={f} cues={R.captions('hook')} width={1320} bottom={64}/></AbsoluteFill>};
// @git-course-scene hook:end
// @git-course-scene mixed-work:start
const MixedWork=()=>{const f=useCurrentFrame();return <AbsoluteFill><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>文件边界，不等于提交边界</SceneTitle><SplitModel/><NarrationSubtitle frame={f} cues={R.captions('mixed-work')} width={1320} bottom={64}/></AbsoluteFill>};
// @git-course-scene mixed-work:end
// @git-course-scene inspect-hunks:start
const InspectHunks=()=> <Terminal scene="inspect-hunks" id="ep17-diff" duration={10}><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>两个 Hunk，只是两个候选单位</SceneTitle><SplitModel/></Terminal>;
// @git-course-scene inspect-hunks:end
// @git-course-scene choose-patch:start
const ChoosePatch=()=> <Terminal scene="choose-patch" id="ep17-add-p" duration={12}><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>y 写入 Index，n 留在 Working Tree</SceneTitle><CenteredSceneBody width={1320}><GitStatePanel areas={[{id:'working-tree',title:'Working Tree',files:['copy edit'],active:true},{id:'index',title:'Index',files:['bug fix'],active:true},{id:'repository',title:'Repository',files:['HEAD'],active:false}]} prominent/></CenteredSceneBody></Terminal>;
// @git-course-scene choose-patch:end
// @git-course-scene verify-index:start
const VerifyIndex=()=> <Terminal scene="verify-index" id="ep17-verify" duration={10}><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>从两侧验证，而不是相信一次选择</SceneTitle><CenteredSceneBody width={1320}><GitStatePanel areas={[{id:'working-tree',title:'Working Tree',files:['app.js · copy edit'],active:true},{id:'index',title:'Index',files:['app.js · bug fix'],active:true},{id:'repository',title:'Repository',files:['HEAD'],active:false}]} prominent/></CenteredSceneBody></Terminal>;
// @git-course-scene verify-index:end
// @git-course-scene two-commits:start
const TwoCommits=()=>{const f=useCurrentFrame();const a=courseCommitAnchor(650,520,{size:'hero'}),b=courseCommitAnchor(1050,520,{size:'hero'});return <AbsoluteFill><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>两个意图，形成两个提交</SceneTitle><svg width="1500" height="650" viewBox="0 0 1500 650" style={{margin:'210px auto 0'}}><CourseGraphEdge from={b} to={a} size="hero"/><CourseCommitNode id="fix" x={650} y={520} size="hero" tone="main"/><CourseCommitNode id="copy" x={1050} y={520} size="hero" tone="feature"/></svg><NarrationSubtitle frame={f} cues={R.captions('two-commits')} width={1320} bottom={64}/></AbsoluteFill>};
// @git-course-scene two-commits:end
// @git-course-scene takeaway:start
const Takeaway=()=>{const f=useCurrentFrame();return <AbsoluteFill><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>先定义意图，再操作 Index</SceneTitle><CenteredSceneBody width={1480} style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:36}}>{[['看','diff 识别 hunk'],['选','add -p 回答'],['验','cached / working']].map((x,i)=><div key={x[0]} style={{padding:38,textAlign:'center',borderRadius:24,background:COLOR.canvas.raised,opacity:appear(f,2+i*3)}}><div style={{...TYPE.hero,fontWeight:WEIGHT.bold,color:[COLOR.git.main,COLOR.git.head,COLOR.git.feature][i]}}>{x[0]}</div><div style={{...TYPE.body,fontWeight:WEIGHT.bold,marginTop:24}}>{x[1]}</div></div>)}</CenteredSceneBody><NarrationSubtitle frame={f} cues={R.captions('takeaway')} width={1320} bottom={64}/></AbsoluteFill>};
// @git-course-scene takeaway:end
const C={hook:Hook,'mixed-work':MixedWork,'inspect-hunks':InspectHunks,'choose-patch':ChoosePatch,'verify-index':VerifyIndex,'two-commits':TwoCommits,takeaway:Takeaway};
export const Ep17InteractiveStaging=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP17.seriesTitle} episodeTitle={EP17.title} scenes={EP17_SCENES} currentFrame={f} showHeader={x=>x>=R.start('mixed-work')} showEpisodeTitle={x=>x>=R.start('mixed-work')}><EpisodeTimeline runtime={R} components={C}/></CourseLayout>};
