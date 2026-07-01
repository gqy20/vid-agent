import {AbsoluteFill} from 'remotion';
import {Ck} from './theme';
import {SceneRenderer} from './SceneRenderer';
import {DEFAULT_SEGMENT_ID, getScene, isSceneId, type SceneId} from './timeline';

export type GkSegmentProps = {
  sceneId?: SceneId;
};

/** 单场景预览 Composition（抽帧自检用：remotion still GkSegment --props） */
export const GkSegment: React.FC<GkSegmentProps> = ({
  sceneId = DEFAULT_SEGMENT_ID,
}) => {
  const safeSceneId = isSceneId(sceneId) ? sceneId : DEFAULT_SEGMENT_ID;
  getScene(safeSceneId);

  return (
    <AbsoluteFill style={{background: Ck.bg0}}>
      <SceneRenderer id={safeSceneId} />
    </AbsoluteFill>
  );
};
