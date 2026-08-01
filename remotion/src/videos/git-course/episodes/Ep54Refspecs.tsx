import {useCurrentFrame} from 'remotion'; import {EP54} from '../data/episodes'; import {EP54_DURATION_IN_FRAMES,EP54_SCENES} from '../data/episodeTimelines.generated'; import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated'; import {CourseLayout,EpisodeTimeline,SceneTitle,TerminalThenModelScene,createEpisodeRuntime} from '../kit'; import {seconds} from '../timeline'; import {CompareCards,FlowSteps,ModelScene,QuestionSceneVisual,RepositoryTopology} from './WorkflowEpisodeVisuals';
export {EP54_DURATION_IN_FRAMES,EP54_SCENES}; const R=createEpisodeRuntime(EP54_SCENES); const cue=(id:string,d=13)=>({id:id as keyof typeof TERMINAL_RECORDINGS,from:0,durationInFrames:seconds(d+.7),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id as keyof typeof TERMINAL_RECORDINGS].holdFromFrame}); const Term=({scene,id,result,at=13}:{scene:Parameters<typeof R.captions>[0];id:string;result:React.ReactNode;at?:number})=><TerminalThenModelScene cues={[cue(id,at)]} modelAtSeconds={at} terminalEvidenceHoldSeconds={1} model={result} captions={R.captions(scene)} auditIdPrefix={`ep54-${scene}`}/>;
// @git-course-scene hook:start
const Hook=()=> <QuestionSceneVisual eyebrow="REFSPEC" question="Source 与 Destination 属于哪边？" captions={R.captions('hook')}/>;
// @git-course-scene hook:end
// @git-course-scene refspec-model:start
const RefspecModel=()=> <ModelScene title="命令方向决定 Source 与 Destination" captions={R.captions('refspec-model')}><CompareCards cards={[{label:'Fetch',detail:'remote src → local dst',tone:'feature'},{label:'src:dst',detail:'ref mapping',tone:'head'},{label:'Push',detail:'local src → remote dst',tone:'main'}]}/></ModelScene>;
// @git-course-scene refspec-model:end
// @git-course-scene default-fetch:start
const DefaultFetch=()=> <Term scene="default-fetch" id="ep54-default-fetch" at={14.78} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Clone 保存默认 Fetch 映射</SceneTitle><RepositoryTopology repositories={[{label:'Remote',ref:'refs/heads/*',tone:'feature'},{label:'Local',ref:'refs/remotes/origin/*',tone:'main'}]}/></>}/>;
// @git-course-scene default-fetch:end
// @git-course-scene explicit-fetch:start
const ExplicitFetch=()=> <Term scene="explicit-fetch" id="ep54-explicit-fetch-clean" at={20.42} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>显式 Fetch 选择目标 Ref</SceneTitle><CompareCards cards={[{label:'topic',detail:'remote source',tone:'feature'},{label:'origin/topic',detail:'local destination',tone:'main'},{label:'FETCH_HEAD',detail:'no persistent dst',tone:'head'}]}/></>}/>;
// @git-course-scene explicit-fetch:end
// @git-course-scene push-rename:start
const PushRename=()=> <Term scene="push-rename" id="ep54-push-rename-guard" at={17.01} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Push 可以发布为不同远端名称</SceneTitle><RepositoryTopology repositories={[{label:'Local',ref:'refs/heads/topic',tone:'main'},{label:'Remote',ref:'refs/heads/review',tone:'feature'}]}/></>}/>;
// @git-course-scene push-rename:end
// @git-course-scene takeaway:start
const Takeaway=()=> <ModelScene title="先写仓库，再展开 Refs" captions={R.captions('takeaway')}><FlowSteps steps={[{label:'Direction',tone:'head'},{label:'Source',tone:'feature'},{label:'Destination',tone:'main'},{label:'Verify',tone:'neutral'}]}/></ModelScene>;
// @git-course-scene takeaway:end
const C={hook:Hook,'refspec-model':RefspecModel,'default-fetch':DefaultFetch,'explicit-fetch':ExplicitFetch,'push-rename':PushRename,takeaway:Takeaway}; export const Ep54Refspecs=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP54.seriesTitle} episodeTitle={EP54.title} scenes={EP54_SCENES} currentFrame={f} showHeader={x=>x>=R.start('refspec-model')} showEpisodeTitle={x=>x>=R.start('refspec-model')}><EpisodeTimeline runtime={R} components={C}/></CourseLayout>};
