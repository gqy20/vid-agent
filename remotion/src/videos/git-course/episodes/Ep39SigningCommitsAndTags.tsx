import {useCurrentFrame} from 'remotion'; import {EP39} from '../data/episodes'; import {EP39_DURATION_IN_FRAMES,EP39_SCENES} from '../data/episodeTimelines.generated'; import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated'; import {CourseLayout,EpisodeTimeline,SceneTitle,TerminalThenModelScene,createEpisodeRuntime} from '../kit'; import {seconds} from '../timeline'; import {CompareCards,FlowSteps,ModelScene,QuestionSceneVisual} from './WorkflowEpisodeVisuals';
export {EP39_DURATION_IN_FRAMES,EP39_SCENES}; const R=createEpisodeRuntime(EP39_SCENES); const cue=(id:string,d=11)=>({id:id as keyof typeof TERMINAL_RECORDINGS,from:0,durationInFrames:seconds(d+.7),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id as keyof typeof TERMINAL_RECORDINGS].holdFromFrame}); const Term=({scene,id,result,at=11}:{scene:Parameters<typeof R.captions>[0];id:string;result:React.ReactNode;at?:number})=><TerminalThenModelScene cues={[cue(id,at)]} modelAtSeconds={at} model={result} captions={R.captions(scene)} auditIdPrefix={`ep39-${scene}`}/>;
// @git-course-scene hook:start
const Hook=()=> <QuestionSceneVisual eyebrow="OBJECT SIGNING" question="签名证明身份，还是证明关系？" captions={R.captions('hook')}/>;
// @git-course-scene hook:end
// @git-course-scene trust-model:start
const TrustModel=()=> <ModelScene title="对象、签名、密钥与信任分层" captions={R.captions('trust-model')}><FlowSteps revealAtSeconds={.4} steps={[{label:'Object',tone:'neutral'},{label:'Signature',tone:'head'},{label:'Public Key',tone:'feature'},{label:'Trust Map',tone:'neutral'}]}/></ModelScene>;
// @git-course-scene trust-model:end
// @git-course-scene signed-commit:start
const SignedCommit=()=> <Term scene="signed-commit" id="ep39-signed-commit" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Signed Commit 把签名写入对象</SceneTitle><CompareCards cards={[{label:'Commit OID',detail:'fixed'},{label:'gpgsig',detail:'embedded',tone:'head'},{label:'Verify',detail:'Good signature',tone:'feature'}]}/></>}/>;
// @git-course-scene signed-commit:end
// @git-course-scene signed-tag:start
const SignedTag=()=> <Term scene="signed-tag" id="ep39-signed-tag" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Signed Tag 签署的是 Tag 对象</SceneTitle><FlowSteps revealAtSeconds={10.4} steps={[{label:'Tag Ref',tone:'neutral'},{label:'Tag Object',detail:'signature embedded',tone:'head'},{label:'Commit',tone:'feature'}]}/></>}/>;
// @git-course-scene signed-tag:end
// @git-course-scene trust-loss:start
const TrustLoss=()=> <Term scene="trust-loss" id="ep39-trust-loss" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>签名仍在，信任映射可以消失</SceneTitle><CompareCards cards={[{label:'Object',detail:'same OID'},{label:'Signature',detail:'still embedded',tone:'head'},{label:'Trust Map',detail:'missing',tone:'conflict'}]}/></>}/>;
// @git-course-scene trust-loss:end
// @git-course-scene takeaway:start
const Takeaway=()=> <ModelScene title="签名验证不等于仓库加密" captions={R.captions('takeaway')}><FlowSteps revealAtSeconds={.4} steps={[{label:'Integrity',tone:'neutral'},{label:'Key Match',tone:'head'},{label:'Trust',tone:'feature'}]}/></ModelScene>;
// @git-course-scene takeaway:end
const C={hook:Hook,'trust-model':TrustModel,'signed-commit':SignedCommit,'signed-tag':SignedTag,'trust-loss':TrustLoss,takeaway:Takeaway}; export const Ep39SigningCommitsAndTags=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP39.seriesTitle} episodeTitle={EP39.title} scenes={EP39_SCENES} currentFrame={f} showHeader={x=>x>=R.start('trust-model')} showEpisodeTitle={x=>x>=R.start('trust-model')}><EpisodeTimeline runtime={R} components={C}/></CourseLayout>};
