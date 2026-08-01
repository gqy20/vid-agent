import {useCurrentFrame} from 'remotion'; import {EP31} from '../data/episodes'; import {EP31_DURATION_IN_FRAMES,EP31_SCENES} from '../data/episodeTimelines.generated'; import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated'; import {CourseLayout,EpisodeTimeline,SceneTitle,TerminalThenModelScene,createEpisodeRuntime} from '../kit'; import {seconds} from '../timeline'; import {CompareCards,FlowSteps,ModelScene,QuestionSceneVisual} from './WorkflowEpisodeVisuals';
export {EP31_DURATION_IN_FRAMES,EP31_SCENES}; const R=createEpisodeRuntime(EP31_SCENES); const cue=(id:string,d=10)=>({id:id as keyof typeof TERMINAL_RECORDINGS,from:0,durationInFrames:seconds(d+.7),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id as keyof typeof TERMINAL_RECORDINGS].holdFromFrame}); const Term=({scene,id,result,at=10}:{scene:Parameters<typeof R.captions>[0];id:string;result:React.ReactNode;at?:number})=><TerminalThenModelScene cues={[cue(id,at)]} modelAtSeconds={at} model={result} captions={R.captions(scene)} auditIdPrefix={`ep31-${scene}`}/>;
// @git-course-scene hook:start
const Hook=()=> <QuestionSceneVisual eyebrow="MAINTENANCE" question="Main 前进后，旧版本怎样修？" captions={R.captions('hook')}/>;
// @git-course-scene hook:end
// @git-course-scene release-lines:start
const ReleaseLines=()=> <ModelScene title="Tag 固定发布点，Branch 继续移动" captions={R.captions('release-lines')}><CompareCards cards={[{label:'v1.0.0',detail:'固定发布对象',tone:'head'},{label:'maint/v1',detail:'旧版本维护线',tone:'feature'},{label:'main',detail:'下一版本功能'}]}/></ModelScene>;
// @git-course-scene release-lines:end
// @git-course-scene hotfix:start
const Hotfix=()=> <Term scene="hotfix" id="ep31-hotfix" at={11.3} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>修复从最老受支持位置开始</SceneTitle><FlowSteps revealAtSeconds={11.3} steps={[{label:'v1.0.0',tone:'head'},{label:'maint/v1',tone:'feature'},{label:'hotfix/login',tone:'conflict'}]}/></>}/>;
// @git-course-scene hotfix:end
// @git-course-scene maintenance-release:start
const MaintenanceRelease=()=> <Term scene="maintenance-release" id="ep31-maint-release" at={10.6} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>维护线通过后发布 V1.0.1</SceneTitle><FlowSteps revealAtSeconds={10.6} steps={[{label:'Fix',tone:'conflict'},{label:'Test',tone:'head'},{label:'maint/v1',tone:'feature'},{label:'v1.0.1',tone:'head'}]}/></>}/>;
// @git-course-scene maintenance-release:end
// @git-course-scene merge-up:start
const MergeUp=()=> <Term scene="merge-up" id="ep31-merge-up" at={12} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>修复再沿维护线向上进入 Main</SceneTitle><FlowSteps revealAtSeconds={12} steps={[{label:'maint/v1',tone:'feature'},{label:'Merge Up',tone:'head'},{label:'main'},{label:'Test'}]}/></>}/>;
// @git-course-scene merge-up:end
// @git-course-scene takeaway:start
const Takeaway=()=> <ModelScene title="先修最老支持线，再向上整合" captions={R.captions('takeaway')}><FlowSteps revealAtSeconds={.4} steps={[{label:'Oldest',detail:'最老支持线',tone:'feature'},{label:'Fix',detail:'修复与验证',tone:'conflict'},{label:'Release',detail:'维护版本',tone:'head'},{label:'Merge Up',detail:'进入更新线'}]}/></ModelScene>;
// @git-course-scene takeaway:end
const C={hook:Hook,'release-lines':ReleaseLines,hotfix:Hotfix,'maintenance-release':MaintenanceRelease,'merge-up':MergeUp,takeaway:Takeaway}; export const Ep31ReleaseAndMaintenanceBranches=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP31.seriesTitle} episodeTitle={EP31.title} scenes={EP31_SCENES} currentFrame={f} showHeader={x=>x>=R.start('release-lines')} showEpisodeTitle={x=>x>=R.start('release-lines')}><EpisodeTimeline runtime={R} components={C}/></CourseLayout>};
