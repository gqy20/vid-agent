import {AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {CLAMP, MONO, SANS, SERIF} from '../../theme';
import {BAD_FRAMES} from './assets';
import {CharacterActor} from './actors/CharacterActor';
import {ACTORS, type ActorId} from './actors/manifests';
import {P, alpha} from './palette';

export const ACTOR_FPS = 30;
export const ACTOR_DURATION_IN_FRAMES = ACTOR_FPS * 75;

const DIALOGUE: Array<{
  from: number;
  actor: ActorId;
  text: string;
  x: number;
  y: number;
  audio: string;
}> = [
  {
    from: 96,
    actor: 'engineer',
    text: '八向图能跑，但角色没有呼吸。',
    x: 1040,
    y: 186,
    audio: 'deadline-cut/actors/audio/01-engineer.mp3',
  },
  {
    from: 360,
    actor: 'analyst',
    text: '这里不是小瑕疵，方向一换，观众会立刻看见。',
    x: 1120,
    y: 150,
    audio: 'deadline-cut/actors/audio/02-analyst.mp3',
  },
  {
    from: 630,
    actor: 'director',
    text: '别把坏帧删掉，先看看它能不能变成故事。',
    x: 290,
    y: 158,
    audio: 'deadline-cut/actors/audio/03-director.mp3',
  },
  {
    from: 980,
    actor: 'analyst',
    text: '如果它是在倾听，这个歪头就不是错误。',
    x: 1120,
    y: 150,
    audio: 'deadline-cut/actors/audio/04-analyst.mp3',
  },
  {
    from: 1320,
    actor: 'engineer',
    text: '那我把可用方向接起来，动作让位给情绪。',
    x: 1040,
    y: 186,
    audio: 'deadline-cut/actors/audio/05-engineer.mp3',
  },
  {
    from: 1780,
    actor: 'director',
    text: '这一版可以交。它不是完美，但它有角色。',
    x: 310,
    y: 158,
    audio: 'deadline-cut/actors/audio/06-director.mp3',
  },
];

const STAGE = {
  engineer: [
    {frame: 0, x: 1140, y: 765, scale: 0.82, holdDirection: true},
    {frame: 260, x: 1180, y: 765, scale: 0.82, holdDirection: true},
    {frame: 500, x: 980, y: 690, scale: 0.78},
    {frame: 820, x: 1030, y: 610, scale: 0.72},
    {frame: 1160, x: 1230, y: 690, scale: 0.78},
    {frame: 1450, x: 1030, y: 710, scale: 0.82},
    {frame: 1930, x: 1050, y: 735, scale: 0.82, holdDirection: true},
    {frame: 2220, x: 1050, y: 735, scale: 0.82, holdDirection: true},
  ],
  analyst: [
    {frame: 0, x: 1715, y: 740, scale: 0.78},
    {frame: 285, x: 1430, y: 680, scale: 0.78},
    {frame: 430, x: 1290, y: 590, scale: 0.72},
    {frame: 760, x: 1290, y: 590, scale: 0.72, holdDirection: true},
    {frame: 960, x: 1180, y: 705, scale: 0.8},
    {frame: 1460, x: 1170, y: 720, scale: 0.82, holdDirection: true},
    {frame: 2220, x: 1170, y: 720, scale: 0.82, holdDirection: true},
  ],
  director: [
    {frame: 0, x: 220, y: 760, scale: 0.82},
    {frame: 520, x: 520, y: 680, scale: 0.8},
    {frame: 680, x: 760, y: 590, scale: 0.74},
    {frame: 920, x: 860, y: 540, scale: 0.7},
    {frame: 1240, x: 840, y: 700, scale: 0.82},
    {frame: 1740, x: 820, y: 730, scale: 0.84, holdDirection: true},
    {frame: 2220, x: 820, y: 730, scale: 0.84, holdDirection: true},
  ],
} as const;

const ease = (frame: number, input: [number, number], output: [number, number]) =>
  interpolate(frame, input, output, {...CLAMP});

const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: P.paper, color: P.ink, overflow: 'hidden'}}>
    <AbsoluteFill
      style={{
        background:
          `radial-gradient(circle at 12% 12%, ${alpha(P.claySoft, 0.62)}, transparent 34%),` +
          `radial-gradient(circle at 86% 24%, ${alpha(P.sageSoft, 0.76)}, transparent 32%),` +
          `linear-gradient(180deg, ${alpha(P.porcelain, 0.7)}, ${alpha(P.paper2, 0.92)})`,
      }}
    />
    <AbsoluteFill
      style={{
        background:
          `linear-gradient(90deg, ${alpha(P.ink, 0.032)} 1px, transparent 1px),` +
          `linear-gradient(0deg, ${alpha(P.ink, 0.028)} 1px, transparent 1px)`,
        backgroundSize: '96px 96px',
      }}
    />
    {children}
  </AbsoluteFill>
);

const StoryHeader: React.FC<{frame: number}> = ({frame}) => {
  const titleOut = interpolate(frame, [0, 160, 230], [1, 1, 0], CLAMP);
  return (
    <>
      <div style={{position: 'absolute', left: 92, top: 70, width: 560, opacity: titleOut}}>
        <div style={{fontFamily: MONO, color: P.clay, fontSize: 23}}>DEADLINE CUT / CHARACTER STORY</div>
        <div style={{height: 18}} />
        <div style={{fontFamily: SERIF, fontSize: 70, fontWeight: 700, lineHeight: 1.06}}>
          角色不是素材，角色要做出选择。
        </div>
      </div>
      <div style={{position: 'absolute', right: 88, top: 68, fontFamily: MONO, color: P.slate, fontSize: 24}}>
        actor-driven / state changes
      </div>
    </>
  );
};

const ReviewDesk: React.FC = () => (
  <>
    <div
      style={{
        position: 'absolute',
        left: 730,
        top: 286,
        width: 820,
        height: 392,
        borderRadius: 14,
        transform: 'skewX(-5deg)',
        background: alpha(P.porcelain, 0.82),
        border: `1px solid ${alpha(P.line, 0.94)}`,
        boxShadow: `0 34px 90px ${alpha(P.ink, 0.12)}`,
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: 790,
        top: 322,
        width: 700,
        height: 235,
        borderRadius: 10,
        background: alpha(P.ink, 0.08),
        border: `1px solid ${alpha(P.ink, 0.1)}`,
      }}
    />
  </>
);

const PreviewWindow: React.FC<{frame: number}> = ({frame}) => {
  const failed = frame < 760;
  const worse = frame >= 760 && frame < 1040;
  const listening = frame >= 1040 && frame < 1700;
  const delivered = frame >= 1700;
  const status = delivered ? 'DELIVERED' : listening ? 'LISTENING BEAT' : worse ? 'REPAIR MADE IT WORSE' : 'PREVIEW FAILED';
  const color = delivered ? P.sage : listening ? P.brass : P.oxide;
  const shake = failed || worse ? Math.sin(frame / 3) * 4 : 0;
  const src = delivered || listening ? BAD_FRAMES[2].src : BAD_FRAMES[0].src;
  return (
    <div
      style={{
        position: 'absolute',
        left: 826 + shake,
        top: 350,
        width: 310,
        height: 292,
        borderRadius: 10,
        overflow: 'hidden',
        background: P.porcelain,
        border: `2px solid ${alpha(color, 0.72)}`,
        boxShadow: `0 18px 46px ${alpha(P.ink, 0.12)}`,
      }}
    >
      <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top'}} />
      <div
        style={{
          position: 'absolute',
          left: 12,
          top: 12,
          padding: '7px 10px',
          borderRadius: 6,
          background: alpha(color, 0.9),
          color: P.porcelain,
          fontFamily: MONO,
          fontSize: 16,
        }}
      >
        {status}
      </div>
      {failed || worse ? (
        <div
          style={{
            position: 'absolute',
            right: 14,
            bottom: 14,
            width: 78,
            height: 78,
            borderRadius: 999,
            border: `6px solid ${alpha(P.oxide, 0.78)}`,
            transform: 'rotate(-18deg)',
          }}
        />
      ) : null}
    </div>
  );
};

const AuditPanel: React.FC<{frame: number}> = ({frame}) => {
  const p = interpolate(frame, [250, 310], [0, 1], CLAMP);
  const marked = interpolate(frame, [360, 520], [0, 1], CLAMP);
  return (
    <div
      style={{
        position: 'absolute',
        left: 1188,
        top: 348,
        width: 260,
        opacity: p,
      }}
    >
      <div style={{fontFamily: MONO, color: P.muted, fontSize: 18}}>QA MARKS</div>
      {['帽子漂移', '裁切过近', '方向可用'].map((label, index) => {
        const isBad = index < 2;
        return (
          <div
            key={label}
            style={{
              marginTop: 12,
              height: 44,
              borderRadius: 7,
              background: alpha(isBad ? P.oxide : P.sage, isBad ? 0.12 + marked * 0.08 : 0.1),
              border: `1px solid ${alpha(isBad ? P.oxide : P.sage, 0.34)}`,
              display: 'flex',
              alignItems: 'center',
              padding: '0 14px',
              fontFamily: SANS,
              color: P.ink,
              fontSize: 22,
              transform: `translateX(${isBad ? interpolate(marked, [0, 1], [0, -10], CLAMP) : 0}px)`,
            }}
          >
            {isBad && marked > 0.3 ? '!' : '✓'} {label}
          </div>
        );
      })}
    </div>
  );
};

const DirectionCandidatePanel: React.FC<{frame: number}> = ({frame}) => {
  const p = interpolate(frame, [500, 560, 980, 1060], [0, 1, 1, 0], CLAMP);
  const rows: ActorId[] = ['analyst', 'engineer'];
  return (
    <div
      style={{
        position: 'absolute',
        left: 92,
        top: 238,
        width: 552,
        height: 286,
        borderRadius: 12,
        border: `1px solid ${alpha(P.line, 0.94)}`,
        background: alpha(P.porcelain, 0.86),
        opacity: p,
        boxShadow: `0 18px 46px ${alpha(P.ink, 0.08)}`,
        zIndex: 260,
      }}
    >
      <div style={{position: 'absolute', left: 22, top: 18, fontFamily: MONO, color: P.muted, fontSize: 18}}>
        MMX 16-DIRECTION CANDIDATES / quality gate
      </div>
      {rows.map((actor, index) => {
        const manifest = ACTORS[actor];
        const accepted = manifest.candidateStatus === 'accepted';
        return (
          <div key={actor} style={{position: 'absolute', left: 22 + index * 262, top: 58, width: 244}}>
            <div
              style={{
                width: 244,
                height: 158,
                borderRadius: 8,
                overflow: 'hidden',
                border: `1px solid ${alpha(accepted ? P.sage : P.oxide, 0.45)}`,
                background: P.paper,
              }}
            >
              {manifest.candidateDirectionSheet ? (
                <Img
                  src={staticFile(manifest.candidateDirectionSheet)}
                  style={{width: '100%', height: '100%', objectFit: 'cover'}}
                />
              ) : null}
            </div>
            <div style={{height: 12}} />
            <div style={{fontFamily: SANS, color: P.ink, fontSize: 21, fontWeight: 700}}>
              {manifest.name} / {accepted ? '可接入' : '退回重生'}
            </div>
            <div style={{height: 8}} />
            <div style={{fontFamily: SANS, color: P.ink2, fontSize: 16, lineHeight: 1.28}}>
              {actor === 'analyst' ? '方向感成立，但服装漂移。' : '身份漂移过重，不能上正式线。'}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const assetPosition = (frame: number, index: number) => {
  const startX = 180 + index * 150;
  const startY = 720;
  if (index === 0) {
    return {
      x: ease(frame, [530, 760], [startX, 920]),
      y: ease(frame, [530, 760], [startY, 438]),
      rotate: ease(frame, [530, 760], [-3, -12]),
      scale: ease(frame, [530, 760], [1, 0.86]),
    };
  }
  if (index === 1) {
    return {
      x: ease(frame, [840, 1100], [startX, 1112]),
      y: ease(frame, [840, 1100], [startY, 438]),
      rotate: ease(frame, [840, 1100], [2, 8]),
      scale: ease(frame, [840, 1100], [1, 0.86]),
    };
  }
  return {
    x: ease(frame, [1220, 1480], [startX, 1262]),
    y: ease(frame, [1220, 1480], [startY, 438]),
    rotate: ease(frame, [1220, 1480], [0, 3]),
    scale: ease(frame, [1220, 1480], [1, 0.86]),
  };
};

const AssetCards: React.FC<{frame: number}> = ({frame}) => (
  <>
    {BAD_FRAMES.map((item, index) => {
      const pos = assetPosition(frame, index);
      const reveal = interpolate(frame, [180 + index * 20, 230 + index * 20], [0, 1], CLAMP);
      const bad = index < 2;
      const reframed = frame > 1040 && index === 1;
      return (
        <div
          key={item.label}
          style={{
            position: 'absolute',
            left: pos.x,
            top: pos.y,
            width: 126,
            height: 150,
            borderRadius: 8,
            overflow: 'hidden',
            transform: `translate(-50%, -50%) rotate(${pos.rotate}deg) scale(${pos.scale})`,
            opacity: reveal,
            zIndex: 420 + index,
            background: P.porcelain,
            border: `2px solid ${alpha(reframed ? P.brass : bad ? P.oxide : P.sage, 0.7)}`,
            boxShadow: `0 16px 34px ${alpha(P.ink, 0.13)}`,
          }}
        >
          <Img src={staticFile(item.src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top'}} />
          <div
            style={{
              position: 'absolute',
              left: 8,
              top: 8,
              right: 8,
              padding: '5px 7px',
              borderRadius: 5,
              background: alpha(reframed ? P.brass : bad ? P.oxide : P.sage, 0.9),
              color: P.porcelain,
              fontFamily: MONO,
              fontSize: 13,
            }}
          >
            {reframed ? '倾听镜头' : item.label}
          </div>
        </div>
      );
    })}
  </>
);

const Storyboard: React.FC<{frame: number}> = ({frame}) => {
  const p = interpolate(frame, [880, 960], [0, 1], CLAMP);
  const slots = [
    {label: '发现断点', fill: frame > 900, color: P.oxide},
    {label: '重新解释', fill: frame > 1080, color: P.brass},
    {label: '等待回应', fill: frame > 1340, color: P.sage},
  ];
  return (
    <div
      style={{
        position: 'absolute',
        left: 760,
        top: 690,
        width: 700,
        height: 168,
        borderRadius: 10,
        border: `1px solid ${alpha(P.line, 0.95)}`,
        background: alpha(P.porcelain, 0.72),
        opacity: p,
        boxShadow: `0 18px 42px ${alpha(P.ink, 0.08)}`,
      }}
    >
      <div style={{position: 'absolute', left: 22, top: 16, fontFamily: MONO, color: P.muted, fontSize: 18}}>
        STORYBOARD / bad frame becomes motivation
      </div>
      {slots.map((slot, index) => (
        <div
          key={slot.label}
          style={{
            position: 'absolute',
            left: 24 + index * 220,
            top: 58,
            width: 196,
            height: 82,
            borderRadius: 8,
            border: `1px solid ${alpha(slot.fill ? slot.color : P.line, slot.fill ? 0.5 : 0.95)}`,
            background: slot.fill ? alpha(slot.color, 0.16) : alpha(P.paper, 0.5),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: SANS,
            color: P.ink,
            fontSize: 24,
          }}
        >
          {slot.fill ? slot.label : '空镜头'}
        </div>
      ))}
    </div>
  );
};

const Timeline: React.FC<{frame: number}> = ({frame}) => {
  const repair = interpolate(frame, [740, 880], [0, 1], CLAMP);
  const rewrite = interpolate(frame, [1120, 1500], [0, 1], CLAMP);
  const delivered = interpolate(frame, [1700, 1990], [0, 1], CLAMP);
  const rows = [
    {label: '01 / 角色转身预览', active: true, color: P.oxide},
    {label: '02 / 修复尝试失败', active: repair > 0.2, color: P.oxide},
    {label: '03 / 歪头改为倾听', active: rewrite > 0.1, color: P.brass},
    {label: '04 / 三人围合确认', active: rewrite > 0.55, color: P.sage},
    {label: '05 / current 输出', active: delivered > 0.2, color: P.sage},
  ];
  return (
    <div style={{position: 'absolute', left: 1188, top: 502, width: 268}}>
      {rows.map((row, index) => (
        <div
          key={row.label}
          style={{
            height: 34,
            marginBottom: 8,
            borderRadius: 6,
            background: row.active ? alpha(row.color, 0.16) : alpha(P.ink, 0.05),
            border: `1px solid ${alpha(row.active ? row.color : P.line, row.active ? 0.36 : 0.65)}`,
            display: 'flex',
            alignItems: 'center',
            padding: '0 10px',
            fontFamily: SANS,
            color: row.active ? P.ink : P.muted,
            fontSize: 17,
            transform: `translateX(${interpolate(frame, [120 + index * 40, 160 + index * 40], [-12, 0], CLAMP)}px)`,
          }}
        >
          {row.label}
        </div>
      ))}
      <div style={{height: 7, borderRadius: 999, overflow: 'hidden', background: alpha(P.ink, 0.08)}}>
        <div
          style={{
            height: '100%',
            width: `${Math.max(repair * 26, rewrite * 78, delivered * 100)}%`,
            background: `linear-gradient(90deg, ${P.oxide}, ${P.brass}, ${P.sage})`,
          }}
        />
      </div>
    </div>
  );
};

const SubmitButton: React.FC<{frame: number}> = ({frame}) => {
  const p = interpolate(frame, [1620, 1710], [0, 1], CLAMP);
  const done = interpolate(frame, [1760, 1930], [0, 1], CLAMP);
  return (
    <div
      style={{
        position: 'absolute',
        left: 118,
        bottom: 104,
        width: 500,
        padding: '22px 26px',
        borderRadius: 10,
        border: `1px solid ${alpha(done > 0.92 ? P.sage : P.brass, 0.44)}`,
        background: alpha(P.porcelain, 0.86),
        opacity: p,
        boxShadow: `0 18px 48px ${alpha(P.ink, 0.09)}`,
      }}
    >
      <div style={{fontFamily: MONO, color: done > 0.92 ? P.sage : P.brass, fontSize: 23}}>
        {done > 0.92 ? 'DELIVERED / deadline-cut-actors.mp4' : 'SUBMITTING / current cut'}
      </div>
      <div style={{height: 12}} />
      <div style={{height: 10, borderRadius: 999, overflow: 'hidden', background: alpha(P.ink, 0.08)}}>
        <div style={{height: '100%', width: `${done * 100}%`, background: `linear-gradient(90deg, ${P.brass}, ${P.sage})`}} />
      </div>
    </div>
  );
};

const DialogueBubble: React.FC<{line: (typeof DIALOGUE)[number]; frame: number}> = ({line, frame}) => {
  const color = line.actor === 'director' ? P.clay : line.actor === 'analyst' ? P.sage : P.brass;
  const p = interpolate(frame, [line.from, line.from + 18, line.from + 136, line.from + 162], [0, 1, 1, 0], CLAMP);
  return (
    <div
      style={{
        position: 'absolute',
        left: line.x,
        top: line.y,
        width: 430,
        padding: '17px 21px',
        borderRadius: 9,
        background: alpha(P.porcelain, 0.9),
        border: `1px solid ${alpha(color, 0.48)}`,
        boxShadow: `0 18px 45px ${alpha(P.ink, 0.09)}`,
        fontFamily: SANS,
        color: P.ink,
        fontSize: 26,
        lineHeight: 1.34,
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [14, 0], CLAMP)}px)`,
        zIndex: 1600,
      }}
    >
      {line.text}
    </div>
  );
};

const AudioTracks: React.FC = () => (
  <>
    <Audio src={staticFile('bgm.mp3')} volume={0.055} loop />
    {DIALOGUE.map((line) => (
      <Sequence key={line.audio} from={line.from}>
        <Audio src={staticFile(line.audio)} volume={1} />
      </Sequence>
    ))}
  </>
);

const BeatCaption: React.FC<{frame: number}> = ({frame}) => {
  const beats = [
    {at: 0, text: '阿程先让八向图跑起来。'},
    {at: 300, text: '小析暂停预览，坏帧被标出来。'},
    {at: 760, text: '阿程尝试修复，预览反而更坏。'},
    {at: 1040, text: '阿导把错误重新解释成“倾听”。'},
    {at: 1440, text: '三人把坏帧接进故事板。'},
    {at: 1780, text: '截止前，状态从 failed 变成 delivered。'},
  ];
  const current = beats.reduce((last, beat) => (frame >= beat.at ? beat : last), beats[0]);
  const opacity = interpolate(frame, [190, 240], [0, 1], CLAMP);
  return (
    <div
      style={{
        position: 'absolute',
        left: 92,
        top: 72,
        width: 620,
        opacity,
        fontFamily: SERIF,
        fontSize: 46,
        lineHeight: 1.18,
        fontWeight: 700,
        color: P.ink,
      }}
    >
      {current.text}
    </div>
  );
};

export const DeadlineCutActors: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Stage>
      <AudioTracks />
      <StoryHeader frame={frame} />
      <BeatCaption frame={frame} />
      <ReviewDesk />
      <PreviewWindow frame={frame} />
      <AuditPanel frame={frame} />
      <DirectionCandidatePanel frame={frame} />
      <Timeline frame={frame} />
      <AssetCards frame={frame} />
      <Storyboard frame={frame} />
      <SubmitButton frame={frame} />
      <CharacterActor actor="director" frame={frame} path={[...STAGE.director]} width={222} />
      <CharacterActor actor="engineer" frame={frame} path={[...STAGE.engineer]} width={226} />
      <CharacterActor actor="analyst" frame={frame} path={[...STAGE.analyst]} width={218} />
      {DIALOGUE.map((line) => (
        <DialogueBubble key={line.audio} line={line} frame={frame} />
      ))}
    </Stage>
  );
};
