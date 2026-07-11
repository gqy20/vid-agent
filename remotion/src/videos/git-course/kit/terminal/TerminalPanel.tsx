import {COLOR, FONT} from '../../palette';
import {TYPE} from '../../typography';

export const TERMINAL_HEADER_HEIGHT = 42;

export const TerminalPanel: React.FC<{
  title?: string;
  children: React.ReactNode;
}> = ({title = 'git-course-demo', children}) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        background: COLOR.terminal.bg,
        boxShadow: `0 14px 32px ${COLOR.effects.shadowTerminal}`,
        border: `1px solid ${COLOR.terminal.border}`,
        fontFamily: FONT.mono,
      }}
    >
      <div
        style={{
          height: TERMINAL_HEADER_HEIGHT,
          background: COLOR.terminal.bgTop,
          borderBottom: `1px solid ${COLOR.terminal.border}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 15px',
          position: 'relative',
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          {[COLOR.terminal.chromeRed, COLOR.terminal.chromeYellow, COLOR.terminal.chromeGreen].map((color) => (
            <span key={color} style={{width: 11, height: 11, borderRadius: 20, background: color, display: 'block', opacity: 0.86}} />
          ))}
        </div>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: FONT.mono,
            ...TYPE.uiSmall,
            fontSize: 15,
            color: COLOR.terminal.title,
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </div>
      </div>
      {children}
    </div>
  );
};
