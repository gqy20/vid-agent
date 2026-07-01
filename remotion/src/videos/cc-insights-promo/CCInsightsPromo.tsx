import {AbsoluteFill, Audio, staticFile, interpolate, useVideoConfig} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {C, CLAMP} from '../../theme';
import {KaraokeCaptions} from '../../components/KaraokeCaptions';
import {SceneRenderer} from './SceneRenderer';
import {SCENES} from './timeline';

/* 主合成 @30fps —— 用 TransitionSeries 做平滑转场
   总帧数 = Σ场景(2202) − Σ转场(slide20 + 6×fade16 = 116) = 2086 */
const FADE = 30; // BGM 淡入淡出 30 帧 = 1s
const PEAK = 0.22; // BGM 峰值音量；若盖过配音降到 0.16-0.18

const renderTransition = (scene: (typeof SCENES)[number]) => {
  const transition = 'transitionAfter' in scene ? scene.transitionAfter : null;
  if (!transition) {
    return null;
  }

  const timing = linearTiming({durationInFrames: transition.durationInFrames});
  const presentation =
    transition.kind === 'slide-from-bottom'
      ? slide({direction: 'from-bottom'})
      : fade();

  return (
    <TransitionSeries.Transition
      key={`${scene.id}-transition`}
      presentation={presentation}
      timing={timing}
    />
  );
};

export const CCInsightsPromo: React.FC = () => {
  const {durationInFrames} = useVideoConfig();
  const bgmVolume = (f: number) => {
    if (f < FADE) return interpolate(f, [0, FADE], [0, PEAK], CLAMP);
    if (f > durationInFrames - FADE)
      return interpolate(f, [durationInFrames - FADE, durationInFrames], [PEAK, 0], CLAMP);
    return PEAK;
  };
  return (
    <AbsoluteFill style={{background: C.bg0}}>
      <TransitionSeries>
        {SCENES.map((scene) => (
          <TransitionSeries.Sequence key={scene.id} durationInFrames={scene.durationInFrames}>
            <SceneRenderer id={scene.id} />
          </TransitionSeries.Sequence>
        )).flatMap((sequence, index) => {
          const transition = renderTransition(SCENES[index]);
          return transition ? [sequence, transition] : [sequence];
        })}
      </TransitionSeries>
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        <Audio src={staticFile('voiceover.mp3')} />
        <Audio src={staticFile('bgm.mp3')} volume={bgmVolume} />
        <KaraokeCaptions />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
