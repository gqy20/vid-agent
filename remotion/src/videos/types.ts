import type {ComponentType} from 'react';

/**
 * 每条视频在 `src/videos/<slug>/index.ts` 导出一个 `registration`，
 * Root.tsx 用 require.context 自动聚合，**加视频零改 Root**，多视频可并行。
 */
export type CompositionDescriptor = {
  id: string;
  component: ComponentType<any>;
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
  defaultProps?: Record<string, unknown>;
  calculateMetadata?: (args: {
    props: Record<string, unknown>;
  }) => {durationInFrames?: number} & Record<string, unknown>;
};

export type VideoRegistration = {
  /** 来源目录名，用于排序与报错定位 */
  slug: string;
  compositions: CompositionDescriptor[];
};
