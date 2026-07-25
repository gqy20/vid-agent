import {COLOR, FONT} from '../../palette';
import {TYPE} from '../../typography';

export type DiffLine = {
  type: 'add' | 'remove' | 'context';
  text: string;
};

export type DiffFocus = 'file-header' | 'hunk-header' | 'remove' | 'add';

const diffColor = (type: DiffLine['type']) => {
  if (type === 'add') return {fg: COLOR.git.workingTree, bg: 'rgba(111,143,100,0.14)', mark: '+'};
  if (type === 'remove') return {fg: COLOR.git.conflict, bg: 'rgba(192,87,74,0.13)', mark: '-'};
  return {fg: COLOR.text.secondary, bg: 'transparent', mark: ' '};
};

export const CodeDiff: React.FC<{
  title?: string;
  fileHeader?: string;
  hunkHeader?: string;
  lines: readonly DiffLine[];
  focus?: DiffFocus;
  prominent?: boolean;
}> = ({title, fileHeader, hunkHeader, lines, focus, prominent = false}) => {
  const dimmedOpacity = prominent ? 0.38 : 0.24;
  const focusOpacity = (target: DiffFocus) => focus === undefined || focus === target ? 1 : dimmedOpacity;
  const metaTypography = prominent ? {fontSize: 26, lineHeight: 1.36} : TYPE.codeSmall;
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
      {fileHeader ? (
        <div
          style={{
            minHeight: 44,
            display: 'flex',
            alignItems: 'center',
            padding: '0 18px',
            borderBottom: `1px solid ${COLOR.stroke.soft}`,
            color: COLOR.text.primary,
            ...metaTypography,
            opacity: focusOpacity('file-header'),
          }}
        >
          {fileHeader}
        </div>
      ) : title ? (
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
      {hunkHeader ? (
        <div
          style={{
            minHeight: 42,
            display: 'flex',
            alignItems: 'center',
            padding: '0 18px',
            borderBottom: `1px solid ${COLOR.stroke.soft}`,
            color: COLOR.text.secondary,
            ...metaTypography,
            opacity: focusOpacity('hunk-header'),
          }}
        >
          {hunkHeader}
        </div>
      ) : null}
      <div style={{padding: prominent ? '20px 0' : '18px 0', ...TYPE.code, ...(prominent ? {fontSize: 32, lineHeight: 1.42} : {})}}>
        {lines.map((line, idx) => {
          const style = diffColor(line.type);
          return (
            <div
              key={`${idx}-${line.text}`}
              style={{
                padding: prominent ? '6px 26px' : '4px 24px',
                background: style.bg,
                color: style.fg,
                whiteSpace: 'pre',
                borderLeft: line.type === 'context' ? '3px solid transparent' : `3px solid ${style.fg}`,
                opacity: line.type === 'context' ? (focus === undefined ? 1 : dimmedOpacity) : focusOpacity(line.type),
              }}
            >
              <span style={{display: 'inline-block', width: prominent ? 44 : 38, color: style.fg}}>{style.mark}</span>
              {line.text}
            </div>
          );
        })}
      </div>
    </div>
  );
};
