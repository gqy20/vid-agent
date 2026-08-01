import {useCurrentFrame} from 'remotion'; import {EP37} from '../data/episodes'; import {EP37_DURATION_IN_FRAMES,EP37_SCENES} from '../data/episodeTimelines.generated'; import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated'; import {CourseLayout,EpisodeTimeline,SceneTitle,TerminalThenModelScene,createEpisodeRuntime} from '../kit'; import {seconds} from '../timeline'; import {CompareCards,FlowSteps,ModelScene,QuestionSceneVisual} from './WorkflowEpisodeVisuals';
export {EP37_DURATION_IN_FRAMES,EP37_SCENES}; const R=createEpisodeRuntime(EP37_SCENES); const cue=(id:string,d=11)=>({id:id as keyof typeof TERMINAL_RECORDINGS,from:0,durationInFrames:seconds(d+.7),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id as keyof typeof TERMINAL_RECORDINGS].holdFromFrame}); const Term=({scene,id,result,at=11}:{scene:Parameters<typeof R.captions>[0];id:string;result:React.ReactNode;at?:number})=><TerminalThenModelScene cues={[cue(id,at)]} modelAtSeconds={at} model={result} captions={R.captions(scene)} auditIdPrefix={`ep37-${scene}`}/>;
// @git-course-scene hook:start
const Hook=()=> <QuestionSceneVisual eyebrow="CLIENT HOOKS" question="Commit 之前，谁可以说停？" captions={R.captions('hook')}/>;
// @git-course-scene hook:end
// @git-course-scene hook-model:start
const HookModel=()=> <ModelScene title="前置 Hook 裁决，后置 Hook 观察" captions={R.captions('hook-model')}><FlowSteps revealAtSeconds={.4} steps={[{label:'Staged',tone:'head'},{label:'Pre',tone:'conflict'},{label:'Commit',tone:'neutral'},{label:'Post',tone:'feature'}]}/></ModelScene>;
// @git-course-scene hook-model:end
// @git-course-scene pre-commit:start
const PreCommit=()=> <Term scene="pre-commit" id="ep37-pre-commit" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Pre-commit 用退出码阻止提交</SceneTitle><CompareCards cards={[{label:'Test',detail:'FAIL',tone:'conflict'},{label:'HEAD Before',detail:'unchanged'},{label:'HEAD After',detail:'unchanged'}]}/></>}/>;
// @git-course-scene pre-commit:end
// @git-course-scene post-commit:start
const PostCommit=()=> <Term scene="post-commit" id="ep37-post-commit" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Post-commit 只记录成功结果</SceneTitle><FlowSteps revealAtSeconds={10.4} steps={[{label:'Test PASS',tone:'head'},{label:'Commit',tone:'neutral'},{label:'HEAD Moves',tone:'feature'},{label:'Post Log',tone:'feature'}]}/></>}/>;
// @git-course-scene post-commit:end
// @git-course-scene deployment-boundary:start
const Deployment=()=> <Term scene="deployment-boundary" id="ep37-deployment" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>本地 Hook 不是组织强制门禁</SceneTitle><CompareCards cards={[{label:'--no-verify',detail:'可绕过适用检查',tone:'conflict'},{label:'New Clone',detail:'不会自动携带 hook',tone:'neutral'}]}/></>}/>;
// @git-course-scene deployment-boundary:end
// @git-course-scene takeaway:start
const Takeaway=()=> <ModelScene title="先确认阶段，再判断控制能力" captions={R.captions('takeaway')}><FlowSteps revealAtSeconds={.4} steps={[{label:'When',tone:'neutral'},{label:'Input',tone:'neutral'},{label:'Exit',tone:'head'},{label:'Deploy',tone:'feature'}]}/></ModelScene>;
// @git-course-scene takeaway:end
const C={hook:Hook,'hook-model':HookModel,'pre-commit':PreCommit,'post-commit':PostCommit,'deployment-boundary':Deployment,takeaway:Takeaway}; export const Ep37ClientHooks=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP37.seriesTitle} episodeTitle={EP37.title} scenes={EP37_SCENES} currentFrame={f} showHeader={x=>x>=R.start('hook-model')} showEpisodeTitle={x=>x>=R.start('hook-model')}><EpisodeTimeline runtime={R} components={C}/></CourseLayout>};
