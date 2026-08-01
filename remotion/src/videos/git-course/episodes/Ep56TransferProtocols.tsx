import {useCurrentFrame} from 'remotion'; import {EP56} from '../data/episodes'; import {EP56_DURATION_IN_FRAMES,EP56_SCENES} from '../data/episodeTimelines.generated'; import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated'; import {CourseLayout,EpisodeTimeline,SceneTitle,TerminalThenModelScene,createEpisodeRuntime} from '../kit'; import {seconds} from '../timeline'; import {CompareCards,FlowSteps,ModelScene,QuestionSceneVisual,RepositoryTopology} from './WorkflowEpisodeVisuals';
export {EP56_DURATION_IN_FRAMES,EP56_SCENES}; const R=createEpisodeRuntime(EP56_SCENES); const cue=(id:string,d=14)=>({id:id as keyof typeof TERMINAL_RECORDINGS,from:0,durationInFrames:seconds(d+.7),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id as keyof typeof TERMINAL_RECORDINGS].holdFromFrame}); const Term=({scene,id,result,at=14}:{scene:Parameters<typeof R.captions>[0];id:string;result:React.ReactNode;at?:number})=><TerminalThenModelScene cues={[cue(id,at)]} modelAtSeconds={at} terminalEvidenceHoldSeconds={1} model={result} captions={R.captions(scene)} auditIdPrefix={`ep56-${scene}`}/>;
// @git-course-scene hook:start
const Hook=()=> <QuestionSceneVisual eyebrow="PACK PROTOCOL" question="Fetch 只是下载整个仓库吗？" captions={R.captions('hook')}/>;
// @git-course-scene hook:end
// @git-course-scene protocol-model:start
const ProtocolModel=()=> <ModelScene title="传输前先发现与协商" captions={R.captions('protocol-model')}><FlowSteps steps={[{label:'Advertise',detail:'refs + capabilities',tone:'feature'},{label:'Negotiate',detail:'want + have',tone:'head'},{label:'Pack',detail:'missing objects',tone:'main'},{label:'Ref Update',detail:'new name target',tone:'conflict'}]}/></ModelScene>;
// @git-course-scene protocol-model:end
// @git-course-scene fetch-trace:start
const FetchTrace=()=> <Term scene="fetch-trace" id="ep56-fetch-trace-clean" at={15.07} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Protocol V2 留下真实 Packet 证据</SceneTitle><FlowSteps steps={[{label:'version 2',tone:'feature'},{label:'ls-refs',tone:'head'},{label:'fetch',tone:'main'},{label:'want',tone:'conflict'}]}/></>}/>;
// @git-course-scene fetch-trace:end
// @git-course-scene fetch-result:start
const FetchResult=()=> <Term scene="fetch-result" id="ep56-fetch-result-complete" at={13.73} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>对象到达后再更新目标 Ref</SceneTitle><CompareCards cards={[{label:'Object DB',detail:'remote tip arrives',tone:'feature'},{label:'origin/main',detail:'moves to remote OID',tone:'main'},{label:'main + Index',detail:'unchanged',tone:'neutral'}]}/></>}/>;
// @git-course-scene fetch-result:end
// @git-course-scene push-trace:start
const PushTrace=()=> <Term scene="push-trace" id="ep56-push-trace-clean" at={13.37} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Push 请求由服务端裁决</SceneTitle><RepositoryTopology repositories={[{label:'Client',ref:'old → new · main',tone:'main'},{label:'Server',ref:'receive-pack · status',tone:'feature'}]}/></>}/>;
// @git-course-scene push-trace:end
// @git-course-scene takeaway:start
const Takeaway=()=> <ModelScene title="协议交换对象与 Refs，不传本地现场" captions={R.captions('takeaway')}><FlowSteps steps={[{label:'Refs',tone:'feature'},{label:'Objects',tone:'head'},{label:'Pack',tone:'main'},{label:'Policy',tone:'conflict'}]}/></ModelScene>;
// @git-course-scene takeaway:end
const C={hook:Hook,'protocol-model':ProtocolModel,'fetch-trace':FetchTrace,'fetch-result':FetchResult,'push-trace':PushTrace,takeaway:Takeaway}; export const Ep56TransferProtocols=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP56.seriesTitle} episodeTitle={EP56.title} scenes={EP56_SCENES} currentFrame={f} showHeader={x=>x>=R.start('protocol-model')} showEpisodeTitle={x=>x>=R.start('protocol-model')}><EpisodeTimeline runtime={R} components={C}/></CourseLayout>};
