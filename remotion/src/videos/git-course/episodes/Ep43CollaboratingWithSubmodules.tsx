import {useCurrentFrame} from 'remotion'; import {EP43} from '../data/episodes'; import {EP43_DURATION_IN_FRAMES,EP43_SCENES} from '../data/episodeTimelines.generated'; import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated'; import {CourseLayout,EpisodeTimeline,SceneTitle,TerminalThenModelScene,createEpisodeRuntime} from '../kit'; import {seconds} from '../timeline'; import {CompareCards,FlowSteps,ModelScene,QuestionSceneVisual} from './WorkflowEpisodeVisuals';
export {EP43_DURATION_IN_FRAMES,EP43_SCENES}; const R=createEpisodeRuntime(EP43_SCENES); const cue=(id:string,d=12)=>({id:id as keyof typeof TERMINAL_RECORDINGS,from:0,durationInFrames:seconds(d+.7),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id as keyof typeof TERMINAL_RECORDINGS].holdFromFrame}); const Term=({scene,id,result,at=12}:{scene:Parameters<typeof R.captions>[0];id:string;result:React.ReactNode;at?:number})=><TerminalThenModelScene cues={[cue(id,at)]} modelAtSeconds={at} terminalEvidenceHoldSeconds={1} model={result} captions={R.captions(scene)} auditIdPrefix={`ep43-${scene}`}/>;
// @git-course-scene hook:start
const Hook=()=> <QuestionSceneVisual eyebrow="SUBMODULE PUBLISH" question="为何会指向不可获取的 Commit？" captions={R.captions('hook')}/>;
// @git-course-scene hook:end
// @git-course-scene publish-model:start
const PublishModel=()=> <ModelScene title="两套对象要按依赖顺序发布" captions={R.captions('publish-model')}><FlowSteps steps={[{label:'Child Remote',detail:'commit available',tone:'feature'},{label:'Parent Remote',detail:'gitlink published',tone:'main'},{label:'Consumer',detail:'update succeeds',tone:'head'}]}/></ModelScene>;
// @git-course-scene publish-model:end
// @git-course-scene gitlink-change:start
const GitlinkChange=()=> <Term scene="gitlink-change" id="ep43-gitlink-change" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>子 Commit 与父 Gitlink 是两次提交</SceneTitle><FlowSteps steps={[{label:'Child L2',tone:'feature'},{label:'Dirty Path',detail:'libs/core',tone:'head'},{label:'Parent P2',detail:'new gitlink',tone:'main'}]}/></>}/>;
// @git-course-scene gitlink-change:end
// @git-course-scene missing-child:start
const MissingChild=()=> <Term scene="missing-child" id="ep43-missing-child" at={14} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>父对象可获取，子对象仍可能缺失</SceneTitle><CompareCards cards={[{label:'Parent P2',detail:'available',tone:'main'},{label:'Child L2',detail:'missing',tone:'conflict'},{label:'Update',detail:'fails',tone:'conflict'}]}/></>}/>;
// @git-course-scene missing-child:end
// @git-course-scene publish-order:start
const PublishOrder=()=> <Term scene="publish-order" id="ep43-publish-order" at={14} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>递归检查把依赖变成发布门禁</SceneTitle><FlowSteps steps={[{label:'Check',detail:'fails',tone:'conflict'},{label:'Push Child',detail:'L2 available',tone:'feature'},{label:'Push Parent',detail:'P2 available',tone:'main'}]}/></>}/>;
// @git-course-scene publish-order:end
// @git-course-scene takeaway:start
const Takeaway=()=> <ModelScene title="发布的是一条可恢复的依赖链" captions={R.captions('takeaway')}><FlowSteps steps={[{label:'Child',detail:'available',tone:'feature'},{label:'Gitlink',detail:'published',tone:'main'},{label:'Consumer',detail:'restored',tone:'head'}]}/></ModelScene>;
// @git-course-scene takeaway:end
const C={hook:Hook,'publish-model':PublishModel,'gitlink-change':GitlinkChange,'missing-child':MissingChild,'publish-order':PublishOrder,takeaway:Takeaway}; export const Ep43CollaboratingWithSubmodules=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP43.seriesTitle} episodeTitle={EP43.title} scenes={EP43_SCENES} currentFrame={f} showHeader={x=>x>=R.start('publish-model')} showEpisodeTitle={x=>x>=R.start('publish-model')}><EpisodeTimeline runtime={R} components={C}/></CourseLayout>};
