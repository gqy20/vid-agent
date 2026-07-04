import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {C} from '../../theme';
import {KaraokeCaptions} from '../../components/KaraokeCaptions';
import {SceneRenderer} from './SceneRenderer';
import {TransitionOverlay} from './TransitionOverlay';
import {SCENES} from './timeline';

const renderTransition = (scene: (typeof SCENES)[number]) => {
  const transition = 'transitionAfter' in scene ? scene.transitionAfter : null;
  if (!transition) {
    return null;
  }

  const timing = linearTiming({durationInFrames: transition.durationInFrames});
  const presentation = fade();

  return (
    <TransitionSeries.Transition
      key={`${scene.id}-transition`}
      presentation={presentation}
      timing={timing}
    />
  );
};

export const CCInsightsPromo: React.FC = () => {
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
        {/* 混音轨：人声 + BGM 已合成（mix-cc-insights-52s.m4a），整体音量在素材里定好 */}
        <Audio src={staticFile('mix-cc-insights-52s.m4a')} />
      </AbsoluteFill>
      <KaraokeCaptions srtSrc="voiceover-52s.srt" />
      <TransitionOverlay />
    </AbsoluteFill>
  );
};
