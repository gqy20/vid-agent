import {CCInsightsPromo} from './CCInsightsPromo';
import {CCInsightsSegment} from './CCInsightsSegment';
import {
  DEFAULT_SEGMENT_ID,
  FPS,
  HEIGHT,
  TOTAL_DURATION_IN_FRAMES,
  WIDTH,
  getScene,
  isSceneId,
} from './timeline';
import type {VideoRegistration} from '../types';

export const registration: VideoRegistration = {
  slug: 'cc-insights-promo',
  compositions: [
    {
      id: 'CCInsightsPromo',
      component: CCInsightsPromo,
      durationInFrames: TOTAL_DURATION_IN_FRAMES,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'CCInsightsSegment',
      component: CCInsightsSegment,
      durationInFrames: getScene(DEFAULT_SEGMENT_ID).durationInFrames,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
      defaultProps: {sceneId: DEFAULT_SEGMENT_ID},
      calculateMetadata: ({props}) => {
        const sceneId =
          typeof props.sceneId === 'string' && isSceneId(props.sceneId)
            ? props.sceneId
            : DEFAULT_SEGMENT_ID;
        const scene = getScene(sceneId);
        return {durationInFrames: scene.durationInFrames};
      },
    },
  ],
};
