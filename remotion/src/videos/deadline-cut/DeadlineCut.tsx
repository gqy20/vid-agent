import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {CLAMP, EASE_OUT, MONO, SANS, SERIF} from '../../theme';
import {BAD_FRAMES, BOARD_CARDS, CAST, type CastMember} from './assets';
import {P, alpha} from './palette';
import {CHAPTERS, type Chapter} from './story';
import {
  DURATION_IN_FRAMES,
  FPS,
  SCENE_DURATION,
  getSceneStart,
  type SceneId,
} from './timeline';

const sceneOpacity = (frame: number, id: SceneId) => {
  const start = getSceneStart(id);
  const end = start + SCENE_DURATION;
  return Math.min(
    interpolate(frame, [start, start + 24], [0, 1], CLAMP),
    interpolate(frame, [end - 24, end], [1, 0], CLAMP),
  );
};

const local = (frame: number, id: SceneId) => frame - getSceneStart(id);

const enter = (frame: number, delay = 0, length = 28) =>
  interpolate(frame - delay, [0, length], [0, 1], {...CLAMP, easing: EASE_OUT});

const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: P.paper, color: P.ink}}>
    <AbsoluteFill
      style={{
        background:
          `linear-gradient(90deg, ${alpha(P.ink, 0.035)} 1px, transparent 1px),` +
          `linear-gradient(0deg, ${alpha(P.ink, 0.03)} 1px, transparent 1px)`,
        backgroundSize: '96px 96px',
      }}
    />
    <AbsoluteFill
      style={{
        background:
          `radial-gradient(circle at 10% 10%, ${alpha(P.claySoft, 0.72)}, transparent 34%),` +
          `radial-gradient(circle at 86% 22%, ${alpha(P.sageSoft, 0.78)}, transparent 32%),` +
          `radial-gradient(circle at 62% 90%, ${alpha(P.brassSoft, 0.48)}, transparent 38%)`,
      }}
    />
    {children}
  </AbsoluteFill>
);

const TextPane: React.FC<{chapter: Chapter; frame: number}> = ({chapter, frame}) => {
  const p = enter(frame, 6);
  return (
    <div
      style={{
        position: 'absolute',
        left: 92,
        top: 84,
        width: 620,
        height: 770,
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [18, 0], CLAMP)}px)`,
      }}
    >
      <div style={{fontFamily: MONO, color: chapter.accent, fontSize: 24, letterSpacing: 0}}>
        CHAPTER {chapter.chapter} / {chapter.kicker}
      </div>
      <div style={{height: 26}} />
      <div
        style={{
          fontFamily: SERIF,
          fontSize: 72,
          fontWeight: 700,
          lineHeight: 1.08,
          color: P.ink,
        }}
      >
        {chapter.title}
      </div>
      <div style={{height: 30}} />
      <div
        style={{
          width: 560,
          padding: '28px 30px',
          borderRadius: 8,
          border: `1px solid ${alpha(P.ink, 0.12)}`,
          background: alpha(P.porcelain, 0.78),
          boxShadow: `0 24px 70px ${alpha(P.ink, 0.08)}`,
          fontFamily: SANS,
          fontSize: 31,
          lineHeight: 1.52,
          color: P.ink2,
        }}
      >
        {chapter.voiceover}
      </div>
      {chapter.dialogue ? (
        <div style={{marginTop: 24, display: 'grid', gap: 12, width: 560}}>
          {chapter.dialogue.map((line, index) => {
            const q = enter(frame, 42 + index * 16, 18);
            return (
              <div
                key={line}
                style={{
                  opacity: q,
                  transform: `translateX(${interpolate(q, [0, 1], [-14, 0], CLAMP)}px)`,
                  padding: '14px 18px',
                  borderRadius: 7,
                  background: alpha(chapter.accent, 0.12),
                  border: `1px solid ${alpha(chapter.accent, 0.32)}`,
                  fontFamily: SANS,
                  fontSize: 24,
                  lineHeight: 1.35,
                  color: P.ink,
                }}
              >
                {line}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

const VisualFrame: React.FC<{
  children: React.ReactNode;
  frame: number;
  accent: string;
}> = ({children, frame, accent}) => {
  const p = enter(frame, 18);
  return (
    <div
      style={{
        position: 'absolute',
        left: 785,
        top: 130,
        width: 1010,
        height: 690,
        borderRadius: 8,
        overflow: 'hidden',
        border: `1px solid ${alpha(accent, 0.32)}`,
        background: alpha(P.porcelain, 0.72),
        boxShadow: `0 34px 90px ${alpha(P.ink, 0.12)}`,
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [22, 0], CLAMP)}px)`,
      }}
    >
      {children}
    </div>
  );
};

const Plate: React.FC<{src: string; frame: number; accent: string}> = ({src, frame, accent}) => (
  <VisualFrame frame={frame} accent={accent}>
    <Img
      src={staticFile(src)}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        opacity: 0.92,
        transform: `scale(${1.03 + Math.sin(frame / 80) * 0.008})`,
      }}
    />
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(90deg, ${alpha(P.porcelain, 0.12)}, transparent 38%, ${alpha(P.paper, 0.16)})`,
      }}
    />
  </VisualFrame>
);

const CharacterCard: React.FC<{
  member: CastMember;
  frame: number;
  x: number;
  y: number;
  w?: number;
  h?: number;
  delay?: number;
}> = ({member, frame, x, y, w = 250, h = 340, delay = 0}) => {
  const p = enter(frame, delay, 22);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y + Math.sin((frame + delay) / 24) * 4,
        width: w,
        height: h,
        borderRadius: 8,
        overflow: 'hidden',
        border: `1px solid ${alpha(member.accent, 0.42)}`,
        background: P.porcelain,
        boxShadow: `0 18px 45px ${alpha(P.ink, 0.14)}`,
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [18, 0], CLAMP)}px)`,
      }}
    >
      <Img
        src={staticFile(member.src)}
        style={{width: '112%', height: '112%', objectFit: 'cover', objectPosition: 'center top', transform: 'translate(-6%, -3%)'}}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: '34px 16px 15px',
          background: `linear-gradient(180deg, transparent, ${alpha(P.paper, 0.96)} 48%)`,
        }}
      >
        <div style={{fontFamily: MONO, color: member.accent, fontSize: 15}}>{member.role}</div>
        <div style={{fontFamily: SANS, color: P.ink, fontSize: 28, fontWeight: 700}}>{member.name}</div>
      </div>
    </div>
  );
};

const CastBoard: React.FC<{frame: number; accent: string}> = ({frame, accent}) => (
  <VisualFrame frame={frame} accent={accent}>
    <div style={{position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${alpha(P.sageSoft, 0.52)}, ${alpha(P.porcelain, 0.86)})`}} />
    {CAST.map((member, index) => (
      <CharacterCard
        key={member.id}
        member={member}
        frame={frame}
        x={80 + index * 310}
        y={182 + (index === 1 ? -44 : 18)}
        delay={index * 12}
        w={240}
        h={340}
      />
    ))}
    <div style={{position: 'absolute', left: 72, top: 58, fontFamily: MONO, color: P.muted, fontSize: 22}}>
      CAST / three roles, one decision
    </div>
  </VisualFrame>
);

const AuditBoard: React.FC<{frame: number; accent: string}> = ({frame, accent}) => (
  <VisualFrame frame={frame} accent={accent}>
    <div style={{position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${alpha(P.porcelain, 0.94)}, ${alpha(P.claySoft, 0.28)})`}} />
    {BAD_FRAMES.map((item, index) => {
      const p = enter(frame, 24 + index * 12, 20);
      const bad = index < 2;
      return (
        <div
          key={item.label}
          style={{
            position: 'absolute',
            left: 62 + index * 310,
            top: 108,
            width: 270,
            height: 430,
            borderRadius: 8,
            overflow: 'hidden',
            background: P.porcelain,
            border: `2px solid ${bad ? alpha(P.oxide, 0.62) : alpha(P.sage, 0.58)}`,
            opacity: p,
            transform: `translateY(${interpolate(p, [0, 1], [22, 0], CLAMP)}px)`,
          }}
        >
          <Img src={staticFile(item.src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top'}} />
          <div
            style={{
              position: 'absolute',
              left: 16,
              top: 16,
              padding: '8px 12px',
              borderRadius: 6,
              background: bad ? alpha(P.oxide, 0.86) : alpha(P.sage, 0.86),
              color: P.porcelain,
              fontFamily: MONO,
              fontSize: 19,
            }}
          >
            {item.label}
          </div>
        </div>
      );
    })}
  </VisualFrame>
);

const ConflictBoard: React.FC<{frame: number; accent: string}> = ({frame, accent}) => (
  <VisualFrame frame={frame} accent={accent}>
    <div style={{position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${alpha(P.paper2, 0.9)}, ${alpha(P.oxide, 0.14)})`}} />
    {CAST.map((member, index) => (
      <CharacterCard
        key={member.id}
        member={member}
        frame={frame}
        x={96 + index * 298}
        y={230 + (index === 1 ? -38 : 26)}
        delay={index * 10}
        w={218}
        h={310}
      />
    ))}
    <div
      style={{
        position: 'absolute',
        left: 82,
        right: 82,
        top: 96,
        height: 76,
        borderRadius: 8,
        border: `1px solid ${alpha(P.oxide, 0.34)}`,
        background: alpha(P.porcelain, 0.58),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        fontFamily: MONO,
        fontSize: 26,
        color: P.oxide,
      }}
    >
      <span>TIME LEFT</span>
      <span>00:27:18</span>
    </div>
  </VisualFrame>
);

const TimelineBoard: React.FC<{frame: number; accent: string; final?: boolean}> = ({frame, accent, final = false}) => (
  <VisualFrame frame={frame} accent={accent}>
    <div style={{position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${alpha(P.porcelain, 0.95)}, ${alpha(P.sageSoft, 0.45)})`}} />
    <div style={{position: 'absolute', left: 72, top: 66, fontFamily: MONO, color: P.muted, fontSize: 22}}>
      TIMELINE / deadline-cut
    </div>
    <div style={{position: 'absolute', left: 72, top: 128, right: 72}}>
      {[...BOARD_CARDS, final ? '歪头成为故事钩子' : '重写角色动机'].map((card, index) => {
        const p = enter(frame, 24 + index * 8, 18);
        const hot = index === 2 || (final && index === 5);
        return (
          <div
            key={`${card}-${index}`}
            style={{
              height: 58,
              marginBottom: 14,
              borderRadius: 7,
              background: hot ? alpha(P.brassSoft, 0.7) : alpha(P.paper, 0.72),
              border: `1px solid ${hot ? alpha(P.brass, 0.38) : alpha(P.line, 0.92)}`,
              display: 'flex',
              alignItems: 'center',
              padding: '0 22px',
              fontFamily: SANS,
              color: P.ink,
              fontSize: 25,
              opacity: p,
              transform: `translateX(${interpolate(p, [0, 1], [-22, 0], CLAMP)}px)`,
            }}
          >
            {String(index + 1).padStart(2, '0')} / {card}
          </div>
        );
      })}
    </div>
  </VisualFrame>
);

const DirectionSheet: React.FC<{frame: number; accent: string}> = ({frame, accent}) => {
  const files = [
    'characters/demo-guide/directions/demo-guide-n_001.jpg',
    'characters/demo-guide/directions/demo-guide-ne_001.jpg',
    'characters/demo-guide/directions/demo-guide-e_001.jpg',
    'characters/demo-guide/directions/demo-guide-se_001.jpg',
    'characters/demo-guide/directions/demo-guide-s_001.jpg',
    'characters/demo-guide/directions/demo-guide-sw_001.jpg',
    'characters/demo-guide/directions/demo-guide-w_001.jpg',
    'characters/demo-guide/directions/demo-guide-nw_001.jpg',
  ];
  return (
    <VisualFrame frame={frame} accent={accent}>
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${alpha(P.porcelain, 0.9)}, ${alpha(P.brassSoft, 0.32)})`}} />
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, padding: 58}}>
        {files.map((file, index) => {
          const p = enter(frame, 20 + index * 4, 16);
          return (
            <div
              key={file}
              style={{
                height: 260,
                borderRadius: 7,
                overflow: 'hidden',
                background: P.porcelain,
                border: `1px solid ${alpha(P.line, 0.9)}`,
                opacity: p,
                transform: `scale(${interpolate(p, [0, 1], [0.96, 1], CLAMP)})`,
              }}
            >
              <Img src={staticFile(file)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top'}} />
            </div>
          );
        })}
      </div>
    </VisualFrame>
  );
};

const DeliveryBoard: React.FC<{frame: number; accent: string}> = ({frame, accent}) => (
  <VisualFrame frame={frame} accent={accent}>
    <div style={{position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${alpha(P.porcelain, 0.94)}, ${alpha(P.claySoft, 0.38)})`}} />
    <Img
      src={staticFile('deadline-cut/story-plates/delivery-morning_001.jpg')}
      style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.32}}
    />
    <div
      style={{
        position: 'absolute',
        left: 86,
        right: 86,
        top: 184,
        padding: '34px 40px',
        borderRadius: 8,
        background: alpha(P.porcelain, 0.78),
        border: `1px solid ${alpha(P.sage, 0.38)}`,
        boxShadow: `0 20px 50px ${alpha(P.ink, 0.1)}`,
      }}
    >
      <div style={{fontFamily: MONO, color: P.slate, fontSize: 28}}>renders/current/deadline-cut.mp4</div>
      <div style={{height: 22}} />
      <div style={{height: 12, borderRadius: 999, background: alpha(P.line, 0.72), overflow: 'hidden'}}>
        <div style={{width: `${interpolate(frame, [30, 150], [8, 100], CLAMP)}%`, height: '100%', background: `linear-gradient(90deg, ${P.sage}, ${P.brass})`}} />
      </div>
      <div style={{height: 22}} />
      <div style={{fontFamily: SANS, color: P.ink2, fontSize: 26}}>status: delivered / story beat preserved</div>
    </div>
  </VisualFrame>
);

const VisualForChapter: React.FC<{chapter: Chapter; frame: number}> = ({chapter, frame}) => {
  if (chapter.id === 'board') return <CastBoard frame={frame} accent={chapter.accent} />;
  if (chapter.id === 'audit') return <AuditBoard frame={frame} accent={chapter.accent} />;
  if (chapter.id === 'conflict') return <ConflictBoard frame={frame} accent={chapter.accent} />;
  if (chapter.id === 'repair' || chapter.id === 'collab') return <TimelineBoard frame={frame} accent={chapter.accent} />;
  if (chapter.id === 'finalFrames' || chapter.id === 'epilogue') return <DirectionSheet frame={frame} accent={chapter.accent} />;
  if (chapter.id === 'delivery') return <DeliveryBoard frame={frame} accent={chapter.accent} />;
  if (chapter.plate) return <Plate src={chapter.plate} frame={frame} accent={chapter.accent} />;
  return <TimelineBoard frame={frame} accent={chapter.accent} final />;
};

const ChapterScene: React.FC<{chapter: Chapter; frame: number}> = ({chapter, frame}) => {
  const f = local(frame, chapter.id);
  return (
    <AbsoluteFill style={{opacity: sceneOpacity(frame, chapter.id), pointerEvents: 'none'}}>
      <TextPane chapter={chapter} frame={f} />
      <VisualForChapter chapter={chapter} frame={f} />
    </AbsoluteFill>
  );
};

const GlobalHud: React.FC<{frame: number}> = ({frame}) => {
  const secondsLeft = Math.max(0, Math.ceil((DURATION_IN_FRAMES - frame) / FPS));
  const min = Math.floor(secondsLeft / 60);
  const sec = secondsLeft % 60;
  const progress = interpolate(frame, [0, DURATION_IN_FRAMES - 1], [0, 1], CLAMP);
  return (
    <>
      <div
        style={{
          position: 'absolute',
          right: 96,
          top: 72,
          fontFamily: MONO,
          color: secondsLeft <= 20 ? P.clay : P.slate,
          fontSize: 30,
        }}
      >
        T-{String(min).padStart(2, '0')}:{String(sec).padStart(2, '0')}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 100,
          right: 100,
          bottom: 54,
          height: 8,
          borderRadius: 999,
          background: alpha(P.ink, 0.09),
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${P.clay}, ${P.sage}, ${P.brass})`,
          }}
        />
      </div>
    </>
  );
};

export const DeadlineCut: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Stage>
      <Audio src={staticFile('deadline-cut/audio/deadline-cut-voiceover.mp3')} volume={0.92} />
      <Audio src={staticFile('bgm.mp3')} volume={0.08} loop />
      {CHAPTERS.map((chapter) => (
        <ChapterScene key={chapter.id} chapter={chapter} frame={frame} />
      ))}
      <GlobalHud frame={frame} />
    </Stage>
  );
};
