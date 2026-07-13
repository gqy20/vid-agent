import {GitGraph} from './GitGraph';
import type {GitGraphState} from './types';

export const CenterGraph: React.FC<{
  state: GitGraphState;
  note?: string;
  width?: number;
  top?: number;
  branchMotion?: React.ComponentProps<typeof GitGraph>['branchMotion'];
  branchReveal?: React.ComponentProps<typeof GitGraph>['branchReveal'];
  commitRevealProgress?: React.ComponentProps<typeof GitGraph>['commitRevealProgress'];
  headMotion?: React.ComponentProps<typeof GitGraph>['headMotion'];
  headMarkerOffsetX?: React.ComponentProps<typeof GitGraph>['headMarkerOffsetX'];
  branchOffset?: React.ComponentProps<typeof GitGraph>['branchOffset'];
  showHeadMarker?: React.ComponentProps<typeof GitGraph>['showHeadMarker'];
}> = ({state, note, width = 1120, top = 326, branchMotion, branchReveal, commitRevealProgress, headMotion, headMarkerOffsetX, branchOffset, showHeadMarker}) => (
  <div style={{position: 'absolute', left: '50%', top, width, transform: 'translateX(-50%)'}}>
    <GitGraph
      state={state}
      width={width}
      height={Math.round(width * 0.39)}
      note={note}
      branchMotion={branchMotion}
      branchReveal={branchReveal}
      commitRevealProgress={commitRevealProgress}
      headMotion={headMotion}
      headMarkerOffsetX={headMarkerOffsetX}
      branchOffset={branchOffset}
      showHeadMarker={showHeadMarker}
    />
  </div>
);
