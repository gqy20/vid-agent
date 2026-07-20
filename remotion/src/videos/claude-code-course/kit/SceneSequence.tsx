import {Sequence} from 'remotion';

export const SceneSequence: React.FC<{
  from: number;
  durationInFrames: number;
  children: React.ReactNode;
}> = ({from, durationInFrames, children}) => (
  <Sequence from={from} durationInFrames={durationInFrames} premountFor={30}>
    {children}
  </Sequence>
);
