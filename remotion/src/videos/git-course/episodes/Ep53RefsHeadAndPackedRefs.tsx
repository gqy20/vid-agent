import {useCurrentFrame} from 'remotion'; import {EP53} from '../data/episodes'; import {EP53_DURATION_IN_FRAMES,EP53_SCENES} from '../data/episodeTimelines.generated'; import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated'; import {CourseLayout,EpisodeTimeline,SceneTitle,TerminalThenModelScene,createEpisodeRuntime} from '../kit'; import {seconds} from '../timeline'; import {CompareCards,FlowSteps,ModelScene,QuestionSceneVisual} from './WorkflowEpisodeVisuals';
export {EP53_DURATION_IN_FRAMES,EP53_SCENES}; const R=createEpisodeRuntime(EP53_SCENES); const cue=(id:string,d=13)=>({id:id as keyof typeof TERMINAL_RECORDINGS,from:0,durationInFrames:seconds(d+.7),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id as keyof typeof TERMINAL_RECORDINGS].holdFromFrame}); const Term=({scene,id,result,at=13}:{scene:Parameters<typeof R.captions>[0];id:string;result:React.ReactNode;at?:number})=><TerminalThenModelScene cues={[cue(id,at)]} modelAtSeconds={at} terminalEvidenceHoldSeconds={1} model={result} captions={R.captions(scene)} auditIdPrefix={`ep53-${scene}`}/>;
// @git-course-scene hook:start
const Hook=()=> <QuestionSceneVisual eyebrow="GIT REFS" question="Branch、HEAD 与 Tag 是同一种名字吗？" captions={R.captions('hook')}/>;
// @git-course-scene hook:end
// @git-course-scene ref-model:start
const RefModel=()=> <ModelScene title="对象稳定，Refs 提供可移动名称" captions={R.captions('ref-model')}><FlowSteps steps={[{label:'HEAD',detail:'symbolic ref',tone:'head'},{label:'Branch',detail:'direct ref',tone:'main'},{label:'Commit',detail:'object',tone:'feature'}]}/></ModelScene>;
// @git-course-scene ref-model:end
// @git-course-scene create-branch:start
const CreateBranch=()=> <Term scene="create-branch" id="ep53-create-branch" at={18.98} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Update-ref 原子创建名称</SceneTitle><FlowSteps steps={[{label:'Commit OID',tone:'feature'},{label:'update-ref',detail:'expected old',tone:'head'},{label:'model',detail:'branch ref',tone:'main'}]}/></>}/>;
// @git-course-scene create-branch:end
// @git-course-scene head-and-guard:start
const HeadAndGuard=()=> <Term scene="head-and-guard" id="ep53-head-guard" at={13.12} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Symbolic HEAD 与旧值保护各司其职</SceneTitle><CompareCards cards={[{label:'HEAD',detail:'refs/heads/model',tone:'head'},{label:'Guard',detail:'wrong old rejected',tone:'conflict'}]}/></>}/>;
// @git-course-scene head-and-guard:end
// @git-course-scene pack-refs:start
const PackRefs=()=> <Term scene="pack-refs" id="ep53-pack-refs" at={17.22} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Packed-refs 只改变名称存储</SceneTitle><CompareCards cards={[{label:'Loose Ref',detail:'may disappear',tone:'neutral'},{label:'packed-refs',detail:'stores names',tone:'head'},{label:'rev-parse',detail:'same result',tone:'main'}]}/></>}/>;
// @git-course-scene pack-refs:end
// @git-course-scene takeaway:start
const Takeaway=()=> <ModelScene title="先解析名字，再追踪对象" captions={R.captions('takeaway')}><FlowSteps steps={[{label:'Symbolic',detail:'HEAD',tone:'head'},{label:'Direct Ref',detail:'branch · tag',tone:'main'},{label:'Object',detail:'OID',tone:'feature'}]}/></ModelScene>;
// @git-course-scene takeaway:end
const C={hook:Hook,'ref-model':RefModel,'create-branch':CreateBranch,'head-and-guard':HeadAndGuard,'pack-refs':PackRefs,takeaway:Takeaway}; export const Ep53RefsHeadAndPackedRefs=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP53.seriesTitle} episodeTitle={EP53.title} scenes={EP53_SCENES} currentFrame={f} showHeader={x=>x>=R.start('ref-model')} showEpisodeTitle={x=>x>=R.start('ref-model')}><EpisodeTimeline runtime={R} components={C}/></CourseLayout>};
