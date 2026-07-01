import {C, SANS} from '../theme';
import {Reveal} from './Reveal';

/* 字幕条 */
export const Caption: React.FC<{delay: number; text: string}> = ({delay, text}) => (
  <Reveal delay={delay} style={{position: 'absolute', bottom: 96, width: '100%', textAlign: 'center'}}>
    <span
      style={{
        fontFamily: SANS,
        fontSize: 34,
        fontWeight: 500,
        color: C.white,
        background: 'rgba(13,17,23,0.72)',
        padding: '12px 30px',
        borderRadius: 34,
        border: `1px solid ${C.border}`,
        letterSpacing: 0.5,
      }}
    >
      {text}
    </span>
  </Reveal>
);
