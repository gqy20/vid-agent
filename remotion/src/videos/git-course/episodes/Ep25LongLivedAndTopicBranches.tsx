import {useCurrentFrame} from 'remotion';
import {EP25} from '../data/episodes';
import {EP25_DURATION_IN_FRAMES,EP25_SCENES} from '../data/episodeTimelines.generated';
import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated';
import {CourseLayout,EpisodeTimeline,SceneTitle,TerminalThenModelScene,createEpisodeRuntime} from '../kit';
import {seconds} from '../timeline';
import {CompareCards,FlowSteps,ModelScene,QuestionSceneVisual} from './WorkflowEpisodeVisuals';
export {EP25_DURATION_IN_FRAMES,EP25_SCENES}; const R=createEpisodeRuntime(EP25_SCENES);
const cue=(id:string,d=10)=>({id:id as keyof typeof TERMINAL_RECORDINGS,from:0,durationInFrames:seconds(d+.7),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id as keyof typeof TERMINAL_RECORDINGS].holdFromFrame});
const Term=({scene,id,result,at=10}:{scene:Parameters<typeof R.captions>[0];id:string;result:React.ReactNode;at?:number})=><TerminalThenModelScene cues={[cue(id,at)]} modelAtSeconds={at} model={result} captions={R.captions(scene)} auditIdPrefix={`ep25-${scene}`}/>;
// @git-course-scene hook:start
const Hook=()=> <QuestionSceneVisual eyebrow="BRANCH LIFETIME" question="所有工作都应该直接进入 Main 吗？" captions={R.captions('hook')}/>;
// @git-course-scene hook:end
// @git-course-scene topic-start:start
const TopicStart=()=> <Term scene="topic-start" id="ep25-topic-start" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>一项工作，一条短期 Topic</SceneTitle><FlowSteps revealAtSeconds={10} steps={[{label:'main',detail:'稳定入口'},{label:'topic/login',detail:'两次提交',tone:'feature'}]}/></>}/>;
// @git-course-scene topic-start:end
// @git-course-scene topic-graph:start
const TopicGraph=()=> <ModelScene title="名字不同，底层都只是 Ref" captions={R.captions('topic-graph')}><CompareCards cards={[{label:'main',detail:'长期稳定入口'},{label:'next',detail:'长期集成阶段',tone:'head'},{label:'topic/login',detail:'单一主题，完成后结束',tone:'feature'}]}/></ModelScene>;
// @git-course-scene topic-graph:end
// @git-course-scene integrate:start
const Integrate=()=> <Term scene="integrate" id="ep25-integrate" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>检查通过后，Topic 才进入 Main</SceneTitle><FlowSteps revealAtSeconds={10} steps={[{label:'开发',tone:'feature'},{label:'测试',tone:'head'},{label:'整合'},{label:'main'}]}/></>}/>;
// @git-course-scene integrate:end
// @git-course-scene delete-ref:start
const DeleteRef=()=> <Term scene="delete-ref" id="ep25-delete" at={12} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Ref 消失，Commit 仍由 Main 可达</SceneTitle><CompareCards cards={[{label:'topic/login',detail:'名字已删除',tone:'conflict'},{label:'C1 · C2',detail:'对象仍在历史中',tone:'feature'},{label:'main',detail:'仍可沿 parent 到达'}]}/></>}/>;
// @git-course-scene delete-ref:end
// @git-course-scene takeaway:start
const Takeaway=()=> <ModelScene title="先定义职责，再决定寿命" captions={R.captions('takeaway')}><FlowSteps revealAtSeconds={.4} steps={[{label:'隔离',detail:'一个主题',tone:'feature'},{label:'检查',detail:'可验证',tone:'head'},{label:'整合',detail:'进入稳定线'},{label:'删 Ref',detail:'对象仍可达'}]}/></ModelScene>;
// @git-course-scene takeaway:end
const C={hook:Hook,'topic-start':TopicStart,'topic-graph':TopicGraph,integrate:Integrate,'delete-ref':DeleteRef,takeaway:Takeaway}; export const Ep25LongLivedAndTopicBranches=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP25.seriesTitle} episodeTitle={EP25.title} scenes={EP25_SCENES} currentFrame={f} showHeader={x=>x>=R.start('topic-start')} showEpisodeTitle={x=>x>=R.start('topic-start')}><EpisodeTimeline runtime={R} components={C}/></CourseLayout>};
