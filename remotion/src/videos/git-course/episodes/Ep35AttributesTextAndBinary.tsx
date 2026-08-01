import {useCurrentFrame} from 'remotion'; import {EP35} from '../data/episodes'; import {EP35_DURATION_IN_FRAMES,EP35_SCENES} from '../data/episodeTimelines.generated'; import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated'; import {CourseLayout,EpisodeTimeline,SceneTitle,TerminalThenModelScene,createEpisodeRuntime} from '../kit'; import {seconds} from '../timeline'; import {CompareCards,FlowSteps,ModelScene,QuestionSceneVisual} from './WorkflowEpisodeVisuals';
export {EP35_DURATION_IN_FRAMES,EP35_SCENES}; const R=createEpisodeRuntime(EP35_SCENES); const cue=(id:string,d=11)=>({id:id as keyof typeof TERMINAL_RECORDINGS,from:0,durationInFrames:seconds(d+.7),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id as keyof typeof TERMINAL_RECORDINGS].holdFromFrame}); const Term=({scene,id,result,at=11}:{scene:Parameters<typeof R.captions>[0];id:string;result:React.ReactNode;at?:number})=><TerminalThenModelScene cues={[cue(id,at)]} modelAtSeconds={at} model={result} captions={R.captions(scene)} auditIdPrefix={`ep35-${scene}`}/>;
// @git-course-scene hook:start
const Hook=()=> <QuestionSceneVisual eyebrow="TEXT & BINARY" question="同一脚本，为何产生整页 Diff？" captions={R.captions('hook')}/>;
// @git-course-scene hook:end
// @git-course-scene attribute-model:start
const AttributeModel=()=> <ModelScene title="Attributes 定义路径处理语义" captions={R.captions('attribute-model')}><CompareCards cards={[{label:'text',detail:'Index 换行规范'},{label:'eol',detail:'Working Tree 输出',tone:'feature'},{label:'diff',detail:'比较呈现',tone:'head'}]}/></ModelScene>;
// @git-course-scene attribute-model:end
// @git-course-scene inspect-attributes:start
const InspectAttributes=()=> <Term scene="inspect-attributes" id="ep35-check-attr" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>查看路径实际命中的属性</SceneTitle><CompareCards cards={[{label:'text',detail:'set'},{label:'eol',detail:'lf',tone:'feature'},{label:'diff',detail:'set',tone:'head'}]}/></>}/>;
// @git-course-scene inspect-attributes:end
// @git-course-scene renormalize:start
const Renormalize=()=> <Term scene="renormalize" id="ep35-renormalize" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Renormalize 重写 Index 内容</SceneTitle><FlowSteps revealAtSeconds={11} steps={[{label:'CRLF',tone:'feature'},{label:'Attributes',tone:'head'},{label:'Renormalize',tone:'head'},{label:'Index LF',tone:'neutral'}]}/></>}/>;
// @git-course-scene renormalize:end
// @git-course-scene binary-diff:start
const BinaryDiff=()=> <Term scene="binary-diff" id="ep35-binary-diff" result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>Binary 不应伪装成文本 Diff</SceneTitle><CompareCards cards={[{label:'Before',detail:'噪声文本行',tone:'conflict'},{label:'After -diff',detail:'Binary files differ',tone:'neutral'}]}/></>}/>;
// @git-course-scene binary-diff:end
// @git-course-scene takeaway:start
const Takeaway=()=> <ModelScene title="区分 Index 规范与工作区输出" captions={R.captions('takeaway')}><FlowSteps revealAtSeconds={.4} steps={[{label:'Text',detail:'Index',tone:'neutral'},{label:'EOL',detail:'Working Tree',tone:'feature'},{label:'Diff',detail:'Review',tone:'head'}]}/></ModelScene>;
// @git-course-scene takeaway:end
const C={hook:Hook,'attribute-model':AttributeModel,'inspect-attributes':InspectAttributes,renormalize:Renormalize,'binary-diff':BinaryDiff,takeaway:Takeaway}; export const Ep35AttributesTextAndBinary=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP35.seriesTitle} episodeTitle={EP35.title} scenes={EP35_SCENES} currentFrame={f} showHeader={x=>x>=R.start('attribute-model')} showEpisodeTitle={x=>x>=R.start('attribute-model')}><EpisodeTimeline runtime={R} components={C}/></CourseLayout>};
