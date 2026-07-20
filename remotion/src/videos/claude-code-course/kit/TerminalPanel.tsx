import {COLOR, FONT, TYPE} from '../designTokens';

export const TERMINAL_HEADER_HEIGHT = 42;

export const TerminalPanel: React.FC<{
  title?: string;
  children: React.ReactNode;
}> = ({title = 'claude-code-course', children}) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      borderRadius: 12,
      border: `1px solid ${COLOR.terminal.border}`,
      background: COLOR.terminal.bg,
      boxShadow: `0 18px 44px ${COLOR.effects.shadowTerminal}`,
      fontFamily: FONT.mono,
    }}
  >
    <div
      style={{
        position: 'relative',
        height: TERMINAL_HEADER_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        padding: '0 15px',
        background: COLOR.terminal.bgTop,
        borderBottom: `1px solid ${COLOR.terminal.border}`,
      }}
    >
      <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
        {[0.92, 0.66, 0.42].map((opacity) => (
          <span
            key={opacity}
            style={{
              display: 'block',
              width: 10,
              height: 10,
              borderRadius: 20,
              background: COLOR.text.inverseMuted,
              opacity,
            }}
          />
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          translate: '-50% 0',
          ...TYPE.codeSmall,
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
