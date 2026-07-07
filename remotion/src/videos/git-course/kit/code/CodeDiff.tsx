import {COLOR, FONT} from '../../palette';
import {TYPE} from '../../typography';

export type DiffLine = {
  type: 'add' | 'remove' | 'context';
  text: string;
};

const diffColor = (type: DiffLine['type']) => {
  if (type === 'add') return {fg: COLOR.git.workingTree, bg: 'rgba(111,143,100,0.14)', mark: '+'};
  if (type === 'remove') return {fg: COLOR.git.conflict, bg: 'rgba(192,87,74,0.13)', mark: '-'};
  return {fg: COLOR.text.secondary, bg: 'transparent', mark: ' '};
};

export const CodeDiff: React.FC<{
  title?: string;
  lines: readonly DiffLine[];
}> = ({title, lines}) => {
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
        {lines.map((line, idx) => {
          const style = diffColor(line.type);
          return (
            <div
              key={`${idx}-${line.text}`}
              style={{
                padding: '4px 24px',
                background: style.bg,
                color: style.fg,
                whiteSpace: 'pre',
                borderLeft: line.type === 'context' ? '3px solid transparent' : `3px solid ${style.fg}`,
              }}
            >
              <span style={{display: 'inline-block', width: 38, color: style.fg}}>{style.mark}</span>
              {line.text}
            </div>
          );
        })}
      </div>
    </div>
  );
};
