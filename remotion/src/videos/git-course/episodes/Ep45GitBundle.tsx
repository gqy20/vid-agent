import {useCurrentFrame} from 'remotion'; import {EP45} from '../data/episodes'; import {EP45_DURATION_IN_FRAMES,EP45_SCENES} from '../data/episodeTimelines.generated'; import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated'; import {CourseLayout,EpisodeTimeline,SceneTitle,TerminalThenModelScene,createEpisodeRuntime} from '../kit'; import {seconds} from '../timeline'; import {CompareCards,FlowSteps,ModelScene,QuestionSceneVisual} from './WorkflowEpisodeVisuals';
export {EP45_DURATION_IN_FRAMES,EP45_SCENES}; const R=createEpisodeRuntime(EP45_SCENES); const cue=(id:string,d=12)=>({id:id as keyof typeof TERMINAL_RECORDINGS,from:0,durationInFrames:seconds(d+.7),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id as keyof typeof TERMINAL_RECORDINGS].holdFromFrame}); const Term=({scene,id,result,at=12}:{scene:Parameters<typeof R.captions>[0];id:string;result:React.ReactNode;at?:number})=><TerminalThenModelScene cues={[cue(id,at)]} modelAtSeconds={at} terminalEvidenceHoldSeconds={1} model={result} captions={R.captions(scene)} auditIdPrefix={`ep45-${scene}`}/>;
// @git-course-scene hook:start
const Hook=()=> <QuestionSceneVisual eyebrow="GIT BUNDLE" question="一个文件能携带完整 Git 历史吗？" captions={R.captions('hook')}/>;
// @git-course-scene hook:end
// @git-course-scene bundle-model:start
const BundleModel=()=> <ModelScene title="Bundle 保存 Refs 与可达对象" captions={R.captions('bundle-model')}><FlowSteps steps={[{label:'Refs',tone:'main'},{label:'Objects',detail:'reachable',tone:'head'},{label:'Bundle',detail:'single file',tone:'feature'},{label:'Receiver',tone:'neutral'}]}/></ModelScene>;
// @git-course-scene bundle-model:end
// @git-course-scene full-bundle:start
const FullBundle=()=> <Term scene="full-bundle" id="ep45-full-bundle" at={14} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>完整包可以在交付前验证</SceneTitle><CompareCards cards={[{label:'Create',detail:'--all',tone:'main'},{label:'Verify',detail:'object closure',tone:'head'},{label:'List Heads',detail:'refs + OIDs',tone:'feature'}]}/></>}/>;
// @git-course-scene full-bundle:end
// @git-course-scene clone-bundle:start
const CloneBundle=()=> <Term scene="clone-bundle" id="ep45-clone-bundle" at={14} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Clone 后对象 ID 与拓扑保持不变</SceneTitle><FlowSteps steps={[{label:'Source OID',tone:'main'},{label:'Bundle',tone:'head'},{label:'Receiver OID',detail:'same',tone:'feature'}]}/></>}/>;
// @git-course-scene clone-bundle:end
// @git-course-scene incremental-bundle:start
const IncrementalBundle=()=> <Term scene="incremental-bundle" id="ep45-incremental-bundle" at={15} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>增量包依赖接收方已有对象</SceneTitle><FlowSteps steps={[{label:'v1.0',detail:'prerequisite',tone:'neutral'},{label:'New Objects',tone:'head'},{label:'Fetch',tone:'feature'},{label:'Fast-forward',tone:'main'}]}/></>}/>;
// @git-course-scene incremental-bundle:end
// @git-course-scene takeaway:start
const Takeaway=()=> <ModelScene title="先选对象边界，再决定完整或增量" captions={R.captions('takeaway')}><CompareCards cards={[{label:'Full',detail:'self-contained',tone:'main'},{label:'Incremental',detail:'has prerequisite',tone:'feature'},{label:'Not Included',detail:'worktree / hooks / config',tone:'neutral'}]}/></ModelScene>;
// @git-course-scene takeaway:end
const C={hook:Hook,'bundle-model':BundleModel,'full-bundle':FullBundle,'clone-bundle':CloneBundle,'incremental-bundle':IncrementalBundle,takeaway:Takeaway}; export const Ep45GitBundle=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP45.seriesTitle} episodeTitle={EP45.title} scenes={EP45_SCENES} currentFrame={f} showHeader={x=>x>=R.start('bundle-model')} showEpisodeTitle={x=>x>=R.start('bundle-model')}><EpisodeTimeline runtime={R} components={C}/></CourseLayout>};
