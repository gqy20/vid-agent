import {useCurrentFrame} from 'remotion'; import {EP27} from '../data/episodes'; import {EP27_DURATION_IN_FRAMES,EP27_SCENES} from '../data/episodeTimelines.generated'; import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated'; import {CourseLayout,EpisodeTimeline,SceneTitle,TerminalThenModelScene,createEpisodeRuntime} from '../kit'; import {seconds} from '../timeline'; import {FlowSteps,ModelScene,QuestionSceneVisual,RepositoryTopology} from './WorkflowEpisodeVisuals';
export {EP27_DURATION_IN_FRAMES,EP27_SCENES}; const R=createEpisodeRuntime(EP27_SCENES); const cue=(id:string,d=10)=>({id:id as keyof typeof TERMINAL_RECORDINGS,from:0,durationInFrames:seconds(d+.7),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id as keyof typeof TERMINAL_RECORDINGS].holdFromFrame}); const Term=({scene,id,result}:{scene:Parameters<typeof R.captions>[0];id:string;result:React.ReactNode})=><TerminalThenModelScene cues={[cue(id)]} modelAtSeconds={10} model={result} captions={R.captions(scene)} auditIdPrefix={`ep27-${scene}`}/>;
// @git-course-scene hook:start
const Hook=()=> <QuestionSceneVisual eyebrow="INTEGRATION MANAGER" question="不能 Push Main，怎样贡献？" captions={R.captions('hook')}/>;
// @git-course-scene hook:end
// @git-course-scene topology:start
const Topology=()=> <ModelScene title="三个 Repository，两个写入边界" captions={R.captions('topology')}><RepositoryTopology repositories={[{label:'Contributor',ref:'topic/login',tone:'feature'},{label:'Maintainer',ref:'review locally',tone:'head'},{label:'Canonical',ref:'main'}]}/></ModelScene>;
// @git-course-scene topology:end
// @git-course-scene publish-topic:start
const PublishTopic=()=> <Term scene="publish-topic" id="ep27-publish-topic" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>贡献者只更新自己的 Topic Ref</SceneTitle><RepositoryTopology repositories={[{label:'Local Topic',ref:'C1 · C2',tone:'feature'},{label:'contributor.git',ref:'topic/login',tone:'feature'}]}/></>}/>;
// @git-course-scene publish-topic:end
// @git-course-scene maintainer-fetch:start
const MaintainerFetch=()=> <Term scene="maintainer-fetch" id="ep27-maintainer-fetch" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Fetch 带来对象与可检查范围</SceneTitle><FlowSteps steps={[{label:'Add Remote',tone:'head'},{label:'Fetch'},{label:'main..topic',tone:'feature'}]}/></>}/>;
// @git-course-scene maintainer-fetch:end
// @git-course-scene review-integrate:start
const ReviewIntegrate=()=> <Term scene="review-integrate" id="ep27-review-integrate" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>维护者检查后更新 Canonical</SceneTitle><FlowSteps steps={[{label:'Inspect',tone:'head'},{label:'Test',tone:'head'},{label:'Integrate',tone:'feature'},{label:'Canonical'}]}/></>}/>;
// @git-course-scene review-integrate:end
// @git-course-scene takeaway:start
const Takeaway=()=> <ModelScene title="发布 Ref，交出可验证范围" captions={R.captions('takeaway')}><FlowSteps steps={[{label:'Publish',tone:'feature'},{label:'Fetch'},{label:'Review',tone:'head'},{label:'Accept'}]}/></ModelScene>;
// @git-course-scene takeaway:end
const C={hook:Hook,topology:Topology,'publish-topic':PublishTopic,'maintainer-fetch':MaintainerFetch,'review-integrate':ReviewIntegrate,takeaway:Takeaway}; export const Ep27IntegrationManagerWorkflow=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP27.seriesTitle} episodeTitle={EP27.title} scenes={EP27_SCENES} currentFrame={f} showHeader={x=>x>=R.start('topology')} showEpisodeTitle={x=>x>=R.start('topology')}><EpisodeTimeline runtime={R} components={C}/></CourseLayout>};
