import {useCurrentFrame} from 'remotion'; import {EP48} from '../data/episodes'; import {EP48_DURATION_IN_FRAMES,EP48_SCENES} from '../data/episodeTimelines.generated'; import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated'; import {CourseLayout,EpisodeTimeline,SceneTitle,TerminalThenModelScene,createEpisodeRuntime} from '../kit'; import {seconds} from '../timeline'; import {CompareCards,FlowSteps,ModelScene,QuestionSceneVisual} from './WorkflowEpisodeVisuals';
export {EP48_DURATION_IN_FRAMES,EP48_SCENES}; const R=createEpisodeRuntime(EP48_SCENES); const cue=(id:string,d=12)=>({id:id as keyof typeof TERMINAL_RECORDINGS,from:0,durationInFrames:seconds(d+.7),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id as keyof typeof TERMINAL_RECORDINGS].holdFromFrame}); const Term=({scene,id,result,at=12}:{scene:Parameters<typeof R.captions>[0];id:string;result:React.ReactNode;at?:number})=><TerminalThenModelScene cues={[cue(id,at)]} modelAtSeconds={at} terminalEvidenceHoldSeconds={1} model={result} captions={R.captions(scene)} auditIdPrefix={`ep48-${scene}`}/>;
// @git-course-scene hook:start
const Hook=()=> <QuestionSceneVisual eyebrow="OBJECT LIFECYCLE" question="Commit 离开分支，就消失了吗？" captions={R.captions('hook')}/>;
// @git-course-scene hook:end
// @git-course-scene reachability-model:start
const ReachabilityModel=()=> <ModelScene title="对象消失前会经过多个边界" captions={R.captions('reachability-model')}><FlowSteps steps={[{label:'Ref',detail:'reachable',tone:'main'},{label:'Reflog',detail:'recoverable',tone:'head'},{label:'Unreachable',tone:'conflict'},{label:'Pruned',tone:'neutral'}]}/></ModelScene>;
// @git-course-scene reachability-model:end
// @git-course-scene reflog-protection:start
const ReflogProtection=()=> <Term scene="reflog-protection" id="ep48-reflog-protection" at={14} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Reflog 保留的是定位入口</SceneTitle><CompareCards cards={[{label:'Branch',detail:'moved back',tone:'main'},{label:'Reflog',detail:'old OID recorded',tone:'head'},{label:'Object',detail:'still present',tone:'feature'}]}/></>}/>;
// @git-course-scene reflog-protection:end
// @git-course-scene rescue-commit:start
const RescueCommit=()=> <Term scene="rescue-commit" id="ep48-rescue-commit" at={14} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>未 Prune 的对象可以重新接回 Ref</SceneTitle><FlowSteps steps={[{label:'fsck',detail:'find OID',tone:'head'},{label:'rescue',detail:'new branch',tone:'feature'},{label:'Reachable',detail:'history restored',tone:'main'}]}/></>}/>;
// @git-course-scene rescue-commit:end
// @git-course-scene prune-object:start
const PruneObject=()=> <Term scene="prune-object" id="ep48-prune-object" at={15} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Prune 才移除不可达对象</SceneTitle><CompareCards cards={[{label:'Before',detail:'cat-file succeeds',tone:'feature'},{label:'Prune',detail:'gc --prune=now',tone:'conflict'},{label:'After',detail:'object missing',tone:'neutral'}]}/></>}/>;
// @git-course-scene prune-object:end
// @git-course-scene takeaway:start
const Takeaway=()=> <ModelScene title="先恢复入口，再讨论空间回收" captions={R.captions('takeaway')}><FlowSteps steps={[{label:'Refs',tone:'main'},{label:'Reflog',tone:'head'},{label:'fsck',tone:'feature'},{label:'Rescue Ref',tone:'main'}]}/></ModelScene>;
// @git-course-scene takeaway:end
const C={hook:Hook,'reachability-model':ReachabilityModel,'reflog-protection':ReflogProtection,'rescue-commit':RescueCommit,'prune-object':PruneObject,takeaway:Takeaway}; export const Ep48MaintenanceAndDataRecovery=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP48.seriesTitle} episodeTitle={EP48.title} scenes={EP48_SCENES} currentFrame={f} showHeader={x=>x>=R.start('reachability-model')} showEpisodeTitle={x=>x>=R.start('reachability-model')}><EpisodeTimeline runtime={R} components={C}/></CourseLayout>};
