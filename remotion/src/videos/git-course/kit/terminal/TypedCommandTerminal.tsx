import {interpolate, useCurrentFrame} from 'remotion';
import {COLOR} from '../../palette';
import {seconds} from '../../timeline';
import {TYPE} from '../../typography';
import {TerminalPanel} from './TerminalPanel';

export const TypedCommandTerminal: React.FC<{
  command: string;
  output?: readonly string[];
  branch?: 'main' | 'feature';
  title?: string;
  commandEndFrame?: number;
  outputStartFrame?: number;
}> = ({
  command,
  output = [],
  branch = 'main',
  title = 'git-course-demo',
  commandEndFrame = seconds(1.1),
  outputStartFrame = seconds(1.45),
}) => {
  const frame = useCurrentFrame();
  const chars = Math.floor(interpolate(frame, [0, commandEndFrame], [0, command.length], {extrapolateRight: 'clamp'}));
  const showOutput = frame > outputStartFrame;

  return (
    <TerminalPanel title={title}>
      <div style={{padding: '30px 34px', ...TYPE.code, color: COLOR.text.inverse}}>
        <div style={{whiteSpace: 'pre'}}>
          <span style={{color: branch === 'main' ? COLOR.git.main : COLOR.git.feature, fontWeight: 780}}>{branch}</span>
          <span style={{color: COLOR.terminal.promptMuted}}> $ </span>
          <span>{command.slice(0, chars)}</span>
          <span
            style={{
              display: 'inline-block',
              width: 11,
              height: TYPE.code.fontSize,
              marginLeft: 5,
              transform: 'translateY(5px)',
              background: COLOR.git.head,
              opacity: Math.floor(frame / 12) % 2 === 0 ? 1 : 0.15,
            }}
          />
        </div>
        {showOutput
          ? output.map((line) => (
              <div key={line} style={{...TYPE.codeOutput, color: COLOR.terminal.output, paddingLeft: 26, marginTop: 12}}>
                {line}
              </div>
            ))
          : null}
      </div>
    </TerminalPanel>
  );
};
