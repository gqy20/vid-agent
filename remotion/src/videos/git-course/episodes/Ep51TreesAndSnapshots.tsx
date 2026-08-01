import {useCurrentFrame} from 'remotion'; import {EP51} from '../data/episodes'; import {EP51_DURATION_IN_FRAMES,EP51_SCENES} from '../data/episodeTimelines.generated'; import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated'; import {CourseLayout,EpisodeTimeline,SceneTitle,TerminalThenModelScene,createEpisodeRuntime} from '../kit'; import {seconds} from '../timeline'; import {CompareCards,FlowSteps,ModelScene,QuestionSceneVisual} from './WorkflowEpisodeVisuals';
export {EP51_DURATION_IN_FRAMES,EP51_SCENES}; const R=createEpisodeRuntime(EP51_SCENES); const cue=(id:string,d=13)=>({id:id as keyof typeof TERMINAL_RECORDINGS,from:0,durationInFrames:seconds(d+.7),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id as keyof typeof TERMINAL_RECORDINGS].holdFromFrame}); const Term=({scene,id,result,at=13}:{scene:Parameters<typeof R.captions>[0];id:string;result:React.ReactNode;at?:number})=><TerminalThenModelScene cues={[cue(id,at)]} modelAtSeconds={at} terminalEvidenceHoldSeconds={1} model={result} captions={R.captions(scene)} auditIdPrefix={`ep51-${scene}`}/>;
// @git-course-scene hook:start
const Hook=()=> <QuestionSceneVisual eyebrow="TREE OBJECT" question="Snapshot 只是一张文件清单吗？" captions={R.captions('hook')}/>;
// @git-course-scene hook:end
// @git-course-scene tree-model:start
const TreeModel=()=> <ModelScene title="路径来自递归 Tree 关系" captions={R.captions('tree-model')}><FlowSteps steps={[{label:'Root Tree',tone:'main'},{label:'src',detail:'subtree',tone:'head'},{label:'app.js',detail:'name + mode',tone:'feature'},{label:'Blob',detail:'bytes',tone:'neutral'}]}/></ModelScene>;
// @git-course-scene tree-model:end
// @git-course-scene temporary-index:start
const TemporaryIndex=()=> <Term scene="temporary-index" id="ep51-temporary-index" at={19.5} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>临时 Index 安排已有 Blob</SceneTitle><FlowSteps steps={[{label:'Empty Index',tone:'neutral'},{label:'cacheinfo',detail:'mode · OID · path',tone:'head'},{label:'Staged Entry',tone:'main'}]}/></>}/>;
// @git-course-scene temporary-index:end
// @git-course-scene write-tree:start
const WriteTree=()=> <Term scene="write-tree" id="ep51-write-tree" at={13.31} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Write-tree 固化递归快照</SceneTitle><FlowSteps steps={[{label:'Index',tone:'head'},{label:'write-tree',tone:'feature'},{label:'Root Tree',detail:'full OID',tone:'main'}]}/></>}/>;
// @git-course-scene write-tree:end
// @git-course-scene rename-path:start
const RenamePath=()=> <Term scene="rename-path" id="ep51-rename-path" at={13.04} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>同一 Blob，路径变化会改变 Tree</SceneTitle><CompareCards cards={[{label:'Blob OID',detail:'unchanged',tone:'feature'},{label:'Old Tree',detail:'app.js',tone:'neutral'},{label:'New Tree',detail:'src/app.js',tone:'main'}]}/></>}/>;
// @git-course-scene rename-path:end
// @git-course-scene takeaway:start
const Takeaway=()=> <ModelScene title="Index 排列内容，Tree 固化快照" captions={R.captions('takeaway')}><FlowSteps steps={[{label:'Blob',detail:'content',tone:'feature'},{label:'Index',detail:'arrangement',tone:'head'},{label:'Tree',detail:'snapshot',tone:'main'}]}/></ModelScene>;
// @git-course-scene takeaway:end
const C={hook:Hook,'tree-model':TreeModel,'temporary-index':TemporaryIndex,'write-tree':WriteTree,'rename-path':RenamePath,takeaway:Takeaway}; export const Ep51TreesAndSnapshots=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP51.seriesTitle} episodeTitle={EP51.title} scenes={EP51_SCENES} currentFrame={f} showHeader={x=>x>=R.start('tree-model')} showEpisodeTitle={x=>x>=R.start('tree-model')}><EpisodeTimeline runtime={R} components={C}/></CourseLayout>};
