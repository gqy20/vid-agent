import {AbsoluteFill} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {Ck} from './theme';
import {SceneRenderer} from './SceneRenderer';
import {SCENES, type TransitionKind} from './timeline';

const presentation = (kind: TransitionKind) =>
  kind === 'slide-from-bottom' ? slide({direction: 'from-bottom'}) : fade();

const renderTransition = (scene: (typeof SCENES)[number]) => {
  const transition = 'transitionAfter' in scene ? scene.transitionAfter : null;
  if (!transition) {
    return null;
  }
  return (
    <TransitionSeries.Transition
      key={`${scene.id}-transition`}
      presentation={presentation(transition.kind)}
      timing={linearTiming({durationInFrames: transition.durationInFrames})}
    />
  );
};

/**
 * 主组件。视频本身 silent（方案 A：声音在 ffmpeg mux 阶段合入 mix.mp3）。
 * durationInFrames = Σ场景 906 − Σ转场 84 = 822 帧。
 */
export const GkPromo: React.FC = () => {
  return (
    <AbsoluteFill style={{background: Ck.bg0}}>
      <TransitionSeries>
        {SCENES.map((scene) => (
          <TransitionSeries.Sequence
            key={scene.id}
            durationInFrames={scene.durationInFrames}
          >
            <SceneRenderer id={scene.id} />
          </TransitionSeries.Sequence>
        )).flatMap((sequence, index) => {
          const transition = renderTransition(SCENES[index]);
          return transition ? [sequence, transition] : [sequence];
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};
