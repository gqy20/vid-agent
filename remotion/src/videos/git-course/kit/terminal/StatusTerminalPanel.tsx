import {COLOR} from '../../palette';
import {TYPE} from '../../typography';
import {TerminalPanel} from './TerminalPanel';

export const StatusTerminalPanel: React.FC<{
  status: string;
  file: string;
  title?: string;
  highlight?: 'index' | 'workingTree' | 'main' | 'feature';
}> = ({status, file, title = 'git status -s', highlight = 'index'}) => {
  const highlightColor =
    highlight === 'workingTree'
      ? COLOR.git.workingTree
      : highlight === 'main'
        ? COLOR.git.main
        : highlight === 'feature'
          ? COLOR.git.feature
          : COLOR.git.head;

  return (
    <TerminalPanel title={title}>
      <div style={{padding: '22px 28px', ...TYPE.code, color: COLOR.terminal.output}}>
        <span style={{color: highlightColor}}>{status}</span> {file}
      </div>
    </TerminalPanel>
  );
};
