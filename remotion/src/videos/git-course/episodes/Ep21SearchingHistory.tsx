import {AbsoluteFill,interpolate,useCurrentFrame} from 'remotion';
import {EP21} from '../data/episodes';
import {EP21_DURATION_IN_FRAMES,EP21_SCENES} from '../data/episodeTimelines.generated';
import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated';
import {CenteredSceneBody,CourseLayout,EpisodeTitleCard,EpisodeTimeline,NarrationSubtitle,SceneTitle,TerminalThenModelScene,createEpisodeRuntime} from '../kit';
import {COLOR,FONT,WEIGHT} from '../palette';
import {seconds} from '../timeline';
import {TYPE} from '../typography';

export {EP21_DURATION_IN_FRAMES,EP21_SCENES};
const R=createEpisodeRuntime(EP21_SCENES);
const appear=(f:number,at:number)=>interpolate(f,[seconds(at),seconds(at+.7)],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const cue=(id:keyof typeof TERMINAL_RECORDINGS,d:number)=>({id,from:0,durationInFrames:seconds(d+.7),src:`git-course-lab/terminal/${id}.mp4`,holdFrameSrc:`git-course-lab/terminal/${id}-hold.png`,holdFromFrame:TERMINAL_RECORDINGS[id].holdFromFrame});
const Term:React.FC<{scene:string;id:keyof typeof TERMINAL_RECORDINGS;duration:number;result:React.ReactNode}>=({scene,id,duration,result})=><TerminalThenModelScene cues={[cue(id,duration)]} modelAtSeconds={duration} model={result} captions={R.captions(scene as never)} auditIdPrefix={`ep21-${scene}-terminal`}/>;
const Cards:React.FC<{items:Array<[string,string,string]>}>=({items})=>{const f=useCurrentFrame();return <CenteredSceneBody width={1500} style={{display:'grid',gridTemplateColumns:`repeat(${items.length},1fr)`,gap:32}}>{items.map(([label,value,color],i)=><div key={label} style={{padding:'38px 28px',borderRadius:24,background:COLOR.canvas.raised,border:`4px solid ${color}`,opacity:appear(f,1+i*1.3),textAlign:'center'}}><div style={{...TYPE.label,color}}>{label}</div><div style={{...TYPE.title,fontFamily:FONT.mono,fontWeight:WEIGHT.bold,marginTop:24}}>{value}</div></div>)}</CenteredSceneBody>};

// @git-course-scene hook:start
const Hook=()=>{const f=useCurrentFrame();return <AbsoluteFill><EpisodeTitleCard index="21." keyword="同一个关键词" suffix="四种答案？" opacity={1} underlineScale={appear(f,.4)} auditId="ep21-hook"/><NarrationSubtitle frame={f} cues={R.captions('hook')} width={1320} bottom={64}/></AbsoluteFill>};
// @git-course-scene hook:end
// @git-course-scene search-targets:start
const SearchTargets=()=>{const f=useCurrentFrame();return <AbsoluteFill><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>先问：要搜索哪一层？</SceneTitle><Cards items={[["当前内容","git grep",COLOR.git.workingTree],["提交说明","log --grep",COLOR.git.main],["历史补丁","log -S / -G",COLOR.git.feature]]}/><NarrationSubtitle frame={f} cues={R.captions('search-targets')} width={1320} bottom={64}/></AbsoluteFill>};
// @git-course-scene search-targets:end
// @git-course-scene git-grep:start
const GitGrep=()=> <Term scene="git-grep" id="ep21-grep" duration={10} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>git grep 回答：现在在哪里？</SceneTitle><Cards items={[["TRACKED FILES","当前工作树 + Index","#2F80ED"],["RESULT","文件名 · 行号 · 文本",COLOR.git.workingTree]]}/></>}/>;
// @git-course-scene git-grep:end
// @git-course-scene message-search:start
const MessageSearch=()=> <Term scene="message-search" id="ep21-message" duration={10} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>--grep 检查提交说明</SceneTitle><Cards items={[["QUERY","fix timeout",COLOR.git.main],["MATCH","Commit Message",COLOR.git.main]]}/></>}/>;
// @git-course-scene message-search:end
// @git-course-scene pickaxe-search:start
const PickaxeSearch=()=> <Term scene="pickaxe-search" id="ep21-pickaxe" duration={11} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>-S 追踪字符串数量的变化</SceneTitle><CenteredSceneBody width={1120} style={{display:'flex',alignItems:'center',justifyContent:'center',gap:58}}>{[['BEFORE','0'],['PATCH','+ timeoutMs'],['AFTER','1']].map(([a,b],i)=><div key={a} style={{minWidth:300,padding:'36px 44px',borderRadius:24,background:COLOR.canvas.raised,textAlign:'center',border:`4px solid ${i===1?COLOR.git.feature:COLOR.stroke.strong}`}}><div style={{...TYPE.label,color:COLOR.text.tertiary}}>{a}</div><div style={{...TYPE.hero,fontFamily:FONT.mono,fontWeight:WEIGHT.bold,marginTop:18}}>{b}</div></div>)}</CenteredSceneBody></>}/>;
// @git-course-scene pickaxe-search:end
// @git-course-scene regex-search:start
const RegexSearch=()=> <Term scene="regex-search" id="ep21-regex" duration={10} result={<><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>-G 匹配补丁中变化的行</SceneTitle><CenteredSceneBody width={1280} style={{padding:'46px 56px',borderRadius:26,background:COLOR.canvas.raised,fontFamily:FONT.mono,...TYPE.title,lineHeight:1.7}}><div style={{color:COLOR.git.conflict}}>- const timeout = 3000</div><div style={{color:COLOR.git.feature}}>+ const timeoutMs = 5000</div></CenteredSceneBody></>}/>;
// @git-course-scene regex-search:end
// @git-course-scene takeaway:start
const Takeaway=()=>{const f=useCurrentFrame();return <AbsoluteFill><SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>搜索历史，先选问题，再选命令</SceneTitle><Cards items={[["grep","当前内容",COLOR.git.workingTree],["--grep","提交说明",COLOR.git.main],["-S","计数变化",COLOR.git.feature],["-G","补丁行",COLOR.git.conflict]]}/><NarrationSubtitle frame={f} cues={R.captions('takeaway')} width={1320} bottom={64}/></AbsoluteFill>};
// @git-course-scene takeaway:end

const C={hook:Hook,'search-targets':SearchTargets,'git-grep':GitGrep,'message-search':MessageSearch,'pickaxe-search':PickaxeSearch,'regex-search':RegexSearch,takeaway:Takeaway};
export const Ep21SearchingHistory=()=>{const f=useCurrentFrame();return <CourseLayout seriesTitle={EP21.seriesTitle} episodeTitle={EP21.title} scenes={EP21_SCENES} currentFrame={f} showHeader={x=>x>=R.start('search-targets')} showEpisodeTitle={x=>x>=R.start('search-targets')}><EpisodeTimeline runtime={R} components={C}/></CourseLayout>};
