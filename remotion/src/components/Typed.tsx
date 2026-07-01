import {useCurrentFrame, useVideoConfig} from 'remotion';
import {C, MONO} from '../theme';

/* 打字命令行。cps=字符/秒（与 fps 无关，自动适配）；光标每 8 帧（@30fps≈0.27s）闪一次。 */
export const Typed: React.FC<{text: string; start: number; cps?: number}> = ({
  text,
  start,
  cps = 26,
}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const shown = Math.max(0, Math.min(text.length, Math.floor(((f - start) * cps) / fps)));
  const done = shown >= text.length;
  const cursorOn = Math.floor(f / 8) % 2 === 0;
  return (
    <div style={{whiteSpace: 'pre', color: C.text, fontFamily: MONO}}>
      <span style={{color: C.green}}>$ </span>
      <span style={{color: C.white}}>{text.slice(0, shown)}</span>
      <span style={{opacity: !done || cursorOn ? 1 : 0, color: C.cyan, fontWeight: 700}}>▋</span>
    </div>
  );
};
