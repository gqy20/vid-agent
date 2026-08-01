import {useCurrentFrame} from 'remotion'; import {EP26} from '../data/episodes'; import {EP26_DURATION_IN_FRAMES,EP26_SCENES} from '../data/episodeTimelines.generated'; import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated'; import {CourseLayout,EpisodeTimeline,SceneTitle,TerminalThenModelScene,createEpisodeRuntime} from '../kit'; import {seconds} from '../timeline'; import {FlowSteps,ModelScene,QuestionSceneVisual,RepositoryTopology} from './WorkflowEpisodeVisuals';
export {EP26_DURATION_IN_FRAMES,EP26_SCENES}; const R=createEpisodeRuntime(EP26_SCENES); const cue=(id:string,d=10)=>({id:id as keyof typeof TERMINAL_RECORDINGS,from:0,durationInFrames:seconds(d+.7),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id as keyof typeof TERMINAL_RECORDINGS].holdFromFrame}); const Term=({scene,id,result,at=10}:{scene:Parameters<typeof R.captions>[0];id:string;result:React.ReactNode;at?:number})=><TerminalThenModelScene cues={[cue(id,at)]} modelAtSeconds={at} model={result} captions={R.captions(scene)} auditIdPrefix={`ep26-${scene}`}/>;
// @git-course-scene hook:start
const Hook=()=> <QuestionSceneVisual eyebrow="CENTRALIZED WORKFLOW" question="完整本地仓库，为何还要共享中心？" captions={R.captions('hook')}/>;
// @git-course-scene hook:end
// @git-course-scene three-repos:start
const ThreeRepos=()=> <ModelScene title="集中的是共享入口，不是本地提交" captions={R.captions('three-repos')}><RepositoryTopology repositories={[{label:'Alice',ref:'main · local',tone:'feature'},{label:'shared.git',ref:'refs/heads/main'},{label:'Bob',ref:'main · local',tone:'feature'}]} direction="inward"/></ModelScene>;
// @git-course-scene three-repos:end
// @git-course-scene alice-push:start
const AlicePush=()=> <Term scene="alice-push" id="ep26-alice-push" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Alice 先让共享 Main 前进</SceneTitle><RepositoryTopology repositories={[{label:'Alice',ref:'A1',tone:'feature'},{label:'shared.git',ref:'main → A1'}]}/></>}/>;
// @git-course-scene alice-push:end
// @git-course-scene bob-rejected:start
const BobRejected=()=> <Term scene="bob-rejected" id="ep26-bob-reject" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Bob 的旧历史不能覆盖已发布历史</SceneTitle><FlowSteps revealAtSeconds={10} steps={[{label:'Bob B1',tone:'feature'},{label:'Push',tone:'head'},{label:'Rejected',tone:'conflict'}]}/></>}/>;
// @git-course-scene bob-rejected:end
// @git-course-scene bob-integrates:start
const BobIntegrates=()=> <Term scene="bob-integrates" id="ep26-bob-integrate" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Fetch 后在本地整合，再 Push</SceneTitle><FlowSteps revealAtSeconds={10} steps={[{label:'Fetch'},{label:'Local Merge',tone:'feature'},{label:'Test',tone:'head'},{label:'Push'}]}/></>}/>;
// @git-course-scene bob-integrates:end
// @git-course-scene takeaway:start
const Takeaway=()=> <ModelScene title="分布式能力，集中式共享顺序" captions={R.captions('takeaway')}><RepositoryTopology repositories={[{label:'Local Commit',ref:'Alice / Bob',tone:'feature'},{label:'Local Integrate',ref:'merge or rebase',tone:'head'},{label:'Shared Main',ref:'accepted order'}]}/></ModelScene>;
// @git-course-scene takeaway:end
const C={hook:Hook,'three-repos':ThreeRepos,'alice-push':AlicePush,'bob-rejected':BobRejected,'bob-integrates':BobIntegrates,takeaway:Takeaway}; export const Ep26CentralizedWorkflow=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP26.seriesTitle} episodeTitle={EP26.title} scenes={EP26_SCENES} currentFrame={f} showHeader={x=>x>=R.start('three-repos')} showEpisodeTitle={x=>x>=R.start('three-repos')}><EpisodeTimeline runtime={R} components={C}/></CourseLayout>};
