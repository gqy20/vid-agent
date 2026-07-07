import {COLOR} from '../../palette';
import {TYPE} from '../../typography';
import {CommandOutput} from './CommandOutput';

export const CommandStep: React.FC<{
  branch: 'main' | 'feature' | string;
  command: string;
  output?: readonly string[];
  active?: boolean;
}> = ({branch, command, output = [], active = false}) => {
  const branchColor = branch === 'feature' ? COLOR.git.feature : COLOR.git.main;

  return (
    <div style={{marginBottom: 20, opacity: active ? 1 : 0.58}}>
      <div style={{whiteSpace: 'pre'}}>
        <span style={{color: branchColor, fontWeight: TYPE.graphPointer.fontWeight}}>{branch}</span>
        <span style={{color: COLOR.terminal.promptMuted}}> $ </span>
        <span>{command}</span>
      </div>
      <CommandOutput lines={output} />
    </div>
  );
};
