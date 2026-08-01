import {useCurrentFrame} from 'remotion'; import {EP44} from '../data/episodes'; import {EP44_DURATION_IN_FRAMES,EP44_SCENES} from '../data/episodeTimelines.generated'; import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated'; import {CourseLayout,EpisodeTimeline,SceneTitle,TerminalThenModelScene,createEpisodeRuntime} from '../kit'; import {seconds} from '../timeline'; import {CompareCards,FlowSteps,ModelScene,QuestionSceneVisual} from './WorkflowEpisodeVisuals';
export {EP44_DURATION_IN_FRAMES,EP44_SCENES}; const R=createEpisodeRuntime(EP44_SCENES); const cue=(id:string,d=12)=>({id:id as keyof typeof TERMINAL_RECORDINGS,from:0,durationInFrames:seconds(d+.7),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id as keyof typeof TERMINAL_RECORDINGS].holdFromFrame}); const Term=({scene,id,result,at=12}:{scene:Parameters<typeof R.captions>[0];id:string;result:React.ReactNode;at?:number})=><TerminalThenModelScene cues={[cue(id,at)]} modelAtSeconds={at} terminalEvidenceHoldSeconds={1} model={result} captions={R.captions(scene)} auditIdPrefix={`ep44-${scene}`}/>;
// @git-course-scene hook:start
const Hook=()=> <QuestionSceneVisual eyebrow="MULTIPLE WORKTREES" question="紧急修复一定要打断当前现场吗？" captions={R.captions('hook')}/>;
// @git-course-scene hook:end
// @git-course-scene worktree-model:start
const WorktreeModel=()=> <ModelScene title="共享仓库层，隔离工作区现场" captions={R.captions('worktree-model')}><CompareCards cards={[{label:'Shared',detail:'objects + refs',tone:'main'},{label:'Worktree A',detail:'HEAD + index + files',tone:'head'},{label:'Worktree B',detail:'HEAD + index + files',tone:'feature'}]}/></ModelScene>;
// @git-course-scene worktree-model:end
// @git-course-scene add-hotfix:start
const AddHotfix=()=> <Term scene="add-hotfix" id="ep44-add-hotfix" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>第二个 Worktree 不移动原现场</SceneTitle><CompareCards cards={[{label:'Main',detail:'dirty app.txt',tone:'main'},{label:'Hotfix',detail:'clean index',tone:'feature'}]}/></>}/>;
// @git-course-scene add-hotfix:end
// @git-course-scene shared-state:start
const SharedState=()=> <Term scene="shared-state" id="ep44-shared-state" at={14} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>新 Commit 共享，未提交修改不共享</SceneTitle><CompareCards cards={[{label:'Commit H1',detail:'visible from both',tone:'feature'},{label:'Main Dirty',detail:'only in main',tone:'main'}]}/></>}/>;
// @git-course-scene shared-state:end
// @git-course-scene branch-guard:start
const BranchGuard=()=> <Term scene="branch-guard" id="ep44-branch-guard" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>移除 Worktree，不会删除 Branch</SceneTitle><FlowSteps steps={[{label:'Duplicate',detail:'rejected',tone:'conflict'},{label:'Remove',detail:'workspace only',tone:'head'},{label:'Branch',detail:'still exists',tone:'feature'}]}/></>}/>;
// @git-course-scene branch-guard:end
// @git-course-scene takeaway:start
const Takeaway=()=> <ModelScene title="先判断状态属于哪一层" captions={R.captions('takeaway')}><CompareCards cards={[{label:'Repository',detail:'objects + refs',tone:'main'},{label:'Worktree',detail:'HEAD + index + files',tone:'feature'}]}/></ModelScene>;
// @git-course-scene takeaway:end
const C={hook:Hook,'worktree-model':WorktreeModel,'add-hotfix':AddHotfix,'shared-state':SharedState,'branch-guard':BranchGuard,takeaway:Takeaway}; export const Ep44MultipleWorktrees=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP44.seriesTitle} episodeTitle={EP44.title} scenes={EP44_SCENES} currentFrame={f} showHeader={x=>x>=R.start('worktree-model')} showEpisodeTitle={x=>x>=R.start('worktree-model')}><EpisodeTimeline runtime={R} components={C}/></CourseLayout>};
