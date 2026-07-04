import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Ck, FZ, SANS, SERIF_BOLD, CLAMP, EASE_OUT} from '../theme';
import {Rise, VBackdrop, VStage} from '../primitives';
import {SceneCaption} from '../captions';

export const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const score = Math.round(
    interpolate(frame, [6, 66], [0, 642], {...CLAMP, easing: EASE_OUT}),
  );
  return (
    <VBackdrop tone="cream">
      <VStage gap={26}>
        <Rise delay={6} y={18}>
          <div
            style={{
              fontFamily: SERIF_BOLD,
              fontSize: FZ.metric,
              color: Ck.ink,
              lineHeight: 1,
              letterSpacing: -3,
            }}
          >
            {score}
          </div>
        </Rise>
        <Rise delay={14}>
          <div style={{fontFamily: SERIF_BOLD, fontSize: FZ.subtitle, color: Ck.ink2}}>
            分数出来了。
          </div>
        </Rise>
      </VStage>

      {/* 642 的视觉框架：虚线圆环。删除了原 4 个飘问号（装饰动效违反 taste.md）。
       *  ring 给数字一个位置，旁白与底部字幕承担语义，让画面只回答 "642" 一件事。 */}
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        <svg
          width="1080"
          height="1920"
          viewBox="0 0 1080 1920"
          style={{position: 'absolute', inset: 0}}
        >
          <circle
            cx="540"
            cy="900"
            r="290"
            fill="none"
            stroke={Ck.brandDeep}
            strokeWidth="1.5"
            strokeDasharray="6 10"
            opacity="0.32"
          />
        </svg>
      </AbsoluteFill>

      <SceneCaption id="hook" />
    </VBackdrop>
  );
};
