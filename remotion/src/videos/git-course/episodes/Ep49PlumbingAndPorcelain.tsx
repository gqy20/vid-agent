import {useCurrentFrame} from 'remotion'; import {EP49} from '../data/episodes'; import {EP49_DURATION_IN_FRAMES,EP49_SCENES} from '../data/episodeTimelines.generated'; import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated'; import {CourseLayout,EpisodeTimeline,SceneTitle,TerminalThenModelScene,createEpisodeRuntime} from '../kit'; import {seconds} from '../timeline'; import {CompareCards,FlowSteps,ModelScene,QuestionSceneVisual} from './WorkflowEpisodeVisuals';
export {EP49_DURATION_IN_FRAMES,EP49_SCENES}; const R=createEpisodeRuntime(EP49_SCENES); const cue=(id:string,d=13)=>({id:id as keyof typeof TERMINAL_RECORDINGS,from:0,durationInFrames:seconds(d+.7),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id as keyof typeof TERMINAL_RECORDINGS].holdFromFrame}); const Term=({scene,id,result,at=13}:{scene:Parameters<typeof R.captions>[0];id:string;result:React.ReactNode;at?:number})=><TerminalThenModelScene cues={[cue(id,at)]} modelAtSeconds={at} terminalEvidenceHoldSeconds={1} model={result} captions={R.captions(scene)} auditIdPrefix={`ep49-${scene}`}/>;
// @git-course-scene hook:start
const Hook=()=> <QuestionSceneVisual eyebrow="GIT INTERNALS" question="Commit 以后，仓库里发生了什么？" captions={R.captions('hook')}/>;
// @git-course-scene hook:end
// @git-course-scene shared-model:start
const SharedModel=()=> <ModelScene title="两类命令观察同一个 Repository" captions={R.captions('shared-model')}><CompareCards cards={[{label:'Porcelain',detail:'完成用户任务',tone:'main'},{label:'Repository',detail:'同一状态',tone:'head'},{label:'Plumbing',detail:'直接验证模型',tone:'feature'}]}/></ModelScene>;
// @git-course-scene shared-model:end
// @git-course-scene porcelain-commit:start
const PorcelainCommit=()=> <Term scene="porcelain-commit" id="ep49-porcelain-commit" at={16.98} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>先让熟悉命令产生真实结果</SceneTitle><FlowSteps steps={[{label:'git add',detail:'prepare index',tone:'head'},{label:'git commit',detail:'create snapshot',tone:'main'},{label:'HEAD OID',detail:'trace anchor',tone:'feature'}]}/></>}/>;
// @git-course-scene porcelain-commit:end
// @git-course-scene inspect-objects:start
const InspectObjects=()=> <Term scene="inspect-objects" id="ep49-inspect-objects" at={15.05} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>沿完整 OID 追踪对象关系</SceneTitle><FlowSteps steps={[{label:'Ref',tone:'main'},{label:'Commit',tone:'head'},{label:'Tree',tone:'feature'},{label:'Blob',tone:'neutral'}]}/></>}/>;
// @git-course-scene inspect-objects:end
// @git-course-scene inspect-state:start
const InspectState=()=> <Term scene="inspect-state" id="ep49-inspect-state" at={12.58} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Refs 与 Index 保存不同状态</SceneTitle><CompareCards cards={[{label:'Branch Ref',detail:'history tip',tone:'main'},{label:'Index',detail:'next snapshot',tone:'head'},{label:'Objects',detail:'content database',tone:'feature'}]}/></>}/>;
// @git-course-scene inspect-state:end
// @git-course-scene takeaway:start
const Takeaway=()=> <ModelScene title="用任务操作，用 Plumbing 验证" captions={R.captions('takeaway')}><FlowSteps steps={[{label:'Task',detail:'porcelain',tone:'main'},{label:'Question',detail:'choose layer',tone:'head'},{label:'Evidence',detail:'plumbing',tone:'feature'}]}/></ModelScene>;
// @git-course-scene takeaway:end
const C={hook:Hook,'shared-model':SharedModel,'porcelain-commit':PorcelainCommit,'inspect-objects':InspectObjects,'inspect-state':InspectState,takeaway:Takeaway}; export const Ep49PlumbingAndPorcelain=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP49.seriesTitle} episodeTitle={EP49.title} scenes={EP49_SCENES} currentFrame={f} showHeader={x=>x>=R.start('shared-model')} showEpisodeTitle={x=>x>=R.start('shared-model')}><EpisodeTimeline runtime={R} components={C}/></CourseLayout>};
