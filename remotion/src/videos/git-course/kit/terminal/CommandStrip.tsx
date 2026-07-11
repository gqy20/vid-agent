import {COLOR, FONT, WEIGHT} from '../../palette';
import {TYPE} from '../../typography';

export const CommandStrip: React.FC<{
  command: string;
  output?: string;
  branch?: 'main' | 'feature';
  opacity?: number;
  left?: number;
  top?: number;
  width?: number;
  minHeight?: number;
}> = ({command, output, branch = 'main', opacity = 1, left = 156, top = 116, width = 690, minHeight = 112}) => (
  <div
    style={{
      position: 'absolute',
      left,
      top,
      width,
      minHeight,
      borderRadius: 8,
      border: `1px solid ${COLOR.terminal.border}`,
      background: COLOR.terminal.bg,
      boxShadow: `0 16px 42px ${COLOR.effects.shadowTerminal}`,
      opacity,
      padding: '18px 22px',
      boxSizing: 'border-box',
      fontFamily: FONT.mono,
      zIndex: 8,
    }}
  >
    <div style={{...TYPE.codeSmall, color: COLOR.text.inverse, whiteSpace: 'pre'}}>
      <span style={{color: branch === 'main' ? COLOR.git.main : COLOR.git.feature, fontWeight: WEIGHT.bold}}>{branch}</span>
      <span style={{color: COLOR.terminal.prompt, fontWeight: WEIGHT.bold}}> &gt; </span>
      <span>{command}</span>
    </div>
    {output ? (
      <div style={{...TYPE.codeOutput, fontSize: 19, color: COLOR.terminal.comment, marginTop: 8, paddingLeft: 22}}>
        {output}
      </div>
    ) : null}
  </div>
);
