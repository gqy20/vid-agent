import {AbsoluteFill, Audio, Img, Sequence, Video, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {CLAMP, MONO, SANS, SERIF} from '../../theme';
import {BAD_FRAMES} from './assets';
import {P, alpha} from './palette';

export const STORYBOARD_FPS = 30;
export const STORYBOARD_DURATION_IN_FRAMES = STORYBOARD_FPS * 180;

type Shot = {
  from: number;
  duration: number;
  plate: string;
  title: string;
  caption: string;
  dialogue?: string;
  speaker?: string;
  accent: string;
  zoom: [number, number];
  panX: [number, number];
  panY: [number, number];
  crop?: string;
  cards?: boolean;
  pinnedCard?: boolean;
  motion: 'room' | 'bad-frame' | 'submit' | 'pin' | 'listening' | 'rebuild' | 'test' | 'confirm' | 'delivery';
};

const SHOTS: Shot[] = [
  {
    from: 0,
    duration: 540,
    plate: 'deadline-cut/storyboard-plates/s01-night-room_001.jpg',
    title: '凌晨两点，片子还没有角色。',
    caption: '九点前要交样片。阿程盯着最后一段转身，以为缺的是更多方向；小析盯着那个停顿，觉得角色像突然忘了自己是谁。',
    dialogue: '先别提交。观众会在这一秒掉出去。',
    speaker: '阿导',
    accent: P.clay,
    zoom: [1.06, 1.16],
    panX: [-1.5, 1.5],
    panY: [0, -1],
    motion: 'room',
  },
  {
    from: 540,
    duration: 540,
    plate: 'deadline-cut/storyboard-plates/s02-bad-frame_001.jpg',
    title: '阿程给出了第一个答案。',
    caption: '他把八向图摊开，问题看起来很技术：方向太少，过渡太硬。只要补到十六向，转身应该就会顺。',
    dialogue: '给我二十分钟，我把它补成十六向。',
    speaker: '阿程',
    accent: P.brass,
    zoom: [1.08, 1.2],
    panX: [2, -3],
    panY: [0, -2],
    crop: 'center center',
    cards: true,
    motion: 'bad-frame',
  },
  {
    from: 1080,
    duration: 540,
    plate: 'deadline-cut/storyboard-plates/s03-stop-submit-clean_001.jpg',
    title: '小析按住了提交键。',
    caption: '她不是在挡进度，而是在挡一个错误答案。帽子漂移可以修，裁切可以换，但角色没有理由回头，这件事不能靠补帧解决。',
    dialogue: '你修的是方向，不是它为什么动。',
    speaker: '小析',
    accent: P.sage,
    zoom: [1.06, 1.18],
    panX: [-2, 2],
    panY: [0, -2],
    crop: 'center center',
    cards: true,
    motion: 'submit',
  },
  {
    from: 1620,
    duration: 540,
    plate: 'deadline-cut/storyboard-plates/s04-sixteen-fails_002.jpg',
    title: '十六向生成出来，问题更清楚了。',
    caption: '动作确实更顺了，但它更像一组展示姿势。每一格都对，每一秒都空，因为角色还是不知道自己要回应谁。',
    dialogue: '它顺了，可是更假了。',
    speaker: '小析',
    accent: P.brass,
    zoom: [1.05, 1.16],
    panX: [-1, 1.5],
    panY: [0, -1],
    motion: 'bad-frame',
  },
  {
    from: 2160,
    duration: 540,
    plate: 'deadline-cut/storyboard-plates/s04-pin-frame-clean_001.jpg',
    title: '阿导没有删掉那张坏帧。',
    caption: '他把歪头的帧钉到故事板中央。不是因为它正确，而是因为它第一次像是在听别人说话。',
    dialogue: '如果它不是转身，而是在倾听呢？',
    speaker: '阿导',
    accent: P.clay,
    zoom: [1.06, 1.18],
    panX: [-7, -2],
    panY: [0, -1.5],
    pinnedCard: true,
    motion: 'pin',
  },
  {
    from: 2700,
    duration: 540,
    plate: 'deadline-cut/storyboard-plates/s07-rebuild-scene_001.jpg',
    title: '阿程把方向图退回成一场戏。',
    caption: '他不再问还缺几个角度，而是把最后一镜拆成动作：递出、停住、倾听、回头。每一步都要有前因。',
    dialogue: '先让它知道自己为什么停下。',
    speaker: '阿程',
    accent: P.sage,
    zoom: [1.04, 1.16],
    panX: [-1, 2],
    panY: [0, -2],
    motion: 'rebuild',
  },
  {
    from: 3240,
    duration: 540,
    plate: 'deadline-cut/storyboard-plates/s08-reaction-test_001.jpg',
    title: '第二次测试，房间安静了。',
    caption: '屏幕上只剩一个很小的动作：角色准备离开，听见声音，停住，偏头。没有炫技，只有一个正在发生的决定。',
    dialogue: '它不是卡住了。它是在决定。',
    speaker: '小析',
    accent: P.brass,
    zoom: [1.04, 1.14],
    panX: [1, -1],
    panY: [0, -1],
    motion: 'test',
  },
  {
    from: 3780,
    duration: 540,
    plate: 'deadline-cut/storyboard-plates/s09-final-confirm_001.jpg',
    title: '天亮之前，阿程删掉了多余方向。',
    caption: '他保留几个不完美的停顿，只修那些会破坏理解的地方。角色没有变得更满，它变得更像有心事。',
    dialogue: '这一版可以交。不是因为顺，是因为它会犹豫。',
    speaker: '阿导',
    accent: P.sage,
    zoom: [1.04, 1.18],
    panX: [-2, 1],
    panY: [0, -2],
    motion: 'confirm',
  },
  {
    from: 4320,
    duration: 540,
    plate: 'deadline-cut/storyboard-plates/s06-delivered-dawn_001.jpg',
    title: '交付的不是完美，而是可信。',
    caption: '阿程终于明白：方向图是资源，动作是语法，选择才是故事。那张坏帧没有被删除，它被改写成角色回头前的一次犹豫。',
    dialogue: '更多方向只能让它转身，明确动作才会让它做选择。',
    speaker: '旁白',
    accent: P.clay,
    zoom: [1.06, 1.2],
    panX: [0, 0],
    panY: [2, -4],
    motion: 'delivery',
  },
];

const progressInShot = (frame: number, shot: Shot) =>
  Math.max(0, Math.min(1, (frame - shot.from) / shot.duration));

const MANIM_CUTAWAY_FROM = 2388;
const MANIM_CUTAWAY_DURATION = 312;

const FilmFrame: React.FC<{shot: Shot; frame: number}> = ({shot, frame}) => {
  const p = progressInShot(frame, shot);
  const fade = interpolate(frame, [shot.from, shot.from + 24, shot.from + shot.duration - 28, shot.from + shot.duration], [0, 1, 1, 0], CLAMP);
  const scale = interpolate(p, [0, 1], shot.zoom, CLAMP);
  const x = interpolate(p, [0, 1], shot.panX, CLAMP);
  const y = interpolate(p, [0, 1], shot.panY, CLAMP);
  return (
    <Sequence from={shot.from} durationInFrames={shot.duration}>
      <AbsoluteFill style={{background: '#14100d', opacity: fade}}>
        <Img
          src={staticFile(shot.plate)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: shot.crop ?? 'center center',
            transform: `translate(${x}%, ${y}%) scale(${scale})`,
            filter: 'saturate(0.84) contrast(1.02) brightness(0.96)',
          }}
        />
        <AmbientMotion frame={frame} shot={shot} />
        <AbsoluteFill
          style={{
            background:
              `linear-gradient(90deg, ${alpha('#000000', 0.42)}, transparent 42%, transparent 72%, ${alpha('#000000', 0.26)}),` +
              `linear-gradient(180deg, ${alpha('#000000', 0.14)}, transparent 44%, ${alpha('#000000', 0.76)})`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 76,
            top: 64,
            fontFamily: MONO,
            color: alpha(P.porcelain, 0.72),
            fontSize: 18,
            letterSpacing: 0,
          }}
        >
          DEADLINE CUT / STORYBOARD FILM
        </div>
        <div
          style={{
            position: 'absolute',
            left: 76,
            bottom: 134,
            width: 820,
            color: P.porcelain,
          }}
        >
          <div style={{fontFamily: SERIF, fontSize: 52, lineHeight: 1.08, fontWeight: 700}}>
            {shot.title}
          </div>
          <div style={{height: 18}} />
          <div style={{fontFamily: SANS, fontSize: 23, lineHeight: 1.46, color: alpha(P.porcelain, 0.86)}}>
            {shot.caption}
          </div>
        </div>
        {shot.dialogue ? (
          <div
            style={{
              position: 'absolute',
              right: 84,
              bottom: 116,
              width: 560,
              padding: '20px 24px',
              borderLeft: `5px solid ${shot.accent}`,
              background: alpha('#11100d', 0.62),
              boxShadow: `0 20px 70px ${alpha('#000000', 0.24)}`,
              color: P.porcelain,
            }}
          >
            <div style={{fontFamily: MONO, color: shot.accent, fontSize: 18}}>{shot.speaker}</div>
            <div style={{height: 10}} />
            <div style={{fontFamily: SANS, fontSize: 29, lineHeight: 1.34}}>{shot.dialogue}</div>
          </div>
        ) : null}
        {shot.cards ? <ProblemCards frame={frame} shot={shot} /> : null}
        {shot.pinnedCard ? <PinnedStoryCard frame={frame} shot={shot} /> : null}
        <StoryMotion frame={frame} shot={shot} />
        <div
          style={{
            position: 'absolute',
            left: 76,
            right: 76,
            bottom: 58,
            height: 2,
            background: alpha(P.porcelain, 0.18),
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${p * 100}%`,
              background: shot.accent,
            }}
          />
        </div>
      </AbsoluteFill>
    </Sequence>
  );
};

const ManimCutaway: React.FC<{frame: number}> = ({frame}) => {
  const opacity = interpolate(
    frame,
    [MANIM_CUTAWAY_FROM, MANIM_CUTAWAY_FROM + 18, MANIM_CUTAWAY_FROM + MANIM_CUTAWAY_DURATION - 18, MANIM_CUTAWAY_FROM + MANIM_CUTAWAY_DURATION],
    [0, 1, 1, 0],
    CLAMP,
  );
  return (
    <Sequence from={MANIM_CUTAWAY_FROM} durationInFrames={MANIM_CUTAWAY_DURATION}>
      <AbsoluteFill style={{background: '#14100d', opacity}}>
        <Video
          src={staticFile('deadline-cut/manim/direction-to-action.mp4')}
          volume={0}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </AbsoluteFill>
    </Sequence>
  );
};

const AmbientMotion: React.FC<{frame: number; shot: Shot}> = ({frame, shot}) => {
  const p = progressInShot(frame, shot);
  const shimmer = 0.16 + Math.sin((frame - shot.from) / 42) * 0.04;
  const sweepX = interpolate(p, [0, 1], [-36, 118], CLAMP);
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: `${sweepX}%`,
          top: -180,
          width: 210,
          height: 1440,
          transform: 'rotate(18deg)',
          background: `linear-gradient(90deg, transparent, ${alpha(P.porcelain, shimmer)}, transparent)`,
          filter: 'blur(22px)',
          opacity: shot.motion === 'test' ? 0.18 : 0.11,
          mixBlendMode: 'screen',
        }}
      />
      {DUST.map((dot, index) => {
        const drift = Math.sin((frame + index * 19) / (52 + index * 3));
        return (
          <div
            key={`${dot.x}-${dot.y}`}
            style={{
              position: 'absolute',
              left: dot.x + drift * 10,
              top: dot.y + p * dot.travel,
              width: dot.size,
              height: dot.size,
              borderRadius: dot.size / 2,
              background: alpha(P.porcelain, dot.opacity),
              filter: 'blur(1px)',
              opacity: interpolate(p, [0, 0.12, 0.86, 1], [0, 1, 1, 0], CLAMP),
            }}
          />
        );
      })}
    </>
  );
};

const StoryMotion: React.FC<{frame: number; shot: Shot}> = ({frame, shot}) => {
  if (shot.motion === 'room') {
    return <BreathingDeadline frame={frame} shot={shot} />;
  }
  if (shot.motion === 'bad-frame') {
    return <FrameScan frame={frame} shot={shot} />;
  }
  if (shot.motion === 'submit') {
    return <SubmitBlock frame={frame} shot={shot} />;
  }
  if (shot.motion === 'pin') {
    return <PinAnnotations frame={frame} shot={shot} />;
  }
  if (shot.motion === 'listening') {
    return <ListeningPulse frame={frame} shot={shot} />;
  }
  if (shot.motion === 'rebuild') {
    return <BlockingMarks frame={frame} shot={shot} />;
  }
  if (shot.motion === 'test') {
    return <DecisionEcho frame={frame} shot={shot} />;
  }
  if (shot.motion === 'confirm') {
    return <ChoiceArc frame={frame} shot={shot} />;
  }
  return <DeliveryGlow frame={frame} shot={shot} />;
};

const BreathingDeadline: React.FC<{frame: number; shot: Shot}> = ({frame, shot}) => {
  const p = progressInShot(frame, shot);
  const pulse = 0.46 + Math.sin((frame - shot.from) / 18) * 0.12;
  return (
    <div
      style={{
        position: 'absolute',
        right: 300,
        top: 122,
        width: 118,
        height: 118,
        borderRadius: 59,
        border: `1px solid ${alpha(P.brass, 0.58)}`,
        boxShadow: `0 0 ${18 + pulse * 20}px ${alpha(P.brass, 0.28)}`,
        opacity: interpolate(p, [0.12, 0.28, 0.88, 1], [0, 1, 1, 0], CLAMP),
      }}
    >
      <div style={{position: 'absolute', left: 58, top: 20, width: 1, height: 40, background: alpha(P.brass, 0.72), transform: `rotate(${p * 210}deg)`, transformOrigin: 'bottom center'}} />
      <div style={{position: 'absolute', left: 58, top: 58, width: 1, height: 30, background: alpha(P.porcelain, 0.54), transform: `rotate(${p * 48}deg)`, transformOrigin: 'top center'}} />
    </div>
  );
};

const FrameScan: React.FC<{frame: number; shot: Shot}> = ({frame, shot}) => {
  const p = progressInShot(frame, shot);
  const x = interpolate(p, [0.08, 0.78], [980, 1490], CLAMP);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: 100,
        width: 2,
        height: 270,
        background: `linear-gradient(180deg, transparent, ${P.brass}, transparent)`,
        boxShadow: `0 0 24px ${alpha(P.brass, 0.5)}`,
        opacity: interpolate(p, [0.08, 0.16, 0.78, 0.9], [0, 1, 1, 0], CLAMP),
      }}
    />
  );
};

const SubmitBlock: React.FC<{frame: number; shot: Shot}> = ({frame, shot}) => {
  const p = progressInShot(frame, shot);
  const enter = interpolate(p, [0.15, 0.3], [0, 1], CLAMP);
  return (
    <div
      style={{
        position: 'absolute',
        left: 184,
        top: 192,
        width: 360,
        height: 360,
        borderRadius: 180,
        border: `2px solid ${alpha(P.sage, 0.74)}`,
        opacity: enter * interpolate(p, [0.82, 1], [1, 0], CLAMP),
        transform: `scale(${0.86 + enter * 0.22 + Math.sin(frame / 18) * 0.015})`,
        boxShadow: `0 0 70px ${alpha(P.sage, 0.16)}`,
      }}
    >
      <div style={{position: 'absolute', left: 70, right: 70, top: 176, height: 3, background: P.sage, transform: 'rotate(-34deg)'}} />
    </div>
  );
};

const PinAnnotations: React.FC<{frame: number; shot: Shot}> = ({frame, shot}) => {
  const p = progressInShot(frame, shot);
  return (
    <>
      {['停顿', '视线', '回应'].map((label, index) => {
        const show = interpolate(p, [0.3 + index * 0.08, 0.44 + index * 0.08], [0, 1], CLAMP);
        return (
          <div
            key={label}
            style={{
              position: 'absolute',
              left: 1154,
              top: 226 + index * 64,
              width: 190,
              opacity: show,
              transform: `translateX(${(1 - show) * 26}px)`,
              color: P.porcelain,
              fontFamily: SANS,
              fontSize: 22,
            }}
          >
            <div style={{height: 1, width: 96, background: alpha(P.porcelain, 0.46), marginBottom: 8}} />
            {label}
          </div>
        );
      })}
    </>
  );
};

const ListeningPulse: React.FC<{frame: number; shot: Shot}> = ({frame, shot}) => {
  const p = progressInShot(frame, shot);
  return (
    <>
      {[0, 1, 2].map((index) => {
        const wave = interpolate(p, [0.22 + index * 0.08, 0.74 + index * 0.08], [0, 1], CLAMP);
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: 650 - wave * 80,
              top: 212 - wave * 52,
              width: 330 + wave * 180,
              height: 210 + wave * 110,
              borderRadius: '50%',
              border: `1px solid ${alpha(P.brass, 0.44 * (1 - wave))}`,
              opacity: interpolate(p, [0.2, 0.36, 0.9, 1], [0, 1, 1, 0], CLAMP),
            }}
          />
        );
      })}
    </>
  );
};

const BlockingMarks: React.FC<{frame: number; shot: Shot}> = ({frame, shot}) => {
  const p = progressInShot(frame, shot);
  const marks = [
    {x: 1000, y: 540, label: '递出'},
    {x: 1118, y: 468, label: '停住'},
    {x: 1254, y: 520, label: '回应'},
  ];
  return (
    <>
      {marks.map((mark, index) => {
        const show = interpolate(p, [0.18 + index * 0.1, 0.36 + index * 0.1], [0, 1], CLAMP);
        return (
          <div
            key={mark.label}
            style={{
              position: 'absolute',
              left: mark.x,
              top: mark.y,
              width: 96,
              height: 96,
              borderRadius: 48,
              border: `1px solid ${alpha(index === 1 ? P.sage : P.brass, 0.72)}`,
              opacity: show * interpolate(p, [0.86, 1], [1, 0], CLAMP),
              transform: `translate(-50%, -50%) scale(${0.72 + show * 0.28})`,
              color: P.porcelain,
              fontFamily: MONO,
              fontSize: 15,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: alpha('#11100d', 0.2),
            }}
          >
            {mark.label}
          </div>
        );
      })}
    </>
  );
};

const DecisionEcho: React.FC<{frame: number; shot: Shot}> = ({frame, shot}) => {
  const p = progressInShot(frame, shot);
  return (
    <>
      {[0, 1, 2].map((index) => {
        const show = interpolate(p, [0.2 + index * 0.08, 0.4 + index * 0.08], [0, 1], CLAMP);
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: 874 + index * 34,
              top: 334 - index * 8,
              width: 72,
              height: 116,
              borderRadius: '42% 42% 36% 36%',
              border: `1px solid ${alpha(P.brass, 0.46)}`,
              opacity: show * (0.48 - index * 0.1) * interpolate(p, [0.76, 1], [1, 0], CLAMP),
              transform: `rotate(${-8 + index * 7}deg)`,
            }}
          />
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: 790,
          top: 380,
          width: 350,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${alpha(P.porcelain, 0.58)}, transparent)`,
          opacity: interpolate(p, [0.36, 0.5, 0.8, 1], [0, 1, 1, 0], CLAMP),
          transform: `rotate(${interpolate(p, [0.36, 0.8], [-4, 5], CLAMP)}deg)`,
        }}
      />
    </>
  );
};

const ChoiceArc: React.FC<{frame: number; shot: Shot}> = ({frame, shot}) => {
  const p = progressInShot(frame, shot);
  const show = interpolate(p, [0.24, 0.42], [0, 1], CLAMP) * interpolate(p, [0.84, 1], [1, 0], CLAMP);
  return (
    <div
      style={{
        position: 'absolute',
        right: 520,
        top: 300,
        width: 260,
        height: 260,
        borderRadius: 130,
        borderTop: `2px solid ${alpha(P.sage, 0.82)}`,
        borderRight: `2px solid ${alpha(P.sage, 0.46)}`,
        opacity: show,
        transform: `rotate(${interpolate(p, [0.24, 0.8], [-40, 26], CLAMP)}deg)`,
        filter: 'drop-shadow(0 0 18px rgba(220,228,215,0.22))',
      }}
    />
  );
};

const DeliveryGlow: React.FC<{frame: number; shot: Shot}> = ({frame, shot}) => {
  const p = progressInShot(frame, shot);
  return (
    <div
      style={{
        position: 'absolute',
        left: 620,
        top: 120,
        width: 680,
        height: 420,
        background: `radial-gradient(circle, ${alpha(P.brassSoft, 0.34)}, transparent 64%)`,
        opacity: interpolate(p, [0.08, 0.42, 0.9, 1], [0, 0.82, 0.72, 0], CLAMP),
        transform: `scale(${interpolate(p, [0, 1], [0.86, 1.08], CLAMP)})`,
        mixBlendMode: 'screen',
      }}
    />
  );
};

const DUST = [
  {x: 210, y: 148, size: 3, travel: 80, opacity: 0.22},
  {x: 418, y: 210, size: 2, travel: 120, opacity: 0.16},
  {x: 735, y: 160, size: 3, travel: 90, opacity: 0.18},
  {x: 1010, y: 190, size: 2, travel: 110, opacity: 0.15},
  {x: 1364, y: 126, size: 3, travel: 96, opacity: 0.18},
  {x: 1602, y: 248, size: 2, travel: 84, opacity: 0.14},
] as const;

const PinnedStoryCard: React.FC<{frame: number; shot: Shot}> = ({frame, shot}) => {
  const p = progressInShot(frame, shot);
  const lift = interpolate(p, [0.08, 0.28], [20, 0], CLAMP);
  const opacity = interpolate(p, [0.08, 0.24], [0, 1], CLAMP);
  return (
    <div
      style={{
        position: 'absolute',
        left: 790,
        top: 168,
        width: 326,
        height: 430,
        padding: 22,
        boxSizing: 'border-box',
        background: alpha(P.paper, 0.94),
        border: `1px solid ${alpha(P.ink, 0.18)}`,
        boxShadow: `0 24px 80px ${alpha('#000000', 0.28)}`,
        transform: `rotate(1.4deg) translateY(${lift}px)`,
        opacity,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: -13,
          width: 28,
          height: 28,
          borderRadius: 14,
          transform: 'translateX(-50%)',
          background: P.clay,
          boxShadow: `0 6px 14px ${alpha('#000000', 0.26)}`,
        }}
      />
      <div style={{fontFamily: MONO, fontSize: 16, color: P.muted}}>BAD FRAME</div>
      <div style={{height: 22}} />
      <div style={{fontFamily: SERIF, fontSize: 33, lineHeight: 1.08, fontWeight: 700, color: P.ink}}>
        它不是转身，
        <br />
        是在倾听。
      </div>
      <div style={{position: 'absolute', left: 24, right: 24, bottom: 30}}>
        {['停顿', '视线', '回应'].map((label, index) => (
          <div
            key={label}
            style={{
              height: 34,
              borderTop: `1px solid ${alpha(P.ink, 0.16)}`,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontFamily: SANS,
              fontSize: 20,
              color: P.ink2,
            }}
          >
            <span style={{width: 10, height: 10, borderRadius: 5, background: index === 1 ? P.sage : P.brass}} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

const ProblemCards: React.FC<{frame: number; shot: Shot}> = ({frame, shot}) => {
  const p = progressInShot(frame, shot);
  return (
    <>
      {BAD_FRAMES.map((item, index) => {
        const enter = interpolate(p, [0.12 + index * 0.06, 0.28 + index * 0.06], [0, 1], CLAMP);
        return (
          <div
            key={item.label}
            style={{
              position: 'absolute',
              left: 1040 + index * 132,
              top: 118 + Math.sin((frame + index * 20) / 22) * 7,
              width: 112,
              height: 138,
              borderRadius: 8,
              overflow: 'hidden',
              border: `1px solid ${alpha(index === 2 ? P.sage : P.oxide, 0.8)}`,
              background: P.porcelain,
              opacity: enter * 0.92,
              transform: `rotate(${-8 + index * 7}deg) translateY(${(1 - enter) * -24}px)`,
              boxShadow: `0 18px 46px ${alpha('#000000', 0.24)}`,
            }}
          >
            <Img src={staticFile(item.src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            <div
              style={{
                position: 'absolute',
                left: 8,
                right: 8,
                top: 8,
                padding: '4px 6px',
                borderRadius: 5,
                background: alpha(index === 2 ? P.sage : P.oxide, 0.9),
                color: P.porcelain,
                fontFamily: MONO,
                fontSize: 12,
              }}
            >
              {item.label}
            </div>
          </div>
        );
      })}
    </>
  );
};

const ClosingSlate: React.FC<{frame: number}> = ({frame}) => {
  const p = interpolate(frame, [4860, 4940, 5360, 5400], [0, 1, 1, 0], CLAMP);
  return (
    <AbsoluteFill style={{background: P.paper, opacity: p}}>
      <AbsoluteFill
        style={{
          background:
            `linear-gradient(135deg, ${P.paper}, ${P.paper2} 62%, ${alpha(P.sageSoft, 0.72)})`,
        }}
      />
      <div style={{position: 'absolute', left: 120, top: 92, fontFamily: MONO, color: P.muted, fontSize: 20}}>
        NEW DIRECTION
      </div>
      <div style={{position: 'absolute', left: 120, top: 178, width: 980, fontFamily: SERIF, fontSize: 78, lineHeight: 1.04, fontWeight: 700, color: P.ink}}>
        下一版不再生成“更多方向”，而是生成“更明确的动作”。
      </div>
      <div style={{position: 'absolute', left: 124, top: 430, width: 760, fontFamily: SANS, color: P.ink2, fontSize: 29, lineHeight: 1.52}}>
        每个镜头先写清楚角色要做什么：递交、阻止、钉上、等待、确认、交付。资源只服务这些动作，Remotion 只负责剪辑、节奏和视线。
      </div>
      <div style={{position: 'absolute', right: 130, top: 210, width: 520}}>
        {['镜头目标', '角色动作', '情绪变化', '局部运动', '对白节奏'].map((label, index) => (
          <div
            key={label}
            style={{
              height: 74,
              marginBottom: 16,
              borderBottom: `1px solid ${alpha(P.ink, 0.14)}`,
              display: 'flex',
              alignItems: 'center',
              fontFamily: SANS,
              fontSize: 31,
              color: P.ink,
              transform: `translateX(${interpolate(frame, [4860 + index * 36, 4930 + index * 36], [40, 0], CLAMP)}px)`,
              opacity: interpolate(frame, [4860 + index * 36, 4930 + index * 36], [0, 1], CLAMP),
            }}
          >
            <span style={{fontFamily: MONO, color: P.brass, fontSize: 19, width: 70}}>0{index + 1}</span>
            {label}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const DeadlineCutStoryboard: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#14100d'}}>
      <Audio src={staticFile('bgm.mp3')} volume={0.035} loop />
      <Audio src={staticFile('deadline-cut/storyboard-audio/narration.mp3')} volume={1} />
      {SHOTS.map((shot) => (
        <FilmFrame key={`${shot.from}-${shot.title}`} shot={shot} frame={frame} />
      ))}
      <ManimCutaway frame={frame} />
      <ClosingSlate frame={frame} />
    </AbsoluteFill>
  );
};
