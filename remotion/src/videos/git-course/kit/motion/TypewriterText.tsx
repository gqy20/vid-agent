import {COLOR} from '../../palette';
import {clamp01} from './timing';

export const TypewriterText: React.FC<{
  text: string;
  progress: number;
  accentUntil?: number;
  accent?: string;
  cursor?: boolean;
}> = ({text, progress, accentUntil = 0, accent = COLOR.git.feature, cursor = true}) => {
  const typed = text.slice(0, Math.max(0, Math.floor(clamp01(progress) * text.length)));
  return (
    <>
      <span style={{color: accent}}>{typed.slice(0, accentUntil)}</span>
      <span>{typed.slice(accentUntil)}</span>
      {cursor ? <span style={{opacity: progress < 1 ? 1 : 0.16, marginLeft: 4}}>_</span> : null}
    </>
  );
};
