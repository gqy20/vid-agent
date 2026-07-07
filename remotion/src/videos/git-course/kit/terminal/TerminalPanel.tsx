import {COLOR, FONT} from '../../palette';
import {TYPE} from '../../typography';

export const TerminalPanel: React.FC<{
  title?: string;
  children: React.ReactNode;
}> = ({title = 'git-course-demo', children}) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        background: COLOR.terminal.bg,
        boxShadow: `0 12px 28px ${COLOR.effects.shadowSoft}`,
        border: `1px solid ${COLOR.terminal.border}`,
        fontFamily: FONT.mono,
      }}
    >
      <div
        style={{
          height: 48,
          background: COLOR.terminal.bgTop,
          borderBottom: `1px solid ${COLOR.terminal.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 18px',
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          {[COLOR.terminal.chromeRed, COLOR.terminal.chromeYellow, COLOR.terminal.chromeGreen].map((color) => (
            <span key={color} style={{width: 13, height: 13, borderRadius: 20, background: color, display: 'block'}} />
          ))}
        </div>
        <div style={{fontFamily: FONT.sans, ...TYPE.uiSmall, color: COLOR.terminal.title}}>{title}</div>
      </div>
      {children}
    </div>
  );
};
