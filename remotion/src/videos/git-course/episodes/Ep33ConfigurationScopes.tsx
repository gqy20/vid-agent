import {useCurrentFrame} from 'remotion'; import {EP33} from '../data/episodes'; import {EP33_DURATION_IN_FRAMES,EP33_SCENES} from '../data/episodeTimelines.generated'; import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated'; import {CourseLayout,EpisodeTimeline,SceneTitle,TerminalThenModelScene,createEpisodeRuntime} from '../kit'; import {seconds} from '../timeline'; import {CompareCards,FlowSteps,ModelScene,QuestionSceneVisual} from './WorkflowEpisodeVisuals';
export {EP33_DURATION_IN_FRAMES,EP33_SCENES}; const R=createEpisodeRuntime(EP33_SCENES); const cue=(id:string,d=11)=>({id:id as keyof typeof TERMINAL_RECORDINGS,from:0,durationInFrames:seconds(d+.7),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id as keyof typeof TERMINAL_RECORDINGS].holdFromFrame}); const Term=({scene,id,result,at=11}:{scene:Parameters<typeof R.captions>[0];id:string;result:React.ReactNode;at?:number})=><TerminalThenModelScene cues={[cue(id,at)]} modelAtSeconds={at} model={result} captions={R.captions(scene)} auditIdPrefix={`ep33-${scene}`}/>;
// @git-course-scene hook:start
const Hook=()=> <QuestionSceneVisual eyebrow="CONFIGURATION SCOPE" question="同一配置，为何结果不同？" captions={R.captions('hook')}/>;
// @git-course-scene hook:end
// @git-course-scene scope-model:start
const ScopeModel=()=> <ModelScene title="配置按作用范围分层读取" captions={R.captions('scope-model')}><FlowSteps revealAtSeconds={.4} steps={[{label:'System',tone:'neutral'},{label:'Global',tone:'neutral'},{label:'Local',tone:'neutral'},{label:'Worktree',tone:'feature'},{label:'Command',tone:'head'}]}/></ModelScene>;
// @git-course-scene scope-model:end
// @git-course-scene inspect-origin:start
const InspectOrigin=()=> <Term scene="inspect-origin" id="ep33-show-origin" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>同时查看值、来源与范围</SceneTitle><CompareCards cards={[{label:'System',detail:'system.cfg'},{label:'Global',detail:'global.cfg'},{label:'Local',detail:'.git/config',tone:'head'}]}/></>}/>;
// @git-course-scene inspect-origin:end
// @git-course-scene command-scope:start
const CommandScope=()=> <Term scene="command-scope" id="ep33-command-scope" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Command 只影响本次调用</SceneTitle><FlowSteps revealAtSeconds={10.4} steps={[{label:'Local',tone:'neutral'},{label:'git -c',tone:'head'},{label:'Command',tone:'head'},{label:'Local',tone:'neutral'}]}/></>}/>;
// @git-course-scene command-scope:end
// @git-course-scene worktree-scope:start
const WorktreeScope=()=> <Term scene="worktree-scope" id="ep33-worktree-scope" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Worktree 可以拥有独立配置</SceneTitle><CompareCards cards={[{label:'Main Worktree',detail:'local',tone:'neutral'},{label:'Linked Worktree',detail:'worktree',tone:'feature'}]}/></>}/>;
// @git-course-scene worktree-scope:end
// @git-course-scene takeaway:start
const Takeaway=()=> <ModelScene title="先定位来源，再决定修改范围" captions={R.captions('takeaway')}><FlowSteps revealAtSeconds={.4} steps={[{label:'Get',tone:'neutral'},{label:'Origin',tone:'neutral'},{label:'Scope',tone:'head'},{label:'Change',tone:'feature'}]}/></ModelScene>;
// @git-course-scene takeaway:end
const C={hook:Hook,'scope-model':ScopeModel,'inspect-origin':InspectOrigin,'command-scope':CommandScope,'worktree-scope':WorktreeScope,takeaway:Takeaway}; export const Ep33ConfigurationScopes=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP33.seriesTitle} episodeTitle={EP33.title} scenes={EP33_SCENES} currentFrame={f} showHeader={x=>x>=R.start('scope-model')} showEpisodeTitle={x=>x>=R.start('scope-model')}><EpisodeTimeline runtime={R} components={C}/></CourseLayout>};
