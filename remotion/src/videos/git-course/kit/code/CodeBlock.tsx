import {COLOR, FONT} from '../../palette';
import {TYPE} from '../../typography';

export const CodeBlock: React.FC<{
  title?: string;
  lines: readonly string[];
  highlight?: readonly number[];
}> = ({title, lines, highlight = []}) => {
  return (
    <div
      style={{
        width: '100%',
        borderRadius: 8,
        background: 'rgba(255,255,255,0.68)',
        border: `1px solid ${COLOR.stroke.soft}`,
        overflow: 'hidden',
        fontFamily: FONT.mono,
        boxShadow: `0 12px 32px ${COLOR.effects.shadowSoft}`,
      }}
    >
      {title ? (
        <div
          style={{
            height: 44,
            display: 'flex',
            alignItems: 'center',
            padding: '0 18px',
            borderBottom: `1px solid ${COLOR.stroke.soft}`,
            fontFamily: FONT.sans,
            color: COLOR.text.secondary,
            ...TYPE.codeSmall,
          }}
        >
          {title}
        </div>
      ) : null}
      <div style={{padding: '18px 0', ...TYPE.code}}>
        {lines.map((line, idx) => (
          <div
            key={`${idx}-${line}`}
            style={{
              padding: '4px 24px',
              background: highlight.includes(idx) ? COLOR.effects.headHighlight : 'transparent',
              color: highlight.includes(idx) ? COLOR.text.primary : COLOR.text.secondary,
              whiteSpace: 'pre',
              borderLeft: highlight.includes(idx) ? `3px solid ${COLOR.git.head}` : '3px solid transparent',
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
