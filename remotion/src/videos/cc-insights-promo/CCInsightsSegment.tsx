import {AbsoluteFill} from 'remotion';
import {C} from '../../theme';
import {SceneRenderer} from './SceneRenderer';
import {DEFAULT_SEGMENT_ID, getScene, isSceneId, type SceneId} from './timeline';

export type CCInsightsSegmentProps = {
  sceneId?: SceneId;
};

export const CCInsightsSegment: React.FC<CCInsightsSegmentProps> = ({
  sceneId = DEFAULT_SEGMENT_ID,
}) => {
  const safeSceneId = isSceneId(sceneId) ? sceneId : DEFAULT_SEGMENT_ID;
  getScene(safeSceneId);

  return (
    <AbsoluteFill style={{background: C.bg0}}>
      <SceneRenderer id={safeSceneId} />
    </AbsoluteFill>
  );
};
