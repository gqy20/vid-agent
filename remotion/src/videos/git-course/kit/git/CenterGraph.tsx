import {GitGraph} from './GitGraph';
import type {GitGraphState} from './types';

export const CenterGraph: React.FC<{
  state: GitGraphState;
  note?: string;
  width?: number;
  top?: number;
  branchMotion?: React.ComponentProps<typeof GitGraph>['branchMotion'];
  headMotion?: React.ComponentProps<typeof GitGraph>['headMotion'];
  headMarkerOffsetX?: React.ComponentProps<typeof GitGraph>['headMarkerOffsetX'];
  showHeadMarker?: React.ComponentProps<typeof GitGraph>['showHeadMarker'];
}> = ({state, note, width = 1120, top = 326, branchMotion, headMotion, headMarkerOffsetX, showHeadMarker}) => (
  <div style={{position: 'absolute', left: '50%', top, width, transform: 'translateX(-50%)'}}>
    <GitGraph
      state={state}
      width={width}
      height={Math.round(width * 0.39)}
      note={note}
      branchMotion={branchMotion}
      headMotion={headMotion}
      headMarkerOffsetX={headMarkerOffsetX}
      showHeadMarker={showHeadMarker}
    />
  </div>
);
