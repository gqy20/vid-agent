import {GkPromo} from './GkPromo';
import {GkSegment} from './GkSegment';
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
  slug: 'gk-promo',
  compositions: [
    {
      id: 'GkPromo',
      component: GkPromo,
      durationInFrames: TOTAL_DURATION_IN_FRAMES,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'GkSegment',
      component: GkSegment,
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
