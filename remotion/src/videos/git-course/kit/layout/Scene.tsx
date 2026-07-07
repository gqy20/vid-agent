import {AbsoluteFill} from 'remotion';

export const Scene: React.FC<{
  children: React.ReactNode;
  padding?: string | number;
}> = ({children, padding = '150px 150px 120px'}) => {
  return (
    <AbsoluteFill
      style={{
        padding,
        boxSizing: 'border-box',
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
