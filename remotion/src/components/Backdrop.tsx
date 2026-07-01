import {AbsoluteFill} from 'remotion';
import {SANS} from '../theme';

/* 全屏深空背景（含轻微径向呼吸光） */
export const Backdrop: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill
    style={{
      background:
        'radial-gradient(circle at 50% 32%, #171b3d 0%, #0b0d22 52%, #07081a 100%)',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: SANS,
    }}
  >
    {children}
  </AbsoluteFill>
);
