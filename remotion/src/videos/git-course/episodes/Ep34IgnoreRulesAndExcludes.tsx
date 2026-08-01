import {useCurrentFrame} from 'remotion'; import {EP34} from '../data/episodes'; import {EP34_DURATION_IN_FRAMES,EP34_SCENES} from '../data/episodeTimelines.generated'; import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated'; import {CourseLayout,EpisodeTimeline,SceneTitle,TerminalThenModelScene,createEpisodeRuntime} from '../kit'; import {seconds} from '../timeline'; import {CompareCards,FlowSteps,ModelScene,QuestionSceneVisual} from './WorkflowEpisodeVisuals';
export {EP34_DURATION_IN_FRAMES,EP34_SCENES}; const R=createEpisodeRuntime(EP34_SCENES); const cue=(id:string,d=11)=>({id:id as keyof typeof TERMINAL_RECORDINGS,from:0,durationInFrames:seconds(d+.7),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id as keyof typeof TERMINAL_RECORDINGS].holdFromFrame}); const Term=({scene,id,result,at=11}:{scene:Parameters<typeof R.captions>[0];id:string;result:React.ReactNode;at?:number})=><TerminalThenModelScene cues={[cue(id,at)]} modelAtSeconds={at} model={result} captions={R.captions(scene)} auditIdPrefix={`ep34-${scene}`}/>;
// @git-course-scene hook:start
const Hook=()=> <QuestionSceneVisual eyebrow="IGNORE RULES" question="文件存在，为何 Status 看不到？" captions={R.captions('hook')}/>;
// @git-course-scene hook:end
// @git-course-scene rule-sources:start
const RuleSources=()=> <ModelScene title="不同规则服务不同共享边界" captions={R.captions('rule-sources')}><CompareCards cards={[{label:'.gitignore',detail:'团队共享'},{label:'info/exclude',detail:'当前 clone',tone:'feature'},{label:'excludesFile',detail:'当前用户',tone:'head'}]}/></ModelScene>;
// @git-course-scene rule-sources:end
// @git-course-scene check-rules:start
const CheckRules=()=> <Term scene="check-rules" id="ep34-check-ignore" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Check-ignore 定位命中规则</SceneTitle><CompareCards cards={[{label:'build/',detail:'.gitignore'},{label:'notes.local',detail:'info/exclude',tone:'feature'},{label:'*.swp',detail:'excludesFile',tone:'head'}]}/></>}/>;
// @git-course-scene check-rules:end
// @git-course-scene tracked-path:start
const TrackedPath=()=> <Term scene="tracked-path" id="ep34-tracked-path" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Ignore 不会移除 Tracked Path</SceneTitle><FlowSteps revealAtSeconds={10.4} steps={[{label:'Tracked',tone:'neutral'},{label:'Add Rule',tone:'head'},{label:'Modify',tone:'feature'},{label:'Status M',tone:'feature'}]}/></>}/>;
// @git-course-scene tracked-path:end
// @git-course-scene stop-tracking:start
const StopTracking=()=> <Term scene="stop-tracking" id="ep34-stop-tracking" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>停止跟踪与保留文件分开</SceneTitle><FlowSteps revealAtSeconds={10.4} steps={[{label:'Tracked',tone:'neutral'},{label:'rm --cached',tone:'head'},{label:'Untracked',tone:'feature'},{label:'Ignored',tone:'neutral'}]}/></>}/>;
// @git-course-scene stop-tracking:end
// @git-course-scene takeaway:start
const Takeaway=()=> <ModelScene title="先问路径是否已经被跟踪" captions={R.captions('takeaway')}><FlowSteps revealAtSeconds={.4} steps={[{label:'Tracked?',tone:'head'},{label:'Source',tone:'neutral'},{label:'Pattern',tone:'feature'}]}/></ModelScene>;
// @git-course-scene takeaway:end
const C={hook:Hook,'rule-sources':RuleSources,'check-rules':CheckRules,'tracked-path':TrackedPath,'stop-tracking':StopTracking,takeaway:Takeaway}; export const Ep34IgnoreRulesAndExcludes=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP34.seriesTitle} episodeTitle={EP34.title} scenes={EP34_SCENES} currentFrame={f} showHeader={x=>x>=R.start('rule-sources')} showEpisodeTitle={x=>x>=R.start('rule-sources')}><EpisodeTimeline runtime={R} components={C}/></CourseLayout>};
