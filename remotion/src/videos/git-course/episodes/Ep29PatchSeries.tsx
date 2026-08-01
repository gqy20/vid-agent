import {useCurrentFrame} from 'remotion'; import {EP29} from '../data/episodes'; import {EP29_DURATION_IN_FRAMES,EP29_SCENES} from '../data/episodeTimelines.generated'; import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated'; import {CourseLayout,EpisodeTimeline,SceneTitle,TerminalThenModelScene,createEpisodeRuntime} from '../kit'; import {seconds} from '../timeline'; import {CompareCards,FlowSteps,ModelScene,QuestionSceneVisual} from './WorkflowEpisodeVisuals';
export {EP29_DURATION_IN_FRAMES,EP29_SCENES}; const R=createEpisodeRuntime(EP29_SCENES); const cue=(id:string,d=10)=>({id:id as keyof typeof TERMINAL_RECORDINGS,from:0,durationInFrames:seconds(d+.7),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id as keyof typeof TERMINAL_RECORDINGS].holdFromFrame}); const Term=({scene,id,result,at=10}:{scene:Parameters<typeof R.captions>[0];id:string;result:React.ReactNode;at?:number})=><TerminalThenModelScene cues={[cue(id,at)]} modelAtSeconds={at} model={result} captions={R.captions(scene)} auditIdPrefix={`ep29-${scene}`}/>;
// @git-course-scene hook:start
const Hook=()=> <QuestionSceneVisual eyebrow="PATCH SERIES" question="没有 Remote，Commit 怎样传递？" captions={R.captions('hook')}/>;
// @git-course-scene hook:end
// @git-course-scene sender-history:start
const SenderHistory=()=> <ModelScene title="先固定 Base..HEAD 的提交顺序" captions={R.captions('sender-history')}><FlowSteps revealAtSeconds={.4} steps={[{label:'C1',detail:'建立结构',tone:'feature'},{label:'C2',detail:'加入行为',tone:'feature'},{label:'C3',detail:'补充测试',tone:'feature'}]}/></ModelScene>;
// @git-course-scene sender-history:end
// @git-course-scene format-patch:start
const FormatPatch=()=> <Term scene="format-patch" id="ep29-format-patch" at={12.3} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>每条 Commit 对应一份 Patch Message</SceneTitle><FlowSteps revealAtSeconds={12.3} steps={[{label:'C1 → 0001',tone:'feature'},{label:'C2 → 0002',tone:'feature'},{label:'C3 → 0003',tone:'feature'}]}/></>}/>;
// @git-course-scene format-patch:end
// @git-course-scene inspect-message:start
const InspectMessage=()=> <Term scene="inspect-message" id="ep29-inspect-patch" at={12.3} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>一份 Patch 同时携带提交语义</SceneTitle><CompareCards cards={[{label:'From',detail:'作者信息',tone:'feature'},{label:'Subject',detail:'提交标题',tone:'head'},{label:'Body',detail:'为什么改变'},{label:'Diff',detail:'文件变化',tone:'main'}]}/></>}/>;
// @git-course-scene inspect-message:end
// @git-course-scene apply-series:start
const ApplySeries=()=> <Term scene="apply-series" id="ep29-apply-series" at={12} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Git Am 按顺序重建三条 Commit</SceneTitle><FlowSteps revealAtSeconds={12} steps={[{label:'0001',tone:'feature'},{label:'0002',tone:'feature'},{label:'0003',tone:'feature'},{label:'New OIDs',tone:'head'}]}/></>}/>;
// @git-course-scene apply-series:end
// @git-course-scene takeaway:start
const Takeaway=()=> <ModelScene title="需要提交语义时，传递 Patch Series" captions={R.captions('takeaway')}><CompareCards cards={[{label:'format-patch + am',detail:'重建作者、说明与 commit 序列',tone:'feature'},{label:'git apply',detail:'只应用 patch，不自动 commit',tone:'head'}]}/></ModelScene>;
// @git-course-scene takeaway:end
const C={hook:Hook,'sender-history':SenderHistory,'format-patch':FormatPatch,'inspect-message':InspectMessage,'apply-series':ApplySeries,takeaway:Takeaway}; export const Ep29PatchSeries=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP29.seriesTitle} episodeTitle={EP29.title} scenes={EP29_SCENES} currentFrame={f} showHeader={x=>x>=R.start('sender-history')} showEpisodeTitle={x=>x>=R.start('sender-history')}><EpisodeTimeline runtime={R} components={C}/></CourseLayout>};
