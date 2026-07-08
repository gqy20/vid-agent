import {OffthreadVideo, staticFile} from 'remotion';
import {LAB_COLOR} from '../palette';
import {LAB_TYPE} from '../typography';

const TERMINAL_WIDTH = 1240;
const TERMINAL_BODY_HEIGHT = 640;
const TERMINAL_HEADER_HEIGHT = 42;

const TERMINAL_LINES = [
  '$ git init -q',
  "$ printf 'hello git\\n' > README.md",
  '$ git add README.md',
  '$ git commit -m "init"',
  '[main (root-commit) 8e21c4a] init',
  '$ git cat-file -t HEAD',
  'commit',
];

export const TerminalRecording: React.FC<{
  src?: string;
  title?: string;
  status?: string;
  opacity?: number;
  scale?: number;
  x?: number;
  y?: number;
}> = ({src, title = 'git object lab', status = 'real shell', opacity = 1, scale = 1, x = 0, y = 0}) => {
  return (
    <div
      style={{
        width: TERMINAL_WIDTH,
        height: TERMINAL_HEADER_HEIGHT + TERMINAL_BODY_HEIGHT,
        borderRadius: 18,
        overflow: 'hidden',
        border: `1px solid ${LAB_COLOR.terminalBorder}`,
        background: LAB_COLOR.terminal,
        boxShadow: `0 26px 70px rgba(0, 0, 0, 0.28), 0 0 0 1px ${LAB_COLOR.terminalGlow}`,
        opacity,
        transform: `translate(${x}px, ${y}px) scale(${scale})`,
        transformOrigin: 'center',
      }}
    >
      <div
        style={{
          height: TERMINAL_HEADER_HEIGHT,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 18px',
          borderBottom: `1px solid ${LAB_COLOR.terminalHeaderLine}`,
          background: LAB_COLOR.terminalHeader,
          color: LAB_COLOR.terminalHeaderText,
          ...LAB_TYPE.label,
          fontSize: 16,
          fontWeight: 680,
          textTransform: 'uppercase',
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <div
            style={{
              width: 7,
              height: 18,
              borderRadius: 8,
              background: LAB_COLOR.blob,
              boxShadow: `0 0 18px ${LAB_COLOR.terminalGlow}`,
            }}
          />
          <span>{title}</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 8, color: LAB_COLOR.muted}}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: LAB_COLOR.commit,
            }}
          />
          <span>{status}</span>
        </div>
      </div>
      {src ? (
        <OffthreadVideo
          src={staticFile(src)}
          style={{width: TERMINAL_WIDTH, height: TERMINAL_BODY_HEIGHT, objectFit: 'cover', display: 'block'}}
        />
      ) : (
        <div style={{height: TERMINAL_BODY_HEIGHT, padding: 34, color: LAB_COLOR.text, ...LAB_TYPE.mono}}>
          <div style={{color: LAB_COLOR.muted, marginBottom: 22}}>real terminal recording placeholder</div>
          {TERMINAL_LINES.map((line) => (
            <div key={line} style={{whiteSpace: 'pre', color: line.startsWith('$') ? LAB_COLOR.text : LAB_COLOR.muted}}>
              {line}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
