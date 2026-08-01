import {useCurrentFrame} from 'remotion'; import {EP36} from '../data/episodes'; import {EP36_DURATION_IN_FRAMES,EP36_SCENES} from '../data/episodeTimelines.generated'; import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated'; import {CourseLayout,EpisodeTimeline,SceneTitle,TerminalThenModelScene,createEpisodeRuntime} from '../kit'; import {seconds} from '../timeline'; import {CompareCards,FlowSteps,ModelScene,QuestionSceneVisual} from './WorkflowEpisodeVisuals';
export {EP36_DURATION_IN_FRAMES,EP36_SCENES}; const R=createEpisodeRuntime(EP36_SCENES); const cue=(id:string,d=11)=>({id:id as keyof typeof TERMINAL_RECORDINGS,from:0,durationInFrames:seconds(d+.7),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id as keyof typeof TERMINAL_RECORDINGS].holdFromFrame}); const Term=({scene,id,result,at=11}:{scene:Parameters<typeof R.captions>[0];id:string;result:React.ReactNode;at?:number})=><TerminalThenModelScene cues={[cue(id,at)]} modelAtSeconds={at} model={result} captions={R.captions(scene)} auditIdPrefix={`ep36-${scene}`}/>;
// @git-course-scene hook:start
const Hook=()=> <QuestionSceneVisual eyebrow="CUSTOM DRIVERS" question="同一 Driver，改变的是哪一层？" captions={R.captions('hook')}/>;
// @git-course-scene hook:end
// @git-course-scene driver-model:start
const DriverModel=()=> <ModelScene title="Attributes 选路，Config 提供命令" captions={R.captions('driver-model')}><FlowSteps revealAtSeconds={.4} steps={[{label:'Path Rule',tone:'neutral'},{label:'Driver Name',tone:'head'},{label:'Config',tone:'feature'},{label:'Command',tone:'neutral'}]}/></ModelScene>;
// @git-course-scene driver-model:end
// @git-course-scene diff-driver:start
const DiffDriver=()=> <Term scene="diff-driver" id="ep36-diff-driver" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Diff Driver 只改变阅读视图</SceneTitle><CompareCards cards={[{label:'Blob OID',detail:'保持不变',tone:'neutral'},{label:'Textconv',detail:'生成可读视图',tone:'head'}]}/></>}/>;
// @git-course-scene diff-driver:end
// @git-course-scene merge-driver:start
const MergeDriver=()=> <Term scene="merge-driver" id="ep36-merge-driver" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Merge Driver 写回合并结果</SceneTitle><CompareCards cards={[{label:'%O',detail:'Base input',tone:'neutral'},{label:'%A',detail:'Ours + result',tone:'head'},{label:'%B',detail:'Theirs input',tone:'feature'},{label:'Exit',detail:'0 / non-zero',tone:'conflict'}]}/></>}/>;
// @git-course-scene merge-driver:end
// @git-course-scene clean-smudge:start
const CleanSmudge=()=> <Term scene="clean-smudge" id="ep36-clean-smudge" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Filter 位于工作区与 Index 之间</SceneTitle><CompareCards cards={[{label:'Clean',detail:'Working Tree → Index',tone:'head'},{label:'Smudge',detail:'Index → Working Tree',tone:'feature'}]}/></>}/>;
// @git-course-scene clean-smudge:end
// @git-course-scene takeaway:start
const Takeaway=()=> <ModelScene title="先确认输入、输出与失败语义" captions={R.captions('takeaway')}><CompareCards cards={[{label:'Diff',detail:'View only'},{label:'Merge',detail:'Write result',tone:'head'},{label:'Filter',detail:'Transform content',tone:'feature'}]}/></ModelScene>;
// @git-course-scene takeaway:end
const C={hook:Hook,'driver-model':DriverModel,'diff-driver':DiffDriver,'merge-driver':MergeDriver,'clean-smudge':CleanSmudge,takeaway:Takeaway}; export const Ep36CustomDiffMergeAndFilters=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP36.seriesTitle} episodeTitle={EP36.title} scenes={EP36_SCENES} currentFrame={f} showHeader={x=>x>=R.start('driver-model')} showEpisodeTitle={x=>x>=R.start('driver-model')}><EpisodeTimeline runtime={R} components={C}/></CourseLayout>};
