import {useCurrentFrame} from 'remotion'; import {EP50} from '../data/episodes'; import {EP50_DURATION_IN_FRAMES,EP50_SCENES} from '../data/episodeTimelines.generated'; import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated'; import {CourseLayout,EpisodeTimeline,SceneTitle,TerminalThenModelScene,createEpisodeRuntime} from '../kit'; import {seconds} from '../timeline'; import {CompareCards,FlowSteps,ModelScene,QuestionSceneVisual} from './WorkflowEpisodeVisuals';
export {EP50_DURATION_IN_FRAMES,EP50_SCENES}; const R=createEpisodeRuntime(EP50_SCENES); const cue=(id:string,d=13)=>({id:id as keyof typeof TERMINAL_RECORDINGS,from:0,durationInFrames:seconds(d+.7),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id as keyof typeof TERMINAL_RECORDINGS].holdFromFrame}); const Term=({scene,id,result,at=13}:{scene:Parameters<typeof R.captions>[0];id:string;result:React.ReactNode;at?:number})=><TerminalThenModelScene cues={[cue(id,at)]} modelAtSeconds={at} terminalEvidenceHoldSeconds={1} model={result} captions={R.captions(scene)} auditIdPrefix={`ep50-${scene}`}/>;
// @git-course-scene hook:start
const Hook=()=> <QuestionSceneVisual eyebrow="BLOB OBJECT" question="换个文件名，Blob 会改变吗？" captions={R.captions('hook')}/>;
// @git-course-scene hook:end
// @git-course-scene object-input:start
const ObjectInput=()=> <ModelScene title="Blob OID 来自完整对象表示" captions={R.captions('object-input')}><FlowSteps steps={[{label:'blob',detail:'type',tone:'head'},{label:'size',detail:'byte length',tone:'feature'},{label:'bytes',detail:'content',tone:'main'},{label:'OID',detail:'object format',tone:'conflict'}]}/></ModelScene>;
// @git-course-scene object-input:end
// @git-course-scene calculate-oid:start
const CalculateOid=()=> <Term scene="calculate-oid" id="ep50-calculate-oid" at={17.91} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>默认只计算对象 ID</SceneTitle><CompareCards cards={[{label:'hash-object',detail:'calculate OID',tone:'head'},{label:'Object DB',detail:'not written',tone:'neutral'}]}/></>}/>;
// @git-course-scene calculate-oid:end
// @git-course-scene write-object:start
const WriteObject=()=> <Term scene="write-object" id="ep50-write-object" at={13.16} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>-w 才把 Blob 写入对象库</SceneTitle><FlowSteps steps={[{label:'OID',detail:'efeee5…',tone:'feature'},{label:'ef',detail:'directory',tone:'head'},{label:'eee5…',detail:'filename',tone:'neutral'},{label:'Blob',detail:'compressed bytes',tone:'main'}]}/></>}/>;
// @git-course-scene write-object:end
// @git-course-scene compare-bytes:start
const CompareBytes=()=> <Term scene="compare-bytes" id="ep50-compare-bytes" at={12.31} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>名字不参与 Blob，字节参与</SceneTitle><CompareCards cards={[{label:'app.js',detail:'same bytes · same OID',tone:'main'},{label:'copy.js',detail:'same bytes · same OID',tone:'main'},{label:'+ newline',detail:'new bytes · new OID',tone:'conflict'}]}/></>}/>;
// @git-course-scene compare-bytes:end
// @git-course-scene takeaway:start
const Takeaway=()=> <ModelScene title="Blob 保存字节，不保存文件身份" captions={R.captions('takeaway')}><FlowSteps steps={[{label:'Bytes',tone:'feature'},{label:'Blob',tone:'main'},{label:'Tree',detail:'name + mode',tone:'head'}]}/></ModelScene>;
// @git-course-scene takeaway:end
const C={hook:Hook,'object-input':ObjectInput,'calculate-oid':CalculateOid,'write-object':WriteObject,'compare-bytes':CompareBytes,takeaway:Takeaway}; export const Ep50BlobObjectDatabase=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP50.seriesTitle} episodeTitle={EP50.title} scenes={EP50_SCENES} currentFrame={f} showHeader={x=>x>=R.start('object-input')} showEpisodeTitle={x=>x>=R.start('object-input')}><EpisodeTimeline runtime={R} components={C}/></CourseLayout>};
