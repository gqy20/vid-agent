import {useCurrentFrame} from 'remotion'; import {EP32} from '../data/episodes'; import {EP32_DURATION_IN_FRAMES,EP32_SCENES} from '../data/episodeTimelines.generated'; import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated'; import {CourseLayout,EpisodeTimeline,SceneTitle,TerminalThenModelScene,createEpisodeRuntime} from '../kit'; import {seconds} from '../timeline'; import {CompareCards,FlowSteps,ModelScene,QuestionSceneVisual} from './WorkflowEpisodeVisuals';
export {EP32_DURATION_IN_FRAMES,EP32_SCENES}; const R=createEpisodeRuntime(EP32_SCENES); const cue=(id:string,d=10)=>({id:id as keyof typeof TERMINAL_RECORDINGS,from:0,durationInFrames:seconds(d+.7),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id as keyof typeof TERMINAL_RECORDINGS].holdFromFrame}); const Term=({scene,id,result}:{scene:Parameters<typeof R.captions>[0];id:string;result:React.ReactNode})=><TerminalThenModelScene cues={[cue(id)]} modelAtSeconds={10} model={result} captions={R.captions(scene)} auditIdPrefix={`ep32-${scene}`}/>;
// @git-course-scene hook:start
const Hook=()=> <QuestionSceneVisual eyebrow="INTEGRATION STRATEGY" question="文件相同，历史也相同吗？" captions={R.captions('hook')}/>;
// @git-course-scene hook:end
// @git-course-scene same-start:start
const SameStart=()=> <ModelScene title="三条实验路径从同一组对象开始" captions={R.captions('same-start')}><FlowSteps steps={[{label:'Base'},{label:'Main',tone:'main'},{label:'Topic C1',tone:'feature'},{label:'Topic C2',tone:'feature'}]}/></ModelScene>;
// @git-course-scene same-start:end
// @git-course-scene merge-path:start
const MergePath=()=> <Term scene="merge-path" id="ep32-merge-path" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Merge 保留拓扑与原 Commit 身份</SceneTitle><CompareCards cards={[{label:'Parents',detail:'main + topic'},{label:'Topic OIDs',detail:'保持不变',tone:'feature'},{label:'Topology',detail:'保留分叉',tone:'head'}]}/></>}/>;
// @git-course-scene merge-path:end
// @git-course-scene rebase-path:start
const RebasePath=()=> <Term scene="rebase-path" id="ep32-rebase-path" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Rebase 在新 Base 上重建 Commit</SceneTitle><CompareCards cards={[{label:'Linear',detail:'目标可 fast-forward'},{label:'New OIDs',detail:'parent 改变',tone:'feature'},{label:'Shared?',detail:'已共享时谨慎',tone:'head'}]}/></>}/>;
// @git-course-scene rebase-path:end
// @git-course-scene pick-path:start
const PickPath=()=> <Term scene="pick-path" id="ep32-pick-path" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Cherry-pick 只接收选中的变化</SceneTitle><CompareCards cards={[{label:'Selected',detail:'指定 commit',tone:'feature'},{label:'New OIDs',detail:'目标上新建',tone:'head'},{label:'No ancestry',detail:'来源 topic 不成为祖先'}]}/></>}/>;
// @git-course-scene pick-path:end
// @git-course-scene takeaway:start
const Takeaway=()=> <ModelScene title="先回答四个问题，再选命令" captions={R.captions('takeaway')}><CompareCards cards={[{label:'Topology',detail:'保留分叉吗'},{label:'Identity',detail:'保留原 commit 吗',tone:'feature'},{label:'Range',detail:'全部还是部分',tone:'head'},{label:'Shared',detail:'branch 已共享吗',tone:'conflict'}]}/></ModelScene>;
// @git-course-scene takeaway:end
const C={hook:Hook,'same-start':SameStart,'merge-path':MergePath,'rebase-path':RebasePath,'pick-path':PickPath,takeaway:Takeaway}; export const Ep32ChoosingIntegrationStrategy=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP32.seriesTitle} episodeTitle={EP32.title} scenes={EP32_SCENES} currentFrame={f} showHeader={x=>x>=R.start('same-start')} showEpisodeTitle={x=>x>=R.start('same-start')}><EpisodeTimeline runtime={R} components={C}/></CourseLayout>};
