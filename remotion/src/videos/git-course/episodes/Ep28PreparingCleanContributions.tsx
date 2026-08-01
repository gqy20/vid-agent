import {useCurrentFrame} from 'remotion'; import {EP28} from '../data/episodes'; import {EP28_DURATION_IN_FRAMES,EP28_SCENES} from '../data/episodeTimelines.generated'; import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated'; import {CourseLayout,EpisodeTimeline,SceneTitle,TerminalThenModelScene,createEpisodeRuntime} from '../kit'; import {seconds} from '../timeline'; import {CompareCards,FlowSteps,ModelScene,QuestionSceneVisual} from './WorkflowEpisodeVisuals';
export {EP28_DURATION_IN_FRAMES,EP28_SCENES}; const R=createEpisodeRuntime(EP28_SCENES); const cue=(id:string,d=10)=>({id:id as keyof typeof TERMINAL_RECORDINGS,from:0,durationInFrames:seconds(d+.7),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id as keyof typeof TERMINAL_RECORDINGS].holdFromFrame}); const Term=({scene,id,result}:{scene:Parameters<typeof R.captions>[0];id:string;result:React.ReactNode})=><TerminalThenModelScene cues={[cue(id)]} modelAtSeconds={10} model={result} captions={R.captions(scene)} auditIdPrefix={`ep28-${scene}`}/>;
// @git-course-scene hook:start
const Hook=()=> <QuestionSceneVisual eyebrow="REVIEWABLE COMMITS" question="能运行，就容易审查吗？" captions={R.captions('hook')}/>;
// @git-course-scene hook:end
// @git-course-scene inspect-dirty:start
const InspectDirty=()=> <Term scene="inspect-dirty" id="ep28-inspect-dirty" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>先移除不属于贡献的噪声</SceneTitle><CompareCards cards={[{label:'功能',detail:'本次需要的变化'},{label:'DEBUG',detail:'临时输出，移除',tone:'conflict'},{label:'Whitespace',detail:'diff --check 定位',tone:'head'}]}/></>}/>;
// @git-course-scene inspect-dirty:end
// @git-course-scene split-intent:start
const SplitIntent=()=> <ModelScene title="一个 Commit 表达一个可验证意图" captions={R.captions('split-intent')}><CompareCards cards={[{label:'C1',detail:'实现登录校验',tone:'feature'},{label:'C2',detail:'补充行为测试',tone:'main'}]}/></ModelScene>;
// @git-course-scene split-intent:end
// @git-course-scene verify-index:start
const VerifyIndex=()=> <Term scene="verify-index" id="ep28-verify-index" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>先核对 Index，再建立 Commit</SceneTitle><FlowSteps steps={[{label:'Cached Diff',tone:'head'},{label:'Test'},{label:'Commit',tone:'feature'}]}/></>}/>;
// @git-course-scene verify-index:end
// @git-course-scene receiver-range:start
const ReceiverRange=()=> <Term scene="receiver-range" id="ep28-review-range" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>接收者看到的是 Upstream..HEAD</SceneTitle><FlowSteps steps={[{label:'C1',detail:'功能',tone:'feature'},{label:'C2',detail:'测试'},{label:'Clean WT',detail:'无遗漏',tone:'head'}]}/></>}/>;
// @git-course-scene receiver-range:end
// @git-course-scene takeaway:start
const Takeaway=()=> <ModelScene title="清楚的范围，比统一模板更重要" captions={R.captions('takeaway')}><FlowSteps steps={[{label:'Scope',detail:'只有所需变化'},{label:'Intent',detail:'一条一个意图',tone:'feature'},{label:'Evidence',detail:'可独立验证',tone:'head'},{label:'Range',detail:'接收者视角'}]}/></ModelScene>;
// @git-course-scene takeaway:end
const C={hook:Hook,'inspect-dirty':InspectDirty,'split-intent':SplitIntent,'verify-index':VerifyIndex,'receiver-range':ReceiverRange,takeaway:Takeaway}; export const Ep28PreparingCleanContributions=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP28.seriesTitle} episodeTitle={EP28.title} scenes={EP28_SCENES} currentFrame={f} showHeader={x=>x>=R.start('inspect-dirty')} showEpisodeTitle={x=>x>=R.start('inspect-dirty')}><EpisodeTimeline runtime={R} components={C}/></CourseLayout>};
