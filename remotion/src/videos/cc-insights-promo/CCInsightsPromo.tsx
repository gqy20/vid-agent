import {AbsoluteFill} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {C} from '../../theme';
import {SceneHook} from './scenes/SceneHook';
import {SceneBrand} from './scenes/SceneBrand';
import {SceneRec} from './scenes/SceneRec';
import {SceneTok} from './scenes/SceneTok';
import {SceneCmd} from './scenes/SceneCmd';
import {SceneWeb} from './scenes/SceneWeb';
import {SceneFeatures} from './scenes/SceneFeatures';
import {SceneCTA} from './scenes/SceneCTA';

/* 主合成 —— 用 TransitionSeries 做平滑转场
   总帧数 = Σ场景(2202) − Σ转场(slide20 + 6×fade16 = 116) = 2086 */
const fadeT = (
  <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: 16})} />
);

export const CCInsightsPromo: React.FC = () => {
  return (
    <AbsoluteFill style={{background: C.bg0}}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={240}><SceneHook /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({direction: 'from-bottom'})} timing={linearTiming({durationInFrames: 20})} />
        <TransitionSeries.Sequence durationInFrames={156}><SceneBrand /></TransitionSeries.Sequence>
        {fadeT}
        <TransitionSeries.Sequence durationInFrames={396}><SceneRec /></TransitionSeries.Sequence>
        {fadeT}
        <TransitionSeries.Sequence durationInFrames={276}><SceneTok /></TransitionSeries.Sequence>
        {fadeT}
        <TransitionSeries.Sequence durationInFrames={276}><SceneCmd /></TransitionSeries.Sequence>
        {fadeT}
        <TransitionSeries.Sequence durationInFrames={306}><SceneWeb /></TransitionSeries.Sequence>
        {fadeT}
        <TransitionSeries.Sequence durationInFrames={336}><SceneFeatures /></TransitionSeries.Sequence>
        {fadeT}
        <TransitionSeries.Sequence durationInFrames={216}><SceneCTA /></TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
