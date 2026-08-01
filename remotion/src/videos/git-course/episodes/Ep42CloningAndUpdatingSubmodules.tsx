import {useCurrentFrame} from 'remotion'; import {EP42} from '../data/episodes'; import {EP42_DURATION_IN_FRAMES,EP42_SCENES} from '../data/episodeTimelines.generated'; import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated'; import {CourseLayout,EpisodeTimeline,SceneTitle,TerminalThenModelScene,createEpisodeRuntime} from '../kit'; import {seconds} from '../timeline'; import {CompareCards,FlowSteps,ModelScene,QuestionSceneVisual} from './WorkflowEpisodeVisuals';
export {EP42_DURATION_IN_FRAMES,EP42_SCENES}; const R=createEpisodeRuntime(EP42_SCENES); const cue=(id:string,d=12)=>({id:id as keyof typeof TERMINAL_RECORDINGS,from:0,durationInFrames:seconds(d+.7),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id as keyof typeof TERMINAL_RECORDINGS].holdFromFrame}); const Term=({scene,id,result,at=12}:{scene:Parameters<typeof R.captions>[0];id:string;result:React.ReactNode;at?:number})=><TerminalThenModelScene cues={[cue(id,at)]} modelAtSeconds={at} terminalEvidenceHoldSeconds={1} model={result} captions={R.captions(scene)} auditIdPrefix={`ep42-${scene}`}/>;
// @git-course-scene hook:start
const Hook=()=> <QuestionSceneVisual eyebrow="SUBMODULE CLONE" question="Clone 后，子仓库为什么是空的？" captions={R.captions('hook')}/>;
// @git-course-scene hook:end
// @git-course-scene update-model:start
const UpdateModel=()=> <ModelScene title="恢复 Submodule 需要三类动作" captions={R.captions('update-model')}><FlowSteps steps={[{label:'Init',detail:'local config'},{label:'Fetch',detail:'child objects',tone:'head'},{label:'Checkout',detail:'gitlink OID',tone:'feature'}]}/></ModelScene>;
// @git-course-scene update-model:end
// @git-course-scene empty-after-clone:start
const EmptyAfterClone=()=> <Term scene="empty-after-clone" id="ep42-empty-after-clone" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>父仓库到齐，子仓库尚未初始化</SceneTitle><CompareCards cards={[{label:'Parent',detail:'objects ready',tone:'main'},{label:'Submodule',detail:'- OID',tone:'conflict'},{label:'Directory',detail:'empty',tone:'neutral'}]}/></>}/>;
// @git-course-scene empty-after-clone:end
// @git-course-scene init-update:start
const InitUpdate=()=> <Term scene="init-update" id="ep42-init-update" at={14} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Detached HEAD 精确复现父版本</SceneTitle><FlowSteps steps={[{label:'URL',detail:'configured'},{label:'Objects',detail:'fetched',tone:'head'},{label:'HEAD',detail:'detached at OID',tone:'feature'}]}/></>}/>;
// @git-course-scene init-update:end
// @git-course-scene recursive-clone:start
const RecursiveClone=()=> <Term scene="recursive-clone" id="ep42-recursive-clone" at={14} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>递归参数合并操作，没有改变模型</SceneTitle><CompareCards cards={[{label:'Parent Clone',detail:'repository'},{label:'Submodule Init',detail:'configuration',tone:'head'},{label:'Submodule Update',detail:'exact commit',tone:'feature'}]}/></>}/>;
// @git-course-scene recursive-clone:end
// @git-course-scene takeaway:start
const Takeaway=()=> <ModelScene title="先问对象有没有，再问检出了什么" captions={R.captions('takeaway')}><FlowSteps steps={[{label:'Config',tone:'neutral'},{label:'Objects',tone:'head'},{label:'Checkout',tone:'feature'}]}/></ModelScene>;
// @git-course-scene takeaway:end
const C={hook:Hook,'update-model':UpdateModel,'empty-after-clone':EmptyAfterClone,'init-update':InitUpdate,'recursive-clone':RecursiveClone,takeaway:Takeaway}; export const Ep42CloningAndUpdatingSubmodules=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP42.seriesTitle} episodeTitle={EP42.title} scenes={EP42_SCENES} currentFrame={f} showHeader={x=>x>=R.start('update-model')} showEpisodeTitle={x=>x>=R.start('update-model')}><EpisodeTimeline runtime={R} components={C}/></CourseLayout>};
