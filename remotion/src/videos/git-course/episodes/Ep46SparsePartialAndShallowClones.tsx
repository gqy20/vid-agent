import {useCurrentFrame} from 'remotion'; import {EP46} from '../data/episodes'; import {EP46_DURATION_IN_FRAMES,EP46_SCENES} from '../data/episodeTimelines.generated'; import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated'; import {CourseLayout,EpisodeTimeline,SceneTitle,TerminalThenModelScene,createEpisodeRuntime} from '../kit'; import {seconds} from '../timeline'; import {CompareCards,FlowSteps,ModelScene,QuestionSceneVisual} from './WorkflowEpisodeVisuals';
export {EP46_DURATION_IN_FRAMES,EP46_SCENES}; const R=createEpisodeRuntime(EP46_SCENES); const cue=(id:string,d=12)=>({id:id as keyof typeof TERMINAL_RECORDINGS,from:0,durationInFrames:seconds(d+.7),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id as keyof typeof TERMINAL_RECORDINGS].holdFromFrame}); const Term=({scene,id,result,at=12}:{scene:Parameters<typeof R.captions>[0];id:string;result:React.ReactNode;at?:number})=><TerminalThenModelScene cues={[cue(id,at)]} modelAtSeconds={at} terminalEvidenceHoldSeconds={1} model={result} captions={R.captions(scene)} auditIdPrefix={`ep46-${scene}`}/>;
// @git-course-scene hook:start
const Hook=()=> <QuestionSceneVisual eyebrow="EFFICIENT CLONES" question="少文件、少对象、少历史相同吗？" captions={R.captions('hook')}/>;
// @git-course-scene hook:end
// @git-course-scene three-boundaries:start
const ThreeBoundaries=()=> <ModelScene title="三种机制作用在不同层" captions={R.captions('three-boundaries')}><CompareCards cards={[{label:'Sparse',detail:'working tree paths',tone:'main'},{label:'Partial',detail:'object contents',tone:'head'},{label:'Shallow',detail:'history depth',tone:'feature'}]}/></ModelScene>;
// @git-course-scene three-boundaries:end
// @git-course-scene sparse-checkout:start
const SparseCheckout=()=> <Term scene="sparse-checkout" id="ep46-sparse-checkout" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Sparse 收窄路径，不截断历史</SceneTitle><CompareCards cards={[{label:'Working Tree',detail:'app only',tone:'main'},{label:'History',detail:'complete',tone:'feature'}]}/></>}/>;
// @git-course-scene sparse-checkout:end
// @git-course-scene partial-clone:start
const PartialClone=()=> <Term scene="partial-clone" id="ep46-partial-clone" at={15} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Partial 让缺失对象按需补取</SceneTitle><FlowSteps steps={[{label:'Promisor',detail:'filter=blob:none',tone:'head'},{label:'Missing Blob',tone:'conflict'},{label:'git show',tone:'main'},{label:'Fetched',tone:'feature'}]}/></>}/>;
// @git-course-scene partial-clone:end
// @git-course-scene shallow-clone:start
const ShallowClone=()=> <Term scene="shallow-clone" id="ep46-shallow-clone" at={15} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Shallow 在祖先关系上设置边界</SceneTitle><FlowSteps steps={[{label:'Depth 2',detail:'two commits',tone:'head'},{label:'Deepen',detail:'+2 ancestors',tone:'feature'},{label:'History',detail:'expanded',tone:'main'}]}/></>}/>;
// @git-course-scene shallow-clone:end
// @git-course-scene takeaway:start
const Takeaway=()=> <ModelScene title="先确认你想减少哪一种成本" captions={R.captions('takeaway')}><CompareCards cards={[{label:'Files',detail:'Sparse',tone:'main'},{label:'Objects',detail:'Partial',tone:'head'},{label:'History',detail:'Shallow',tone:'feature'}]}/></ModelScene>;
// @git-course-scene takeaway:end
const C={hook:Hook,'three-boundaries':ThreeBoundaries,'sparse-checkout':SparseCheckout,'partial-clone':PartialClone,'shallow-clone':ShallowClone,takeaway:Takeaway}; export const Ep46SparsePartialAndShallowClones=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP46.seriesTitle} episodeTitle={EP46.title} scenes={EP46_SCENES} currentFrame={f} showHeader={x=>x>=R.start('three-boundaries')} showEpisodeTitle={x=>x>=R.start('three-boundaries')}><EpisodeTimeline runtime={R} components={C}/></CourseLayout>};
