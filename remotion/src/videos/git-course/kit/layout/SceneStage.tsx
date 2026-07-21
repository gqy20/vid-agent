import {AbsoluteFill} from 'remotion';
import {SCENE_STAGE_RECTS, type SceneStagePreset} from './CourseRects';
import {rectToStyle, type Rect} from './geometry';

export const SceneStage: React.FC<{
  readonly preset: SceneStagePreset;
  readonly children: React.ReactNode;
  readonly rect?: Rect;
  readonly auditId?: string;
  readonly style?: React.CSSProperties;
}> = ({preset, children, rect = SCENE_STAGE_RECTS[preset], auditId, style}) => (
  <AbsoluteFill data-layout-preset={preset} data-audit-id={auditId}>
    <div style={{...rectToStyle(rect), ...style}}>{children}</div>
  </AbsoluteFill>
);
