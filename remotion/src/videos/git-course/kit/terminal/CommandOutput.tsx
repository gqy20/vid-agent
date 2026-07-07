import {COLOR} from '../../palette';
import {TYPE} from '../../typography';

export const CommandOutput: React.FC<{
  lines: readonly string[];
}> = ({lines}) => {
  return (
    <>
      {lines.map((line) => (
        <div
          key={line}
          style={{
            ...TYPE.codeOutput,
            color: line.startsWith('#') ? COLOR.terminal.comment : COLOR.terminal.output,
            paddingLeft: 24,
          }}
        >
          {line}
        </div>
      ))}
    </>
  );
};
