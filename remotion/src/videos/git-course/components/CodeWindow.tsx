import {COLOR, FONT} from '../palette';
import {TYPE} from '../typography';

export const CodeWindow: React.FC<{
  title: string;
  lines: readonly string[];
  highlight?: number;
}> = ({title, lines, highlight}) => {
  return (
    <div
      style={{
        width: '100%',
        borderRadius: 14,
        background: COLOR.canvas.raised,
        border: `1px solid ${COLOR.stroke.default}`,
        overflow: 'hidden',
        fontFamily: FONT.mono,
      }}
    >
      <div
        style={{
          height: 44,
          display: 'flex',
          alignItems: 'center',
          padding: '0 18px',
          borderBottom: `1px solid ${COLOR.stroke.default}`,
          fontFamily: FONT.sans,
          color: COLOR.text.secondary,
          ...TYPE.codeSmall,
        }}
      >
        {title}
      </div>
      <div style={{padding: '18px 0', ...TYPE.code}}>
        {lines.map((line, idx) => (
          <div
            key={`${idx}-${line}`}
            style={{
              padding: '3px 24px',
              background: idx === highlight ? COLOR.effects.headHighlight : 'transparent',
              color: idx === highlight ? COLOR.text.primary : COLOR.text.secondary,
              whiteSpace: 'pre',
            }}
          >
            <span style={{display: 'inline-block', width: 38, color: COLOR.text.tertiary}}>{idx + 1}</span>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};
