import {useCurrentFrame} from 'remotion'; import {EP40} from '../data/episodes'; import {EP40_DURATION_IN_FRAMES,EP40_SCENES} from '../data/episodeTimelines.generated'; import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated'; import {CourseLayout,EpisodeTimeline,SceneTitle,TerminalThenModelScene,createEpisodeRuntime} from '../kit'; import {seconds} from '../timeline'; import {CompareCards,FlowSteps,ModelScene,QuestionSceneVisual} from './WorkflowEpisodeVisuals';
export {EP40_DURATION_IN_FRAMES,EP40_SCENES}; const R=createEpisodeRuntime(EP40_SCENES); const cue=(id:string,d=12)=>({id:id as keyof typeof TERMINAL_RECORDINGS,from:0,durationInFrames:seconds(d+.7),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id as keyof typeof TERMINAL_RECORDINGS].holdFromFrame}); const Term=({scene,id,result,at=12}:{scene:Parameters<typeof R.captions>[0];id:string;result:React.ReactNode;at?:number})=><TerminalThenModelScene cues={[cue(id,at)]} modelAtSeconds={at} model={result} captions={R.captions(scene)} auditIdPrefix={`ep40-${scene}`}/>;
// @git-course-scene hook:start
const Hook=()=> <QuestionSceneVisual eyebrow="TRUST BOUNDARIES" question="名字相同，就能 Push 吗？" captions={R.captions('hook')}/>;
// @git-course-scene hook:end
// @git-course-scene trust-model:start
const TrustModel=()=> <ModelScene title="作者、认证与授权回答不同问题" captions={R.captions('trust-model')}><FlowSteps revealAtSeconds={.4} steps={[{label:'Metadata',tone:'neutral'},{label:'Credential',tone:'head'},{label:'Permission',tone:'feature'}]}/></ModelScene>;
// @git-course-scene trust-model:end
// @git-course-scene author-metadata:start
const AuthorMetadata=()=> <Term scene="author-metadata" id="ep40-author-metadata" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>User Identity 只是 Commit 元数据</SceneTitle><CompareCards cards={[{label:'Author',detail:'name + email'},{label:'Committer',detail:'name + email',tone:'head'},{label:'Login',detail:'not involved',tone:'neutral'}]}/></>}/>;
// @git-course-scene author-metadata:end
// @git-course-scene auth-and-authz:start
const AuthBoundary=()=> <Term scene="auth-and-authz" id="ep40-auth-boundary" at={13} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>认证成功，不代表拥有 Push 权限</SceneTitle><FlowSteps revealAtSeconds={13} steps={[{label:'No Credential',detail:'401',tone:'conflict'},{label:'Reader',detail:'403',tone:'conflict'},{label:'Writer',detail:'Accepted',tone:'feature'}]}/></>}/>;
// @git-course-scene auth-and-authz:end
// @git-course-scene credential-helper:start
const CredentialHelper=()=> <Term scene="credential-helper" id="ep40-credential-helper" at={19.5} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Helper 管理的是连接凭证</SceneTitle><FlowSteps revealAtSeconds={19.5} steps={[{label:'Approve',tone:'head'},{label:'Fill',tone:'feature'},{label:'Reject',tone:'conflict'}]}/></>}/>;
// @git-course-scene credential-helper:end
// @git-course-scene takeaway:start
const Takeaway=()=> <ModelScene title="对象身份、连接身份、服务器权限" captions={R.captions('takeaway')}><CompareCards cards={[{label:'Metadata',detail:'Commit object'},{label:'Credential',detail:'Connection',tone:'head'},{label:'Permission',detail:'Server policy',tone:'feature'}]}/></ModelScene>;
// @git-course-scene takeaway:end
const C={hook:Hook,'trust-model':TrustModel,'author-metadata':AuthorMetadata,'auth-and-authz':AuthBoundary,'credential-helper':CredentialHelper,takeaway:Takeaway}; export const Ep40CredentialsAndTrustBoundaries=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP40.seriesTitle} episodeTitle={EP40.title} scenes={EP40_SCENES} currentFrame={f} showHeader={x=>x>=R.start('trust-model')} showEpisodeTitle={x=>x>=R.start('trust-model')}><EpisodeTimeline runtime={R} components={C}/></CourseLayout>};
