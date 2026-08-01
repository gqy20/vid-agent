import {useCurrentFrame} from 'remotion'; import {EP30} from '../data/episodes'; import {EP30_DURATION_IN_FRAMES,EP30_SCENES} from '../data/episodeTimelines.generated'; import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated'; import {CourseLayout,EpisodeTimeline,SceneTitle,TerminalThenModelScene,createEpisodeRuntime} from '../kit'; import {seconds} from '../timeline'; import {CompareCards,FlowSteps,ModelScene,QuestionSceneVisual} from './WorkflowEpisodeVisuals';
export {EP30_DURATION_IN_FRAMES,EP30_SCENES}; const R=createEpisodeRuntime(EP30_SCENES); const cue=(id:string,d=10)=>({id:id as keyof typeof TERMINAL_RECORDINGS,from:0,durationInFrames:seconds(d+.7),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id as keyof typeof TERMINAL_RECORDINGS].holdFromFrame}); const Term=({scene,id,result}:{scene:Parameters<typeof R.captions>[0];id:string;result:React.ReactNode})=><TerminalThenModelScene cues={[cue(id)]} modelAtSeconds={10} model={result} captions={R.captions(scene)} auditIdPrefix={`ep30-${scene}`}/>;
// @git-course-scene hook:start
const Hook=()=> <QuestionSceneVisual eyebrow="MAINTAINING TOPICS" question="两个 Topic 都能进 Main 吗？" captions={R.captions('hook')}/>;
// @git-course-scene hook:end
// @git-course-scene fetch-topics:start
const FetchTopics=()=> <Term scene="fetch-topics" id="ep30-fetch-topics" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Fetch 只建立两个观察位置</SceneTitle><CompareCards cards={[{label:'alice/topic-a',detail:'remote-tracking ref',tone:'feature'},{label:'main',detail:'尚未改变'},{label:'bob/topic-b',detail:'remote-tracking ref',tone:'feature'}]}/></>}/>;
// @git-course-scene fetch-topics:end
// @git-course-scene isolated-review:start
const IsolatedReview=()=> <Term scene="isolated-review" id="ep30-isolated-review" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>独立评估让失败停留在局部</SceneTitle><CompareCards cards={[{label:'review/alice',detail:'PASS',tone:'main'},{label:'review/bob',detail:'FAIL · 不进 main',tone:'conflict'}]}/></>}/>;
// @git-course-scene isolated-review:end
// @git-course-scene updated-topic:start
const UpdatedTopic=()=> <ModelScene title="修正版只更新 Bob 的评估路径" captions={R.captions('updated-topic')}><FlowSteps steps={[{label:'Bob v1',detail:'test failed',tone:'conflict'},{label:'Fetch v2',detail:'更新观察 ref',tone:'head'},{label:'Review',detail:'重新验证',tone:'feature'}]}/></ModelScene>;
// @git-course-scene updated-topic:end
// @git-course-scene throwaway-integration:start
const ThrowawayIntegration=()=> <Term scene="throwaway-integration" id="ep30-integration-test" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>临时 Integration 验证组合结果</SceneTitle><FlowSteps steps={[{label:'Topic A',tone:'feature'},{label:'Topic B',tone:'feature'},{label:'Combine',tone:'head'},{label:'Main'}]}/></>}/>;
// @git-course-scene throwaway-integration:end
// @git-course-scene takeaway:start
const Takeaway=()=> <ModelScene title="隔离评估，临时组合，最后接纳" captions={R.captions('takeaway')}><FlowSteps steps={[{label:'Fetch'},{label:'Isolate',tone:'feature'},{label:'Combine',tone:'head'},{label:'Accept'}]}/></ModelScene>;
// @git-course-scene takeaway:end
const C={hook:Hook,'fetch-topics':FetchTopics,'isolated-review':IsolatedReview,'updated-topic':UpdatedTopic,'throwaway-integration':ThrowawayIntegration,takeaway:Takeaway}; export const Ep30MaintainingTopicBranches=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP30.seriesTitle} episodeTitle={EP30.title} scenes={EP30_SCENES} currentFrame={f} showHeader={x=>x>=R.start('fetch-topics')} showEpisodeTitle={x=>x>=R.start('fetch-topics')}><EpisodeTimeline runtime={R} components={C}/></CourseLayout>};
