import {useCurrentFrame} from 'remotion'; import {EP47} from '../data/episodes'; import {EP47_DURATION_IN_FRAMES,EP47_SCENES} from '../data/episodeTimelines.generated'; import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated'; import {CourseLayout,EpisodeTimeline,SceneTitle,TerminalThenModelScene,createEpisodeRuntime} from '../kit'; import {seconds} from '../timeline'; import {CompareCards,FlowSteps,ModelScene,QuestionSceneVisual} from './WorkflowEpisodeVisuals';
export {EP47_DURATION_IN_FRAMES,EP47_SCENES}; const R=createEpisodeRuntime(EP47_SCENES); const cue=(id:string,d=12)=>({id:id as keyof typeof TERMINAL_RECORDINGS,from:0,durationInFrames:seconds(d+.7),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id as keyof typeof TERMINAL_RECORDINGS].holdFromFrame}); const Term=({scene,id,result,at=12}:{scene:Parameters<typeof R.captions>[0];id:string;result:React.ReactNode;at?:number})=><TerminalThenModelScene cues={[cue(id,at)]} modelAtSeconds={at} terminalEvidenceHoldSeconds={1} model={result} captions={R.captions(scene)} auditIdPrefix={`ep47-${scene}`}/>;
// @git-course-scene hook:start
const Hook=()=> <QuestionSceneVisual eyebrow="DESTRUCTIVE BOUNDARY" question="清理未跟踪文件为什么容易删错？" captions={R.captions('hook')}/>;
// @git-course-scene hook:end
// @git-course-scene clean-boundary:start
const CleanBoundary=()=> <ModelScene title="参数选择集合，Pathspec 限定范围" captions={R.captions('clean-boundary')}><CompareCards cards={[{label:'-n',detail:'preview',tone:'neutral'},{label:'-X / -x',detail:'choose set',tone:'head'},{label:'-- path/',detail:'limit scope',tone:'feature'}]}/></ModelScene>;
// @git-course-scene clean-boundary:end
// @git-course-scene classify-files:start
const ClassifyFiles=()=> <Term scene="classify-files" id="ep47-classify-files" at={14} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Clean 面对的不是同一种文件</SceneTitle><CompareCards cards={[{label:'Tracked',detail:'protected',tone:'main'},{label:'Untracked',detail:'candidate',tone:'head'},{label:'Ignored',detail:'separate set',tone:'feature'},{label:'Nested Repo',detail:'extra guard',tone:'neutral'}]}/></>}/>;
// @git-course-scene classify-files:end
// @git-course-scene dry-runs:start
const DryRuns=()=> <Term scene="dry-runs" id="ep47-dry-runs" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>三个 Dry-run 对应三个目标集合</SceneTitle><CompareCards cards={[{label:'-nd',detail:'untracked',tone:'main'},{label:'-ndX',detail:'ignored only',tone:'feature'},{label:'-ndx',detail:'both',tone:'head'}]}/></>}/>;
// @git-course-scene dry-runs:end
// @git-course-scene scoped-clean:start
const ScopedClean=()=> <Term scene="scoped-clean" id="ep47-scoped-clean" at={14} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>真实删除限制在 build/</SceneTitle><FlowSteps steps={[{label:'Preview',detail:'-ndX build/'},{label:'Delete',detail:'-fdX build/',tone:'conflict'},{label:'Verify',detail:'other paths kept',tone:'feature'}]}/></>}/>;
// @git-course-scene scoped-clean:end
// @git-course-scene takeaway:start
const Takeaway=()=> <ModelScene title="预览同一集合，再执行最小范围" captions={R.captions('takeaway')}><FlowSteps steps={[{label:'Classify',tone:'neutral'},{label:'Dry-run',tone:'head'},{label:'Scope',tone:'feature'}]}/></ModelScene>;
// @git-course-scene takeaway:end
const C={hook:Hook,'clean-boundary':CleanBoundary,'classify-files':ClassifyFiles,'dry-runs':DryRuns,'scoped-clean':ScopedClean,takeaway:Takeaway}; export const Ep47CleanAndDestructiveBoundaries=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP47.seriesTitle} episodeTitle={EP47.title} scenes={EP47_SCENES} currentFrame={f} showHeader={x=>x>=R.start('clean-boundary')} showEpisodeTitle={x=>x>=R.start('clean-boundary')}><EpisodeTimeline runtime={R} components={C}/></CourseLayout>};
