import {Composition} from 'remotion';
import {BrandIntro} from './videos/brand-intro/BrandIntro';
import {CCInsightsPromo} from './videos/cc-insights-promo/CCInsightsPromo';
import {CCInsightsSegment} from './videos/cc-insights-promo/CCInsightsSegment';
import {
  DEFAULT_SEGMENT_ID,
  FPS,
  HEIGHT,
  TOTAL_DURATION_IN_FRAMES,
  WIDTH,
  getScene,
  isSceneId,
} from './videos/cc-insights-promo/timeline';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="BrandIntro"
        component={BrandIntro}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          name: 'qingyu_ge',
          tagline: '感知 · 记忆 · 创造',
          sub: 'AI-native research tools',
        }}
      />
      <Composition
        id="CCInsightsPromo"
        component={CCInsightsPromo}
        durationInFrames={TOTAL_DURATION_IN_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="CCInsightsSegment"
        component={CCInsightsSegment}
        durationInFrames={getScene(DEFAULT_SEGMENT_ID).durationInFrames}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{
          sceneId: DEFAULT_SEGMENT_ID,
        }}
        calculateMetadata={({props}) => {
          const sceneId =
            typeof props.sceneId === 'string' && isSceneId(props.sceneId)
              ? props.sceneId
              : DEFAULT_SEGMENT_ID;
          const scene = getScene(sceneId);
          return {
            durationInFrames: scene.durationInFrames,
          };
        }}
      />
    </>
  );
};
