import {useCurrentFrame} from 'remotion'; import {EP55} from '../data/episodes'; import {EP55_DURATION_IN_FRAMES,EP55_SCENES} from '../data/episodeTimelines.generated'; import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated'; import {CourseLayout,EpisodeTimeline,SceneTitle,TerminalThenModelScene,createEpisodeRuntime} from '../kit'; import {seconds} from '../timeline'; import {CompareCards,FlowSteps,ModelScene,QuestionSceneVisual} from './WorkflowEpisodeVisuals';
export {EP55_DURATION_IN_FRAMES,EP55_SCENES}; const R=createEpisodeRuntime(EP55_SCENES); const cue=(id:string,d=14)=>({id:id as keyof typeof TERMINAL_RECORDINGS,from:0,durationInFrames:seconds(d+.7),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id as keyof typeof TERMINAL_RECORDINGS].holdFromFrame}); const Term=({scene,id,result,at=14}:{scene:Parameters<typeof R.captions>[0];id:string;result:React.ReactNode;at?:number})=><TerminalThenModelScene cues={[cue(id,at)]} modelAtSeconds={at} terminalEvidenceHoldSeconds={1} model={result} captions={R.captions(scene)} auditIdPrefix={`ep55-${scene}`}/>;
// @git-course-scene hook:start
const Hook=()=> <QuestionSceneVisual eyebrow="PACKFILE" question="每个版本都会完整复制大文件吗？" captions={R.captions('hook')}/>;
// @git-course-scene hook:end
// @git-course-scene pack-model:start
const PackModel=()=> <ModelScene title="逻辑 OID 稳定，物理表示可压缩" captions={R.captions('pack-model')}><FlowSteps steps={[{label:'Loose',detail:'objects',tone:'neutral'},{label:'Pack',detail:'compressed data',tone:'head'},{label:'IDX',detail:'OID lookup',tone:'feature'},{label:'Delta',detail:'base + change',tone:'main'}]}/></ModelScene>;
// @git-course-scene pack-model:end
// @git-course-scene loose-count:start
const LooseCount=()=> <Term scene="loose-count" id="ep55-loose-count" at={12.48} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>先固定 Repack 前的对象基线</SceneTitle><CompareCards cards={[{label:'Loose',detail:'count + size',tone:'neutral'},{label:'Blob OID',detail:'stable identity',tone:'feature'},{label:'cat-file',detail:'type + size',tone:'main'}]}/></>}/>;
// @git-course-scene loose-count:end
// @git-course-scene repack:start
const Repack=()=> <Term scene="repack" id="ep55-repack" at={21.19} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Repack 改变物理存储，不改对象</SceneTitle><FlowSteps steps={[{label:'Loose',tone:'neutral'},{label:'repack -ad',tone:'head'},{label:'.pack + .idx',tone:'feature'},{label:'Same OID',tone:'main'}]}/></>}/>;
// @git-course-scene repack:end
// @git-course-scene verify-delta:start
const VerifyDelta=()=> <Term scene="verify-delta" id="ep55-verify-delta-clean" at={12.25} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>真实 Delta 关系来自 Verify-pack</SceneTitle><CompareCards cards={[{label:'Object',detail:'own OID',tone:'feature'},{label:'Base',detail:'storage dependency',tone:'head'},{label:'Depth',detail:'delta chain',tone:'main'}]}/></>}/>;
// @git-course-scene verify-delta:end
// @git-course-scene takeaway:start
const Takeaway=()=> <ModelScene title="Pack 压缩存储，不改对象模型" captions={R.captions('takeaway')}><FlowSteps steps={[{label:'OID',detail:'logical identity',tone:'feature'},{label:'Pack',detail:'physical bytes',tone:'head'},{label:'Delta',detail:'not history',tone:'main'}]}/></ModelScene>;
// @git-course-scene takeaway:end
const C={hook:Hook,'pack-model':PackModel,'loose-count':LooseCount,repack:Repack,'verify-delta':VerifyDelta,takeaway:Takeaway}; export const Ep55PackfilesAndDeltas=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP55.seriesTitle} episodeTitle={EP55.title} scenes={EP55_SCENES} currentFrame={f} showHeader={x=>x>=R.start('pack-model')} showEpisodeTitle={x=>x>=R.start('pack-model')}><EpisodeTimeline runtime={R} components={C}/></CourseLayout>};
