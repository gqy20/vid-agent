import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLOR, FONT, WEIGHT} from '../palette';
import {TYPE} from '../typography';
import {CenteredSceneBody, NarrationSubtitle, SceneTitle} from '../kit';
import {seconds} from '../timeline';
import type {NarrationCaptionCue} from '../kit';

export type FlowTone = 'main' | 'feature' | 'head' | 'conflict' | 'neutral';

const toneColor = (tone: FlowTone) => tone === 'neutral' ? COLOR.stroke.strong : COLOR.git[tone];

export const FlowSteps: React.FC<{
  readonly steps: readonly {label: string; detail?: string; tone?: FlowTone}[];
  readonly active?: number;
}> = ({steps, active = steps.length - 1}) => (
  <CenteredSceneBody width={1540}>
    <div style={{position:'relative',display:'grid',gridTemplateColumns:`repeat(${steps.length}, minmax(0, 1fr))`,gap:36,alignItems:'center'}}>
      <div style={{position:'absolute',left:100,right:100,top:64,height:9,borderRadius:9,background:COLOR.git.graphLine,zIndex:0}} />
      {steps.map((step,index)=>{
        const color=toneColor(step.tone ?? 'main');
        return <div key={`${step.label}-${index}`} style={{position:'relative',zIndex:1,textAlign:'center',opacity:index<=active?1:.28}}>
          <div style={{width:128,height:128,margin:'0 auto',borderRadius:'50%',display:'grid',placeItems:'center',background:COLOR.canvas.raised,border:`7px solid ${color}`,boxShadow:`0 14px 30px ${COLOR.effects.shadowSoft}`}}>
            <span style={{...TYPE.title,fontFamily:FONT.mono,fontWeight:WEIGHT.bold,color}}>{index+1}</span>
          </div>
          <div style={{...TYPE.title,fontSize:38,fontWeight:WEIGHT.bold,marginTop:30,whiteSpace:'nowrap'}}>{step.label}</div>
          {step.detail?<div style={{...TYPE.body,color:COLOR.text.secondary,marginTop:10}}>{step.detail}</div>:null}
        </div>;
      })}
    </div>
  </CenteredSceneBody>
);

export const RepositoryTopology: React.FC<{
  readonly repositories: readonly {label:string;ref:string;tone?:FlowTone}[];
  readonly direction?: 'inward'|'right';
}> = ({repositories,direction='right'}) => (
  <CenteredSceneBody width={1540}>
    <div style={{position:'relative',display:'grid',gridTemplateColumns:`repeat(${repositories.length},1fr)`,gap:70,alignItems:'center'}}>
      <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',zIndex:0,overflow:'visible'}}>
        {repositories.slice(0,-1).map((_,index)=>{
          const x1=(index+.5)*1540/repositories.length;
          const x2=(index+1.5)*1540/repositories.length;
          const center=1540/2;
          const reverse=direction==='inward' && x1>center;
          return <line key={index} x1={reverse?x2:x1} y1={104} x2={reverse?x1:x2} y2={104} stroke={COLOR.git.graphLine} strokeWidth={9} strokeLinecap="round"/>;
        })}
      </svg>
      {repositories.map((repo,index)=>{const color=toneColor(repo.tone??(index===repositories.length-1?'main':'feature'));return <div key={repo.label} style={{position:'relative',zIndex:1,minHeight:208,padding:'34px 28px',borderRadius:28,background:COLOR.canvas.raised,border:`5px solid ${color}`,display:'grid',alignContent:'center',textAlign:'center',boxShadow:`0 18px 38px ${COLOR.effects.shadowSoft}`}}>
        <div style={{...TYPE.title,fontWeight:WEIGHT.bold}}>{repo.label}</div>
        <div style={{...TYPE.code,fontFamily:FONT.mono,color,marginTop:22,fontWeight:WEIGHT.bold}}>{repo.ref}</div>
      </div>})}
    </div>
  </CenteredSceneBody>
);

export const CompareCards: React.FC<{
  readonly cards: readonly {label:string;detail:string;tone?:FlowTone}[];
}> = ({cards}) => (
  <CenteredSceneBody width={1540}>
    <div style={{display:'grid',gridTemplateColumns:`repeat(${cards.length},1fr)`,gap:36}}>
      {cards.map((card,index)=>{const color=toneColor(card.tone??(index===0?'main':index===1?'feature':'head'));return <div key={card.label} style={{padding:'48px 34px',borderRadius:28,background:COLOR.canvas.raised,borderTop:`8px solid ${color}`,textAlign:'center',boxShadow:`0 16px 36px ${COLOR.effects.shadowSoft}`}}>
        <div style={{...TYPE.title,fontSize:40,fontFamily:FONT.mono,fontWeight:WEIGHT.bold,color}}>{card.label}</div>
        <div style={{...TYPE.body,fontSize:29,color:COLOR.text.secondary,marginTop:24}}>{card.detail}</div>
      </div>})}
    </div>
  </CenteredSceneBody>
);

export const ModelScene: React.FC<{
  readonly title:string;
  readonly captions:readonly NarrationCaptionCue[];
  readonly children:React.ReactNode;
}> = ({title,captions,children}) => {const frame=useCurrentFrame();return <AbsoluteFill>
  <SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>{title}</SceneTitle>
  {children}
  <NarrationSubtitle frame={frame} cues={captions} width={1320} bottom={64}/>
</AbsoluteFill>};

export const QuestionSceneVisual: React.FC<{
  readonly eyebrow:string;
  readonly question:string;
  readonly captions:readonly NarrationCaptionCue[];
}> = ({eyebrow,question,captions}) => {const frame=useCurrentFrame();const opacity=interpolate(frame,[seconds(.4),seconds(1.1)],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});return <AbsoluteFill style={{display:'grid',placeItems:'center'}}>
  <div style={{width:1460,textAlign:'center',opacity}}>
    <div style={{...TYPE.label,color:COLOR.git.main,letterSpacing:4}}>{eyebrow}</div>
    <div style={{...TYPE.display,fontSize:88,fontWeight:WEIGHT.black,marginTop:30}}>{question}</div>
  </div>
  <NarrationSubtitle frame={frame} cues={captions} width={1320} bottom={64}/>
</AbsoluteFill>};
