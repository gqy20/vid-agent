import {useCurrentFrame} from 'remotion'; import {EP52} from '../data/episodes'; import {EP52_DURATION_IN_FRAMES,EP52_SCENES} from '../data/episodeTimelines.generated'; import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated'; import {CourseLayout,EpisodeTimeline,SceneTitle,TerminalThenModelScene,createEpisodeRuntime} from '../kit'; import {seconds} from '../timeline'; import {CompareCards,FlowSteps,ModelScene,QuestionSceneVisual} from './WorkflowEpisodeVisuals';
export {EP52_DURATION_IN_FRAMES,EP52_SCENES}; const R=createEpisodeRuntime(EP52_SCENES); const cue=(id:string,d=13)=>({id:id as keyof typeof TERMINAL_RECORDINGS,from:0,durationInFrames:seconds(d+.7),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id as keyof typeof TERMINAL_RECORDINGS].holdFromFrame}); const Term=({scene,id,result,at=13}:{scene:Parameters<typeof R.captions>[0];id:string;result:React.ReactNode;at?:number})=><TerminalThenModelScene cues={[cue(id,at)]} modelAtSeconds={at} terminalEvidenceHoldSeconds={1} model={result} captions={R.captions(scene)} auditIdPrefix={`ep52-${scene}`}/>;
// @git-course-scene hook:start
const Hook=()=> <QuestionSceneVisual eyebrow="COMMIT OBJECT" question="Commit 里面真的保存了 Diff 吗？" captions={R.captions('hook')}/>;
// @git-course-scene hook:end
// @git-course-scene object-model:start
const ObjectModel=()=> <ModelScene title="Commit 与 Tag 保存不同关系" captions={R.captions('object-model')}><FlowSteps steps={[{label:'Tree',detail:'snapshot',tone:'feature'},{label:'Commit',detail:'parent + metadata',tone:'main'},{label:'Tag Object',detail:'target + tagger',tone:'head'}]}/></ModelScene>;
// @git-course-scene object-model:end
// @git-course-scene first-commit:start
const FirstCommit=()=> <Term scene="first-commit" id="ep52-first-commit" at={16.96} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Commit-tree 写对象，不移动 Branch</SceneTitle><CompareCards cards={[{label:'Tree OID',detail:'input snapshot',tone:'feature'},{label:'Commit OID',detail:'new object',tone:'main'},{label:'Refs',detail:'unchanged',tone:'neutral'}]}/></>}/>;
// @git-course-scene first-commit:end
// @git-course-scene parent-commit:start
const ParentCommit=()=> <Term scene="parent-commit" id="ep52-parent-commit" at={12.83} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Parent 建立历史对象边</SceneTitle><FlowSteps steps={[{label:'C1',detail:'parent',tone:'neutral'},{label:'C2',detail:'same tree + parent',tone:'main'},{label:'diff-tree',detail:'derived comparison',tone:'head'}]}/></>}/>;
// @git-course-scene parent-commit:end
// @git-course-scene annotated-tag:start
const AnnotatedTag=()=> <Term scene="annotated-tag" id="ep52-annotated-tag" at={19.08} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Annotated Tag 拥有独立 OID</SceneTitle><FlowSteps steps={[{label:'v-model',detail:'ref',tone:'head'},{label:'Tag Object',detail:'tagger + message',tone:'feature'},{label:'C2',detail:'peeled target',tone:'main'}]}/></>}/>;
// @git-course-scene annotated-tag:end
// @git-course-scene takeaway:start
const Takeaway=()=> <ModelScene title="沿对象边判断，不沿界面猜测" captions={R.captions('takeaway')}><FlowSteps steps={[{label:'Snapshot',detail:'tree',tone:'feature'},{label:'History',detail:'parent',tone:'main'},{label:'Label',detail:'tag target',tone:'head'}]}/></ModelScene>;
// @git-course-scene takeaway:end
const C={hook:Hook,'object-model':ObjectModel,'first-commit':FirstCommit,'parent-commit':ParentCommit,'annotated-tag':AnnotatedTag,takeaway:Takeaway}; export const Ep52CommitAndTagObjects=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP52.seriesTitle} episodeTitle={EP52.title} scenes={EP52_SCENES} currentFrame={f} showHeader={x=>x>=R.start('object-model')} showEpisodeTitle={x=>x>=R.start('object-model')}><EpisodeTimeline runtime={R} components={C}/></CourseLayout>};
