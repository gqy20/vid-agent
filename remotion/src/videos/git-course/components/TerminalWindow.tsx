import {COLOR, FONT} from '../palette';
import {TYPE} from '../typography';

type CommandBlock = {
  command: string;
  output: readonly string[];
};

export const TerminalWindow: React.FC<{
  blocks: readonly CommandBlock[];
  active: number;
}> = ({blocks, active}) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        background: COLOR.terminal.bg,
        boxShadow: `0 20px 55px ${COLOR.effects.shadowTerminal}`,
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
          gap: 10,
          padding: '0 18px',
        }}
      >
        {[COLOR.terminal.chromeRed, COLOR.terminal.chromeYellow, COLOR.terminal.chromeGreen].map((color) => (
          <span
            key={color}
            style={{
              width: 13,
              height: 13,
              borderRadius: 20,
              background: color,
              display: 'block',
            }}
          />
        ))}
      </div>
      <div style={{padding: '26px 28px', color: COLOR.text.inverse, ...TYPE.code}}>
        {blocks.slice(0, active + 1).map((block, idx) => {
          const opacity = idx === active ? 1 : 0.62;
          return (
            <div key={block.command} style={{marginBottom: 22, opacity}}>
              <div>
                <span style={{color: COLOR.terminal.chromeGreen}}>$ </span>
                <span>{block.command}</span>
              </div>
              {block.output.map((line) => (
                <div key={line} style={{color: COLOR.terminal.output, paddingLeft: 20}}>
                  {line}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
