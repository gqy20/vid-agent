import {useCurrentFrame} from 'remotion'; import {EP38} from '../data/episodes'; import {EP38_DURATION_IN_FRAMES,EP38_SCENES} from '../data/episodeTimelines.generated'; import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated'; import {CourseLayout,EpisodeTimeline,SceneTitle,TerminalThenModelScene,createEpisodeRuntime} from '../kit'; import {seconds} from '../timeline'; import {CompareCards,FlowSteps,ModelScene,QuestionSceneVisual} from './WorkflowEpisodeVisuals';
export {EP38_DURATION_IN_FRAMES,EP38_SCENES}; const R=createEpisodeRuntime(EP38_SCENES); const cue=(id:string,d=11)=>({id:id as keyof typeof TERMINAL_RECORDINGS,from:0,durationInFrames:seconds(d+.7),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id as keyof typeof TERMINAL_RECORDINGS].holdFromFrame}); const Term=({scene,id,result,at=11}:{scene:Parameters<typeof R.captions>[0];id:string;result:React.ReactNode;at?:number})=><TerminalThenModelScene cues={[cue(id,at)]} modelAtSeconds={at} model={result} captions={R.captions(scene)} auditIdPrefix={`ep38-${scene}`}/>;
// @git-course-scene hook:start
const Hook=()=> <QuestionSceneVisual eyebrow="SERVER POLICY" question="客户端通过，服务器仍能拒绝吗？" captions={R.captions('hook')}/>;
// @git-course-scene hook:end
// @git-course-scene receive-model:start
const ReceiveModel=()=> <ModelScene title="Pre-receive 检查整批 Ref 更新" captions={R.captions('receive-model')}><FlowSteps revealAtSeconds={.4} steps={[{label:'Old OID',tone:'neutral'},{label:'New OID',tone:'neutral'},{label:'Ref Name',tone:'feature'},{label:'Decision',tone:'head'}]}/></ModelScene>;
// @git-course-scene receive-model:end
// @git-course-scene batch-reject:start
const BatchReject=()=> <Term scene="batch-reject" id="ep38-batch-reject" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>一条违规 Ref 拒绝整批 Receive</SceneTitle><CompareCards cards={[{label:'main',detail:'REJECTED',tone:'conflict'},{label:'topic',detail:'NOT WRITTEN',tone:'conflict'},{label:'Remote Refs',detail:'unchanged'}]}/></>}/>;
// @git-course-scene batch-reject:end
// @git-course-scene topic-accept:start
const TopicAccept=()=> <Term scene="topic-accept" id="ep38-topic-accept" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>符合规则的 Topic 可以写入</SceneTitle><FlowSteps revealAtSeconds={10.4} steps={[{label:'Topic Push',tone:'feature'},{label:'Pre-receive',tone:'head'},{label:'Ref Update',tone:'feature'},{label:'Object Read',tone:'neutral'}]}/></>}/>;
// @git-course-scene topic-accept:end
// @git-course-scene server-boundary:start
const ServerBoundary=()=> <Term scene="server-boundary" id="ep38-server-boundary" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>--no-verify 不能绕过服务端 Hook</SceneTitle><CompareCards cards={[{label:'Client Option',detail:'--no-verify',tone:'head'},{label:'Server Hook',detail:'still active',tone:'conflict'},{label:'main',detail:'unchanged'}]}/></>}/>;
// @git-course-scene server-boundary:end
// @git-course-scene takeaway:start
const Takeaway=()=> <ModelScene title="共享策略落在共享写入边界" captions={R.captions('takeaway')}><FlowSteps revealAtSeconds={.4} steps={[{label:'Client',detail:'Feedback',tone:'neutral'},{label:'Server',detail:'Decision',tone:'head'},{label:'Ref',detail:'Update',tone:'feature'}]}/></ModelScene>;
// @git-course-scene takeaway:end
const C={hook:Hook,'receive-model':ReceiveModel,'batch-reject':BatchReject,'topic-accept':TopicAccept,'server-boundary':ServerBoundary,takeaway:Takeaway}; export const Ep38ServerHooksAndPolicy=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP38.seriesTitle} episodeTitle={EP38.title} scenes={EP38_SCENES} currentFrame={f} showHeader={x=>x>=R.start('receive-model')} showEpisodeTitle={x=>x>=R.start('receive-model')}><EpisodeTimeline runtime={R} components={C}/></CourseLayout>};
