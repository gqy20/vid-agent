import {AbsoluteFill} from 'remotion';
import {C, SANS} from '../theme';

/* 暖暗工作台背景，避免泛 AI 霓虹感。 */
export const Backdrop: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill
    style={{
      background:
        `radial-gradient(circle at 70% 18%, rgba(224,133,96,0.18) 0%, rgba(224,133,96,0.06) 30%, transparent 58%),
        linear-gradient(135deg, ${C.bg1} 0%, ${C.bg0} 48%, #11100f 100%)`,
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: SANS,
    }}
  >
    {children}
  </AbsoluteFill>
);
