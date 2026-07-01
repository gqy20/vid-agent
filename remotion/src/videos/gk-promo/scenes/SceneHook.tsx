import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Ck, FZ, SANS, SANS_BOLD, CLAMP} from '../theme';
import {CaptionBar, Eyebrow, Rise, VBackdrop, VStage} from '../primitives';

const QUESTIONS = [
  {text: '选哪所？', x: -300, y: -150, delay: 16},
  {text: '学什么？', x: 300, y: -90, delay: 28},
  {text: '去哪座城市？', x: 250, y: 180, delay: 40},
  {text: '以后干嘛？', x: -240, y: 230, delay: 52},
];

const CAPTION = '分数出来了。然后呢？全是未知。';

export const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <VBackdrop tone="cream">
      <VStage gap={26}>
        <Rise delay={0}>
          <Eyebrow color={Ck.ink3}>2026 · 高考志愿</Eyebrow>
        </Rise>
        <Rise delay={6} y={18}>
          <div
            style={{
              fontFamily: SANS_BOLD,
              fontSize: FZ.metric,
              color: Ck.ink,
              lineHeight: 1,
              letterSpacing: -3,
            }}
          >
            642
          </div>
        </Rise>
        <Rise delay={14}>
          <div style={{fontFamily: SANS, fontSize: FZ.subtitle, color: Ck.ink2}}>
            分数出来了。
          </div>
        </Rise>
      </VStage>

      {/* 飘浮问句：缓慢上浮 + 淡入淡出，半透明 */}
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        {QUESTIONS.map((q, i) => {
          const prog = (frame - q.delay) / 70;
          const o = interpolate(prog, [0, 0.2, 0.8, 1], [0, 1, 1, 0], CLAMP);
          const ty = interpolate(prog, [0, 1], [0, -46], CLAMP);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${q.x}px), calc(-50% + ${q.y}px + ${ty}px))`,
                fontFamily: SANS,
                fontSize: 46,
                color: Ck.brandDeep,
                opacity: o * 0.42,
                fontWeight: 600,
              }}
            >
              {q.text}
            </div>
          );
        })}
      </AbsoluteFill>

      <CaptionBar text={CAPTION} delay={20} />
    </VBackdrop>
  );
};
