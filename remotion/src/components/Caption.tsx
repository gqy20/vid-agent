import {C, SANS, FZ} from '../theme';
import {Reveal} from './Reveal';

/* 字幕条 */
export const Caption: React.FC<{delay: number; text: string}> = ({delay, text}) => (
  <Reveal delay={delay} style={{position: 'absolute', bottom: 96, width: '100%', textAlign: 'center'}}>
    <span
      style={{
        fontFamily: SANS,
        fontSize: FZ.caption,
        fontWeight: 450,
        color: 'rgba(240,246,252,0.82)',
        background: 'rgba(13,17,23,0.42)',
        padding: '9px 24px',
        borderRadius: 10,
        border: '1px solid rgba(139,148,158,0.16)',
        letterSpacing: 0,
      }}
    >
      {text}
    </span>
  </Reveal>
);
