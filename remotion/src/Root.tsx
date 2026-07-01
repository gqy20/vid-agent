import {Composition} from 'remotion';
import type {CompositionDescriptor, VideoRegistration} from './videos/types';

/* webpack 5 原生提供 require.context（工程未装 @types/webpack-env，局部声明） */
declare const require: {
  context: (
    directory: string,
    useSubdirectories?: boolean,
    regExp?: RegExp,
  ) => {
    keys: () => string[];
    (key: string): unknown;
  };
};

// 自动聚合：扫描每个 src/videos/<slug>/index.ts，收集其导出的 registration。
// 加新视频只需新建 src/videos/<slug>/index.ts，无需改本文件 → 多视频可并行。
const ctx = require.context('./videos', true, /\/index\.ts$/);
const REGISTRATIONS: VideoRegistration[] = ctx
  .keys()
  .sort()
  .map((k) => (ctx(k) as {registration: VideoRegistration}).registration);

const COMPOSITIONS: CompositionDescriptor[] = REGISTRATIONS.flatMap(
  (r) => r.compositions,
);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {COMPOSITIONS.map((c) => (
        <Composition
          key={c.id}
          id={c.id}
          component={c.component}
          durationInFrames={c.durationInFrames}
          fps={c.fps}
          width={c.width}
          height={c.height}
          {...(c.defaultProps !== undefined ? {defaultProps: c.defaultProps} : {})}
          {...(c.calculateMetadata ? {calculateMetadata: c.calculateMetadata} : {})}
        />
      ))}
    </>
  );
};
