import {useCurrentFrame} from 'remotion';
import {EP41} from '../data/episodes';
import {EP41_DURATION_IN_FRAMES,EP41_SCENES} from '../data/episodeTimelines.generated';
import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated';
import {CourseLayout,EpisodeTimeline,SceneTitle,TerminalThenModelScene,createEpisodeRuntime} from '../kit';
import {seconds} from '../timeline';
import {CompareCards,FlowSteps,ModelScene,QuestionSceneVisual} from './WorkflowEpisodeVisuals';
export {EP41_DURATION_IN_FRAMES,EP41_SCENES};
const R=createEpisodeRuntime(EP41_SCENES);
const cue=(id:string,d=12)=>({id:id as keyof typeof TERMINAL_RECORDINGS,from:0,durationInFrames:seconds(d+.7),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id as keyof typeof TERMINAL_RECORDINGS].holdFromFrame});
const Term=({scene,id,result,at=12}:{scene:Parameters<typeof R.captions>[0];id:string;result:React.ReactNode;at?:number})=><TerminalThenModelScene cues={[cue(id,at)]} modelAtSeconds={at} model={result} captions={R.captions(scene)} auditIdPrefix={`ep41-${scene}`}/>;
// @git-course-scene hook:start
const Hook=()=> <QuestionSceneVisual eyebrow="SUBMODULE" question="父仓库保存了子仓库的文件吗？" captions={R.captions('hook')}/>;
// @git-course-scene hook:end
// @git-course-scene pointer-model:start
const PointerModel=()=> <ModelScene title="Gitlink 精确指向子仓库 Commit" captions={R.captions('pointer-model')}><FlowSteps steps={[{label:'Superproject',tone:'main'},{label:'160000',detail:'gitlink',tone:'head'},{label:'Child Commit',detail:'full OID',tone:'feature'}]}/></ModelScene>;
// @git-course-scene pointer-model:end
// @git-course-scene add-submodule:start
const AddSubmodule=()=> <Term scene="add-submodule" id="ep41-add-submodule" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>添加后出现两个不同职责的路径</SceneTitle><CompareCards cards={[{label:'.gitmodules',detail:'path + url',tone:'neutral'},{label:'libs/core',detail:'gitlink',tone:'head'}]}/></>}/>;
// @git-course-scene add-submodule:end
// @git-course-scene gitlink-entry:start
const GitlinkEntry=()=> <Term scene="gitlink-entry" id="ep41-gitlink-entry" at={13} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>父条目与子 HEAD 指向同一对象</SceneTitle><FlowSteps steps={[{label:'Index',detail:'160000'},{label:'HEAD Tree',detail:'160000',tone:'head'},{label:'Child HEAD',detail:'same OID',tone:'feature'}]}/></>}/>;
// @git-course-scene gitlink-entry:end
// @git-course-scene independent-history:start
const IndependentHistory=()=> <Term scene="independent-history" id="ep41-independent-history" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>两套 Repository，各自保存历史</SceneTitle><CompareCards cards={[{label:'Parent',detail:'records gitlink',tone:'main'},{label:'Child',detail:'owns commits + refs',tone:'feature'}]}/></>}/>;
// @git-course-scene independent-history:end
// @git-course-scene takeaway:start
const Takeaway=()=> <ModelScene title="位置、版本与历史要分开看" captions={R.captions('takeaway')}><CompareCards cards={[{label:'URL',detail:'where to fetch',tone:'neutral'},{label:'Gitlink',detail:'which commit',tone:'head'},{label:'Child Repo',detail:'objects + refs',tone:'feature'}]}/></ModelScene>;
// @git-course-scene takeaway:end
const C={hook:Hook,'pointer-model':PointerModel,'add-submodule':AddSubmodule,'gitlink-entry':GitlinkEntry,'independent-history':IndependentHistory,takeaway:Takeaway};
export const Ep41SubmodulePointerModel=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP41.seriesTitle} episodeTitle={EP41.title} scenes={EP41_SCENES} currentFrame={f} showHeader={x=>x>=R.start('pointer-model')} showEpisodeTitle={x=>x>=R.start('pointer-model')}><EpisodeTimeline runtime={R} components={C}/></CourseLayout>};
