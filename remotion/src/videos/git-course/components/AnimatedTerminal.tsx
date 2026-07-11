import {interpolate, useCurrentFrame} from 'remotion';
import {COLOR, WEIGHT} from '../palette';
import type {TerminalStep} from '../data/terminalScripts';
import {TYPE} from '../typography';
import {TerminalPanel} from '../kit/terminal/TerminalPanel';

type RenderedStep = {
  step: TerminalStep;
  commandText: string;
  outputCount: number;
  isActive: boolean;
  isTyping: boolean;
};

const OUTPUT_DELAY = 10;
const LINE_DELAY = 9;

const branchColor = (branch: TerminalStep['promptBranch']) =>
  branch === 'feature' ? COLOR.git.feature : COLOR.git.main;

const getRenderedStep = (step: TerminalStep, frame: number): RenderedStep | null => {
  if (frame < step.at) return null;
  const local = frame - step.at;
  const typeFrames = step.typeFrames ?? 36;
  const typedChars = Math.min(
    step.command.length,
    Math.floor(interpolate(local, [0, typeFrames], [0, step.command.length], {extrapolateRight: 'clamp'})),
  );
  const outputStart = typeFrames + OUTPUT_DELAY;
  const outputCount =
    local < outputStart
      ? 0
      : Math.min(step.output.length, Math.floor((local - outputStart) / LINE_DELAY) + 1);

  return {
    step,
    commandText: step.command.slice(0, typedChars),
    outputCount,
    isActive: local < outputStart + step.output.length * LINE_DELAY + 28,
    isTyping: typedChars < step.command.length,
  };
};

const Cursor: React.FC<{visible: boolean}> = ({visible}) => {
  const frame = useCurrentFrame();
  const opacity = visible ? (Math.floor(frame / 12) % 2 === 0 ? 1 : 0.12) : 0;
  return (
    <span
      style={{
        display: 'inline-block',
        width: 11,
        height: TYPE.code.fontSize,
        marginLeft: 4,
        transform: 'translateY(5px)',
        background: COLOR.git.head,
        opacity,
      }}
    />
  );
};

export const AnimatedTerminal: React.FC<{
  steps: readonly TerminalStep[];
  maxVisibleSteps?: number;
  inactiveOpacity?: number;
  frameOffset?: number;
}> = ({steps, maxVisibleSteps, inactiveOpacity = 0.54, frameOffset = 0}) => {
  const frame = useCurrentFrame() + frameOffset;
  const allRendered = steps
    .map((step) => getRenderedStep(step, frame))
    .filter((step): step is RenderedStep => step !== null);
  const rendered = maxVisibleSteps ? allRendered.slice(-maxVisibleSteps) : allRendered;

  return (
    <TerminalPanel>
      <div
        style={{
          padding: '24px 28px',
          color: COLOR.text.inverse,
          ...TYPE.code,
          height: 'calc(100% - 48px)',
          overflow: 'hidden',
        }}
      >
        {rendered.map((item, idx) => {
          const isLast = idx === rendered.length - 1;
          const opacity = item.isActive || isLast ? 1 : inactiveOpacity;
          return (
            <div key={`${item.step.at}-${item.step.command}`} style={{marginBottom: 20, opacity}}>
              <div style={{whiteSpace: 'pre'}}>
                <span style={{color: branchColor(item.step.promptBranch), fontWeight: TYPE.graphPointer.fontWeight}}>
                  {item.step.promptBranch}
                </span>
                <span style={{color: COLOR.terminal.prompt, fontWeight: WEIGHT.bold}}> &gt; </span>
                <span>{item.commandText}</span>
                <Cursor visible={isLast && item.isTyping} />
              </div>
              {item.step.output.slice(0, item.outputCount).map((line, lineIdx) => (
                <div
                  key={line}
                  style={{
                    ...TYPE.codeOutput,
                    color: line.startsWith('#') ? COLOR.terminal.comment : COLOR.terminal.output,
                    paddingLeft: 24,
                    opacity: interpolate(frame - item.step.at, [0, 8 + lineIdx * LINE_DELAY], [0.35, 1], {
                      extrapolateRight: 'clamp',
                    }),
                  }}
                >
                  {line}
                </div>
              ))}
              {isLast && !item.isTyping && item.outputCount === item.step.output.length ? (
                <div style={{height: 1}}>
                  <Cursor visible />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </TerminalPanel>
  );
};
