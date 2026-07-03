import {interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, CLAMP, EASE_OUT, MONO, SANS} from '../../../theme';
import {Backdrop} from '../../../components/Backdrop';

const LOG_LINES = [
  '{"tool":"Bash","duration_ms":42180,"error":true,"cmd":"go test ./..."}',
  '{"model":"claude-sonnet","input_tokens":184923,"project":"article-mcp"}',
  '{"session":"s_91f2","turns":147,"status":"timeout","retry":3}',
  '{"tool":"WebFetch","duration_ms":28041,"error":"ETIMEDOUT"}',
  '{"project":"article-mcp","cache_read":0,"cache_write":612883}',
  '{"cmd":"pytest","exit_code":1,"stderr":"fixture not found"}',
  '{"session":"s_4b7a","cost_usd":12.84,"latency_p95":19.2}',
  '{"tool":"Read","path":"node_modules/**","tokens":68421}',
  '{"cmd":"npm test","exit_code":1,"repeat_failures":18}',
  '{"project":"cc-insights","tokens":832901,"status":"ok"}',
  '{"tool":"Bash","duration_ms":31202,"error":true,"reason":"timeout"}',
  '{"session":"s_a8d0","turns":96,"model":"opus","tokens":702331}',
  '{"event":"assistant_message","tokens":39118,"cached":false}',
  '{"cmd":"pnpm build","exit_code":2,"repeat_failures":11}',
  '{"tool":"Grep","matches":1832,"path":"~/.claude/*.jsonl"}',
  '{"project":"article-mcp","share_of_tokens":0.61,"rank":1}',
  '{"tool":"Edit","files":42,"status":"partial","retry":2}',
  '{"cmd":"go test","failure_rate":0.47,"family":"test"}',
  '{"session":"s_e2c1","duration_min":42,"last_error":"Bash timeout"}',
  '{"event":"user_interrupt","after_tokens":119204}',
];

const PIPELINE = [
  {id: 'scan', label: 'scan jsonl', sub: '67,823 rows'},
  {id: 'group', label: 'group traces', sub: 'project / tool / session'},
  {id: 'detect', label: 'detect cluster', sub: 'failure + cost hotspot'},
  {id: 'emit', label: 'emit finding', sub: 'evidence + next cmd'},
];

const STATUS_LINES = [
  '> open ~/.claude/*.jsonl',
  '> normalize tool calls',
  '> build session graph',
  '> rank repeated failures',
  '> finding generated',
];

const LogRow: React.FC<{line: string; index: number; collapse: number; drift: number}> = ({
  line,
  index,
  collapse,
  drift,
}) => {
  const x = -820 + random(`x-${index}`) * 1640;
  const y = -430 + index * 46 + random(`y-${index}`) * 28;
  const centerX = interpolate(collapse, [0, 1], [x, -70 + (index % 4) * 46], {
    easing: EASE_OUT,
    ...CLAMP,
  });
  const centerY = interpolate(collapse, [0, 1], [y - drift, 24 + (index % 6) * 13], {
    easing: EASE_OUT,
    ...CLAMP,
  });
  const opacity = interpolate(collapse, [0, 0.65, 1], [0.76, 0.38, 0], CLAMP);
  const scale = interpolate(collapse, [0, 1], [1, 0.35], CLAMP);
  const tone =
    line.includes('error') || line.includes('timeout') || line.includes('exit_code')
      ? C.red
      : line.includes('tokens') || line.includes('cost')
        ? C.warn
        : C.dim;

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(${centerX}px, ${centerY}px) scale(${scale})`,
        transformOrigin: 'left center',
        opacity,
        fontFamily: MONO,
        fontSize: 20,
        color: tone,
        whiteSpace: 'nowrap',
        padding: '7px 11px',
        borderRadius: 5,
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(250,249,245,0.08)',
      }}
    >
      {line}
    </div>
  );
};

const ScanPanel: React.FC<{progress: number; fade: number; frame: number}> = ({
  progress,
  fade,
  frame,
}) => {
  const y = interpolate(progress, [0, 1], [18, 0], {easing: EASE_OUT, ...CLAMP});
  return (
    <div
      style={{
        position: 'absolute',
        left: 106,
        top: 76,
        width: 920,
        padding: 18,
        borderRadius: 16,
        background: 'rgba(13,14,13,0.78)',
        border: '1px solid rgba(250,249,245,0.1)',
        boxShadow: '0 24px 90px rgba(0,0,0,0.42)',
        opacity: progress * fade,
        transform: `translateY(${y}px)`,
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: 25,
          color: C.text,
          background: 'rgba(0,0,0,0.56)',
          border: '1px solid rgba(250,249,245,0.14)',
          borderRadius: 12,
          padding: '20px 22px',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{color: C.green}}>$ </span>
        cc-insights ingest ~/.claude/*.jsonl
        <span style={{color: C.cyan}}> --trace</span>
      </div>
      <div
        style={{
          marginTop: 16,
          display: 'grid',
          gap: 8,
          fontFamily: MONO,
          fontSize: 20,
          color: C.dim,
        }}
      >
        {STATUS_LINES.map((line, index) => (
          <div
            key={line}
            style={{
              opacity: interpolate(frame, [14 + index * 12, 22 + index * 12], [0, 1], CLAMP),
              color: index === STATUS_LINES.length - 1 ? C.cyan : C.dim,
            }}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};

const PipelineStage: React.FC<{
  label: string;
  sub: string;
  index: number;
  progress: number;
}> = ({label, sub, index, progress}) => {
  const local = interpolate(progress, [index * 0.18, index * 0.18 + 0.25], [0, 1], {
    easing: EASE_OUT,
    ...CLAMP,
  });
  const active = progress > index * 0.18 + 0.18;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
      <div
        style={{
          width: 224,
          minHeight: 104,
          padding: '18px 18px 16px',
          borderRadius: 10,
          background: active ? 'rgba(143,189,182,0.12)' : 'rgba(21,21,21,0.8)',
          border: `1px solid ${active ? 'rgba(143,189,182,0.42)' : 'rgba(250,249,245,0.1)'}`,
          opacity: local,
          transform: `translateY(${interpolate(local, [0, 1], [18, 0], CLAMP)}px)`,
        }}
      >
        <div style={{fontFamily: MONO, fontSize: 16, color: C.dim, marginBottom: 10}}>
          0{index + 1}
        </div>
        <div style={{fontFamily: MONO, fontSize: 24, color: C.text, marginBottom: 8}}>
          {label}
        </div>
        <div style={{fontFamily: SANS, fontSize: 19, lineHeight: 1.25, color: C.dim}}>
          {sub}
        </div>
      </div>
      {index < PIPELINE.length - 1 ? (
        <div
          style={{
            width: 58,
            height: 1,
            background: `linear-gradient(90deg, rgba(143,189,182,${local}), rgba(143,189,182,0.08))`,
            opacity: local,
          }}
        />
      ) : null}
    </div>
  );
};

const Pipeline: React.FC<{progress: number; opacity: number}> = ({progress, opacity}) => (
  <div
    style={{
      position: 'absolute',
      left: 106,
      right: 106,
      top: 432,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      opacity,
    }}
  >
    {PIPELINE.map((stage, index) => (
      <PipelineStage
        key={stage.id}
        label={stage.label}
        sub={stage.sub}
        index={index}
        progress={progress}
      />
    ))}
  </div>
);

const FindingCard: React.FC<{progress: number}> = ({progress}) => {
  const y = interpolate(progress, [0, 1], [28, 0], {easing: EASE_OUT, ...CLAMP});
  const scale = interpolate(progress, [0, 1], [0.97, 1], {easing: EASE_OUT, ...CLAMP});
  const opacity = interpolate(progress, [0, 0.25, 1], [0, 0.85, 1], CLAMP);

  return (
    <div
      style={{
        width: 980,
        padding: '28px 30px 30px',
        borderRadius: 12,
        background: 'rgba(13,14,13,0.94)',
        border: '1px solid rgba(143,189,182,0.24)',
        boxShadow: '0 34px 100px rgba(0,0,0,0.46)',
        transform: `translateY(${y}px) scale(${scale})`,
        opacity,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          fontFamily: MONO,
          fontSize: 18,
          color: C.dim,
        }}
      >
        <span style={{color: C.cyan}}>finding.generated</span>
        <span>trace_id=7f31a9 · local</span>
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 39,
          lineHeight: 1.22,
          color: C.white,
          fontWeight: 700,
          marginBottom: 22,
        }}
      >
        Bash timeout cluster is dragging Claude Code sessions
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 12,
          marginBottom: 18,
        }}
      >
        {[
          ['evidence', '28 failed commands', C.red],
          ['hotspot', 'article-mcp · 61% tokens', C.warn],
          ['pattern', 'Bash timeout loop', C.cyan],
        ].map(([label, value, color]) => (
          <div
            key={label}
            style={{
              padding: '15px 16px',
              borderRadius: 8,
              background: 'rgba(250,249,245,0.052)',
              border: '1px solid rgba(250,249,245,0.1)',
            }}
          >
            <div style={{fontFamily: MONO, fontSize: 15, color: color as string, marginBottom: 7}}>
              {label}
            </div>
            <div style={{fontFamily: SANS, fontSize: 24, fontWeight: 700, color: C.text}}>
              {value}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 25,
          color: C.text,
          background: 'rgba(0,0,0,0.38)',
          border: '1px solid rgba(143,189,182,0.25)',
          borderRadius: 8,
          padding: '15px 18px',
        }}
      >
        <span style={{color: C.green}}>$ </span>
        cc-insights cmd --reason timeout --project article-mcp
      </div>
    </div>
  );
};

export const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const logDrift = interpolate(frame, [0, 54], [0, 260], CLAMP);
  const collapse = spring({
    frame: frame - 50,
    fps,
    config: {damping: 18, stiffness: 116, mass: 0.8},
  });
  const scanIn = interpolate(frame, [4, 22], [0, 1], {easing: EASE_OUT, ...CLAMP});
  const scanFade = interpolate(frame, [108, 142], [1, 0.06], CLAMP);
  const pipelineProgress = interpolate(frame, [58, 122], [0, 1], CLAMP);
  const pipelineOpacity = interpolate(frame, [52, 74, 132, 146], [0, 1, 1, 0], CLAMP);
  const cardIn = interpolate(frame, [134, 166], [0, 1], {easing: EASE_OUT, ...CLAMP});

  return (
    <Backdrop>
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
        {LOG_LINES.map((line, index) => (
          <LogRow key={line} line={line} index={index} collapse={collapse} drift={logDrift} />
        ))}
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 72,
          border: '1px solid rgba(250,249,245,0.06)',
          opacity: 0.8,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 72,
          right: 72,
          top: 238,
          height: 1,
          background: 'rgba(250,249,245,0.045)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 72,
          right: 72,
          bottom: 238,
          height: 1,
          background: 'rgba(250,249,245,0.045)',
        }}
      />

      <ScanPanel progress={scanIn} fade={scanFade} frame={frame} />
      <Pipeline progress={pipelineProgress} opacity={pipelineOpacity} />
      <FindingCard progress={cardIn} />
    </Backdrop>
  );
};
